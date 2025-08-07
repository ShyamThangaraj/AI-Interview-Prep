'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-4 flex flex-col relative overflow-hidden">
      {/* Brand + Navbar */}
      <div className="flex justify-between items-center mt-4 px-4">
        <h2 className="text-3xl text-gray-400 font-mono ml-4">DREAMTERVIEW</h2>
        <h2 className="text-xl text-gray-400 font-mono ml-[10%]">FROM DREAMING JOBS. TO WORKING JOBS.</h2>
        <nav className="flex space-x-12 text-lg text-gray-400 font-mono">
          <Link href="/ai-articles" className="hover:underline">
            Articles→
          </Link>
          <Link href="/about" className="hover:underline">
            About→
          </Link>
          <Link href="/developers" className="hover:underline">
            Developers→
          </Link>
        </nav>
      </div>

      {/* LEFT CLOUDS */}
      <div
        className="absolute left-[20%] top-[13%] w-[30rem] h-[13rem] bg-contain bg-no-repeat bg-center text-sm leading-tight break-words text-black font-mono px-[9rem] pt-[5.3rem] text-center hidden sm:block"
        style={{ backgroundImage: 'url("/cloud.png")' }}
      >
        “Helped me land my dream job at Google”<br />— Aishwarya
      </div>

      <div
        className="absolute left-[3%] top-[40%] w-[30rem] h-[13rem] bg-contain bg-no-repeat bg-center text-sm leading-tight break-words text-black font-mono px-[9rem] pt-[5.3rem] text-center hidden sm:block"
        style={{ backgroundImage: 'url("/cloud.png")' }}
      >
        “The AI mock interviewer is 🔥”<br />— Leo
      </div>

      <div
        className="absolute left-[20%] top-[70%] w-[30rem] h-[13rem] bg-contain bg-no-repeat bg-center text-sm leading-tight break-words text-black font-mono px-[9rem] pt-[5.3rem] text-center hidden sm:block"
        style={{ backgroundImage: 'url("/cloud.png")' }}
      >
        “Love the prep dashboard UI.”<br />— Sana
      </div>

      {/* RIGHT CLOUDS */}
      <div
        className="absolute left-[58%] top-[14%] w-[30rem] h-[13rem] bg-contain bg-no-repeat bg-center text-sm leading-tight break-words text-black font-mono px-[9rem] pt-[5.3rem] text-center hidden sm:block"
        style={{ backgroundImage: 'url("/cloud.png")' }}
      >
        “I crushed my Amazon interview”<br />— Dev
      </div>

      <div
        className="absolute left-[71%] top-[40%] w-[30rem] h-[13rem] bg-contain bg-no-repeat bg-center text-sm leading-tight break-words text-black font-mono px-[9rem] pt-[5.3rem] text-center hidden sm:block"
        style={{ backgroundImage: 'url("/cloud.png")' }}
      >
        “It even helped me with behavioral questions.”<br />— Rina
      </div>

      <div
        className="absolute left-[58%] top-[70%] w-[30rem] h-[13rem] bg-contain bg-no-repeat bg-center text-sm leading-tight break-words text-black font-mono px-[9rem] pt-[5.3rem] text-center hidden sm:block"
        style={{ backgroundImage: 'url("/cloud.png")' }}
      >
        “Way better than blind LeetCode prep”<br />— Marcus
      </div>
      {/* Hero Section */}
      <div className="flex flex-1 items-center justify-center relative text-center mt-7">
        <div>
          <h1 className="text-7xl sm:text-8xl font-bold mb-4 text-white font-mono tracking-tight">
            Interview Prep
          </h1>
          <p className="text-xl text-gray-400 mb-8 font-mono">
            Your #1 app for landing your dream jobs...
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/signup">
              <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition font-mono">
                Get Started
              </button>
            </Link>
            <Link href="/login">
              <button className="px-6 py-2 border border-white hover:bg-white hover:text-black text-white rounded transition font-mono">
                Login
              </button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}