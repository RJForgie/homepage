import { sql } from "kysely";
import { getDb } from "../db/client";

export interface TrendStats {
  totalJobs: number;
  totalRelevantJobs: number;
  totalCompanies: number;
  totalDirectEmployers: number;
  topTechnologies: Array<{
    name: string;
    category: string | null;
    count: number;
  }>;
  topLocations: Array<{ name: string; count: number }>;
  seniorityBreakdown: Array<{ level: string; count: number }>;
  workArrangementBreakdown: Array<{ arrangement: string; count: number }>;
}

export async function getTrendStats(): Promise<TrendStats> {
  const db = getDb();

  const [
    jobCounts,
    companyCounts,
    topTechs,
    topLocs,
    seniorityRows,
    arrangementRows,
  ] = await Promise.all([
    // Job counts (all data for trends)
    db
      .selectFrom("normalized_jobs")
      .select([
        sql<number>`count(*)`.as("total"),
        sql<number>`sum(case when is_relevant = 1 then 1 else 0 end)`.as(
          "relevant",
        ),
      ])
      .executeTakeFirstOrThrow(),

    // Company counts
    db
      .selectFrom("companies")
      .select([
        sql<number>`count(*)`.as("total"),
        sql<number>`sum(case when company_type = 'direct_employer' then 1 else 0 end)`.as(
          "direct",
        ),
      ])
      .executeTakeFirstOrThrow(),

    // Top technologies (from all jobs)
    db
      .selectFrom("job_technologies as jt")
      .innerJoin("technologies as t", "t.id", "jt.technology_id")
      .select([
        "t.name",
        "t.category",
        sql<number>`count(jt.job_id)`.as("count"),
      ])
      .groupBy("t.id")
      .orderBy("count", "desc")
      .limit(20)
      .execute(),

    // Top locations (from all jobs)
    db
      .selectFrom("normalized_jobs as j")
      .innerJoin("locations as l", "l.id", "j.location_id")
      .select(["l.name", sql<number>`count(j.id)`.as("count")])
      .groupBy("l.id")
      .orderBy("count", "desc")
      .limit(10)
      .execute(),

    // Seniority breakdown (relevant jobs only)
    db
      .selectFrom("normalized_jobs")
      .where("is_relevant", "=", 1)
      .where("seniority_level", "is not", null)
      .select(["seniority_level", sql<number>`count(*)`.as("count")])
      .groupBy("seniority_level")
      .orderBy("count", "desc")
      .execute(),

    // Work arrangement breakdown (relevant jobs only)
    db
      .selectFrom("normalized_jobs")
      .where("is_relevant", "=", 1)
      .where("work_arrangement", "is not", null)
      .select(["work_arrangement", sql<number>`count(*)`.as("count")])
      .groupBy("work_arrangement")
      .orderBy("count", "desc")
      .execute(),
  ]);

  return {
    totalJobs: Number(jobCounts.total),
    totalRelevantJobs: Number(jobCounts.relevant),
    totalCompanies: Number(companyCounts.total),
    totalDirectEmployers: Number(companyCounts.direct),
    topTechnologies: topTechs.map((t) => ({
      name: t.name,
      category: t.category,
      count: Number(t.count),
    })),
    topLocations: topLocs.map((l) => ({
      name: l.name,
      count: Number(l.count),
    })),
    seniorityBreakdown: seniorityRows.map((s) => ({
      level: s.seniority_level!,
      count: Number(s.count),
    })),
    workArrangementBreakdown: arrangementRows.map((a) => ({
      arrangement: a.work_arrangement!,
      count: Number(a.count),
    })),
  };
}
