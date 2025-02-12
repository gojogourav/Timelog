import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { cookies } from "next/headers";

const prisma = new PrismaClient()
export async function POST(request:NextRequest) {
    try{
        const {username,password} = await request.json()

        const user = await prisma.user.findUnique({
            where:{username}
        })

        if(!user || !(await bcrypt.compare(password,user.password))){
            return NextResponse.json(
                {error:"Invalid credentials"},
                {status:401}
            )
        }

        const accessToken = jwt.sign(
            {userId:user.id},
            process.env.JWT_ACCESS_SECRET!,
            {expiresIn:'15m'}
        )

        const refreshToken = jwt.sign(
            {userId:user.id},
            process.env.JWT_REFRESH_SECRET!,
            {expiresIn:'7d'}
        )
        
        ;(await cookies()).set('access_token',accessToken,{
            httpOnly:true,
            secure:true,
            sameSite:'strict',
            maxAge:900
        })

        ;(await cookies()).set('refresh_token',refreshToken,{
            httpOnly:true,
            secure:true,
            sameSite:'strict',
            maxAge:604800
        })

        return NextResponse.json({success:true})

    }catch(error){
        return NextResponse.json(
            {error:"internal server error"},
            {status:500}
        )

    }
}