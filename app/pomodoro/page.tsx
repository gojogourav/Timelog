"use client"
import React, { useEffect, useState } from 'react'

function Page() {
  const [timer, setTimer] = useState(25 * 60);
  const [isBreak, setIsBreak] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [workDuration, setWorkDuration] = useState(25 * 60);
  const [breakDuration, setBreakDuration] = useState(5 * 60);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secondsRemainder = (seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${secondsRemainder}`;
  };

  // Update timer duration when work/break durations or break state changes
  useEffect(() => {
    setTimer(isBreak ? breakDuration : workDuration);
  }, [isBreak, workDuration, breakDuration]);

  // Handle timer countdown
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 0) {
          const newBreakState = !isBreak;
          setIsPaused(!isPaused);
          setIsBreak(newBreakState);
          setTimer(newBreakState ? breakDuration : workDuration);
          return newBreakState ? breakDuration : workDuration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, isBreak, workDuration, breakDuration]);

  const resetTimer = () => {
    setIsPaused(true);
    setIsBreak(false);
    setTimer(workDuration);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className=" p-8 rounded-lg shadow-lg max-w-md w-full rounded-2xl bg-neutral-900">
        <div className="text-center text-white">
          <h1 className="text-6xl font-bold mb-4 text-white">
            {formatTime(timer)}
          </h1>
          <p className="text-xl mb-6 text-white">
            {isBreak ? 'Break Time! 🧘' : 'Work Time! 💻'}
          </p>

          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg"
            >
              {isPaused ? '▶️ Start' : '⏸ Pause'}
            </button>
            <button
              onClick={resetTimer}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-lg"
            >
              🔄 Reset
            </button>
          </div>

          <div className="border-t pt-6">
            <div
              className="text-blue-600 cursor-pointer hover:text-blue-700 mb-4"
              onClick={() => setShowSettings(!showSettings)}
            >
              {showSettings ? '▼ Hide Settings' : '▲ Show Settings'}
            </div>

            {showSettings && (
              <div className="space-y-4 mt">
                <div>
                  <label className="block text-white mb-2">
                    Work Duration (minutes):
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={workDuration / 60}
                    onChange={(e) => setWorkDuration(Math.max(1, Number(e.target.value)) * 60)}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 bg-black"
                  />
                </div>
                <div>
                  <label className="block mt-10 text-white mb-2">
                    Break Duration (minutes):
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={breakDuration / 60}
                    onChange={(e) => setBreakDuration(Math.max(1, Number(e.target.value)) * 60)}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 bg-black"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Page;