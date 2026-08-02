import { getAllNovels, getFeaturedSlugs } from "@/lib/queries";
import { FeaturedClient } from "@/components/admin/featured-client";

export default async function AdminFeaturedPage() {
  const [novels, currentlyFeatured] = await Promise.all([getAllNovels(), getFeaturedSlugs()]);
  return <FeaturedClient novels={novels} initialFeatured={currentlyFeatured} />;
}
