import { authMiddleware } from "@clerk/nextjs";

// Embeds the auth state inside of the request itself.
// Done in the edge before it hits our servers.

// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your middleware
export default authMiddleware({
  publicRoutes: ["/api/webhooks/users", "/notifications", "/", "/api/trigger"],
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
