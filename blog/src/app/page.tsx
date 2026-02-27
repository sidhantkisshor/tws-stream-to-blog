import { getRecentPosts } from "@/lib/posts";
import { PostCard } from "@/components/PostCard";

export const revalidate = 60;

export default async function HomePage() {
  const posts = await getRecentPosts();

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-deep-slate">
          <span className="text-burnt-amber">TWS</span> Trading Insights
        </h1>
        <p className="mt-2 text-lg text-deep-slate/70">
          Live stream analysis and market insights
        </p>
      </header>

      {posts.length === 0 ? (
        <p className="text-deep-slate/50">No posts yet. Check back after the next live stream.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} {...post} />
          ))}
        </div>
      )}
    </main>
  );
}
