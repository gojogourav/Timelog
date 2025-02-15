import { PrismaClient } from "@prisma/client";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
export async function GET(req: NextRequest) {
    try {
        const accessToken = (await cookies()).get('access_token')?.value
        if (!accessToken) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 500 })

        }

        if (!process.env.JWT_ACCESS_SECRET) {
            console.error("JWT_ACCESS_SECRET is not defined in the environment.");
            return NextResponse.json(
                { error: "Server configuration error" },
                { status: 500 }
            );
        }

        const decoded = await jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET!) as jwt.JwtPayload

        if (!decoded) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 500 })
        }

        const user = await prisma.user.findUnique({
            where: {
                id: decoded.userId
            }
        })

        if (!user) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 500 })
        }

        const activities = await prisma.timeLog.findMany({
            where: {
                activity:{
                    userId:decoded.userId
                }
            },
            include:{activity:true}
        })

        return NextResponse.json({ activities }, { status: 200 })

    } catch (error) {
        console.log("Error creating session:", error);
        if (error instanceof jwt.TokenExpiredError) {
            return NextResponse.json(
                { error: "Session expired" },
                { status: 401 }
            );
        }

        if (error instanceof jwt.JsonWebTokenError) {
            return NextResponse.json(
                { error: "Invalid token" },
                { status: 401 }
            );
        }

        return NextResponse.json({ error }, { status: 500 });

    }
}