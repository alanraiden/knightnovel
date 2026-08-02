import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDashboardData, getUserComments } from "@/lib/queries";
import { ProfileClient } from "@/components/bookmarks/profile-client";

export const metadata = { title: "Profile", robots: { index: false, follow: false } };

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  const [data, myComments] = await Promise.all([
    getDashboardData(userId),
    userId ? getUserComments(userId) : Promise.resolve([]),
  ]);

  return <ProfileClient data={data} myComments={myComments} />;
}
