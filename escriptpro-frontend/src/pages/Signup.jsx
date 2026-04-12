import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Apple, ArrowRight, BriefcaseMedical } from 'lucide-react'
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
      <section className="auth-card">
        <div className="auth-header-row">
          <p className="auth-kicker">New Practice</p>
          <span className="auth-icon-badge">
            <BriefcaseMedical className="h-5 w-5" />
          </span>
        </div>
        <h1 className="auth-title">{selectedRole === 'RECEPTIONIST' ? 'Receptionist Signup' : 'Doctor Signup'}</h1>
        <p className="auth-copy">
          {selectedRole === 'RECEPTIONIST'
            ? 'Create a receptionist account linked to the doctor you work with.'
            : 'Create your doctor account.'}
        </p>

        <button type="button" className="button-secondary auth-apple-button w-full justify-between">
          <span className="inline-flex items-center gap-3">
            <Apple className="h-5 w-5" />
            Sign up with Apple
          </span>
          <ArrowRight className="h-4 w-4" />
        </button>

        <form onSubmit={handleSubmit} className="auth-form">
          <div>
            <label className="field-label">Sign Up As</label>
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
              id="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              className="input-luxe"
              placeholder={selectedRole === 'RECEPTIONIST' ? 'Receptionist name' : 'Dr. Name'}
            />
          </div>

          <div>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="input-luxe"
              placeholder={selectedRole === 'RECEPTIONIST' ? 'receptionist@example.com' : 'doctor@example.com'}
            />
          </div>

          <div>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              required
              className="input-luxe"
              placeholder="9876543210 or +919876543210"
            />
          </div>

          {selectedRole === 'RECEPTIONIST' && (
            <div>
              <label className="field-label" htmlFor="doctorId">
                Assigned Doctor ID
              </label>
              <input
                id="doctorId"
                type="number"
                min="1"
                value={doctorId}
                onChange={(event) => setDoctorId(event.target.value)}
                required
                className="input-luxe"
                placeholder="Enter doctor ID"
              />
            </div>
          )}

          <div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="input-luxe"
              placeholder="Minimum 12 characters"
            />
          </div>

          <div>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              className="input-luxe"
              placeholder="Re-enter password"
            />
          </div>

          {error && <p className="alert-error">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="button-primary w-full"
          >
            {loading ? 'Creating account...' : selectedRole === 'RECEPTIONIST' ? 'Create receptionist account' : 'Sign up'}
          </button>
        </form>

        <p className="mt-5 text-sm text-white/72">
          Already have an account?{' '}
          <Link to="/" className="font-medium text-white underline underline-offset-4">
            Login
          </Link>
        </p>
      </section>
    </main>
  )
}

export default Signup
