import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Apple, ArrowRight, ShieldCheck } from 'lucide-react'
import api from '../services/api'

function Login() {
  const navigate = useNavigate()
  const savedLoginPrefs = JSON.parse(localStorage.getItem('savedLoginPrefs') || '{}')
  const [identifier, setIdentifier] = useState(savedLoginPrefs.identifier || '')
  const [selectedRole, setSelectedRole] = useState(savedLoginPrefs.role || 'DOCTOR')
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
          role: selectedRole,
        })
      )
    } else {
      localStorage.removeItem('savedLoginPrefs')
    }
  }

  const finalizeLogin = (token, loginIdentifier, resolvedRole, resolvedDoctorId) => {
    if (!token) {
      setError('Login failed. Token not received.')
      return
    }

    const effectiveRole = (resolvedRole || selectedRole || 'DOCTOR').toUpperCase()
    if (selectedRole && effectiveRole !== selectedRole) {
      setError(`This account is registered as ${effectiveRole.toLowerCase()}, not ${selectedRole.toLowerCase()}.`)
      return
    }

    persistLoginPreference(loginIdentifier)
    localStorage.setItem('token', token)
    localStorage.setItem('role', effectiveRole)
    if (resolvedDoctorId !== null && resolvedDoctorId !== undefined) {
      localStorage.setItem('doctorId', String(resolvedDoctorId))
    } else {
      localStorage.removeItem('doctorId')
    }
    navigate('/dashboard')
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

    finalizeLogin(response.data?.token, loginIdentifier, response.data?.role, response.data?.doctorId)
  }

  const handleOtpVerification = async (loginIdentifier) => {
    const response = await api.post('/auth/verify-otp', {
      mfaChallengeToken,
      otp: otp.trim(),
    })

    finalizeLogin(response.data?.token, loginIdentifier, response.data?.role, response.data?.doctorId)
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
    <main className="auth-shell">
      <section className="auth-card">
        <div className="auth-header-row">
          <p className="auth-kicker">Secure Access</p>
          <span className="auth-icon-badge">
            <ShieldCheck className="h-5 w-5" />
          </span>
        </div>
        <h1 className="auth-title">{selectedRole === 'RECEPTIONIST' ? 'Receptionist Login' : 'Doctor Login'}</h1>
        {mfaPending && <p className="auth-copy">Enter the 6-digit OTP sent to your registered mobile number.</p>}

        {!mfaPending && (
          <button type="button" className="button-secondary auth-apple-button w-full justify-between">
            <span className="inline-flex items-center gap-3">
              <Apple className="h-5 w-5" />
              Sign in with Apple
            </span>
            <ArrowRight className="h-4 w-4" />
          </button>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {!mfaPending && (
            <>
              <div>
                <label className="field-label">Login As</label>
                <div className="grid grid-cols-2 gap-2">
                  {['DOCTOR', 'RECEPTIONIST'].map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setSelectedRole(role)}
                      className={`rounded-full border px-4 py-3 text-sm font-medium transition ${
                        selectedRole === role
                          ? 'border-white/45 bg-white/22 text-white'
                          : 'border-white/15 bg-white/8 text-white/70 hover:bg-white/14'
                      }`}
                    >
                      {role === 'DOCTOR' ? 'Doctor' : 'Receptionist'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <input
                  id="identifier"
                  type="text"
                  value={identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
                  required
                  className="input-luxe"
                  placeholder="doctor@example.com or 9876543210"
                />
              </div>

              <div>
                <div className="auth-password-row">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    className="input-luxe"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="button-secondary auth-toggle-button"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <div className="auth-meta-row">
                <label className="flex items-center gap-2 text-white/75">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  Remember email/phone
                </label>
                <Link to="/forgot-password" className="text-white underline underline-offset-4">
                  Forgot password?
                </Link>
              </div>
            </>
          )}

          {mfaPending && (
            <div>
              <label className="field-label" htmlFor="otp">
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
                className="input-luxe"
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
              className="button-secondary auth-toggle-button"
            >
              Back
            </button>
          )}

          {error && (
            <p className="alert-error">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="button-primary w-full"
          >
            {loading
              ? (mfaPending ? 'Verifying OTP...' : 'Signing in...')
              : (mfaPending ? 'Verify OTP' : 'Login')}
          </button>
        </form>

        <p className="mt-5 text-sm text-white/72">
          New doctor?{' '}
          <Link to="/signup" className="font-medium text-white underline underline-offset-4">
            Create an account
          </Link>
        </p>
      </section>
    </main>
  )
}

export default Login
