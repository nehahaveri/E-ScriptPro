import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

function Login() {
  const savedLoginPrefs = JSON.parse(localStorage.getItem('savedLoginPrefs') || '{}')
  const [identifier, setIdentifier] = useState(savedLoginPrefs.identifier || '')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [mfaChallengeToken, setMfaChallengeToken] = useState('')
  const [mfaPending, setMfaPending] = useState(false)
  const [rememberMe, setRememberMe] = useState(Boolean(savedLoginPrefs.rememberMe))
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const persistLoginPreference = (loginIdentifier) => {
    if (rememberMe) {
      localStorage.setItem(
        'savedLoginPrefs',
        JSON.stringify({
          identifier: loginIdentifier,
          rememberMe: true,
        })
      )
    } else {
      localStorage.removeItem('savedLoginPrefs')
    }
  }

  const finalizeLogin = (token, loginIdentifier) => {
    if (!token) {
      setError('Login failed. Token not received.')
      return
    }

    persistLoginPreference(loginIdentifier)
    localStorage.setItem('token', token)
    window.location.href = '/dashboard'
  }

  const handlePrimaryLogin = async (loginIdentifier) => {
    const response = await api.post('/auth/login', {
      identifier: loginIdentifier,
      password,
    })

    if (response.data?.mfaRequired) {
      setMfaPending(true)
      setMfaChallengeToken(response.data?.mfaChallengeToken || '')
      setOtp('')
      return
    }

    finalizeLogin(response.data?.token, loginIdentifier)
  }

  const handleOtpVerification = async (loginIdentifier) => {
    const response = await api.post('/auth/verify-otp', {
      mfaChallengeToken,
      otp: otp.trim(),
    })

    finalizeLogin(response.data?.token, loginIdentifier)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    const cleanedIdentifier = identifier.trim()
    const loginIdentifier = cleanedIdentifier.includes('@')
      ? cleanedIdentifier.toLowerCase()
      : cleanedIdentifier

    try {
      if (mfaPending) {
        await handleOtpVerification(loginIdentifier)
      } else {
        await handlePrimaryLogin(loginIdentifier)
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (err.code === 'ERR_NETWORK'
          ? 'Cannot reach backend. Check API Gateway on port 8081.'
          : null) ||
        'Invalid credentials.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <section className="w-full max-w-md rounded-xl bg-white p-6 shadow-sm border border-slate-200">
        <h1 className="text-2xl font-semibold text-slate-900">Doctor Login</h1>
        <p className="mt-1 text-sm text-slate-600">
          {mfaPending
            ? 'Enter the 6-digit OTP sent to your registered mobile number.'
            : 'Use email or phone number and password. Phone defaults to India unless you include a country code.'}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {!mfaPending && (
            <>
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
            </>
          )}

          {mfaPending && (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="otp">
                One-Time Password
              </label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                placeholder="Enter 6-digit OTP"
              />
            </div>
          )}

          {mfaPending && (
            <button
              type="button"
              onClick={() => {
                setMfaPending(false)
                setMfaChallengeToken('')
                setOtp('')
                setError('')
              }}
              className="rounded-md border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Back
            </button>
          )}

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
            {loading
              ? (mfaPending ? 'Verifying OTP...' : 'Signing in...')
              : (mfaPending ? 'Verify OTP' : 'Login')}
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
