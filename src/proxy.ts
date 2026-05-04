import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // 1. Allow public routes
    const publicRoutes = ["/login", "/register", "/api/auth", "/unauthorized"];
    if (publicRoutes.some((path) => pathname.startsWith(path))) {
        return NextResponse.next();
    }

    // 2. Check for token
    const token = await getToken({ req, secret: process.env.AUTH_SECRET });

    // console.log(token);
    // console.log(req.url);

    if (!token) {
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("callbackUrl", req.url);
        return NextResponse.redirect(loginUrl);
    }

    // 3. Role-based protection
    const role = token.role;

    // If the route is an admin route, but user is not admin
    if (pathname.startsWith("/admin") && role !== "admin") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    // If the route is a user route, but user is not a user
    if (pathname.startsWith("/user") && role !== "user") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    // If the route is a delivery route, but user is not a deliveryBoy
    if (pathname.startsWith("/delivery") && role !== "deliveryBoy") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    // Allow all other routes (like "/") for logged in users
    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|public/|.*\\..*).*)",
    ],
};
