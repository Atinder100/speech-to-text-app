import { useState } from 'react'

import {
  useLocation,
  useNavigate,
} from 'react-router-dom'

import axios from 'axios'

function VerifyOtp() {

  const [otp, setOtp] =
    useState('')

  const [error, setError] =
    useState('')

  const [loading, setLoading] =
    useState(false)

  const location =
    useLocation()

  const navigate =
    useNavigate()

  const email =
    location.state?.email

  const handleSubmit =
    async (e) => {

      e.preventDefault()

      try {

        setLoading(true)

        const response =
          await axios.post(
            'https://speech-to-text-backend-rayx.onrender.com/verify-otp',
            {
              email,
              otp,
            }
          )

        localStorage.setItem(
          'token',
          response.data.token
        )

        localStorage.setItem(
          'user',
          JSON.stringify(
            response.data.user
          )
        )

        navigate('/dashboard')

      } catch (error) {

        setError(
          error.response?.data?.message ||
          'OTP verification failed'
        )

      } finally {

        setLoading(false)
      }
    }

  return (

    <div className="min-h-screen flex items-center justify-center bg-slate-950">

      <div className="bg-slate-900 p-8 rounded-2xl w-full max-w-md">

        <h1 className="text-white text-3xl font-bold mb-6">

          Verify OTP

        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) =>
              setOtp(
                e.target.value
              )
            }
            className="w-full p-4 rounded-xl bg-slate-800 text-white"
          />

          {error && (

            <p className="text-red-400">

              {error}

            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-600 text-white p-4 rounded-xl"
          >

            {
              loading
                ? 'Verifying...'
                : 'Verify OTP'
            }

          </button>

        </form>

      </div>

    </div>
  )
}

export default VerifyOtp