import type { Metadata } from "next";
import { getRankingsForPeriod } from "@/lib/queries";
import { RankingsClient } from "@/components/rankings/rankings-client";

type SearchParams = { period?: "day" | "week" | "month" };

const periodLabel: Record<string, string> = { day: "Today's", week: "This Week's", month: "This Month's" };

export function generateMetadata({ searchParams }: { searchParams: SearchParams }): Metadata {
  const period = searchParams.period ?? "day";
  return {
    title: `${periodLabel[period] ?? "Today's"} Top Novel Rankings`,
    description: `See the most popular web novels ${period === "day" ? "today" : period === "week" ? "this week" : "this month"} on Knight Novel.`,
  };
}

export default async function RankingsPage({ searchParams }: { searchParams: SearchParams }) {
  const [day, week, month] = await Promise.all([
    getRankingsForPeriod("day", 20),
    getRankingsForPeriod("week", 20),
    getRankingsForPeriod("month", 20),
  ]);
  return <RankingsClient day={day} week={week} month={month} initialPeriod={searchParams.period} />;
}
