import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-me";

export async function GET() {
  return NextResponse.json({ message: "Lead Login API is alive. Use POST to authenticate." });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Check if prisma is initialized correctly
    if (!prisma || !(prisma as any).leadPortalAccount) {
      console.error(">>> [CRITICAL] Prisma Client is not synced with LeadPortalAccount model.");
      return NextResponse.json({ 
        error: "Server configuration error. Please restart the dev server (npm run dev) to sync database models.",
        details: "prisma.leadPortalAccount is undefined" 
      }, { status: 500 });
    }

    // Find the lead portal account
    const account = await prisma.leadPortalAccount.findUnique({
      where: { username: email },
      include: { 
        lead: {
          include: {
            organization: true
          }
        } 
      },
    });

    if (!account) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // For testing/quick-setup we used plain text. 
    // In a real scenario, use bcrypt.compare(password, account.passwordHash)
    if (account.passwordHash !== password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = jwt.sign(
      { 
        leadId: account.leadId, 
        email: account.username, 
        role: "LEAD", 
        organizationId: account.lead.organizationId 
      },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    const response = NextResponse.json(
      { 
        message: "Login successful", 
        lead: { 
          id: account.leadId, 
          name: account.lead.contactName, 
          email: account.username,
          organization: account.lead.organization.name
        } 
      },
      { status: 200 }
    );

    response.cookies.set("leadToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    // Update last login
    await prisma.leadPortalAccount.update({
        where: { id: account.id },
        data: { lastLoginAt: new Date() }
    });

    return response;
  } catch (error: any) {
    console.error("[LeadLogin] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
