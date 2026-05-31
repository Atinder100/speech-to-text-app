import { StrictMode } from 'react'

import { createRoot } from 'react-dom/client'

import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom'

import './index.css'

import Home from './pages/Home.jsx'

import Dashboard from './pages/Dashboard.jsx'

import Register from './pages/Register.jsx'

import Login from './pages/Login.jsx'

createRoot(
  document.getElementById('root')
).render(

  <StrictMode>

    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/register"
          element={<Register />}
        />


        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

      </Routes>

    </BrowserRouter>

  </StrictMode>
)