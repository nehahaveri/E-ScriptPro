import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, KeyRound, Mail } from 'lucide-react'
import api from '../services/api'

function ForgotPassword() {
  const [identifier, setIdentifier] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    setLoading(true)
    try {
      const response = await api.post('/auth/forgot-password', {
        identifier: identifier.trim(),
      })
      setSuccess(response.data?.message || 'If the email exists, a reset link has been sent.')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate reset token.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="auth-header-row">
          <p className="auth-kicker">Account Recovery</p>
          <span className="auth-icon-badge">
            <KeyRound className="h-4 w-4 sm:h-5 sm:w-5" />
          </span>
        </div>
        <h1 className="auth-title text-xl sm:text-2xl md:text-[1.8rem]">Forgot Password</h1>
        <p className="auth-copy text-xs sm:text-sm">Enter email or phone number to receive a reset link.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40">
              <Mail className="h-4 w-4" />
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

          {error && <p className="alert-error text-xs">{error}</p>}
          {success && <p className="alert-success text-xs">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="button-primary w-full text-sm"
          >
            {loading ? 'Submitting...' : 'Request password reset'}
            {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-white/72">
          Back to{' '}
          <Link to="/" className="font-medium text-white underline underline-offset-4">
            Login
          </Link>
        </p>
      </section>
    </main>
  )
}

export default ForgotPassword
