"use client";

import { Stats } from "./Stats";
import useSWR from "swr";
import { ArtisanStats } from "../../components/types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function StatsPage() {
  const { data: stats } = useSWR<ArtisanStats>("/api/artisan/stats", fetcher);

  return <Stats stats={stats} />;
}
