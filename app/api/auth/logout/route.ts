import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-me";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: { id: true, name: true, organizationId: true }
        });

        if (user) {
          await createAuditLog({
            organizationId: user.organizationId,
            actorType: "USER",
            actorId: user.id,
            actorName: user.name,
            action: "LOGOUT",
            note: "User logged out successfully",
            source: "UI"
          });
        }
      } catch (jwtError) {
        console.error("JWT verification failed during logout:", jwtError);
      }
    }

    const response = NextResponse.json({ message: "Logout successful" }, { status: 200 });
    response.cookies.set("token", "", { maxAge: 0, path: "/" });
    return response;
  } catch (error) {
    console.error("Logout error:", error);
    // Even if logging fails, we should still clear the cookie
    const response = NextResponse.json({ message: "Logout successful" }, { status: 200 });
    response.cookies.set("token", "", { maxAge: 0, path: "/" });
    return response;
  }
}
