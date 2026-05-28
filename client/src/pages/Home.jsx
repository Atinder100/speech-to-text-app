import { Link } from 'react-router-dom'

function Home() {

  return (

    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#111827] text-white">

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[#020617]/80 border-b border-slate-800">

        <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-5">

          {/* LOGO */}
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            WebScribe AI
          </h1>

          {/* NAV LINKS */}
          <div className="flex items-center gap-4">

            <button className="px-5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition">

              Home

            </button>

            <button className="px-5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition">

              FAQs

            </button>

            <button className="px-6 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-105 transition shadow-lg">

              Log In

            </button>

          </div>

        </div>

      </nav>

      {/* HERO SECTION */}
      <section className="max-w-7xl mx-auto px-8 py-28 flex flex-col lg:flex-row items-center justify-between gap-20">

        {/* LEFT */}
        <div className="flex-1">

          <p className="uppercase tracking-[0.3em] text-cyan-400 font-semibold mb-6">

            AI Powered Speech Recognition

          </p>

          <h1 className="text-6xl lg:text-7xl font-extrabold leading-tight">

            Want to Convert

            <span className="block bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">

              Audio Files Into Text?

            </span>

          </h1>

          <p className="mt-8 text-xl text-slate-400 leading-relaxed max-w-2xl">

            WebScribe AI helps you instantly transform
            meetings, podcasts, interviews, and voice
            recordings into highly accurate text using AI.

          </p>

          {/* BUTTON */}
          <div className="mt-12">

            <Link
              to="/dashboard"
              className="inline-block px-10 py-5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg shadow-2xl hover:scale-105 transition-all duration-300"
            >

              Convert Now

            </Link>

          </div>

        </div>

        {/* RIGHT CARD */}
        <div className="flex-1 flex justify-center">

          <div className="w-full max-w-lg bg-[#1e293b]/70 border border-slate-700 rounded-3xl p-10 backdrop-blur-xl shadow-2xl">

            <div className="space-y-6">

              <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">

                <p className="text-cyan-400 font-semibold mb-2">

                  Live Transcription

                </p>

                <p className="text-slate-300">

                  Convert live speech into text instantly.

                </p>

              </div>

              <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">

                <p className="text-cyan-400 font-semibold mb-2">

                  Upload Audio Files

                </p>

                <p className="text-slate-300">

                  Upload recordings and generate transcripts.

                </p>

              </div>

              <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">

                <p className="text-cyan-400 font-semibold mb-2">

                  Save & Manage

                </p>

                <p className="text-slate-300">

                  Copy and manage previous transcriptions.

                </p>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* WHAT THIS TOOL DOES */}
      <section className="max-w-7xl mx-auto px-8 pb-28">

        <div className="bg-[#1e293b]/70 border border-slate-700 rounded-3xl p-12 shadow-2xl">

          <h2 className="text-5xl font-extrabold mb-10">

            What This Tool Does

          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8">

              <h3 className="text-2xl font-bold text-cyan-400 mb-4">

                Speech Recognition

              </h3>

              <p className="text-slate-400 leading-relaxed">

                Converts speech into accurate text using AI.

              </p>

            </div>

            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8">

              <h3 className="text-2xl font-bold text-cyan-400 mb-4">

                Audio Uploads

              </h3>

              <p className="text-slate-400 leading-relaxed">

                Upload audio files and generate transcripts instantly.

              </p>

            </div>

            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8">

              <h3 className="text-2xl font-bold text-cyan-400 mb-4">

                Live Recording

              </h3>

              <p className="text-slate-400 leading-relaxed">

                Record audio live and get real-time captions.

              </p>

            </div>

          </div>

        </div>

      </section>

    </div>
  )
}

export default Home