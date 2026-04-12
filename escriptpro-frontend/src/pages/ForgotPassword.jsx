import { useState } from 'react'
import { Link } from 'react-router-dom'
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
        <p className="auth-kicker">Account Recovery</p>
        <h1 className="auth-title">Forgot Password</h1>
        <p className="auth-copy">Enter email or phone number. Phone defaults to India unless you include a country code.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div>
            <label className="field-label" htmlFor="identifier">
              Email / Phone Number
            </label>
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

          {error && <p className="alert-error">{error}</p>}

          {success && <p className="alert-success">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="button-primary w-full"
          >
            {loading ? 'Submitting request...' : 'Request password reset'}
          </button>
        </form>

        <p className="mt-5 text-sm text-slate-600">
          Back to{' '}
          <Link to="/" className="font-medium text-slate-900 underline">
            Login
          </Link>
        </p>
      </section>
    </main>
  )
}

export default ForgotPassword
