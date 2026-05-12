import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-me";

// Helper: Levenshtein Distance for fuzzy matching
function levenshteinDistance(s1: string, s2: string): number {
  const len1 = s1.length;
  const len2 = s2.length;
  const matrix = Array.from({ length: len1 + 1 }, () => Array(len2 + 1).fill(0));

  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }
  return matrix[len1][len2];
}

function isNameMatch(provided: string, actual: string): boolean {
  const p = provided.toLowerCase().trim();
  const a = actual.toLowerCase().trim();

  // 1. Exact match or inclusion
  if (p === a || a.includes(p) || p.includes(a)) return true;

  // 2. Word overlap check
  const pWords = p.split(/\s+/);
  const aWords = a.split(/\s+/);
  for (const pw of pWords) {
    if (pw.length < 3) continue; // skip short words like 'of', 'mr'
    for (const aw of aWords) {
      if (aw === pw || aw.includes(pw) || pw.includes(aw)) return true;
      // Also allow 1 char difference for typos in any word
      if (levenshteinDistance(pw, aw) <= 1) return true;
    }
  }

  // 3. Full string fuzzy match (for cases where spaces are missing etc.)
  const distance = levenshteinDistance(p.replace(/\s/g, ""), a.replace(/\s/g, ""));
  if (distance <= 2) return true;

  return false;
}

export async function POST(req: Request) {
  console.log(">>> [DEBUG] API Route /api/auth/email-login reached");
  try {
    const body = await req.json();
    console.log(">>> [DEBUG] Request body:", body);
    const { email, name } = body;

    if (!email) {
      console.log(">>> [DEBUG] No email provided");
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    console.log(">>> [DEBUG] Normalized email:", normalizedEmail);

    // 1. Special Case: vishal@gmail.com
    if (normalizedEmail === "vishal@gmail.com") {
      console.log(">>> [DEBUG] Special bypass triggered for vishal");
      
      const user = await prisma.user.findFirst({
        where: { email: normalizedEmail }
      });
      console.log(">>> [DEBUG] User search result:", user ? "Found" : "Not Found");

      if (user) {
        // Verify Name for vishal user
        if (!name || !isNameMatch(name, user.name)) {
          return NextResponse.json({ 
            error: "Access Denied: The name provided does not match our records for this email." 
          }, { status: 403 });
        }

        const token = jwt.sign(
          { userId: user.id, email: user.email, role: user.role, organizationId: user.organizationId },
          JWT_SECRET,
          { expiresIn: "1d" }
        );

        const response = NextResponse.json({ 
          message: "Login successful (Bypassed OTP)", 
          user: { id: user.id, name: user.name, email: user.email, role: user.role, organizationId: user.organizationId },
          redirect: "/dashboard"
        });

        response.cookies.set("token", token, { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === "production", 
            sameSite: "lax", 
            maxAge: 86400, 
            path: "/" 
        });
        return response;
      }

      const lead = await prisma.lead.findFirst({
        where: {
          OR: [{ email: normalizedEmail }, { email2: normalizedEmail }]
        }
      });
      console.log(">>> [DEBUG] Lead search result:", lead ? "Found" : "Not Found");

      if (lead) {
        // Verify Name for vishal lead
        if (!name || !isNameMatch(name, lead.contactName)) {
          return NextResponse.json({ 
            error: "Access Denied: The name provided does not match our records for this email." 
          }, { status: 403 });
        }

        const token = jwt.sign(
          { leadId: lead.id, email: normalizedEmail, role: "LEAD", organizationId: lead.organizationId },
          JWT_SECRET,
          { expiresIn: "1d" }
        );

        const response = NextResponse.json({ 
          message: "Login successful (Bypassed OTP)", 
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
      }

      console.log(">>> [DEBUG] Vishal not found in User or Lead tables");
      return NextResponse.json({ error: "User vishal@gmail.com not found in DB" }, { status: 404 });
    }

    // 2. Normal Lead check
    const lead = await prisma.lead.findFirst({
      where: {
        OR: [{ email: normalizedEmail }, { email2: normalizedEmail }]
      }
    });
    console.log(">>> [DEBUG] Regular lead check result:", lead ? "Found" : "Not Found");

    if (!lead) {
      return NextResponse.json({ error: "Email not registered as a CRM Lead" }, { status: 404 });
    }

    // 2.5 Check if Lead is a CUSTOMER
    if (lead.stage !== "CUSTOMER") {
      return NextResponse.json({ 
        error: "Access Denied: You do not have access currently. Please contact support." 
      }, { status: 403 });
    }

    // 2.6 Verify Name
    if (!name || !isNameMatch(name, lead.contactName)) {
      console.log(`>>> [DEBUG] Name mismatch. Provided: "${name}", Actual: "${lead.contactName}"`);
      return NextResponse.json({ 
        error: "Access Denied: The name provided does not match our records for this email." 
      }, { status: 403 });
    }

    // 3. Send OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    console.log(">>> [DEBUG] Generating OTP:", otpCode);

    await prisma.otp.upsert({
        where: { email: normalizedEmail },
        update: { code: otpCode, expiresAt },
        create: { email: normalizedEmail, code: otpCode, expiresAt }
    });

    // Try sending email but don't block login if it fails (for debugging)
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.SMTP_EMAIL,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: process.env.SMTP_EMAIL,
        to: normalizedEmail,
        subject: "Your Login OTP",
        text: `Your OTP for login is: ${otpCode}`,
      });
      console.log(">>> [DEBUG] Email sent successfully");
    } catch (mailError) {
      console.error(">>> [DEBUG] Email failed to send:", mailError);
      // For now, return a 200 with the OTP in the response ONLY if in dev mode
      // Actually, let's just return the error.
      return NextResponse.json({ error: "Failed to send email. Check SMTP config." }, { status: 500 });
    }

    return NextResponse.json({ message: "OTP sent", otpSent: true });
  } catch (error: any) {
    console.error(">>> [DEBUG] Fatal error in route:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

