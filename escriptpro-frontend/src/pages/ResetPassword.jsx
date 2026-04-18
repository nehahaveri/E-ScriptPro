import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, KeyRound, ShieldCheck } from 'lucide-react'
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
        <div className="auth-header-row">
          <p className="auth-kicker">Password Reset</p>
          <span className="auth-icon-badge">
            <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5" />
          </span>
        </div>
        <h1 className="auth-title text-xl sm:text-2xl md:text-[1.8rem]">Reset Password</h1>
        <p className="auth-copy text-xs sm:text-sm">Use the reset token to set a new password.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <input
              id="token"
              type="text"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              required
              className="input-luxe pl-10 text-sm"
              placeholder="Paste reset token"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40">
                <KeyRound className="h-4 w-4" />
              </span>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                required
                className="input-luxe pl-10 text-sm"
                placeholder="New password"
              />
            </div>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40">
                <KeyRound className="h-4 w-4" />
              </span>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                className="input-luxe pl-10 text-sm"
                placeholder="Confirm password"
              />
            </div>
          </div>

          {error && <p className="alert-error text-xs">{error}</p>}
          {success && (
            <p className="alert-success text-xs">
              {success}{' '}
              <Link to="/" className="underline font-medium">Login now</Link>
            </p>
          )}

          <button type="submit" disabled={loading} className="button-primary w-full text-sm">
            {loading ? 'Resetting...' : 'Reset password'}
            {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-white/72">
          Back to{' '}
          <Link to="/" className="font-medium text-white underline underline-offset-4">Login</Link>
        </p>
      </section>
    </main>
  )
}

export default ResetPassword
