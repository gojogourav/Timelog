//logout.ts
import { cookies } from "next/headers";
import Router from "next/router";
import { NextRequest, NextResponse } from "next/server";


export async function POST(request:NextRequest) {
    (await cookies()).delete('access_token')
    ;(await cookies()).delete('refresh_token')

    return NextResponse.redirect(new URL('/login', 'http://localhost:3000'))
}