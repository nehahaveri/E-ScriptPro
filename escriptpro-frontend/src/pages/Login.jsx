import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Eye, EyeOff, KeyRound, Mail, Phone, ShieldCheck, Stethoscope, UserCog } from 'lucide-react'
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

  const finalizeLogin = (token, refreshToken, loginIdentifier, resolvedRole, resolvedDoctorId) => {
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
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken)
    }
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

    finalizeLogin(response.data?.token, response.data?.refreshToken, loginIdentifier, response.data?.role, response.data?.doctorId)
  }

  const handleOtpVerification = async (loginIdentifier) => {
    const response = await api.post('/auth/verify-otp', {
      mfaChallengeToken,
      otp: otp.trim(),
    })

    finalizeLogin(response.data?.token, response.data?.refreshToken, loginIdentifier, response.data?.role, response.data?.doctorId)
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
            <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5" />
          </span>
        </div>
        <h1 className="auth-title text-xl sm:text-2xl md:text-[1.8rem]">
          {selectedRole === 'RECEPTIONIST' ? 'Receptionist Login' : 'Doctor Login'}
        </h1>
        {mfaPending && <p className="auth-copy text-xs sm:text-sm">Enter the 6-digit OTP sent to your registered mobile number.</p>}

        <form onSubmit={handleSubmit} className="auth-form">
          {!mfaPending && (
            <>
              <div>
                <label className="field-label text-xs">Login As</label>
                <div className="grid grid-cols-2 gap-2">
                  {['DOCTOR', 'RECEPTIONIST'].map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setSelectedRole(role)}
                      className={`flex items-center justify-center gap-2 rounded-full border px-3 py-2.5 text-xs font-medium transition ${
                        selectedRole === role
                          ? 'border-white/45 bg-white/22 text-white'
                          : 'border-white/15 bg-white/8 text-white/70 hover:bg-white/14'
                      }`}
                    >
                      {role === 'DOCTOR' ? <Stethoscope className="h-3.5 w-3.5" /> : <UserCog className="h-3.5 w-3.5" />}
                      {role === 'DOCTOR' ? 'Doctor' : 'Receptionist'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40">
                  {identifier.includes('@') ? <Mail className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
                </span>
                <input
                  id="identifier"
                  type="text"
                  value={identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
                  required
                  className="input-luxe pl-10 text-sm"
                  placeholder="doctor@example.com or 9876543210"
                />
              </div>

              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40">
                  <KeyRound className="h-4 w-4" />
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className="input-luxe pl-10 pr-12 text-sm"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-white/50 transition hover:text-white/80"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <div className="auth-meta-row text-xs">
                <label className="flex items-center gap-2 text-white/75">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    className="h-3.5 w-3.5 rounded border-slate-300"
                  />
                  Remember me
                </label>
                <Link to="/forgot-password" className="text-white/70 underline underline-offset-4 hover:text-white">
                  Forgot password?
                </Link>
              </div>
            </>
          )}

          {mfaPending && (
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                className="input-luxe pl-10 text-sm tracking-[0.3em]"
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
              className="button-secondary auth-toggle-button text-xs"
            >
              ← Back to login
            </button>
          )}

          {error && (
            <p className="alert-error text-xs">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="button-primary w-full text-sm"
          >
            {loading
              ? (mfaPending ? 'Verifying OTP...' : 'Signing in...')
              : (mfaPending ? 'Verify OTP' : 'Login')}
            {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-white/72">
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
