import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()
export async function POST(request: NextRequest) {
    try {
        const { username,email, password } = await request.json()
        if (!username ||!email ||!password) {
            return NextResponse.json(
                { error: "All fields are required" },
                { status: 400 }
            )
        }

        const existingUser = await prisma.user.findFirst({
            where: {

                OR:[
                    {username},
                    {email}
                ]
            }
        })

        if (existingUser) {
            return NextResponse.json(
                { error: "Username and email already exists" },
                { status: 409 }
            )
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
                profilePhoto: '',
                tokenVersion: 0
            }
        })

        return NextResponse.json(
            { success: true, userId: newUser.id },
            { status: 201 }
        )
    } catch (error) {
        console.log(`Error in registering user :( - ${error}`);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}