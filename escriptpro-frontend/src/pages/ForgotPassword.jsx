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
    <main className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <section className="w-full max-w-md rounded-xl bg-white p-6 shadow-sm border border-slate-200">
        <h1 className="text-2xl font-semibold text-slate-900">Forgot Password</h1>
        <p className="mt-1 text-sm text-slate-600">Enter email or phone number. Phone defaults to India unless you include a country code.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="identifier">
              Email / Phone Number
            </label>
            <input
              id="identifier"
              type="text"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
              placeholder="doctor@example.com or 9876543210"
            />
          </div>

          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 border border-red-200">
              {error}
            </p>
          )}

          {success && (
            <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700 border border-emerald-200">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60"
          >
            {loading ? 'Submitting request...' : 'Request password reset'}
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-600">
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
