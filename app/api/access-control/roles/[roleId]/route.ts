import { NextResponse } from "next/server";
import { authorize, authError } from "@/lib/auth";
import { AccessControlService } from "@/lib/services/accessControl.service";
import { z } from "zod";

const updateRoleSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  orderIndex: z.number().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ roleId: string }> }
) {
  const auth = await authorize("USER_MANAGEMENT");
  if (!auth.authorized) return authError(auth);

  try {
    const { roleId } = await params;
    const body = await req.json();
    const validated = updateRoleSchema.parse(body);

    const role = await AccessControlService.updateRole(roleId, auth.user!.organizationId, validated);
    return NextResponse.json(role);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ roleId: string }> }
) {
  const auth = await authorize("USER_MANAGEMENT");
  if (!auth.authorized) return authError(auth);

  try {
    const { roleId } = await params;
    await AccessControlService.deleteRole(roleId, auth.user!.organizationId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
