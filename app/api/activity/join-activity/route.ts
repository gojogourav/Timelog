import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get the JWT from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as jwt.JwtPayload;
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ error: "Invalid token" });
    }
    const userId = decoded.userId;

    // Get the activityId from the request body
    const { activityId } = req.body;
    if (!activityId) {
      return res.status(400).json({ error: "Missing activityId" });
    }

    // Fetch the activity from the database
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
    });
    if (!activity) {
      return res.status(404).json({ error: "Activity not found" });
    }

    // Check if the activity is private
    if (activity.private) {
      return res.status(403).json({ error: "This activity is private. You cannot join it." });
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

    return res.status(200).json({
      message: "Successfully joined the activity",
      activity: updatedActivity,
    });
  } catch (error) {
    console.error("Error joining activity:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
