import { NextResponse } from "next/server";

// The one thing a Server Component can't otherwise learn about the current
// request: its pathname (it isn't a header). Everything else the analytics
// logging in app/layout.js needs — cookies, referer, a geo header from
// whatever's in front of the app — is already a real request header, read
// directly via headers() with no proxy involved. This runs on every request
// but does no I/O, just header cloning, so it's cheap; the actual DB write
// stays in app/layout.js, which runs in the Node runtime (this file runs in
// the Edge runtime, which node:sqlite is not available in).
export function proxy(request) {
  const headers = new Headers(request.headers);
  headers.set("x-pathname", request.nextUrl.pathname);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  // Skip static assets and Next's own internals — no page view to log there.
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|ico|css|js|map)$).*)"],
};
