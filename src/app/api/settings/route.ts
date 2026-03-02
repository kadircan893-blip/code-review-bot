import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { UpdateSettingsSchema } from "@/types/api";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await db.userSettings.upsert({
    where: { userId: session.user.id },
    update: {},
    create: { userId: session.user.id },
  });

  return NextResponse.json({ data: settings });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = UpdateSettingsSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid input", details: result.error.flatten() },
      { status: 422 }
    );
  }

  const { focusAreas, ...rest } = result.data;

  const settings = await db.userSettings.upsert({
    where: { userId: session.user.id },
    update: {
      ...rest,
      ...(focusAreas !== undefined
        ? { focusAreas: focusAreas.join(",") }
        : {}),
    },
    create: {
      userId: session.user.id,
      ...rest,
      ...(focusAreas !== undefined
        ? { focusAreas: focusAreas.join(",") }
        : {}),
    },
  });

  return NextResponse.json({ data: settings });
}
