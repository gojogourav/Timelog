'use client'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation';
function TopBar() {
    const [isActive,setIsActive] = useState('/');
    const [isHovered,setIsHovered] = useState(false);

    const pathname = usePathname()

  return (
    <div>

        <div className='mt-5 text-white font-bold bg-black items-center content-center justify-around w-full flex text-center
            font-mono text-lg
        '>
            <Link href='/'  className={`text-xl cursor-pointer hover:text-green-500 ${pathname==='/dashboard'?`text-green-500`:''}`} >
                Time Tracker
            </Link>
            <div className='lg:flex text-lg md:flex justify-between space-x-8 hidden lg:block '>
                
                <Link href='/pomodoro' className={`cursor-pointer hover:text-green-500 ${pathname==='/social-share'?`text-green-500`:''}`}>
    
                Quick Pomodoro
                </Link>
                
                <Link href='/session' className={`cursor-pointer hover:text-green-500 ${pathname==='/video-share'?`text-green-500`:''}`}>
    
                Session
                </Link>
                <Link href='/activity' className={`cursor-pointer hover:text-green-500 ${pathname==='/video-share'?`text-green-500`:''}`}>
    
                Activity
                </Link>
                <Link href='/leaderboard' className={`cursor-pointer hover:text-green-500 ${pathname==='/video-share'?`text-green-500`:''}`}>
    
                LeaderBoard
                </Link>
                <Link href='/profile' className={`cursor-pointer hover:text-green-500 ${pathname==='/video-share'?`text-green-500`:''}`}>
    
                Profile
                </Link>
            </div>
    
        </div>
    </div>
  )
}

export default TopBar