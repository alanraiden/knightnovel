import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDiscussionThread } from "@/lib/queries";
import { DiscussionThreadClient } from "@/components/community/discussion-thread-client";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const thread = await getDiscussionThread(params.id);
  if (!thread) return {};
  return {
    title: `${thread.root.title} · ${thread.novelTitle}`,
    description: thread.root.body.slice(0, 160),
  };
}

export default async function DiscussionPage({ params }: { params: { id: string } }) {
  const thread = await getDiscussionThread(params.id);
  if (!thread || thread.status === "removed") notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
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
