import Link from "next/link";
import { Shout } from "@/components/Shout";

export default function NotFound() {
  return (
    <main className="px-[var(--gutter)] pb-24 pt-6 md:pt-10">
      <Shout as="h1" text="This trade does not exist" hot="last" />
      <p className="mt-6 max-w-[40ch] text-xl leading-snug text-ink">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link href="/" className="btn mt-7">
        Back to home
      </Link>
    </main>
  );
}
