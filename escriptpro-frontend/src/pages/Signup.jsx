import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, BriefcaseMedical, Eye, EyeOff, Hash, KeyRound, Mail, Moon, Phone, Stethoscope, Sun, User, UserCog } from 'lucide-react'
import api from '../services/api'

function Signup() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1: form, 2: OTP verification
  const [selectedRole, setSelectedRole] = useState('DOCTOR')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [doctorId, setDoctorId] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [signupToken, setSignupToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark')
  const [otpTimer, setOtpTimer] = useState(0)

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [darkMode])

  // OTP timer countdown
  useEffect(() => {
    let interval
    if (otpTimer > 0) {
      interval = setInterval(() => setOtpTimer((t) => t - 1), 1000)
    }
    return () => clearInterval(interval)
  }, [otpTimer])

  const handleInitiateSignup = async (event) => {
    event.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Password and confirm password must match.')
      return
    }

    if (selectedRole === 'RECEPTIONIST' && !doctorId.trim()) {
      setError('Assigned doctor ID is required for receptionist signup.')
      return
    }

    setLoading(true)

    try {
      const response = await api.post('/auth/signup/initiate', {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
        confirmPassword,
        role: selectedRole,
        doctorId: selectedRole === 'RECEPTIONIST' ? Number(doctorId.trim()) : undefined,
      })

      setSignupToken(response.data.signupToken)
      setOtp('')
      setOtpTimer(300) // 5 minutes
      setStep(2) // Move to OTP verification step
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (typeof err.response?.data === 'string' ? err.response.data : null) ||
        (err.code === 'ERR_NETWORK'
          ? 'Cannot reach backend. Check API Gateway on port 8081.'
          : null) ||
        'Failed to initiate signup. Please try again.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (event) => {
    event.preventDefault()
    setError('')

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP.')
      return
    }

    setLoading(true)

    try {
      const response = await api.post('/auth/signup/verify-otp', {
        signupToken,
        otp,
      })

      const token = response.data.token
      const resolvedRole = (response.data.role || selectedRole).toUpperCase()
      const resolvedDoctorId = response.data.doctorId

      localStorage.setItem('token', token)
      localStorage.setItem('role', resolvedRole)
      if (resolvedDoctorId !== null && resolvedDoctorId !== undefined) {
        localStorage.setItem('doctorId', String(resolvedDoctorId))
      } else {
        localStorage.removeItem('doctorId')
      }

      navigate('/dashboard')
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (typeof err.response?.data === 'string' ? err.response.data : null) ||
        (err.code === 'ERR_NETWORK'
          ? 'Cannot reach backend. Check API Gateway on port 8081.'
          : null) ||
        'OTP verification failed. Please try again.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setError('')
    setLoading(true)

    try {
      await api.post('/auth/signup/initiate', {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
        confirmPassword,
        role: selectedRole,
        doctorId: selectedRole === 'RECEPTIONIST' ? Number(doctorId.trim()) : undefined,
      })
      setOtp('')
      setOtpTimer(300)
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (typeof err.response?.data === 'string' ? err.response.data : null) ||
        'Failed to resend OTP. Please try again.'
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
            <h2 className="mt-3 text-2xl font-bold leading-tight text-white">Start Your<br />Digital Practice.</h2>
            <p className="mt-4 text-sm leading-6 text-white/75">Create your account and begin managing patients and prescriptions digitally.</p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 text-xs text-white/80">
              <BriefcaseMedical className="h-4 w-4 flex-shrink-0" />
              <span>Quick onboarding in minutes</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-white/80">
              <Stethoscope className="h-4 w-4 flex-shrink-0" />
              <span>Doctor &amp; receptionist roles</span>
            </div>
          </div>
        </div>

        {/* Auth card */}
        <section className="auth-card flex-1 rounded-none border-0" style={{ boxShadow: 'none' }}>
          <div className="auth-header-row">
            <p className="auth-kicker">{step === 1 ? 'New Practice' : 'Verify Identity'}</p>
            <span className="auth-icon-badge">
              <BriefcaseMedical className="h-4 w-4 sm:h-5 sm:w-5" />
            </span>
          </div>

          {step === 1 ? (
            <>
              <h1 className="auth-title text-xl sm:text-2xl md:text-[1.8rem]">
                {selectedRole === 'RECEPTIONIST' ? 'Receptionist Signup' : 'Doctor Signup'}
              </h1>
              <p className="auth-copy text-xs sm:text-sm">
                {selectedRole === 'RECEPTIONIST'
                  ? 'Create a receptionist account linked to the doctor you work with.'
                  : 'Create your doctor account.'}
              </p>

              <form onSubmit={handleInitiateSignup} className="auth-form">
                <div>
                  <label className="field-label text-xs">Sign Up As</label>
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
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                    className="input-luxe pl-10 text-sm"
                    placeholder={selectedRole === 'RECEPTIONIST' ? 'Receptionist name' : 'Dr. Name'}
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40">
                      <Mail className="h-4 w-4" />
                    </span>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                      className="input-luxe pl-10 text-sm"
                      placeholder={selectedRole === 'RECEPTIONIST' ? 'receptionist@email.com' : 'doctor@email.com'}
                    />
                  </div>

                  <div className="relative">
                    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40">
                      <Phone className="h-4 w-4" />
                    </span>
                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      required
                      className="input-luxe pl-10 text-sm"
                      placeholder="9876543210"
                    />
                  </div>
                </div>

                {selectedRole === 'RECEPTIONIST' && (
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40">
                      <Hash className="h-4 w-4" />
                    </span>
                    <input
                      id="doctorId"
                      type="number"
                      min="1"
                      value={doctorId}
                      onChange={(event) => setDoctorId(event.target.value)}
                      required
                      className="input-luxe pl-10 text-sm"
                      placeholder="Assigned Doctor ID"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                      className="input-luxe pl-10 text-sm"
                      placeholder="Min 12 characters"
                    />
                  </div>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40">
                      <KeyRound className="h-4 w-4" />
                    </span>
                    <input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      required
                      className="input-luxe pl-10 text-sm"
                      placeholder="Re-enter password"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="inline-flex items-center gap-1.5 text-xs text-white/60 transition hover:text-white/80"
                >
                  {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  {showPassword ? 'Hide passwords' : 'Show passwords'}
                </button>

                {error && <p className="alert-error text-xs">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="button-primary w-full text-sm"
                >
                  {loading ? 'Sending OTP...' : 'Continue'}
                  {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                </button>
              </form>

              <p className="mt-4 text-center text-xs text-white/72">
                Already have an account?{' '}
                <Link to="/" className="font-medium text-white underline underline-offset-4">
                  Login
                </Link>
              </p>
            </>
          ) : (
            <>
              <h1 className="auth-title text-xl sm:text-2xl md:text-[1.8rem]">
                Enter OTP
              </h1>
              <p className="auth-copy text-xs sm:text-sm">
                We've sent a 6-digit OTP to <strong>{phone}</strong>. Enter it below to verify your identity.
              </p>

              <form onSubmit={handleVerifyOtp} className="auth-form">
                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40">
                    <Hash className="h-4 w-4" />
                  </span>
                  <input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength="6"
                    required
                    className="input-luxe pl-10 text-sm text-center tracking-widest"
                    placeholder="000000"
                    autoFocus
                  />
                </div>

                <div className="text-center text-xs text-white/60">
                  {otpTimer > 0 ? (
                    <p>OTP expires in {Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}</p>
                  ) : (
                    <p>OTP expired</p>
                  )}
                </div>

                {error && <p className="alert-error text-xs">{error}</p>}

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="button-primary w-full text-sm"
                >
                  {loading ? 'Verifying...' : 'Verify & Create Account'}
                  {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading || otpTimer > 0}
                  className="w-full text-xs text-white/60 transition hover:text-white/80 disabled:opacity-50"
                >
                  {otpTimer > 0 ? `Resend OTP in ${Math.floor(otpTimer / 60)}:${(otpTimer % 60).toString().padStart(2, '0')}` : 'Resend OTP'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep(1)
                    setOtp('')
                    setError('')
                  }}
                  className="w-full text-xs text-white/60 transition hover:text-white/80"
                >
                  Back to signup form
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </main>
  )
}

export default Signup
