import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../services/api'

function ResetPassword() {
  const [searchParams] = useSearchParams()
  const [token, setToken] = useState(searchParams.get('token') || '')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const response = await api.post('/auth/reset-password', {
        token: token.trim(),
        newPassword,
        confirmPassword,
      })
      setSuccess(response.data?.message || 'Password reset successful.')
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <p className="auth-kicker">Password Reset</p>
        <h1 className="auth-title">Reset Password</h1>
        <p className="auth-copy">Use the reset token you received to set a new password.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div>
            <label className="field-label" htmlFor="token">
              Reset Token
            </label>
            <input
              id="token"
              type="text"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              required
              className="input-luxe"
              placeholder="Paste reset token"
            />
          </div>

          <div>
            <label className="field-label" htmlFor="newPassword">
              New Password
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              required
              className="input-luxe"
              placeholder="Minimum 12 characters"
            />
          </div>

          <div>
            <label className="field-label" htmlFor="confirmPassword">
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              className="input-luxe"
              placeholder="Confirm new password"
            />
          </div>

          {error && <p className="alert-error">{error}</p>}

          {success && (
            <p className="alert-success">
              {success} You can now{' '}
              <Link to="/" className="underline font-medium">
                login
              </Link>
              .
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="button-primary w-full"
          >
            {loading ? 'Resetting password...' : 'Reset password'}
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

export default ResetPassword
