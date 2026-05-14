import { createClient } from "@/lib/supabase/server";
import { SearchClient } from "@/components/feed/SearchClient";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary"


export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }: any) {
  // ✅ await createClient
  const supabase = await createClient();
  const q = (searchParams?.q || "").trim();

  let posts: any[] = [];
  let groups: any[] = [];
  let equipment: any[] = [];

  if (q) {
    const [p, g, e] = await Promise.all([
  supabase
    .from("posts")
    .select("id, title, created_at, profiles(username)")
    .textSearch("fts", q, { type: "websearch", config: "english" })  // uses your gin index
    .limit(15),
  supabase
    .from("groups")
    .select("id, name, location, profiles(username)")
    .textSearch("fts", q, { type: "websearch", config: "english" })
    .limit(15),
  supabase
    .from("equipment")
    .select("id, title, category, condition, profiles(username)")
    .textSearch("fts", q, { type: "websearch", config: "english" })
    .limit(15),
]);
    posts = p.data || [];
    groups = g.data || [];
    equipment = e.data || [];
  }

  return <ErrorBoundary>
  <SearchClient q={q} posts={posts} groups={groups} equipment={equipment} />
</ErrorBoundary>
}