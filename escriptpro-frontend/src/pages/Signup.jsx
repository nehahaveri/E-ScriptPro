import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, BriefcaseMedical, Eye, EyeOff, Hash, KeyRound, Mail, Moon, Phone, Stethoscope, Sun, User, UserCog } from 'lucide-react'
import api from '../services/api'

function Signup() {
  const navigate = useNavigate()
  const [selectedRole, setSelectedRole] = useState('DOCTOR')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [doctorId, setDoctorId] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark')
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

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
    if (selectedRole !== 'DOCTOR' || !googleClientId) {
      return undefined
    }

    const handleGoogleDoctorSignup = async (response) => {
      const trimmedName = name.trim()
      const trimmedPhone = phone.trim()
      if (!trimmedName) {
        setError('Name is required for Google signup.')
        return
      }
      if (!trimmedPhone) {
        setError('Phone number is required for Google signup.')
        return
      }
      if (!password || password.length < 12) {
        setError('Password must be at least 12 characters for Google signup.')
        return
      }
      if (password !== confirmPassword) {
        setError('Password and confirm password must match.')
        return
      }

      setGoogleLoading(true)
      setError('')
      try {
        const signupResponse = await api.post('/auth/google-signup/doctor', {
          idToken: response.credential,
          name: trimmedName,
          phone: trimmedPhone,
          password,
        })

        const token = signupResponse.data?.token
        const resolvedRole = (signupResponse.data?.role || 'DOCTOR').toUpperCase()
        const resolvedDoctorId = signupResponse.data?.doctorId

        if (!token) {
          setError('Signup completed, but auto-login failed. Please login manually.')
          navigate('/')
          return
        }

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
          'Google signup failed. Please try again.'
        setError(message)
      } finally {
        setGoogleLoading(false)
      }
    }

    const initializeGoogleSignUp = () => {
      if (!window.google || !window.google.accounts?.id) {
        return
      }
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleGoogleDoctorSignup,
      })
      const target = document.getElementById('google-signup-button')
      if (target) {
        target.innerHTML = ''
        window.google.accounts.id.renderButton(target, {
          theme: 'outline',
          size: 'large',
          text: 'signup_with',
        })
      }
    }

    if (window.google) {
      initializeGoogleSignUp()
      return undefined
    }

    window.addEventListener('load', initializeGoogleSignUp)
    return () => window.removeEventListener('load', initializeGoogleSignUp)
  }, [selectedRole, googleClientId, name, phone, password, confirmPassword, navigate])

  const handleSubmit = async (event) => {
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
      const signupResponse = await api.post('/auth/signup', {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
        role: selectedRole,
        doctorId: selectedRole === 'RECEPTIONIST' ? Number(doctorId.trim()) : undefined,
      })

      // Prefer token returned by signup; fallback to login for compatibility.
      let token = signupResponse.data?.token
      const resolvedRole = (signupResponse.data?.role || selectedRole).toUpperCase()
      const resolvedDoctorId = signupResponse.data?.doctorId
      if (!token) {
        const loginResponse = await api.post('/auth/login', {
          identifier: email.trim().toLowerCase(),
          password,
        })
        token = loginResponse.data?.token
        localStorage.setItem('role', (loginResponse.data?.role || resolvedRole).toUpperCase())
        if (loginResponse.data?.doctorId !== null && loginResponse.data?.doctorId !== undefined) {
          localStorage.setItem('doctorId', String(loginResponse.data.doctorId))
        }
      }
      if (!token) {
        setError('Signup completed, but auto-login failed. Please login manually.')
        navigate('/')
        return
      }

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
        'Signup failed. Please try again.'
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
            <p className="auth-kicker">New Practice</p>
            <span className="auth-icon-badge">
              <BriefcaseMedical className="h-4 w-4 sm:h-5 sm:w-5" />
            </span>
          </div>
        <h1 className="auth-title text-xl sm:text-2xl md:text-[1.8rem]">
          {selectedRole === 'RECEPTIONIST' ? 'Receptionist Signup' : 'Doctor Signup'}
        </h1>
        <p className="auth-copy text-xs sm:text-sm">
          {selectedRole === 'RECEPTIONIST'
            ? 'Create a receptionist account linked to the doctor you work with.'
            : 'Create your doctor account.'}
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
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
            disabled={loading || googleLoading}
            className="button-primary w-full text-sm"
          >
            {loading || googleLoading
              ? 'Creating account...'
              : selectedRole === 'RECEPTIONIST'
                ? 'Create receptionist account'
                : 'Sign up'}
            {!loading && !googleLoading && <ArrowRight className="ml-2 h-4 w-4" />}
          </button>

          {selectedRole === 'DOCTOR' && (
            <div className="mt-1">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/15" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-transparent px-2 text-white/60">Or continue with</span>
                </div>
              </div>
              <div className="mt-4 flex justify-center">
                {googleClientId
                  ? <div id="google-signup-button"></div>
                  : <p className="text-xs text-white/65">Google signup unavailable. Set `VITE_GOOGLE_CLIENT_ID`.</p>}
              </div>
            </div>
          )}
        </form>

        <p className="mt-4 text-center text-xs text-white/72">
          Already have an account?{' '}
          <Link to="/" className="font-medium text-white underline underline-offset-4">
            Login
          </Link>
        </p>
      </section>
      </div>
    </main>
  )
}

export default Signup
