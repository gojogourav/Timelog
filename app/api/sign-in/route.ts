import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from 'jsonwebtoken'

export async function POST(req: NextRequest) {
    try{
        const {username,password} = await req.json()

        const fakeUser = {
            id:'1',
            username:'user',
            password:'password'
        }

        if (!fakeUser || !(await bcrypt.compare(password, fakeUser.password))) {
            return NextResponse.json(
              { error: "Invalid credentials" },
              { status: 401 }
            )
          }

        const accessToken = await jwt.sign(
            {userId:fakeUser.id},
            process.env.JWT_ACCESS_SECRET!,
            {expiresIn:'15m'}
        )

        const refreshToken = await jwt.sign(
            {userId:fakeUser.id,tokenVersion:0},
            process.env.JWT_ACCESS_SECRET!,
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
            {error:"Internal server error"},
            {status:500}
        )

    }
    
}