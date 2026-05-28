import {
  useState,
} from 'react'

import axios from 'axios'

import {
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

  const handleChange = (e) => {

    setFormData({

      ...formData,

      [e.target.name]:
        e.target.value,
    })
  }

  const handleSubmit =
    async (e) => {

      e.preventDefault()

      setError('')
      setSuccess('')

      // NAME VALIDATION
      if (
        formData.name.length < 3
      ) {

        return setError(
          'Name must be at least 3 characters'
        )
      }

      // EMAIL VALIDATION
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

      // PASSWORD VALIDATION
      if (
        formData.password.length <
        6
      ) {

        return setError(
          'Password must be at least 6 characters'
        )
      }

      try {

        const response =
          await axios.post(
            'http://localhost:5000/register',

            formData
          )

        setSuccess(
          response.data.message
        )

        setTimeout(() => {

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

          navigate(
            '/dashboard'
          )

        }, 1500)

      } catch (error) {

        setError(
          error.response?.data
            ?.message ||
            'Registration failed'
        )
      }
    }

  return (

    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#111827] flex items-center justify-center p-8">

      <div className="w-full max-w-lg bg-[#1e293b]/80 backdrop-blur-xl border border-slate-700 rounded-3xl p-10 shadow-2xl">

        <h1 className="text-5xl font-extrabold text-white mb-3">

          Create Account

        </h1>

        <p className="text-slate-400 mb-10">

          Join WebScribe and start converting audio into text.

        </p>

        <form
          onSubmit={
            handleSubmit
          }
          className="space-y-6"
        >

          {/* NAME */}
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={
              formData.name
            }
            onChange={
              handleChange
            }
            className="w-full p-4 rounded-2xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-4 focus:ring-cyan-500"
          />

          {/* EMAIL */}
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={
              formData.email
            }
            onChange={
              handleChange
            }
            className="w-full p-4 rounded-2xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-4 focus:ring-cyan-500"
          />

          {/* PASSWORD */}
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={
              formData.password
            }
            onChange={
              handleChange
            }
            className="w-full p-4 rounded-2xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-4 focus:ring-cyan-500"
          />

          {/* ERROR */}
          {error && (

            <p className="text-red-400">

              {error}

            </p>
          )}

          {/* SUCCESS */}
          {success && (

            <p className="text-green-400">

              {success}

            </p>
          )}

          {/* BUTTON */}
          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg shadow-xl hover:scale-105 transition-all duration-300"
          >

            Create Account

          </button>

        </form>

      </div>

    </div>
  )
}

export default Register