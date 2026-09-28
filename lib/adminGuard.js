import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth";

// For admin pages: send anyone without a valid session cookie to the login
// page. Call it first, before reading any data.
export async function requireAdminPage() {
  const cookieStore = await cookies();
  if (!isAdminRequest(cookieStore)) redirect("/admin/login");
}

// For admin API routes: returns a 401 response to send back, or null when the
// caller is the admin.
export async function requireAdminApi() {
  const cookieStore = await cookies();
  if (!isAdminRequest(cookieStore)) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  return null;
}
