import { NextApiRequest, NextApiResponse } from "next";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import jwt from 'jsonwebtoken'
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
    try {
        const accessToken = (await cookies()).get('access_token')?.value
        if (!accessToken) {
            return NextResponse.json({ error: "Unauthorized" },{status:401});
          }      

          if (!process.env.JWT_ACCESS_SECRET) {
            console.error("JWT_ACCESS_SECRET is not defined in the environment.");
            return NextResponse.json(
              { error: "Server configuration error" },
              { status: 500 }
            );
          }
      
        
        const decoded = await jwt.verify(
            accessToken,
            process.env.JWT_ACCESS_SECRET!,
        ) as jwt.JwtPayload

        const user = await prisma.user.findUnique({
            where: {
                id: decoded.userId
            }
        })

        const { 
            description,
            activityTitle,
            Activityphoto, 
            isPrivate
        } = await req.json()

        if(!activityTitle){
    return NextResponse.json({error:"Please activity must have some title"},{status:401})
        }

        if (!user ) {
            return NextResponse
            .json({ error: "Failed to authenticate user" },{status:402})
        }

        const newActivity = await prisma.activity.create({
            data: {
                userId:decoded.userId,
                description,
                activityTitle:activityTitle,
                private:isPrivate,
                Activityphoto
            }
        })


        return NextResponse.json({ newActivity },{status:200})
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
        
        return NextResponse.json({ error },{status:500});
    }

}