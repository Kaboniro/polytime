import { redirect } from "next/navigation";

// The Queries tab became Submissions (queries plus visitor events and links).
export default function QueriesPage() {
  redirect("/admin/submissions?type=query");
}
