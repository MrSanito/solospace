import { NextResponse } from "next/server";
import { authorize, authError } from "@/lib/auth";
import { AccessControlService } from "@/lib/services/accessControl.service";
import { z } from "zod";
import { PermissionKey } from "@prisma/client";

const updatePermissionsSchema = z.object({
  permissions: z.array(z.object({
    permission: z.nativeEnum(PermissionKey),
    allowed: z.boolean()
  }))
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ roleId: string }> }
) {
  const auth = await authorize();
  if (!auth.authorized) return authError(auth);

  try {
    const { roleId } = await params;
    const permissions = await AccessControlService.getPermissions(roleId);
    return NextResponse.json(permissions);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ roleId: string }> }
) {
  const auth = await authorize("USER_MANAGEMENT");
  if (!auth.authorized) return authError(auth);

  try {
    const { roleId } = await params;
    const body = await req.json();
    const validated = updatePermissionsSchema.parse(body);

    await AccessControlService.updatePermissions(roleId, validated.permissions);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
