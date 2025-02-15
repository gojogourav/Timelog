import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import jwt from 'jsonwebtoken'
import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient()
export async function POST(request: NextRequest) {
    try {
        const refreshToken = (await cookies()).get('refresh_token')?.value

        if (!refreshToken) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const decoded = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET!,
        ) as jwt.JwtPayload

        const user = await prisma.user.findUnique({
            where: {
                id: decoded.userId
            }
        })
        if (!user || user.tokenVersion !== decoded.tokenVersion) {
            return NextResponse.json(
                { error: "Token revoked" },
                { status: 401 }
            );
        }


        const newAccessToken = jwt.sign(
            { userId: decoded.userId },
            process.env.JWT_REFRESH_SECRET!,
            { expiresIn: '15m' }
        )


        ; (await cookies()).set('access_token', newAccessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 900
            })

        return NextResponse.json({ sucess: true })

    } catch (error) {
        (await cookies()).delete('access_token')
            ; (await cookies()).delete('refresh_token')
        return NextResponse.json(
            { error: "Invalid refresh token" },
            { status: 401 }
        )
    }
}