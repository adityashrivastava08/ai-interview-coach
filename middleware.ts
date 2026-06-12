export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/interview/:path*",
    "/api/history/:path*",
    "/api/interview/:path*",
    "/api/dsa/:path*",
    "/api/resume/:path*",
    "/api/user/:path*",
  ],
};
