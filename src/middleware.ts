import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// ─── Route definitions ────────────────────────────────────────────────────────
// Routes that require a verified (network-checked) user identity.
// Keep this list small — every hit here costs a round-trip to Supabase Auth.
const PROTECTED_ROUTES = [
  "/feed/create",
  "/profile",
  "/trek-rooms/create",
  "/trek-rooms/join",
  "/marketplace/list",
  "/profile/edit",
];

// Routes that should redirect to /feed if the user IS logged in
const AUTH_ROUTES = ["/login", "/register"];

// ─── Helper ───────────────────────────────────────────────────────────────────
function matchesRoute(pathname: string, routes: string[]): boolean {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── 1. Build the Supabase SSR client ────────────────────────────────────────
  //    We use a "staging" response to collect cookie mutations, then we'll
  //    transfer everything to the final response at the very end.
  //    This avoids the bug where supabaseResponse gets re-created inside
  //    setAll() and wipes headers we already set.

  let cookieMutations: Array<{
    name: string;
    value: string;
    options?: object;
  }> = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        // Collect mutations — apply them to the final response at the end.
        // This ensures headers set after this point are NEVER lost.
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          cookieMutations = cookiesToSet;
        },
      },
    },
  );

  // ── 2. Fast session read (cookie-local, ~0ms) ───────────────────────────────
  //    getSession() reads the JWT from cookies. No network call unless the
  //    token is expired and needs refreshing.
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const hasSession = !!session;

  // ── 3. Slow verified check (network call to Supabase Auth) ──────────────────
  //    Only pay this cost for routes that actually need verified identity.
  //    For /feed, /marketplace browsing, etc. — the cookie session is enough.
  let verifiedUserId: string | null = null;
  let verifiedUserEmail: string | null = null;

  if (hasSession && matchesRoute(pathname, PROTECTED_ROUTES)) {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      // Token was invalid — sign them out and redirect to login
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      redirectUrl.searchParams.set("redirected", "true");
      return NextResponse.redirect(redirectUrl);
    }

    verifiedUserId = user.id;
    verifiedUserEmail = user.email ?? null;
  }

  // ── 4. Redirect logic ───────────────────────────────────────────────────────

  // Unauthenticated user trying to access a protected route
  if (!hasSession && matchesRoute(pathname, PROTECTED_ROUTES)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", pathname); // remember where they wanted to go
    return NextResponse.redirect(redirectUrl);
  }

  // Authenticated user trying to access login/register — send them home
  if (hasSession && matchesRoute(pathname, AUTH_ROUTES)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/feed";
    return NextResponse.redirect(redirectUrl);
  }

  // ── 5. Build the final response ─────────────────────────────────────────────
  //    We create the response ONCE here, then apply cookies + headers.
  //    This is the fix for the header-wipe bug in your original code.
  const response = NextResponse.next({ request });

  // Apply any cookie mutations Supabase collected (e.g. token refresh)
  cookieMutations.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options as any);
  });

  // Pass user identity to Server Components via headers — 0ms cost in pages
  const userId = verifiedUserId ?? session?.user?.id ?? "";
  const userEmail = verifiedUserEmail ?? session?.user?.email ?? "";

  response.headers.set("x-user-id", userId);
  response.headers.set("x-user-email", userEmail);

  // Useful for server components to know if the current route is protected
  response.headers.set(
    "x-route-protected",
    matchesRoute(pathname, PROTECTED_ROUTES) ? "true" : "false",
  );

  return response;
}

// ─── Matcher ──────────────────────────────────────────────────────────────────
// Excludes:
//   - API routes         → don't run auth overhead on your own backend calls
//   - _next internals    → static assets, image optimization
//   - PWA files          → icons, manifest, service worker
//   - favicon            → obvious
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon\\.ico|icons|manifest\\.json|sw\\.js|workbox.*).*)",
  ],
};
