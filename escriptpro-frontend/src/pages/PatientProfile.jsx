import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { CalendarDays, Clock3, User, Phone, Ruler } from 'lucide-react'
import api from '../services/api'

const createPatientForm = (patient) => ({
  name: patient?.name || '',
  mobile: patient?.mobile || '',
  age: patient?.age ?? '',
  gender: patient?.gender || 'MALE',
  appointmentDate: patient?.appointmentDate || '',
  appointmentTime: patient?.appointmentTime || '',
  appointmentStatus: patient?.appointmentStatus || '',
  appointmentReminderMinutes:
    patient?.appointmentReminderMinutes === null || patient?.appointmentReminderMinutes === undefined
      ? ''
      : String(patient.appointmentReminderMinutes),
  height: patient?.height ?? '',
  weight: patient?.weight ?? '',
})

const resolvePatientNumber = (patient, fallback) => patient?.patientNumber ?? fallback

const isIsoDateOnly = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value)

const formatDisplayDate = (value) => {
  if (!value) {
    return ''
  }

  if (isIsoDateOnly(value)) {
    const [year, month, day] = value.split('-').map(Number)
    return new Date(year, month - 1, day).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return parsed.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const formatDisplayTime = (value) => {
  if (!value) {
    return ''
  }

  const [hours, minutes] = value.split(':').map(Number)
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return value
  }

  return new Date(2000, 0, 1, hours, minutes).toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

const formatAppointmentLabel = (date, time) => [formatDisplayDate(date), formatDisplayTime(time)].filter(Boolean).join(' | ')
const GOOGLE_PENDING_PATIENT_KEY = 'googleCalendarPendingPatientId'
const GOOGLE_PENDING_ROUTE_KEY = 'googleCalendarPendingRoute'

function PatientProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [patient, setPatient] = useState(null)
  const [patientForm, setPatientForm] = useState(createPatientForm(null))
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [appointmentFocused, setAppointmentFocused] = useState(false)
  const appointmentInputRef = useRef(null)
  const [appointmentTimeFocused, setAppointmentTimeFocused] = useState(false)
  const appointmentTimeInputRef = useRef(null)
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

  useEffect(() => {
    const googleCalendarState = searchParams.get('googleCalendar')
    if (!googleCalendarState) {
      return
    }

    const pendingPatientId = sessionStorage.getItem(GOOGLE_PENDING_PATIENT_KEY)

    const finalizeCallback = () => {
      sessionStorage.removeItem(GOOGLE_PENDING_PATIENT_KEY)
      sessionStorage.removeItem(GOOGLE_PENDING_ROUTE_KEY)
      const nextParams = new URLSearchParams(searchParams)
      nextParams.delete('googleCalendar')
      const nextQuery = nextParams.toString()
      navigate(nextQuery ? `/patients/${id}?${nextQuery}` : `/patients/${id}`, { replace: true })
    }

    if (googleCalendarState !== 'connected') {
      setError(
        googleCalendarState === 'denied'
          ? 'Google Calendar connection was cancelled.'
          : 'Google Calendar connection failed.'
      )
      finalizeCallback()
      return
    }

    if (!pendingPatientId || pendingPatientId !== String(id)) {
      setSuccessMessage('Google Calendar connected successfully.')
      finalizeCallback()
      return
    }

    const syncPendingPatient = async () => {
      try {
        const response = await api.post(`/calendar/google/sync/patients/${id}`)
        setSuccessMessage('Appointment synced to Google Calendar.')
        if (response.data?.htmlLink) {
          window.open(response.data.htmlLink, '_blank', 'noopener,noreferrer')
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to sync appointment to Google Calendar.')
      } finally {
        finalizeCallback()
      }
    }

    syncPendingPatient()
  }, [searchParams, navigate, id])

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
        appointmentDate: patientForm.appointmentDate || null,
        appointmentTime: patientForm.appointmentTime || null,
        appointmentStatus: patientForm.appointmentDate ? patientForm.appointmentStatus : null,
        appointmentReminderMinutes:
          patientForm.appointmentDate && patientForm.appointmentReminderMinutes !== ''
            ? Number(patientForm.appointmentReminderMinutes)
            : null,
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

  const downloadCalendarInvite = async () => {
    try {
      const response = await api.get(`/patients/${id}/calendar.ics`, {
        responseType: 'blob',
      })
      const blob = new Blob([response.data], { type: 'text/calendar;charset=utf-8' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `appointment-${id}.ics`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to download calendar invite.')
    }
  }

  const connectAndSyncGoogleCalendar = async () => {
    if (!patient?.appointmentDate) {
      setError('Add an appointment date before syncing with Google Calendar.')
      return
    }

    try {
      const statusResponse = await api.get('/calendar/google/status')
      if (statusResponse.data?.connected) {
        const response = await api.post(`/calendar/google/sync/patients/${id}`)
        setSuccessMessage('Appointment synced to Google Calendar.')
        if (response.data?.htmlLink) {
          window.open(response.data.htmlLink, '_blank', 'noopener,noreferrer')
        }
        return
      }

      sessionStorage.setItem(GOOGLE_PENDING_PATIENT_KEY, String(id))
      sessionStorage.setItem(GOOGLE_PENDING_ROUTE_KEY, window.location.href)
      const connectResponse = await api.get('/calendar/google/connect', {
        params: { redirectUri: window.location.href },
      })
      const authorizationUrl = connectResponse.data?.authorizationUrl
      if (!authorizationUrl) {
        throw new Error('Missing Google authorization URL.')
      }
      window.location.href = authorizationUrl
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to start Google Calendar sync.')
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

  const openDatePicker = () => {
    const input = appointmentInputRef.current
    if (!input) {
      return
    }
    input.focus()
    if (typeof input.showPicker === 'function') {
      input.showPicker()
    }
  }

  const openTimePicker = () => {
    const input = appointmentTimeInputRef.current
    if (!input) {
      return
    }
    input.type = 'time'
    input.focus()
    if (typeof input.showPicker === 'function') {
      input.showPicker()
    }
  }

  if (loading) {
    return <main className="app-shell flex items-center justify-center text-slate-600">Loading patient profile...</main>
  }

  return (
    <main className="app-shell relative overflow-hidden">
      <span className="liquid-orb left-[-4rem] top-20 h-40 w-40 bg-[radial-gradient(circle,_rgba(122,229,214,0.42),_rgba(122,229,214,0))]" />
      <span className="liquid-orb right-[-5rem] top-32 h-48 w-48 bg-[radial-gradient(circle,_rgba(86,145,255,0.42),_rgba(86,145,255,0))]" />
      <section className="mx-auto max-w-6xl space-y-5">
        <div className="glass-panel section-chroma flex flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div>
            <p className="glass-kicker text-[10px]">Patient Record</p>
            <h1 className="glass-heading text-xl">Patient Profile</h1>
            <p className="glass-copy text-xs">Patient ID: {resolvePatientNumber(patient, '-')}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => navigate(`/dashboard?service=prescriptions&patientId=${id}`)}
              className="button-glass-secondary min-h-0 px-4 py-2"
            >
              Use In Prescription
            </button>
            {patient?.appointmentDate && (
              <>
                <button
                  type="button"
                  onClick={connectAndSyncGoogleCalendar}
                  className="button-glass-secondary min-h-0 px-4 py-2"
                >
                  Google Calendar
                </button>
                <button
                  type="button"
                  onClick={downloadCalendarInvite}
                  className="button-glass-secondary min-h-0 px-4 py-2"
                >
                  iPhone Calendar (.ics)
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => setDeletePatientOpen(true)}
              className="button-glass-danger min-h-0 px-4 py-2"
            >
              Delete Patient
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="button-glass min-h-0 px-4 py-2"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {error && <p className="alert-error">{error}</p>}

        {successMessage && <p className="alert-success">{successMessage}</p>}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[360px,1fr]">
          <section className="panel-card space-y-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-teal-700">Editable Details</p>
              <h2 className="text-lg text-slate-900">Patient Information</h2>
            </div>

            <div className="glass-well section-chroma-soft p-4">
              <p className="text-sm font-semibold text-slate-900">{patient?.name}</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-slate-600">
                <User className="h-3 w-3 text-slate-400" />
                {patient?.gender} • {patient?.age ?? '-'} years
                <Phone className="ml-2 h-3 w-3 text-slate-400" />
                {patient?.mobile}
              </p>
              {(patient?.height || patient?.weight) && (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-slate-600">
                  <Ruler className="h-3 w-3 text-slate-400" />
                  {patient?.height ? `${patient.height} cm` : null}
                  {patient?.height && patient?.weight ? ' • ' : ''}
                  {patient?.weight ? `${patient.weight} kg` : null}
                </p>
              )}
              {patient?.appointmentDate && (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-slate-600">
                  <CalendarDays className="h-3 w-3 text-slate-400" />
                  Appointment: {formatAppointmentLabel(patient.appointmentDate, patient.appointmentTime)}
                </p>
              )}
              {(patient?.appointmentStatus || patient?.appointmentReminderMinutes != null) && (
                <p className="mt-1.5 text-xs text-slate-600">
                  Status: {patient.appointmentStatus || 'BOOKED'}
                  {patient.appointmentReminderMinutes != null
                    ? ` • Reminder ${patient.appointmentReminderMinutes} min before`
                    : ''}
                </p>
              )}
            </div>

            <form onSubmit={savePatient} className="space-y-3">
              <input
                required
                className="surface-input"
                placeholder="Patient name"
                value={patientForm.name}
                onChange={(event) => setPatientForm((prev) => ({ ...prev, name: event.target.value }))}
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  required
                  type="number"
                  className="surface-input"
                  placeholder="Age"
                  value={patientForm.age}
                  onChange={(event) => setPatientForm((prev) => ({ ...prev, age: event.target.value }))}
                />
                <select
                  className="surface-input"
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
                className="surface-input"
                placeholder="Mobile number"
                value={patientForm.mobile}
                onChange={(event) => setPatientForm((prev) => ({ ...prev, mobile: event.target.value }))}
              />
              <label className="date-input-shell relative block">
                {!patientForm.appointmentDate && !appointmentFocused && (
                  <span className="date-input-overlay pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-sm text-slate-400">
                    Appointment Date
                  </span>
                )}
                <input
                  ref={appointmentInputRef}
                  type="date"
                  className={`surface-input w-full pr-12 ${!patientForm.appointmentDate ? 'date-input-empty' : ''}`}
                  aria-label="Appointment Date"
                  value={patientForm.appointmentDate}
                  onFocus={() => setAppointmentFocused(true)}
                  onBlur={() => setAppointmentFocused(false)}
                  onChange={(event) => setPatientForm((prev) => ({ ...prev, appointmentDate: event.target.value }))}
                />
                <button
                  type="button"
                  aria-label="Open appointment date calendar"
                  onClick={openDatePicker}
                  className="absolute right-3 top-1/2 z-10 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/70 text-[#3A7BD5] shadow-[0_8px_20px_rgba(58,123,213,0.14)] transition hover:bg-white"
                >
                  <CalendarDays className="h-4 w-4" />
                </button>
              </label>
              <label className="date-input-shell relative block">
                <input
                  ref={appointmentTimeInputRef}
                  type={appointmentTimeFocused || patientForm.appointmentTime ? 'time' : 'text'}
                  className="surface-input w-full pr-14"
                  aria-label="Appointment Time"
                  placeholder="Appointment Time"
                  value={patientForm.appointmentTime}
                  onFocus={() => setAppointmentTimeFocused(true)}
                  onBlur={() => setAppointmentTimeFocused(false)}
                  onChange={(event) => setPatientForm((prev) => ({ ...prev, appointmentTime: event.target.value }))}
                />
                <button
                  type="button"
                  aria-label="Open appointment time picker"
                  onClick={openTimePicker}
                  className="absolute right-3 top-1/2 z-10 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/70 text-[#3A7BD5] shadow-[0_8px_20px_rgba(58,123,213,0.14)] transition hover:bg-white"
                >
                  <Clock3 className="h-4 w-4" />
                </button>
              </label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <select
                  className="surface-input"
                  value={patientForm.appointmentStatus}
                  onChange={(event) => setPatientForm((prev) => ({ ...prev, appointmentStatus: event.target.value }))}
                >
                  <option value="">Appointment Status</option>
                  <option value="BOOKED">BOOKED</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                  <option value="NO_SHOW">NO_SHOW</option>
                </select>
                <input
                  type="number"
                  min="0"
                  max="10080"
                  className="surface-input"
                  placeholder="Appointment Reminder (mins)"
                  value={patientForm.appointmentReminderMinutes}
                  onChange={(event) =>
                    setPatientForm((prev) => ({ ...prev, appointmentReminderMinutes: event.target.value }))
                  }
                />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  type="number"
                  className="surface-input"
                  placeholder="Height (cm)"
                  value={patientForm.height}
                  onChange={(event) => setPatientForm((prev) => ({ ...prev, height: event.target.value }))}
                />
                <input
                  type="number"
                  className="surface-input"
                  placeholder="Weight (kg)"
                  value={patientForm.weight}
                  onChange={(event) => setPatientForm((prev) => ({ ...prev, weight: event.target.value }))}
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="surface-button-primary w-full"
              >
                {saving ? 'Saving...' : 'Save Patient Changes'}
              </button>
            </form>
          </section>

          <section className="panel-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-teal-700">Medical Timeline</p>
                <h2 className="text-lg text-slate-900">Prescription History</h2>
              </div>
              <span className="glass-pill text-sm text-slate-500">
                {sortedHistory.length} record(s)
              </span>
            </div>

            {sortedHistory.length === 0 && (
              <p className="glass-well border border-dashed border-slate-300/70 px-4 py-6 text-sm text-slate-500">
                No prescriptions found for this patient.
              </p>
            )}

            <div className="space-y-3">
              {sortedHistory.map((item) => (
                <article key={item.id} className="glass-well section-chroma-soft space-y-3 p-4">
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
                        className="button-glass-secondary min-h-0 px-3 py-2 text-xs"
                      >
                        Download PDF
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletePrescriptionId(item.id)}
                        className="button-glass-danger min-h-0 px-3 py-2 text-xs"
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
                        className="max-h-72 w-full rounded-[22px] border border-white/60 object-contain bg-white/75"
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
          className="glass-input"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-md p-4">
      <div className="glass-panel w-full max-w-md p-5">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <p className="mt-2 text-sm text-slate-600">{description}</p>
        {children && <div className="mt-4">{children}</div>}
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="button-glass-secondary min-h-0 rounded-lg px-4 py-2 text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={confirmDisabled}
            onClick={onConfirm}
            className="button-glass-danger min-h-0 rounded-lg px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
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
    <div className="glass-well px-3 py-2">
      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-0.5 whitespace-pre-wrap text-xs text-slate-700">{value}</p>
    </div>
  )
}

export default PatientProfile
