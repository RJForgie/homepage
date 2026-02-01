import { sql } from "kysely";
import { getDb } from "../db/client";
import { companySlug } from "../utils/slugs";

export interface CompanyListItem {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  jobCount: number;
  locations: string[];
  technologies: string[];
}

export interface CompanyDetail extends CompanyListItem {
  jobs: CompanyJob[];
}

export interface CompanyJob {
  id: number;
  title: string;
  location: string | null;
  salaryText: string | null;
  postedDate: number;
  seniorityLevel: string | null;
  workArrangement: string | null;
  technologies: string[];
  jobUrl: string;
}

export async function getCompaniesForDirectory(): Promise<CompanyListItem[]> {
  const db = getDb();

  const rows = await db
    .selectFrom("companies as c")
    .innerJoin("normalized_jobs as j", (join) =>
      join.onRef("j.company_id", "=", "c.id").on("j.is_relevant", "=", 1),
    )
    .where("c.company_type", "=", "direct_employer")
    .select([
      "c.id",
      "c.name",
      "c.normalized_name",
      "c.description",
      sql<number>`count(distinct j.id)`.as("job_count"),
    ])
    .groupBy("c.id")
    .orderBy("c.name", "asc")
    .execute();

  const companyIds = rows.map((r) => r.id);
  if (companyIds.length === 0) return [];

  // Batch-fetch locations for all companies
  const locationRows = await db
    .selectFrom("normalized_jobs as j")
    .innerJoin("locations as l", "l.id", "j.location_id")
    .where("j.company_id", "in", companyIds)
    .where("j.is_relevant", "=", 1)
    .select(["j.company_id", "l.name"])
    .distinct()
    .execute();

  const locationsByCompany = new Map<number, string[]>();
  for (const row of locationRows) {
    const list = locationsByCompany.get(row.company_id) ?? [];
    list.push(row.name);
    locationsByCompany.set(row.company_id, list);
  }

  // Batch-fetch technologies for all companies
  const techRows = await db
    .selectFrom("normalized_jobs as j")
    .innerJoin("job_technologies as jt", "jt.job_id", "j.id")
    .innerJoin("technologies as t", "t.id", "jt.technology_id")
    .where("j.company_id", "in", companyIds)
    .where("j.is_relevant", "=", 1)
    .select(["j.company_id", "t.name"])
    .distinct()
    .execute();

  const techsByCompany = new Map<number, string[]>();
  for (const row of techRows) {
    const list = techsByCompany.get(row.company_id) ?? [];
    list.push(row.name);
    techsByCompany.set(row.company_id, list);
  }

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: companySlug(r.normalized_name),
    description: r.description,
    jobCount: Number(r.job_count),
    locations: locationsByCompany.get(r.id) ?? [],
    technologies: techsByCompany.get(r.id) ?? [],
  }));
}

export async function getCompanyBySlug(
  slug: string,
  companies: CompanyListItem[],
): Promise<CompanyDetail | null> {
  const company = companies.find((c) => c.slug === slug);
  if (!company) return null;

  const db = getDb();

  const jobRows = await db
    .selectFrom("normalized_jobs as j")
    .leftJoin("locations as l", "l.id", "j.location_id")
    .where("j.company_id", "=", company.id)
    .where("j.is_relevant", "=", 1)
    .select([
      "j.id",
      "j.title",
      "j.salary_text",
      "j.posted_date",
      "j.seniority_level",
      "j.work_arrangement",
      "j.job_url",
      "l.name as location_name",
    ])
    .orderBy("j.posted_date", "desc")
    .execute();

  const jobIds = jobRows.map((j) => j.id);

  let techsByJob = new Map<number, string[]>();
  if (jobIds.length > 0) {
    const techRows = await db
      .selectFrom("job_technologies as jt")
      .innerJoin("technologies as t", "t.id", "jt.technology_id")
      .where("jt.job_id", "in", jobIds)
      .select(["jt.job_id", "t.name"])
      .execute();

    for (const row of techRows) {
      const list = techsByJob.get(row.job_id) ?? [];
      list.push(row.name);
      techsByJob.set(row.job_id, list);
    }
  }

  const jobs: CompanyJob[] = jobRows.map((j) => ({
    id: j.id,
    title: j.title,
    location: j.location_name,
    salaryText: j.salary_text,
    postedDate: j.posted_date,
    seniorityLevel: j.seniority_level,
    workArrangement: j.work_arrangement,
    technologies: techsByJob.get(j.id) ?? [],
    jobUrl: j.job_url,
  }));

  return { ...company, jobs };
}
