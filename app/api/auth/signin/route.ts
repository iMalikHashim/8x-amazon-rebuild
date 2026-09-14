import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { createSession, setSessionCookie } from "@/lib/session";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid" }, { status: 400 });

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user) {
    return NextResponse.json({ error: "unknown-email" }, { status: 401 });
  }

  const matches = await bcrypt.compare(password, user.passwordHash);
  if (!matches) {
    return NextResponse.json({ error: "wrong-password" }, { status: 401 });
  }

  const token = await createSession(user.id);
  await setSessionCookie(token);

  return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } });
}
