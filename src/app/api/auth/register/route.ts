import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { API_CODES } from "@/constants/apiMessages";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ code: API_CODES.AUTH.VALIDATION_FAILED }, { status: 400 });
    }

    const { name, email, password } = parsed.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ code: API_CODES.AUTH.EMAIL_EXISTS }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return NextResponse.json({ code: API_CODES.AUTH.USER_CREATED }, { status: 201 });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ code: API_CODES.COMMON.SERVER_ERROR }, { status: 500 });
  }
}
