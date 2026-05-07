import { NextResponse, NextRequest } from "next/server";
import { authorize, authError } from "@/lib/auth";
import { AccessControlService } from "@/lib/services/accessControl.service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ roleId: string }> }
) {
  const auth = await authorize();
  if (!auth.authorized) return authError(auth);

  try {
    const { roleId } = await params;
    const { searchParams } = req.nextUrl;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const users = await AccessControlService.getUsers(roleId, page, limit);
    return NextResponse.json(users);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
