import { PostRow } from "./PostRow";

interface RelatedPost {
  title: string;
  slug: string;
  hook: string;
  tags: string[];
  publishedAt: Date;
}

interface RelatedPostsProps {
  posts: RelatedPost[];
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <section>
      <h2 className="section-heading mb-6">More on this topic</h2>
      {posts.map((post) => (
        <PostRow key={post.slug} post={post} stacked />
      ))}
    </section>
  );
}
