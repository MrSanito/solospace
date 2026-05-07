import { NextResponse } from "next/server";
import { authorize, authError } from "@/lib/auth";
import { AccessControlService } from "@/lib/services/accessControl.service";
import { z } from "zod";

const createRoleSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  icon: z.string().min(1),
  color: z.string().min(1),
});

export async function GET() {
  const auth = await authorize();
  if (!auth.authorized) return authError(auth);

  try {
    const roles = await AccessControlService.getRoles(auth.user!.organizationId);
    return NextResponse.json(roles);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await authorize("USER_MANAGEMENT");
  if (!auth.authorized) return authError(auth);

  try {
    const body = await req.json();
    const validated = createRoleSchema.parse(body);
    
    const role = await AccessControlService.createRole(auth.user!.organizationId, validated);
    return NextResponse.json(role, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
