import {
  useState,
} from 'react'

import axios from 'axios'

import {
  Link,
  useNavigate,
} from 'react-router-dom'

function Login() {

  const navigate =
    useNavigate()

  const [formData, setFormData] =
    useState({

      email: '',
      password: '',
    })

  const [error, setError] =
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

      try {

        const response =
          await axios.post(
            'http://localhost:5000/login',

            formData
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

navigate(
  '/dashboard'
)

      } catch (error) {

        setError(
          error.response?.data
            ?.message ||
            'Login failed'
        )
      }
    }

  return (

    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#111827] flex items-center justify-center p-8">

      <div className="w-full max-w-lg bg-[#1e293b]/80 backdrop-blur-xl border border-slate-700 rounded-3xl p-10 shadow-2xl">

        <h1 className="text-5xl font-extrabold text-white mb-3">

          Welcome Back

        </h1>

        <p className="text-slate-400 mb-10">

          Login to continue using WebScribe.

        </p>

        <form
          onSubmit={
            handleSubmit
          }
          className="space-y-6"
        >

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

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg shadow-xl hover:scale-105 transition-all duration-300"
          >

            Log In

          </button>

        </form>

        {/* REGISTER LINK */}
        <div className="mt-8 text-center">

          <p className="text-slate-400">

            Don't have an account?

            <Link
              to="/register"
              className="ml-2 text-cyan-400 hover:text-cyan-300 font-semibold"
            >

              Create New Account

            </Link>

          </p>

        </div>

      </div>

    </div>
  )
}

export default Login