import { NextApiRequest, NextApiResponse } from "next";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import jwt from 'jsonwebtoken'
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
    try {
        const accessToken = (await cookies()).get('access_token')?.value
        if (!accessToken) {
            return res.status(401).json({ error: "Unauthorized" });
          }      
        
        const decoded = jwt.verify(
            accessToken,
            process.env.JWT_REFRESH_SECRET!,
        ) as jwt.JwtPayload

        const user = await prisma.user.findUnique({
            where: {
                id: decoded.userId
            }
        })



        const { userId,
            description,
            activityTitle,


        } = await req.body()

        if(!activityTitle){
            return res.status(401).json({error:"Please activity must have some title"})
        }

        if (!user || !(userId === decoded.userId)) {
            return res.json({ error: "Failed to authenticate user" })
        }

        const newActivity = await prisma.activity.create({
            data: {
                userId:decoded.userId,
                creator:decoded.userId,
                description,
                activityTitle,
                private:true,

            }
        })


        return res.status(200).json({ newActivity })
    } catch (error) {
        console.error("Error creating session:", error);
        return res.status(500).json({ error: "Internal server error" });
    }

}