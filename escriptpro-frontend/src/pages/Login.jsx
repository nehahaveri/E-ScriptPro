import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

function Login() {
  const savedLoginPrefs = JSON.parse(localStorage.getItem('savedLoginPrefs') || '{}')
  const [identifier, setIdentifier] = useState(savedLoginPrefs.identifier || '')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(Boolean(savedLoginPrefs.rememberMe))
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await api.post('/auth/login', {
        email: identifier.trim(),
        password,
      })
      const token = response.data?.token
      if (!token) {
        setError('Login failed. Token not received.')
        return
      }

      if (rememberMe) {
        localStorage.setItem(
          'savedLoginPrefs',
          JSON.stringify({
            identifier: identifier.trim(),
            rememberMe: true,
          })
        )
      } else {
        localStorage.removeItem('savedLoginPrefs')
      }

      localStorage.setItem('token', token)
      window.location.href = '/dashboard'
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please check credentials.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <section className="w-full max-w-md rounded-xl bg-white p-6 shadow-sm border border-slate-200">
        <h1 className="text-2xl font-semibold text-slate-900">Doctor Login</h1>
        <p className="mt-1 text-sm text-slate-600">Use email or phone number and password.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="identifier">
              Email / Phone Number
            </label>
            <input
              id="identifier"
              type="text"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
              placeholder="doctor@example.com or 9876543210"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="password">
              Password
            </label>
            <div className="flex items-center gap-2">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="rounded-md border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-slate-700">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
                className="h-4 w-4 rounded border-slate-300"
              />
              Remember email/phone
            </label>
            <Link to="/forgot-password" className="text-slate-900 underline">
              Forgot password?
            </Link>
          </div>

          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 border border-red-200">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-600">
          New doctor?{' '}
          <Link to="/signup" className="font-medium text-slate-900 underline">
            Create an account
          </Link>
        </p>
      </section>
    </main>
  )
}

export default Login
