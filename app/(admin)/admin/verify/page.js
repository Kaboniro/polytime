import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isAdminRequest, readPendingChallenge } from "@/lib/auth";
import { getChallenge } from "@/lib/adminLogin";
import VerifyForm from "@/components/admin/VerifyForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Enter your code — PolyTime Admin" };

// Step 2 of the admin login. Only reachable right after a correct password
// (a pending cookie for a real, unspent challenge); anyone else is sent back.
export default async function VerifyPage() {
  const cookieStore = await cookies();
  if (isAdminRequest(cookieStore)) redirect("/admin");
  const id = readPendingChallenge(cookieStore);
  if (!id || !getChallenge(id)) redirect("/admin/login");

  return <VerifyForm />;
}
