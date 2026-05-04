import User from "@/app/models/user.model";
import connectDb from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDb();

    const { name, email, password, image } = await req.json();
    console.log("Registration attempt:", { name, email });

    const existUser = await User.findOne({ email });
    if (existUser) {
      console.log("Registration failed: Email already exists", email);
      return NextResponse.json(
        { message: "email already exist!" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      console.log("Registration failed: Password too short");
      return NextResponse.json(
        { message: "password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const hashpassPassword = await bcrypt.hash(password, 10);
    const normalizedImage =
      typeof image === "string" && image.trim() ? image.trim() : undefined;

    const user = await User.create({
      name,
      email,
      password: hashpassPassword,
      image: normalizedImage,
    });

    console.log("Registration successful for:", email);
    return NextResponse.json(user, { status: 200 });

  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: `register error: ${error}` },
      { status: 500 }
    );
  }
}
