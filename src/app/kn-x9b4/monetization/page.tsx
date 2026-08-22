import { getAdSettings } from "@/lib/queries";
import { MonetizationClient } from "@/components/admin/monetization-client";

export default async function AdminMonetizationPage() {
  const settings = await getAdSettings();
  return <MonetizationClient initialSettings={settings} />;
}
