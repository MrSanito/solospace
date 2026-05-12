import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-me";

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();
    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Verify OTP
    const otpRecord = await prisma.otp.findUnique({
      where: { email: normalizedEmail }
    });

    if (!otpRecord || otpRecord.code !== otp || otpRecord.expiresAt < new Date()) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 401 });
    }

    // 2. Clear OTP
    await prisma.otp.delete({
      where: { email: normalizedEmail }
    });

    // 3. Find Lead and Generate JWT
    const lead = await prisma.lead.findFirst({
      where: {
        OR: [
          { email: normalizedEmail },
          { email2: normalizedEmail }
        ]
      }
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const token = jwt.sign(
      { leadId: lead.id, email: normalizedEmail, role: "LEAD", organizationId: lead.organizationId },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    const response = NextResponse.json({ 
      message: "Login successful", 
      lead: { id: lead.id, name: lead.contactName, email: normalizedEmail, role: "LEAD", organizationId: lead.organizationId },
      redirect: `/${lead.id}/dashboard`
    });

    response.cookies.set("leadToken", token, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === "production", 
        sameSite: "lax", 
        maxAge: 86400, 
        path: "/" 
    });

    return response;
  } catch (error: any) {
    console.error("[OTPVerify] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
