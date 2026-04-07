import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'

const createPatientForm = (patient) => ({
  name: patient?.name || '',
  mobile: patient?.mobile || '',
  age: patient?.age ?? '',
  gender: patient?.gender || 'MALE',
  address: patient?.address || '',
  height: patient?.height ?? '',
  weight: patient?.weight ?? '',
})

const resolvePatientNumber = (patient, fallback) => patient?.patientNumber ?? fallback

function PatientProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [patient, setPatient] = useState(null)
  const [patientForm, setPatientForm] = useState(createPatientForm(null))
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [deletePatientText, setDeletePatientText] = useState('')
  const [deletePatientOpen, setDeletePatientOpen] = useState(false)
  const [deletePrescriptionId, setDeletePrescriptionId] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      window.location.href = '/'
      return
    }
    loadProfile()
  }, [id])

  const sortedHistory = useMemo(
    () =>
      [...history].sort((a, b) => {
        const left = new Date(a.createdAt || a.visitDate || 0).getTime()
        const right = new Date(b.createdAt || b.visitDate || 0).getTime()
        return right - left
      }),
    [history]
  )

  const loadProfile = async () => {
    setLoading(true)
    setError('')
    try {
      const [patientResponse, historyResponse] = await Promise.all([
        api.get(`/patients/${id}`),
        api.get(`/prescriptions/patient/${id}`),
      ])
      setPatient(patientResponse.data)
      setPatientForm(createPatientForm(patientResponse.data))
      setHistory(historyResponse.data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load patient profile.')
    } finally {
      setLoading(false)
    }
  }

  const savePatient = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccessMessage('')
    try {
      const payload = {
        name: patientForm.name.trim(),
        age: patientForm.age === '' ? null : Number(patientForm.age),
        gender: patientForm.gender,
        mobile: patientForm.mobile.trim(),
        address: patientForm.address.trim(),
        height: patientForm.height === '' ? null : Number(patientForm.height),
        weight: patientForm.weight === '' ? null : Number(patientForm.weight),
      }
      const response = await api.put(`/patients/${id}`, payload)
      setPatient(response.data)
      setPatientForm(createPatientForm(response.data))
      setSuccessMessage('Patient profile updated successfully.')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update patient profile.')
    } finally {
      setSaving(false)
    }
  }

  const downloadPdf = async (prescriptionId) => {
    try {
      const response = await api.get(`/prescriptions/${prescriptionId}/pdf`, {
        responseType: 'blob',
      })
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `prescription-${prescriptionId}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to download prescription PDF.')
    }
  }

  const deletePrescription = async () => {
    if (!deletePrescriptionId) {
      return
    }

    try {
      await api.delete(`/prescriptions/${deletePrescriptionId}`)
      setHistory((prev) => prev.filter((item) => item.id !== deletePrescriptionId))
      setSuccessMessage('Prescription history deleted successfully.')
      setDeletePrescriptionId(null)
      loadProfile()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete prescription history.')
    }
  }

  const deletePatient = async () => {
    if (!patient || deletePatientText.trim() !== patient.name) {
      setError('Type the exact patient name to confirm deletion.')
      return
    }

    try {
      await api.delete(`/patients/${id}`)
      sessionStorage.setItem('dashboardMessage', 'Patient deleted successfully.')
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete patient.')
    }
  }

  if (loading) {
    return <main className="min-h-screen bg-slate-100 p-6">Loading patient profile...</main>
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.16),_transparent_24%),linear-gradient(180deg,_#f8fafc_0%,_#e2e8f0_100%)] p-4 md:p-6">
      <section className="mx-auto max-w-6xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/70 bg-white/85 px-5 py-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">Patient Record</p>
            <h1 className="text-2xl font-semibold text-slate-900">Patient Profile</h1>
            <p className="text-sm text-slate-600">Patient ID: {resolvePatientNumber(patient, '-')}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => navigate(`/dashboard?patientId=${id}`)}
              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700"
            >
              Use In Prescription
            </button>
            <button
              type="button"
              onClick={() => setDeletePatientOpen(true)}
              className="rounded-full border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700"
            >
              Delete Patient
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="rounded-full bg-slate-900 px-4 py-2 text-sm text-white"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {error && (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        {successMessage && (
          <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {successMessage}
          </p>
        )}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[360px,1fr]">
          <section className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.05)] space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Editable Details</p>
              <h2 className="text-lg font-semibold text-slate-900">Patient Information</h2>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-slate-50 p-4">
              <p className="text-lg font-semibold text-slate-900">{patient?.name}</p>
              <p className="mt-1 text-sm text-slate-600">
                {patient?.gender} • {patient?.age ?? '-'} years • {patient?.mobile}
              </p>
              {(patient?.height || patient?.weight) && (
                <p className="mt-2 text-sm text-slate-600">
                  {patient?.height ? `Height ${patient.height} cm` : null}
                  {patient?.height && patient?.weight ? ' • ' : ''}
                  {patient?.weight ? `Weight ${patient.weight} kg` : null}
                </p>
              )}
            </div>

            <form onSubmit={savePatient} className="space-y-3">
              <input
                required
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                placeholder="Patient name"
                value={patientForm.name}
                onChange={(event) => setPatientForm((prev) => ({ ...prev, name: event.target.value }))}
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  required
                  type="number"
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  placeholder="Age"
                  value={patientForm.age}
                  onChange={(event) => setPatientForm((prev) => ({ ...prev, age: event.target.value }))}
                />
                <select
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  value={patientForm.gender}
                  onChange={(event) => setPatientForm((prev) => ({ ...prev, gender: event.target.value }))}
                >
                  <option value="MALE">MALE</option>
                  <option value="FEMALE">FEMALE</option>
                  <option value="OTHER">OTHER</option>
                </select>
              </div>
              <input
                required
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                placeholder="Mobile number"
                value={patientForm.mobile}
                onChange={(event) => setPatientForm((prev) => ({ ...prev, mobile: event.target.value }))}
              />
              <input
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                placeholder="Address"
                value={patientForm.address}
                onChange={(event) => setPatientForm((prev) => ({ ...prev, address: event.target.value }))}
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  type="number"
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  placeholder="Height (cm)"
                  value={patientForm.height}
                  onChange={(event) => setPatientForm((prev) => ({ ...prev, height: event.target.value }))}
                />
                <input
                  type="number"
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  placeholder="Weight (kg)"
                  value={patientForm.weight}
                  onChange={(event) => setPatientForm((prev) => ({ ...prev, weight: event.target.value }))}
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-300"
              >
                {saving ? 'Saving...' : 'Save Patient Changes'}
              </button>
            </form>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.05)] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Medical Timeline</p>
                <h2 className="text-lg font-semibold text-slate-900">Prescription History</h2>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-500">
                {sortedHistory.length} record(s)
              </span>
            </div>

            {sortedHistory.length === 0 && (
              <p className="rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500">
                No prescriptions found for this patient.
              </p>
            )}

            <div className="space-y-3">
              {sortedHistory.map((item) => (
                <article key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {item.diagnosis || 'No diagnosis'}
                      </p>
                      <p className="text-xs text-slate-500">Date: {item.visitDate || 'N/A'}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => downloadPdf(item.id)}
                        className="rounded-full border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700"
                      >
                        Download PDF
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletePrescriptionId(item.id)}
                        className="rounded-full border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <HistoryField label="Diagnosis" value={item.diagnosis} />
                    <HistoryField label="Complaints" value={item.complaints} />
                    <HistoryField label="Examination" value={item.examination} />
                    <HistoryField label="Investigation Advice" value={item.investigationAdvice} />
                    <HistoryField label="Treatment" value={item.treatment} />
                    <HistoryField label="Advice" value={item.advice} />
                    <HistoryField label="Follow Up" value={[item.followUp, item.followUpDate].filter(Boolean).join(' | ')} />
                    <HistoryField
                      label="Consultation Fee"
                      value={item.consultationFee !== null && item.consultationFee !== undefined ? String(item.consultationFee) : ''}
                    />
                    <HistoryField
                      label="Vitals"
                      value={[item.bp ? `BP: ${item.bp}` : null, item.sugar ? `Sugar: ${item.sugar}` : null]
                        .filter(Boolean)
                        .join(' | ')}
                    />
                  </div>

                  {item.xrayImageUrl && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">X-Ray</p>
                      <img
                        src={item.xrayImageUrl}
                        alt="Patient x-ray"
                        className="max-h-72 w-full rounded-2xl border border-slate-200 object-contain bg-white"
                      />
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>

      <ConfirmModal
        open={deletePatientOpen}
        title="Delete Patient"
        description={`Type "${patient?.name || ''}" to permanently delete this patient and the associated prescription history.`}
        confirmLabel="Delete Patient"
        confirmDisabled={deletePatientText.trim() !== (patient?.name || '')}
        onClose={() => {
          setDeletePatientOpen(false)
          setDeletePatientText('')
        }}
        onConfirm={deletePatient}
      >
        <input
          className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
          placeholder="Type patient name to confirm"
          value={deletePatientText}
          onChange={(event) => setDeletePatientText(event.target.value)}
        />
      </ConfirmModal>

      <ConfirmModal
        open={Boolean(deletePrescriptionId)}
        title="Delete Prescription History"
        description="This will permanently remove the selected prescription record."
        confirmLabel="Delete Record"
        onClose={() => setDeletePrescriptionId(null)}
        onConfirm={deletePrescription}
      />
    </main>
  )
}

function ConfirmModal({
  open,
  title,
  description,
  confirmLabel,
  confirmDisabled = false,
  onClose,
  onConfirm,
  children,
}) {
  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <p className="mt-2 text-sm text-slate-600">{description}</p>
        {children && <div className="mt-4">{children}</div>}
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-slate-300 px-4 py-2 text-sm text-slate-700"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={confirmDisabled}
            onClick={onConfirm}
            className="rounded bg-red-600 px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:bg-red-300"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

function HistoryField({ label, value }) {
  if (!value) {
    return null
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{value}</p>
    </div>
  )
}

export default PatientProfile
