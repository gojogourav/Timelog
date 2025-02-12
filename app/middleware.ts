import { parse } from "cookie";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import jwt from 'jsonwebtoken'
import { PrismaClient } from "@prisma/client";
const API_PREFIX = '/api/'


const prisma = new PrismaClient()
const public_link = ['/', '/login', '/register', '/api/auth']
export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname
    const isApiRoute = pathname.startsWith('/api/')
    const isPublic = public_link.includes(pathname)


    if (isPublic && !isApiRoute) return NextResponse.next()

    const accessToken = (await cookies()).get('access_token')?.value
    const refreshToken = (await cookies()).get('refresh_token')?.value

    if (accessToken) {
        const decoded = await jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET!) as jwt.JwtPayload
        if (decoded) {
            return NextResponse.next()
        } else {
            return NextResponse.json({ error: "Error authenticating user" })
        }
    }

    if (refreshToken) {
        try {
            const decodedRefresh = await jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as jwt.JwtPayload
            if (!decodedRefresh) throw new Error('Invalid refresh Token')

            const user = await prisma.user.findUnique({
                where: { id: decodedRefresh.userId }
            })

            if (!user || user.tokenVersion !== decodedRefresh.tokenVersion) {
                throw new Error('Token revoked')
            }


            const newAccessToken = jwt.sign(
                { userId: decodedRefresh.userId },
                process.env.JWT_ACCESS_SECRET!,
                { expiresIn: '15m' }
            )
            const newRefreshToken = jwt.sign(
                { userId: decodedRefresh.userId },
                process.env.JWT_REFRESH_SECRET!,
                { expiresIn: '7d' }
            );

            await prisma.user.update({
                where: { id: decodedRefresh.userId },
                data: { tokenVersion: { increment: 1 } }
            })

            const response = NextResponse.next()

                ; (await cookies()).set('access_token', newAccessToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'strict',
                    maxAge: 900
                })

                ; (await cookies()).delete('refresh_token')

                ; (await cookies()).set('refresh_token', newRefreshToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'strict',
                    maxAge: 604800
                })



            return response
        } catch (error) {
            console.error('Token refresh failed ', error);
        }
    }


    if (isApiRoute) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        )
    }


    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    const response = NextResponse.redirect(loginUrl)
    response.cookies.delete('access_token')
    response.cookies.delete('refresh_token')
    return response
}