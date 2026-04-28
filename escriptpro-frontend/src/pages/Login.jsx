import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Eye, EyeOff, KeyRound, Mail, Moon, Phone, ShieldCheck, Stethoscope, Sun, UserCog } from 'lucide-react'
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
  const [googleLoading, setGoogleLoading] = useState(false)
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [darkMode])

  useEffect(() => {
    const initializeGoogleSignIn = () => {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: '157300149121-1rkou6bg3dgm67g954di2avp6hnpih2i.apps.googleusercontent.com',
          callback: handleGoogleSignIn,
        })
        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-button'),
          { theme: 'outline', size: 'large' }
        )
      }
    // } making a small change

    if (window.google) {
      initializeGoogleSignIn()
    } else {
      window.addEventListener('load', initializeGoogleSignIn)
    }
  }, [])

  const handleGoogleSignIn = async (response) => {
    setGoogleLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/google-login', {
        idToken: response.credential,
      })
      finalizeLogin(res.data?.token, res.data?.email || 'google-user', res.data?.role, res.data?.doctorId)
    } catch (err) {
      const message = err.response?.data?.message || 'Google login failed.'
      setError(message)
    } finally {
      setGoogleLoading(false)
    }
  }

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
      <button
        type="button"
        onClick={() => setDarkMode((d) => !d)}
        className="absolute right-4 top-4 z-20 rounded-full border border-white/15 bg-white/10 p-2.5 text-white/70 backdrop-blur transition hover:bg-white/20 hover:text-white"
        aria-label="Toggle dark mode"
      >
        {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>

      <div className="relative z-10 flex w-full max-w-4xl overflow-hidden rounded-[2.2rem] sm:rounded-[3rem]" style={{ backdropFilter: 'blur(24px)' }}>
        {/* Branding panel — visible on md+ */}
        <div className="hidden w-[44%] flex-col justify-between bg-gradient-to-br from-[#0b5fd7]/90 to-[#00d2ff]/70 p-10 md:flex">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em]">
              <span className="text-black">JustGP</span>
              <span className="text-black">-</span>
              <span className="text-black">Rx</span>
            </p>
            <h2 className="mt-3 text-2xl font-bold leading-tight text-white">Digital Prescriptions,<br />Simplified.</h2>
            <p className="mt-4 text-sm leading-6 text-white/75">Manage patients, generate prescriptions, and streamline your practice — all in one place.</p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 text-xs text-white/80">
              <ShieldCheck className="h-4 w-4 flex-shrink-0" />
              <span>Secure authentication with MFA</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-white/80">
              <Stethoscope className="h-4 w-4 flex-shrink-0" />
              <span>Built for doctors &amp; clinics</span>
            </div>
          </div>
        </div>

        {/* Auth card */}
        <section className="auth-card flex-1 rounded-none border-0" style={{ boxShadow: 'none' }}>
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
                  placeholder={`${selectedRole === 'RECEPTIONIST' ? 'receptionist@example.com' : 'doctor@example.com'} or 9876543210`}
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

        <div className="mt-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/15" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-transparent px-2 text-white/60">Or continue with</span>
            </div>
          </div>
          <div className="mt-4 flex justify-center">
            <div id="google-signin-button"></div>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-white/72">
          New doctor?{' '}
          <Link to="/signup" className="font-medium text-white underline underline-offset-4">
            Create an account
          </Link>
        </p>
      </section>
      </div>
    </main>
  )
}

export default Login
