import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDiscussionThread } from "@/lib/queries";
import { DiscussionThreadClient } from "@/components/community/discussion-thread-client";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const thread = await getDiscussionThread(params.id);
  if (!thread) return {};
  return {
    title: `${thread.root.title} · ${thread.novelTitle}`,
    description: thread.root.body.slice(0, 155).replace(/\n/g, " ").trimEnd() + (thread.root.body.length > 155 ? "…" : ""),
  };
}

export default async function DiscussionPage({ params }: { params: { id: string } }) {
  const thread = await getDiscussionThread(params.id);
  if (!thread || thread.status === "removed") notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      {/* Server-rendered H1 so crawlers see the discussion title in the
          initial HTML. The client component renders the same title visually
          as a styled div — the two don't conflict. */}
      <h1 className="sr-only">{thread.root.title}</h1>
      <DiscussionThreadClient
        discussionId={params.id}
        novelSlug={thread.novelSlug}
        initialRoot={thread.root}
        initialReplies={thread.replies}
        initialStatus={thread.status}
      />
    </div>
  );
}
