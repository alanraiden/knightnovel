import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDashboardData, getUserComments, getEditableProfile, getNotificationSettings } from "@/lib/queries";
import { ProfileClient } from "@/components/bookmarks/profile-client";

export const metadata = { title: "Profile", robots: { index: false, follow: false } };

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  const [data, myComments, editableProfile, notificationSettings] = await Promise.all([
    getDashboardData(userId),
    userId ? getUserComments(userId) : Promise.resolve([]),
    userId ? getEditableProfile(userId) : Promise.resolve(null),
    userId ? getNotificationSettings(userId) : Promise.resolve(null),
  ]);

  return (
    <ProfileClient
      data={data}
      myComments={myComments}
      editableProfile={editableProfile}
      initialNotificationSettings={notificationSettings}
    />
  );
}
