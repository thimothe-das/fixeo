import { getTeamForUser } from "@/lib/db/queries/common";

export async function GET() {
  const team = await getTeamForUser();
  return Response.json(team);
}
