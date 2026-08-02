export const metadata = { title: "About Us" };
export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-xl font-medium text-text-primary">About Knight Novel</h1>
      <p className="mt-4 text-sm leading-relaxed text-text-secondary">
        Knight Novel is a community-first platform for discovering and discussing web novels.
        We built it around genuine discussion rather than points, levels, or streak pressure —
        the goal is simply to help readers find great stories and talk about them.
      </p>
    </div>
  );
}
