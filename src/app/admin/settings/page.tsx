import { getSiteLogoUrl } from "@/lib/queries";
import { SettingsClient } from "@/components/admin/settings-client";

export default async function AdminSettingsPage() {
  const logoUrl = await getSiteLogoUrl();
  return <SettingsClient initialLogoUrl={logoUrl} />;
}
