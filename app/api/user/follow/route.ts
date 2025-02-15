import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { cookies } from "next/headers";
import jwt, { JwtPayload } from 'jsonwebtoken'
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient()

export async function POST(req: NextRequest, res: NextResponse) {
    try {
        const accessToken = (await cookies()).get('access_token')?.value
        if (!accessToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const decoded = await jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET!) as jwt.JwtPayload
        console.log(decoded);

        if (!decoded || !decoded.userId) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        const followerId = decoded.userId;

        const { username } = await req.json()

        if (!username) {
            return NextResponse.json({ error: "Username is required" }, { status: 400 });
        }
        const [followerUser, followeeUser] = await Promise.all([
            prisma.user.findUnique({ where: { id: followerId } }),
            prisma.user.findUnique({ where: { username } }),
        ]);


        if (!followerUser || !followeeUser) {
            return NextResponse.json({ error: "User not found" }, { status: 401 });
        }



        if (followerId === followeeUser.id) {
            return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
        }
        const isFollowing = await prisma.user.findFirst({
            where: {
                id: followerId,
                following: {
                    some: { id: followeeUser.id }
                }
            }
        })
        console.log(isFollowing);
        


        const updateUser = await prisma.user.update({
            where: { id: followerId },
            data: {
                following: isFollowing ? 
                    {disconnect: { id: followeeUser?.id }} 
                    :{connect: { id: followeeUser?.id }}
            }
        })

        return NextResponse.json({
            message: isFollowing?"User unfollowed successfully":"User followed successfully",
            user: updateUser
        }, { status: 200 })
    } catch (err) {
        console.log("Error following user:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}