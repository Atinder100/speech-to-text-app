import {
  useState,
} from 'react'

import axios from 'axios'

import {
  Link,
  useNavigate,
} from 'react-router-dom'

function Register() {

  const navigate =
    useNavigate()

  const [formData, setFormData] =
    useState({

      name: '',
      email: '',
      password: '',
    })

  const [error, setError] =
    useState('')

  const [success, setSuccess] =
    useState('')

  const [loading, setLoading] =
    useState(false)

  const [otp, setOtp] =
    useState('')

  const [otpSent, setOtpSent] =
    useState(false)

  const handleChange = (e) => {

    setFormData({

      ...formData,

      [e.target.name]:
        e.target.value,
    })
  }

  const sendOtp = async () => {

      try {

        await axios.post(

          'https://speech-to-text-backend-rayx.onrender.com/send-otp',

          {
            email: formData.email,
          }
        )

        setOtpSent(true)

        setSuccess(
          'OTP sent successfully'
        )

      } catch (error) {

        setError(
          error.response?.data?.message ||
          'Failed to send OTP'
        )
      }
    }

  const handleSubmit =
    async (e) => {

      e.preventDefault()

      setError('')
      setSuccess('')

      if (
        formData.name.length < 3
      ) {

        return setError(
          'Name must be at least 3 characters'
        )
      }

      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/

      if (
        !emailRegex.test(
          formData.email
        )
      ) {

        return setError(
          'Invalid email'
        )
      }

      if (
        formData.password.length < 6
      ) {

        return setError(
          'Password must be at least 6 characters'
        )
      }

      try {

        setLoading(true)

        const response =
          await axios.post(
            'https://speech-to-text-backend-rayx.onrender.com/register',
            {
              ...formData,
              otp,
            }
          )

        setSuccess(
          'Registration successful'
        )

        navigate(
          '/login',
          {
            state: {
              email: formData.email,
            },
          }
        )

      } catch (error) {

        setError(
          error.response?.data
            ?.message ||
            'Registration failed'
        )

      } finally {

        setLoading(false)
      }
    }

  return (

    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#111827] flex items-center justify-center px-4 py-8">

      <div className="w-full max-w-md sm:max-w-lg bg-[#1e293b]/80 backdrop-blur-xl border border-slate-700 rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 shadow-2xl">

        {/* TITLE */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-3 leading-tight">

          Create Account

        </h1>

        <p className="text-slate-400 mb-8 sm:mb-10 text-sm sm:text-base leading-relaxed">

          Join WebScribe and start converting audio into text.

        </p>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5 sm:space-y-6"
        >

          {/* NAME */}
          <div>

            <label className="block text-slate-300 text-sm mb-2">

              Full Name

            </label>

            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-900 border border-slate-700 text-white text-sm sm:text-base placeholder:text-slate-500 focus:outline-none focus:ring-2 sm:focus:ring-4 focus:ring-cyan-500 transition"
            />

          </div>

          {/* EMAIL */}
          <div>

            <label className="block text-slate-300 text-sm mb-2">

              Email Address

            </label>

            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-900 border border-slate-700 text-white text-sm sm:text-base placeholder:text-slate-500 focus:outline-none focus:ring-2 sm:focus:ring-4 focus:ring-cyan-500 transition"
            />

          </div>

          <div>

            <label className="block text-slate-300 text-sm mb-2">

              OTP

            </label>

            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value)
              }
              className="w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-900 border border-slate-700 text-white"
            />

          </div>

          <button
            type="button"
            onClick={sendOtp}
            className="w-full py-3 rounded-xl bg-yellow-500 text-black font-bold"
          >

            Send OTP

          </button>

          {/* PASSWORD */}
          <div>
            

            <label className="block text-slate-300 text-sm mb-2">

              Password

            </label>

            <input
              type="password"
              name="password"
              placeholder="Create password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-900 border border-slate-700 text-white text-sm sm:text-base placeholder:text-slate-500 focus:outline-none focus:ring-2 sm:focus:ring-4 focus:ring-cyan-500 transition"
            />

          </div>

          

          {/* ERROR */}
          {error && (

            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">

              <p className="text-red-400 text-sm">

                {error}

              </p>

            </div>
          )}

          {/* SUCCESS */}
          {success && (

            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3">

              <p className="text-green-400 text-sm">

                {success}

              </p>

            </div>
          )}

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-sm sm:text-lg shadow-xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-70"
          >

            {
              loading
                ? 'Creating Account...'
                : 'Create Account'
            }

          </button>

        </form>

        {/* LOGIN LINK */}
        <div className="mt-8 text-center">

          <p className="text-slate-400 text-sm sm:text-base">

            Already have an account?

            <Link
              to="/login"
              className="ml-2 text-cyan-400 hover:text-cyan-300 font-semibold"
            >

              Log In

            </Link>

          </p>

        </div>

      </div>

    </div>
  )
}

export default Register