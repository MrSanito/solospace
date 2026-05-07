import { NextResponse } from "next/server";
import { authorize, authError } from "@/lib/auth";
import { AccessControlService } from "@/lib/services/accessControl.service";
import { z } from "zod";
import { DataScopeType } from "@prisma/client";

const updateScopeSchema = z.object({
  scopeType: z.nativeEnum(DataScopeType),
  teamId: z.string().optional().nullable()
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
    const validated = updateScopeSchema.parse(body);

    await AccessControlService.updateScope(roleId, validated as any);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
