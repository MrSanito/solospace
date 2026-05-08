import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-me";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Fetch user to get organizationId
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { organizationId: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const leads = await prisma.lead.findMany({
      where: { organizationId: user.organizationId },
      select: { industry: true },
      distinct: ['industry'],
    });

    const industries = leads
      .map(l => l.industry)
      .filter((i): i is string => !!i && i.trim() !== "")
      .sort();

    return NextResponse.json(industries);
  } catch (error) {
    console.error("Error fetching industries:", error);
    return NextResponse.json({ error: "Failed to fetch industries" }, { status: 500 });
  }
}
