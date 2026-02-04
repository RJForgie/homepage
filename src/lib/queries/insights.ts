import { sql } from "kysely";
import { getDb } from "../db/client";
import { companySlug } from "../utils/slugs";

export interface DashboardJob {
  id: number;
  title: string;
  companyId: number;
  companyName: string;
  companyType: string | null;
  companySlug: string;
  locationId: number;
  locationName: string;
  postedDate: number;
  seniorityLevel: string | null;
  technologies: Array<{ name: string; category: string | null }>;
}

export interface DashboardData {
  jobs: DashboardJob[];
  locations: Array<{ id: number; name: string }>;
}

export async function getDashboardData(): Promise<DashboardData> {
  const db = getDb();

  // Get all relevant jobs with company and location info
  const jobRows = await db
    .selectFrom("normalized_jobs as j")
    .innerJoin("companies as c", "c.id", "j.company_id")
    .innerJoin("locations as l", "l.id", "j.location_id")
    .where("j.is_relevant", "=", 1)
    .select([
      "j.id",
      "j.title",
      "j.posted_date",
      "j.seniority_level",
      "c.id as company_id",
      "c.name as company_name",
      "c.company_type",
      "c.normalized_name",
      "l.id as location_id",
      "l.name as location_name",
    ])
    .execute();

  const jobIds = jobRows.map((j) => j.id);

  // Batch-fetch technologies for all jobs
  let techsByJob = new Map<
    number,
    Array<{ name: string; category: string | null }>
  >();

  if (jobIds.length > 0) {
    const techRows = await db
      .selectFrom("job_technologies as jt")
      .innerJoin("technologies as t", "t.id", "jt.technology_id")
      .where("jt.job_id", "in", jobIds)
      .select(["jt.job_id", "t.name", "t.category"])
      .execute();

    for (const row of techRows) {
      const list = techsByJob.get(row.job_id) ?? [];
      list.push({ name: row.name, category: row.category });
      techsByJob.set(row.job_id, list);
    }
  }

  // Get distinct locations for the filter dropdown
  const locationRows = await db
    .selectFrom("locations as l")
    .innerJoin("normalized_jobs as j", "j.location_id", "l.id")
    .where("j.is_relevant", "=", 1)
    .select(["l.id", "l.name", sql<number>`count(j.id)`.as("cnt")])
    .groupBy("l.id")
    .orderBy("cnt", "desc")
    .execute();

  const jobs: DashboardJob[] = jobRows.map((j) => ({
    id: j.id,
    title: j.title,
    companyId: j.company_id,
    companyName: j.company_name,
    companyType: j.company_type,
    companySlug: companySlug(j.normalized_name),
    locationId: j.location_id,
    locationName: j.location_name,
    postedDate: j.posted_date,
    seniorityLevel: j.seniority_level,
    technologies: techsByJob.get(j.id) ?? [],
  }));

  const locations = locationRows.map((l) => ({
    id: l.id,
    name: l.name,
  }));

  return { jobs, locations };
}

export interface TechCoOccurrence {
  tech: string;
  coTechs: Array<{ name: string; count: number }>;
}

export async function getTechCoOccurrence(): Promise<TechCoOccurrence[]> {
  const db = getDb();

  // Get the top 8 technologies first
  const topTechs = await db
    .selectFrom("job_technologies as jt")
    .innerJoin("technologies as t", "t.id", "jt.technology_id")
    .innerJoin("normalized_jobs as j", "j.id", "jt.job_id")
    .where("j.is_relevant", "=", 1)
    .select(["t.name", sql<number>`count(jt.job_id)`.as("cnt")])
    .groupBy("t.id")
    .orderBy("cnt", "desc")
    .limit(8)
    .execute();

  const topTechNames = topTechs.map((t) => t.name);

  // Self-join to find co-occurring technologies
  const coRows = await db
    .selectFrom("job_technologies as jt1")
    .innerJoin("job_technologies as jt2", (join) =>
      join
        .onRef("jt1.job_id", "=", "jt2.job_id")
        .on("jt1.technology_id", "!=", sql.ref("jt2.technology_id")),
    )
    .innerJoin("technologies as t1", "t1.id", "jt1.technology_id")
    .innerJoin("technologies as t2", "t2.id", "jt2.technology_id")
    .innerJoin("normalized_jobs as j", "j.id", "jt1.job_id")
    .where("j.is_relevant", "=", 1)
    .where("t1.name", "in", topTechNames)
    .select([
      "t1.name as tech1",
      "t2.name as tech2",
      sql<number>`count(*)`.as("co_count"),
    ])
    .groupBy(["t1.name", "t2.name"])
    .orderBy("co_count", "desc")
    .execute();

  // Group by primary tech
  const coMap = new Map<string, Array<{ name: string; count: number }>>();
  for (const row of coRows) {
    const list = coMap.get(row.tech1) ?? [];
    if (list.length < 5) {
      list.push({ name: row.tech2, count: Number(row.co_count) });
    }
    coMap.set(row.tech1, list);
  }

  return topTechNames.map((tech) => ({
    tech,
    coTechs: coMap.get(tech) ?? [],
  }));
}
