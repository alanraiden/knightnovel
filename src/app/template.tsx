// A template (unlike layout) remounts on every navigation, so this gives
// every page a short, subtle fade-in without needing a client-side router
// event or an animation library — reuses the existing `fade-in` keyframe
// already defined in tailwind.config.ts.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="animate-fade-in">{children}</div>;
}
