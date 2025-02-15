import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    // Only allow POST req
    

    try {

        const accessToken = (await cookies()).get('access_token')?.value
        if (!accessToken) {
            return NextResponse.json({ error: "Unauthorized" },{status:401});
        }

        const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET!) as jwt.JwtPayload;
        if (!decoded || !decoded.userId) {
            return NextResponse.json({ error: "Invalid token" },{status:401});
        }
        const userId = decoded.userId;

        const { activityId } = await req.json();
        if (!activityId) {
            return NextResponse.json({ error: "Missing activityId" },{status:400});
        }

        const activity = await prisma.activity.findUnique({
            where: { id: activityId },
        });
        
        if (!activity) {
            return NextResponse.json({ error: "Activity not found" },{status:404});
        }

        // Check if the activity is private
        if (activity.private) {
            return NextResponse.json({ error: "This activity is private. You cannot join it." },{status:403});
        }

        // Add the user to the activity's members list using Prisma's connect
        const updatedActivity = await prisma.activity.update({
            where: { id: activityId },
            data: {
                members: {
                    connect: { id: userId },
                },
            },
            include: { members: true },
        });

        return NextResponse.json({
            message: "Successfully joined the activity",
            activity: updatedActivity,
        },{status:200});
    } catch (error) {
        console.error("Error joining activity:", error);
        return NextResponse.json({ error: "Internal server error" },{status:500});
    }
}
