import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  ActivitySquare,
  BellDot,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileText,
  LogOut,
  Menu,
  Search,
  Stethoscope,
  UserRound,
  Users,
  X,
  Pill,
  Droplets,
  Syringe,
  Sun,
  Moon,
  CloudSun,
  GlassWater,
  Cookie,
  Timer,
  Hash,
  Building2,
  MapPin,
  GraduationCap,
  Briefcase,
  Phone,
  User,
  ImageIcon,
  PenTool,
  Save,
  Plus,
  Trash2,
  ChevronDown,
} from 'lucide-react'
import api from '../services/api'

const emptyTablet = {
  brand: '',
  medicineName: '',
  morning: false,
  afternoon: false,
  night: false,
  scheduleType: 'DAILY',
  weeklyDays: [],
  withWater: true,
  chew: false,
  instruction: 'AFTER_FOOD',
  duration: '',
  quantity: '',
}

const emptySyrup = {
  brand: '',
  syrupName: '',
  morning: false,
  afternoon: false,
  night: false,
  scheduleType: 'DAILY',
  weeklyDays: [],
  intakeType: 'TEASPOON',
  intakeValue: '',
  duration: '',
  quantity: '',
}

const emptyInjection = {
  brand: '',
  medicineName: '',
  daily: true,
  alternateDay: false,
  weeklyOnce: false,
  scheduleType: 'DAILY',
  weeklyDays: [],
}

const weekDayOptions = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']

const medicineTypeOptions = [
  { value: 'TABLET', label: 'Tablets' },
  { value: 'SYRUP', label: 'Syrups' },
  { value: 'INJECTION', label: 'Injections' },
]

const createEmptyMedicineDraft = (type) => {
  if (type === 'SYRUP') {
    return { ...emptySyrup }
  }

  if (type === 'INJECTION') {
    return { ...emptyInjection }
  }

  return { ...emptyTablet }
}

const getMedicineNameField = (type) => (type === 'SYRUP' ? 'syrupName' : 'medicineName')

const hasMedicineValue = (type, medicine) => {
  const nameField = getMedicineNameField(type)
  return Boolean(medicine.brand || medicine[nameField])
}

const formatMealInstruction = (instruction) =>
  instruction
    .split('_')
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' ')

const formatScheduleLabel = (scheduleType, fallback = 'Daily') => {
  if (scheduleType === 'WEEKLY') return 'Weekly'
  if (scheduleType === 'ALTERNATE_DAY') return 'Alternate day'
  if (scheduleType === 'DAILY') return 'Daily'
  return fallback
}

const formatSyrupIntake = (intakeType, intakeValue) => {
  if (intakeValue === null || intakeValue === undefined || intakeValue === '') {
    return ''
  }

  if (intakeType === 'QUANTITY_PER_INTAKE') {
    return `${intakeValue} ml per intake`
  }

  return `${intakeValue} teaspoon`
}

const summarizeMedicine = (type, medicine) => {
  if (type === 'TABLET') {
    const timings = ['morning', 'afternoon', 'night']
      .filter((key) => medicine[key])
      .map((key) => key.charAt(0).toUpperCase() + key.slice(1))
      .join(', ')

    const weeklyDays =
      medicine.scheduleType === 'WEEKLY' && Array.isArray(medicine.weeklyDays)
        ? medicine.weeklyDays.map(formatWeeklyDay).join(', ')
        : ''

    const extras = [
      medicine.withWater ? 'With water' : null,
      medicine.chew ? 'Chew' : null,
      formatScheduleLabel(medicine.scheduleType),
      medicine.duration ? `${medicine.duration} ${medicine.scheduleType === 'WEEKLY' ? 'week(s)' : 'day(s)'}` : null,
      weeklyDays || null,
      medicine.quantity ? `${medicine.quantity} tablet(s)` : null,
      medicine.instruction ? formatMealInstruction(medicine.instruction) : null,
    ]
      .filter(Boolean)
      .join(' • ')

    return [medicine.brand || 'No brand', medicine.medicineName || 'No medicine name', timings, extras]
      .filter(Boolean)
      .join(' | ')
  }

  if (type === 'SYRUP') {
    const timings = ['morning', 'afternoon', 'night']
      .filter((key) => medicine[key])
      .map((key) => key.charAt(0).toUpperCase() + key.slice(1))
      .join(', ')

    const weeklyDays =
      medicine.scheduleType === 'WEEKLY' && Array.isArray(medicine.weeklyDays)
        ? medicine.weeklyDays.map(formatWeeklyDay).join(', ')
        : ''

    const extras = [
      formatScheduleLabel(medicine.scheduleType),
      medicine.duration ? `${medicine.duration} ${medicine.scheduleType === 'WEEKLY' ? 'week(s)' : 'day(s)'}` : null,
      weeklyDays || null,
      formatSyrupIntake(medicine.intakeType, medicine.intakeValue) || null,
      medicine.quantity ? `${medicine.quantity} ml` : null,
    ]
      .filter(Boolean)
      .join(' • ')

    return [medicine.brand || 'No brand', medicine.syrupName || 'No syrup name', timings, extras]
      .filter(Boolean)
      .join(' | ')
  }

  const schedule = ['daily', 'alternateDay', 'weeklyOnce']
    .filter((key) => medicine[key])
    .map((key) => {
      if (key === 'alternateDay') return 'Alternate day'
      if (key === 'weeklyOnce') return 'Weekly'
      return 'Daily'
    })
    .join(', ')

  const resolvedSchedule = formatScheduleLabel(medicine.scheduleType, schedule)

  const weeklyDays = Array.isArray(medicine.weeklyDays) ? medicine.weeklyDays.map(formatWeeklyDay).join(', ') : ''

  return [medicine.brand || 'No brand', medicine.medicineName || 'No injection name', resolvedSchedule, weeklyDays]
    .filter(Boolean)
    .join(' | ')
}

const formatWeeklyDay = (day) => day.charAt(0) + day.slice(1).toLowerCase()

const normalizeWeeklyDays = (scheduleType, weeklyDays) => {
  if (scheduleType !== 'WEEKLY' || !Array.isArray(weeklyDays)) {
    return []
  }

  const selectedDays = new Set(weeklyDays)
  return weekDayOptions.filter((day) => selectedDays.has(day))
}

const resolvePatientNumber = (patient) => patient?.patientNumber ?? patient?.id ?? '-'

const patientInitials = (name) =>
  (name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'PT'

const isIsoDateOnly = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value)

const toLocalDateKey = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const normalizeCalendarDate = (value) => {
  if (!value) {
    return null
  }

  if (isIsoDateOnly(value)) {
    return value
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return null
  }

  return toLocalDateKey(parsed)
}

const formatDisplayDate = (value) => {
  if (!value) {
    return 'No visit yet'
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

const calendarWeekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const serviceSections = [
  { key: 'prescriptions', title: 'Prescriptions', shortTitle: 'Rx', description: 'Medicines & PDF', badge: 'RX', Icon: FileText },
  { key: 'patients', title: 'Patients', shortTitle: 'Patients', description: 'Records & search', badge: 'PT', Icon: Users },
  { key: 'appointments', title: 'Appointments', shortTitle: 'Calendar', description: 'Reminders & follow-ups', badge: 'CL', Icon: CalendarDays },
  { key: 'profile', title: 'Profile', shortTitle: 'Profile', description: 'Clinic identity', badge: 'DP', Icon: Stethoscope },
]

const isValidServiceSection = (value) => serviceSections.some((section) => section.key === value)

function Dashboard() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const activeServiceFromQuery = searchParams.get('service')
  const storedRole = (localStorage.getItem('role') || 'DOCTOR').toUpperCase()
  const storedDoctorId = localStorage.getItem('doctorId')
  const isReceptionist = storedRole === 'RECEPTIONIST'
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [doctor, setDoctor] = useState(null)
  const [doctorForm, setDoctorForm] = useState({
    name: '',
    phone: '',
    clinicName: '',
    locality: '',
    specialization: '',
    education: '',
    experience: '',
    logoUrl: '',
    signatureUrl: '',
  })
  const [profileMessage, setProfileMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const [patients, setPatients] = useState([])
  const [patientQuery, setPatientQuery] = useState('')
  const [selectedPatientId, setSelectedPatientId] = useState(null)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [prescriptionHistory, setPrescriptionHistory] = useState([])
  const [selectedCalendarDate, setSelectedCalendarDate] = useState('')
  const [calendarAppointments, setCalendarAppointments] = useState([])
  const [appointmentsLoading, setAppointmentsLoading] = useState(false)

  const [newPatient, setNewPatient] = useState({
    name: '',
    age: '',
    gender: 'MALE',
    mobile: '',
    appointmentDate: '',
    appointmentTime: '',
    appointmentStatus: '',
    appointmentReminderMinutes: '',
    height: '',
    weight: '',
  })
  const [newPatientAppointmentFocused, setNewPatientAppointmentFocused] = useState(false)
  const newPatientAppointmentInputRef = useRef(null)
  const [newPatientAppointmentTimeFocused, setNewPatientAppointmentTimeFocused] = useState(false)
  const newPatientAppointmentTimeInputRef = useRef(null)

  const [prescriptionMode, setPrescriptionMode] = useState('PATIENT')
  const [showClinicalNotes, setShowClinicalNotes] = useState(false)
  const [complaints, setComplaints] = useState('')
  const [examination, setExamination] = useState('')
  const [investigationAdvice, setInvestigationAdvice] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [bp, setBp] = useState('')
  const [sugar, setSugar] = useState('')
  const [treatment, setTreatment] = useState('')
  const [followUp, setFollowUp] = useState('')
  const [followUpDate, setFollowUpDate] = useState('')
  const [advice, setAdvice] = useState('')
  const [xrayImageUrl, setXrayImageUrl] = useState('')
  const [xrayUploading, setXrayUploading] = useState(false)
  const [consultationFee, setConsultationFee] = useState('')
  const [showDoctorDetails, setShowDoctorDetails] = useState(true)
  const [activeService, setActiveService] = useState(
    isReceptionist
      ? 'patients'
      : isValidServiceSection(activeServiceFromQuery)
        ? activeServiceFromQuery
        : 'prescriptions'
  )
  const [selectedMedicineType, setSelectedMedicineType] = useState('TABLET')
  const [medicineDraft, setMedicineDraft] = useState(createEmptyMedicineDraft('TABLET'))
  const [tablets, setTablets] = useState([])
  const [syrups, setSyrups] = useState([])
  const [injections, setInjections] = useState([])
  const [suggestions, setSuggestions] = useState({})
  const suggestionCacheRef = useRef(new Map())

  const selectedPatientFromList = useMemo(
    () => patients.find((p) => p.id === selectedPatientId) || null,
    [patients, selectedPatientId]
  )

  const availableServiceSections = isReceptionist
    ? serviceSections.filter((section) => section.key === 'patients')
    : serviceSections

  const renderAppointmentsPanel = (className = '') => (
    <section className={`glass-panel section-chroma p-3 ${className}`.trim()}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#4c7fe2]">Calendar</p>
          <h3 className="mt-0.5 text-sm font-semibold text-[#20304f]">Appointments</h3>
        </div>
        <CalendarDays className="h-4 w-4 text-[#4c7fe2]" />
      </div>
      <div className="mt-2 grid grid-cols-7 gap-1.5">
        {calendarWeekdayLabels.map((label) => (
          <span key={label} className="text-center text-[9px] font-bold uppercase tracking-[0.1em] text-[#7d8ca8]">{label}</span>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-1.5">
        {appointmentDays.map((item) =>
          item.isEmpty ? (
            <div key={item.key} className="min-h-10 rounded-xl" />
          ) : (
            <button
              key={item.key}
              type="button"
              onClick={() => loadFollowUpAppointments(item.date)}
              className={`flex min-h-10 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 transition ${
                selectedCalendarDate === item.date
                  ? 'bg-white/82 ring-1 ring-[#4c7fe2]/24 shadow-sm'
                  : item.isToday
                    ? 'bg-[rgba(76,127,226,0.14)] hover:bg-[rgba(76,127,226,0.2)]'
                    : 'bg-white/58 hover:bg-white/76'
              }`}
            >
              <span className="text-xs font-semibold text-[#20304f]">{item.day}</span>
              <span className={`h-1.5 w-1.5 rounded-full ${item.hasAlert ? 'bg-[#4c7fe2]' : 'bg-transparent'}`} />
            </button>
          )
        )}
      </div>
      {selectedCalendarDate && (
        <div className="glass-well section-chroma-soft mt-3 p-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#3A7BD5]">Reminders</p>
              <p className="text-xs font-medium text-[#1D2D50]">{formatDisplayDate(selectedCalendarDate)}</p>
            </div>
            <span className="glass-pill text-[10px] font-medium text-[#6f7f9a]">
              {calendarAppointments.length}
            </span>
          </div>
          <div className="mt-2 space-y-1.5">
            {appointmentsLoading && (
              <p className="text-xs text-slate-500">Loading...</p>
            )}
            {!appointmentsLoading && calendarAppointments.length === 0 && (
              <p className="text-xs text-slate-500">No appointments for this date.</p>
            )}
            {!appointmentsLoading &&
              calendarAppointments.map((appointment) => (
                <button
                  key={`${appointment.eventType}-${appointment.prescriptionId ?? 'appt'}-${appointment.patientId}`}
                  type="button"
                  onClick={() => {
                    setSelectedPatientId(appointment.patientId)
                    selectService('patients')
                  }}
                  className="glass-well section-chroma-soft flex min-h-9 w-full items-center justify-between px-2.5 py-2 text-left transition hover:border-[#4c7fe2]/30 hover:bg-white/82"
                >
                  <div>
                    <p className="text-xs font-medium text-[#1D2D50]">
                      {appointment.patientName} #{appointment.patientNumber ?? appointment.patientId}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {appointment.eventType === 'APPOINTMENT' ? 'Appt' : 'Follow-up'}
                      {appointment.appointmentTime ? ` • ${formatDisplayTime(appointment.appointmentTime)}` : ''}
                      {appointment.patientMobile ? ` • ${appointment.patientMobile}` : ''}
                    </p>
                  </div>
                  <Clock3 className="h-3.5 w-3.5 text-slate-400" />
                </button>
              ))}
          </div>
        </div>
      )}
      {!appointmentDays.some((item) => !item.isEmpty && item.hasAlert) && (
        <div className="glass-well section-chroma-soft mt-3 border border-dashed border-slate-200/70 px-3 py-4 text-center">
          <BellDot className="mx-auto h-6 w-6 text-[#b8c7df]" />
          <p className="mt-2 text-xs font-medium text-[#20304f]">No Appointments</p>
          <p className="mt-0.5 text-[10px] text-[#6f7f9a]">Appointments and follow-ups will appear here.</p>
        </div>
      )}
    </section>
  )

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      window.location.href = '/'
      return
    }
    loadInitialData()
  }, [])

  useEffect(() => {
    const message = sessionStorage.getItem('dashboardMessage')
    if (!message) {
      return
    }
    setProfileMessage(message)
    sessionStorage.removeItem('dashboardMessage')
  }, [])

  useEffect(() => {
    const googleCalendarState = searchParams.get('googleCalendar')
    if (!googleCalendarState || isReceptionist) {
      return
    }

    const pendingPatientId = sessionStorage.getItem(GOOGLE_PENDING_PATIENT_KEY)

    const finalizeCallback = () => {
      sessionStorage.removeItem(GOOGLE_PENDING_PATIENT_KEY)
      sessionStorage.removeItem(GOOGLE_PENDING_ROUTE_KEY)
      const nextParams = new URLSearchParams(searchParams)
      nextParams.delete('googleCalendar')
      const nextQuery = nextParams.toString()
      navigate(nextQuery ? `/dashboard?${nextQuery}` : '/dashboard', { replace: true })
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

    if (!pendingPatientId) {
      setProfileMessage('Google Calendar connected successfully.')
      finalizeCallback()
      return
    }

    const syncPendingPatient = async () => {
      try {
        const response = await api.post(`/calendar/google/sync/patients/${pendingPatientId}`)
        setProfileMessage('Appointment synced to Google Calendar.')
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
  }, [searchParams, navigate, isReceptionist])

  useEffect(() => {
    if (!selectedPatientId) {
      setSelectedPatient(null)
      setPrescriptionHistory([])
      return
    }
    loadPatientDetails(selectedPatientId)
    loadPrescriptionHistory(selectedPatientId)
  }, [selectedPatientId])

  useEffect(() => {
    const timer = setTimeout(() => {
      searchPatients(patientQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [patientQuery])

  useEffect(() => {
    const patientIdFromQuery = searchParams.get('patientId')
    if (!patientIdFromQuery || Number.isNaN(Number(patientIdFromQuery))) {
      return
    }
    setSelectedPatientId(Number(patientIdFromQuery))
  }, [searchParams])

  useEffect(() => {
    const nextService = searchParams.get('service')
    if (isReceptionist) {
      if (activeService !== 'patients') {
        setActiveService('patients')
      }
      return
    }
    if (isValidServiceSection(nextService) && nextService !== activeService) {
      setActiveService(nextService)
    }
  }, [searchParams, activeService, isReceptionist])

  const loadInitialData = async () => {
    setLoading(true)
    setError('')
    try {
      const [doctorRes, patientsRes] = await Promise.allSettled([
        isReceptionist && storedDoctorId
          ? api.get(`/doctors/${storedDoctorId}`)
          : api.get('/doctors/me'),
        api.get('/patients'),
      ])

      if (doctorRes.status === 'fulfilled') {
        setDoctor(doctorRes.value.data)
        setDoctorForm({
          name: doctorRes.value.data?.name || '',
          phone: doctorRes.value.data?.phone || '',
          clinicName: doctorRes.value.data?.clinicName || '',
          locality: doctorRes.value.data?.locality || '',
          specialization: doctorRes.value.data?.specialization || '',
          education: doctorRes.value.data?.education || '',
          experience:
            doctorRes.value.data?.experience !== null && doctorRes.value.data?.experience !== undefined
              ? String(doctorRes.value.data.experience)
              : '',
          logoUrl: doctorRes.value.data?.logoUrl || '',
          signatureUrl: doctorRes.value.data?.signatureUrl || '',
        })
      } else {
        setDoctor(null)
      }

      if (patientsRes.status === 'fulfilled') {
        setPatients(patientsRes.value.data || [])
      } else {
        setPatients([])
      }

      const nextErrors = []
      if (doctorRes.status === 'rejected') {
        nextErrors.push('doctor profile')
      }
      if (patientsRes.status === 'rejected') {
        nextErrors.push('patients')
      }

      if (nextErrors.length > 0) {
        setError(`Some dashboard data could not be loaded: ${nextErrors.join(' and ')}.`)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load doctor workspace.')
    } finally {
      setLoading(false)
    }
  }

  const loadPatientDetails = async (patientId) => {
    try {
      const response = await api.get(`/patients/${patientId}`)
      setSelectedPatient(response.data)
    } catch {
      setSelectedPatient(selectedPatientFromList)
    }
  }

  const loadPrescriptionHistory = async (patientId) => {
    try {
      const response = await api.get(`/prescriptions/patient/${patientId}`)
      setPrescriptionHistory(response.data || [])
    } catch {
      setPrescriptionHistory([])
    }
  }

  const loadFollowUpAppointments = async (date) => {
    if (!date) {
      setSelectedCalendarDate('')
      setCalendarAppointments([])
      return
    }

    setAppointmentsLoading(true)
    try {
      const [followUpsResponse, appointmentsResponse] = await Promise.all([
        api.get('/prescriptions/follow-ups', {
          params: { date },
        }),
        api.get('/patients/appointments', {
          params: { date },
        }),
      ])

      const followUps = (followUpsResponse.data || []).map((item) => ({
        ...item,
        eventType: 'FOLLOW_UP',
        eventDate: item.followUpDate || date,
      }))

      const appointments = (appointmentsResponse.data || []).map((item) => ({
        prescriptionId: null,
        patientId: item.patientId,
        patientNumber: item.patientNumber,
        patientName: item.patientName,
        patientMobile: item.patientMobile,
        patientAge: item.patientAge,
        patientGender: item.patientGender,
        diagnosis: '',
        followUpDate: item.appointmentDate,
        appointmentDate: item.appointmentDate,
        appointmentTime: item.appointmentTime,
        eventType: 'APPOINTMENT',
        eventDate: item.appointmentDate || date,
      }))

      setSelectedCalendarDate(date)
      setCalendarAppointments([...appointments, ...followUps])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load appointments.')
      setSelectedCalendarDate(date)
      setCalendarAppointments([])
    } finally {
      setAppointmentsLoading(false)
    }
  }

  const saveProfile = async (event) => {
    event.preventDefault()
    setProfileMessage('')
    setError('')
    try {
      const payload = {
        ...doctorForm,
        experience: doctorForm.experience === '' ? null : Number(doctorForm.experience),
      }
      const response = await api.put('/doctors/me', payload)
      setDoctor(response.data)
      setProfileMessage('Profile updated successfully.')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.')
    }
  }

  const uploadAsset = async (type, file) => {
    if (!file) {
      return
    }
    setError('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)
      const uploadRes = await api.post('/doctors/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const uploadedUrl = uploadRes.data?.url
      if (!uploadedUrl) {
        return
      }
      const updated = { ...doctorForm, [`${type}Url`]: uploadedUrl }
      setDoctorForm(updated)
      const payload = {
        ...updated,
        experience: updated.experience === '' ? null : Number(updated.experience),
      }
      const response = await api.put('/doctors/me', payload)
      setDoctor(response.data)
      setProfileMessage(`${type === 'logo' ? 'Logo' : 'Signature'} uploaded successfully.`)
    } catch (err) {
      setError(err.response?.data?.message || 'File upload failed.')
    }
  }

  const createPatient = async (event) => {
    event.preventDefault()
    setError('')
    try {
      const payload = {
        name: newPatient.name.trim(),
        age: Number(newPatient.age),
        gender: newPatient.gender,
        mobile: newPatient.mobile.trim(),
        appointmentDate: newPatient.appointmentDate || null,
        appointmentTime: newPatient.appointmentTime || null,
        appointmentStatus: newPatient.appointmentDate ? newPatient.appointmentStatus : null,
        appointmentReminderMinutes:
          newPatient.appointmentDate && newPatient.appointmentReminderMinutes !== ''
            ? Number(newPatient.appointmentReminderMinutes)
            : null,
        height: newPatient.height === '' ? null : Number(newPatient.height),
        weight: newPatient.weight === '' ? null : Number(newPatient.weight),
      }
      const response = await api.post('/patients', payload)
      setPatients((prev) => [response.data, ...prev])
      setNewPatient({
        name: '',
        age: '',
        gender: 'MALE',
        mobile: '',
        appointmentDate: '',
        appointmentTime: '',
        appointmentStatus: '',
        appointmentReminderMinutes: '',
        height: '',
        weight: '',
      })
      setSelectedPatientId(response.data.id)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create patient.')
    }
  }

  const searchPatients = async (queryOverride) => {
    try {
      const normalizedQuery = (queryOverride ?? patientQuery).trim()
      if (!normalizedQuery) {
        const response = await api.get('/patients')
        setPatients(response.data || [])
        return
      }
      const response = await api.get('/patients/search', {
        params: { query: normalizedQuery },
      })
      setPatients(response.data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to search patients.')
    }
  }

  const fetchMedicineSuggestions = async (type, key, query, field) => {
    if (!query || query.trim().length < 1) {
      setSuggestions((prev) => ({ ...prev, [key]: [] }))
      return
    }
    try {
      const normalizedQuery = query.trim().toLowerCase()
      const cacheKey = `${type}_${field}_${normalizedQuery}`
      const cached = suggestionCacheRef.current.get(cacheKey)
      if (cached) {
        setSuggestions((prev) => ({ ...prev, [key]: cached }))
        return
      }

      const response = await api.get('/medicines/search', {
        params: { query: normalizedQuery, type },
      })
      const data = Array.isArray(response.data) ? response.data : []
      const values = [
        ...new Set(
          data
            .map((item) => {
              if (!item || typeof item !== 'object') {
                return ''
              }

              if (field === 'combined') {
                const b = item.brand || ''
                const n = item.medicineName || item.syrupName || ''
                return b && n ? `${b} — ${n}` : b || n
              }
              return field === 'brand' ? item.brand : item.medicineName
            })
            .filter(Boolean)
        ),
      ].slice(0, 10)

      suggestionCacheRef.current.set(cacheKey, values)
      setSuggestions((prev) => ({ ...prev, [key]: values }))
    } catch {
      setSuggestions((prev) => ({ ...prev, [key]: [] }))
    }
  }

  const updateMedicineDraft = (field, value) => {
    setMedicineDraft((prev) => ({ ...prev, [field]: value }))
  }

  const selectService = (serviceKey) => {
    if (isReceptionist && serviceKey !== 'patients') {
      return
    }
    setActiveService(serviceKey)
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('service', serviceKey)
    navigate(`/dashboard?${nextParams.toString()}`, { replace: true })
  }

  const openPrescriptionForPatient = (patientId) => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('patientId', String(patientId))
    nextParams.set('service', 'prescriptions')
    navigate(`/dashboard?${nextParams.toString()}`)
  }

  const openTimePicker = (inputRef) => {
    const input = inputRef.current
    if (!input) {
      return
    }
    input.type = 'time'
    input.focus()
    if (typeof input.showPicker === 'function') {
      input.showPicker()
    }
  }

  const downloadCalendarInvite = async (patientId) => {
    try {
      const response = await api.get(`/patients/${patientId}/calendar.ics`, {
        responseType: 'blob',
      })
      const blob = new Blob([response.data], { type: 'text/calendar;charset=utf-8' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `appointment-${patientId}.ics`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to download calendar invite.')
    }
  }

  const connectAndSyncGoogleCalendar = async (patient) => {
    if (!patient?.appointmentDate) {
      setError('Add an appointment date before syncing with Google Calendar.')
      return
    }

    try {
      const statusResponse = await api.get('/calendar/google/status')
      if (statusResponse.data?.connected) {
        const response = await api.post(`/calendar/google/sync/patients/${patient.id}`)
        setProfileMessage('Appointment synced to Google Calendar.')
        if (response.data?.htmlLink) {
          window.open(response.data.htmlLink, '_blank', 'noopener,noreferrer')
        }
        return
      }

      sessionStorage.setItem(GOOGLE_PENDING_PATIENT_KEY, String(patient.id))
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

  const handleMedicineTypeChange = (nextType) => {
    setSelectedMedicineType(nextType)
    setMedicineDraft(createEmptyMedicineDraft(nextType))
    setSuggestions((prev) => ({
      ...prev,
      [`${nextType.toLowerCase()}-draft-brand`]: [],
      [`${nextType.toLowerCase()}-draft-name`]: [],
    }))
  }

  const updateMedicineSchedule = (scheduleType) => {
    setMedicineDraft((prev) => ({
      ...prev,
      scheduleType,
      daily: selectedMedicineType === 'INJECTION' ? scheduleType === 'DAILY' : prev.daily,
      weeklyOnce: selectedMedicineType === 'INJECTION' ? scheduleType === 'WEEKLY' : prev.weeklyOnce,
      alternateDay: selectedMedicineType === 'INJECTION' ? scheduleType === 'ALTERNATE_DAY' : prev.alternateDay,
      weeklyDays: scheduleType === 'WEEKLY' ? prev.weeklyDays || [] : [],
    }))
  }

  const toggleWeeklyDay = (day) => {
    setMedicineDraft((prev) => {
      if (prev.scheduleType !== 'WEEKLY') {
        return prev
      }

      const nextDays = prev.weeklyDays.includes(day)
        ? prev.weeklyDays.filter((value) => value !== day)
        : [...prev.weeklyDays, day]

      return {
        ...prev,
        weeklyDays: normalizeWeeklyDays(prev.scheduleType, nextDays),
      }
    })
  }

  const addMedicine = () => {
    setError('')

    if (!hasMedicineValue(selectedMedicineType, medicineDraft)) {
      setError('Enter at least a medicine brand or name before adding.')
      return
    }

    if (medicineDraft.scheduleType === 'WEEKLY' && medicineDraft.weeklyDays.length === 0) {
      setError(`Select at least one day for a weekly ${selectedMedicineType.toLowerCase()}.`)
      return
    }

    if (selectedMedicineType === 'TABLET') {
      setTablets((prev) => [
        ...prev,
        { ...medicineDraft, weeklyDays: normalizeWeeklyDays(medicineDraft.scheduleType, medicineDraft.weeklyDays) },
      ])
    } else if (selectedMedicineType === 'SYRUP') {
      setSyrups((prev) => [
        ...prev,
        { ...medicineDraft, weeklyDays: normalizeWeeklyDays(medicineDraft.scheduleType, medicineDraft.weeklyDays) },
      ])
    } else {
      setInjections((prev) => [
        ...prev,
        { ...medicineDraft, weeklyDays: normalizeWeeklyDays(medicineDraft.scheduleType, medicineDraft.weeklyDays) },
      ])
    }

    setSuggestions((prev) => ({
      ...prev,
      [`${selectedMedicineType.toLowerCase()}-draft-brand`]: [],
      [`${selectedMedicineType.toLowerCase()}-draft-name`]: [],
    }))
    setMedicineDraft(createEmptyMedicineDraft(selectedMedicineType))
  }

  const handleFoodInstructionSelect = (instruction) => {
    if (!hasMedicineValue(selectedMedicineType, medicineDraft)) {
      updateMedicineDraft('instruction', instruction)
      return
    }
    const finalDraft = { ...medicineDraft, instruction }
    if (selectedMedicineType === 'TABLET') {
      setTablets((prev) => [
        ...prev,
        { ...finalDraft, weeklyDays: normalizeWeeklyDays(finalDraft.scheduleType, finalDraft.weeklyDays) },
      ])
    } else if (selectedMedicineType === 'SYRUP') {
      setSyrups((prev) => [
        ...prev,
        { ...finalDraft, weeklyDays: normalizeWeeklyDays(finalDraft.scheduleType, finalDraft.weeklyDays) },
      ])
    }
    setSuggestions((prev) => ({
      ...prev,
      [`${selectedMedicineType.toLowerCase()}-draft-combined`]: [],
    }))
    setMedicineDraft(createEmptyMedicineDraft(selectedMedicineType))
  }

  const handleInjectionScheduleAndAdd = (scheduleType) => {
    updateMedicineSchedule(scheduleType)
    if (!hasMedicineValue('INJECTION', medicineDraft)) return
    const finalDraft = {
      ...medicineDraft,
      scheduleType,
      daily: scheduleType === 'DAILY',
      weeklyOnce: scheduleType === 'WEEKLY',
      alternateDay: scheduleType === 'ALTERNATE_DAY',
    }
    setInjections((prev) => [
      ...prev,
      { ...finalDraft, weeklyDays: normalizeWeeklyDays(finalDraft.scheduleType, finalDraft.weeklyDays) },
    ])
    setSuggestions((prev) => ({
      ...prev,
      ['injection-draft-combined']: [],
    }))
    setMedicineDraft(createEmptyMedicineDraft('INJECTION'))
  }

  const uploadXray = async (file) => {
    if (!file) {
      return
    }

    setError('')
    setXrayUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await api.post('/prescriptions/upload-xray', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setXrayImageUrl(response.data?.url || '')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload x-ray image.')
    } finally {
      setXrayUploading(false)
    }
  }

  const removeMedicine = (type, index) => {
    if (type === 'TABLET') {
      setTablets((prev) => prev.filter((_, itemIndex) => itemIndex !== index))
      return
    }

    if (type === 'SYRUP') {
      setSyrups((prev) => prev.filter((_, itemIndex) => itemIndex !== index))
      return
    }

    setInjections((prev) => prev.filter((_, itemIndex) => itemIndex !== index))
  }

    const brandSuggestionKey = `${selectedMedicineType.toLowerCase()}-draft-brand`
    const nameSuggestionKey = `${selectedMedicineType.toLowerCase()}-draft-name`
    const combinedSuggestionKey = `${selectedMedicineType.toLowerCase()}-draft-combined`
    const medicineCounts = {
    TABLET: tablets.filter((item) => hasMedicineValue('TABLET', item)).length,
    SYRUP: syrups.filter((item) => hasMedicineValue('SYRUP', item)).length,
    INJECTION: injections.filter((item) => hasMedicineValue('INJECTION', item)).length,
    }

    const submitPrescription = async (event) => {
    event.preventDefault()
    setError('')
    try {
      const payload = {
        patientId: prescriptionMode === 'PATIENT' ? selectedPatientId : null,
        doctorName: doctorForm.name,
        doctorEmail: doctor?.email || '',
        doctorPhone: doctorForm.phone,
        clinicName: doctorForm.clinicName,
        showDoctorName: showDoctorDetails,
        showClinicName: showDoctorDetails,
        locality: doctorForm.locality,
        education: doctorForm.education,
        logoUrl: doctorForm.logoUrl,
        signatureUrl: doctorForm.signatureUrl,
        complaints: complaints.trim(),
        examination: examination.trim(),
        investigationAdvice: investigationAdvice.trim(),
        diagnosis: diagnosis.trim(),
        bp: bp.trim(),
        sugar: sugar.trim(),
        treatment: treatment.trim(),
        followUp: followUp.trim(),
        followUpDate: followUpDate || null,
        xrayImageUrl: xrayImageUrl.trim(),
        advice: advice.trim(),
        consultationFee: consultationFee === '' ? null : Number(consultationFee),
        fee: consultationFee === '' ? null : Number(consultationFee),
        tablets: tablets.filter((t) => t.brand || t.medicineName),
        syrups: syrups.filter((s) => s.brand || s.syrupName),
        injections: injections
          .filter((i) => i.brand || i.medicineName)
          .map((injection) => ({
            ...injection,
            daily: injection.scheduleType === 'DAILY',
            weeklyOnce: injection.scheduleType === 'WEEKLY',
            alternateDay: injection.scheduleType === 'ALTERNATE_DAY',
            weeklyDays: normalizeWeeklyDays(injection.scheduleType, injection.weeklyDays),
          })),
      }

      payload.tablets = payload.tablets.map((tablet) => ({
        ...tablet,
        weeklyDays: normalizeWeeklyDays(tablet.scheduleType, tablet.weeklyDays),
      }))

      payload.syrups = payload.syrups.map((syrup) => ({
        ...syrup,
        weeklyDays: normalizeWeeklyDays(syrup.scheduleType, syrup.weeklyDays),
        intakeValue: syrup.intakeValue === '' ? null : Number(syrup.intakeValue),
      }))

      if (prescriptionMode === 'PATIENT' && !selectedPatientId) {
        setError('Select a patient for patient-based prescription.')
        return
      }

      const response = await api.post('/prescriptions', payload, {
        responseType: 'blob',
      })

      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `prescription-${Date.now()}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      if (selectedPatientId) {
        loadPrescriptionHistory(selectedPatientId)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save prescription.')
    }
    }

    const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('doctorId')
    window.location.href = '/'
    }

    const stats = [
    { label: 'Patients', value: patients.length, icon: <User className="h-4 w-4 text-cyan-700" /> },
    { label: 'Prescriptions', value: prescriptionHistory.length, icon: <FileText className="h-4 w-4 text-indigo-700" /> },
    { label: 'Medicines', value: tablets.length + syrups.length + injections.length, icon: <Pill className="h-4 w-4 text-emerald-700" /> },
    ]

    const openDatePicker = (inputRef) => {
    const input = inputRef?.current
    if (!input) {
      return
    }
    input.focus()
    if (typeof input.showPicker === 'function') {
      input.showPicker()
    }
    }

    const appointmentDays = useMemo(() => {
    const dates = prescriptionHistory
      .map((item) => item.followUpDate || item.visitDate)
      .filter(Boolean)
      .map((value) => normalizeCalendarDate(value))
      .filter(Boolean)

    const patientAppointmentDates = patients
      .map((patient) => patient.appointmentDate)
      .filter(Boolean)
      .map((value) => normalizeCalendarDate(value))
      .filter(Boolean)

    const highlightedDays = new Set([...dates, ...patientAppointmentDates])
    const today = new Date()
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    const leadingEmptyDays = monthStart.getDay()
    const totalDaysInMonth = monthEnd.getDate()
    const items = []

    for (let index = 0; index < leadingEmptyDays; index += 1) {
      items.push({
        key: `empty-${index}`,
        isEmpty: true,
      })
    }

    for (let day = 1; day <= totalDaysInMonth; day += 1) {
      const date = new Date(today.getFullYear(), today.getMonth(), day)
      const isoDate = toLocalDateKey(date)
      items.push({
        key: isoDate,
        isEmpty: false,
        label: date.toLocaleDateString('en-US', { weekday: 'short' }),
        day,
        date: isoDate,
        hasAlert: highlightedDays.has(isoDate),
        isToday: isoDate === toLocalDateKey(today),
      })
    }

    return items
    }, [prescriptionHistory, patients])

  if (loading) {
    return <main className="app-shell flex items-center justify-center text-slate-600">Loading dashboard...</main>
  }

  return (
    <main className="app-shell relative overflow-hidden p-2 sm:p-3 lg:p-4">
      <span className="liquid-orb left-[-6rem] top-16 h-44 w-44 bg-[radial-gradient(circle,_rgba(132,231,255,0.72),_rgba(132,231,255,0))]" />
      <span className="liquid-orb right-[-4rem] top-28 h-40 w-40 bg-[radial-gradient(circle,_rgba(86,145,255,0.46),_rgba(86,145,255,0))]" />
      <span className="liquid-orb bottom-16 right-[18%] h-52 w-52 bg-[radial-gradient(circle,_rgba(122,229,214,0.4),_rgba(122,229,214,0))]" />

      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 xl:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <aside
            className="absolute left-0 top-0 h-full w-72 overflow-y-auto bg-white/95 p-4 shadow-2xl backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#3A7BD5]">E-ScriptPro</p>
              <button onClick={() => setMobileMenuOpen(false)} className="rounded-full p-1.5 text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mb-4 rounded-2xl bg-gradient-to-br from-[#0b3d91] to-[#3a7bd5] p-4 text-white">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">
                {isReceptionist ? 'Reception' : 'Console'}
              </p>
              <p className="mt-1 truncate text-sm font-semibold">{doctor?.name || doctorForm.name || 'Doctor'}</p>
              <p className="mt-0.5 truncate text-[11px] text-white/70">
                {doctor?.specialization || doctorForm.specialization || 'Set up your profile'}
              </p>
            </div>
            <nav className="space-y-1">
              {availableServiceSections.map((section) => {
                const active = activeService === section.key
                return (
                  <button
                    key={section.key}
                    type="button"
                    onClick={() => { selectService(section.key); setMobileMenuOpen(false) }}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-medium transition ${
                      active
                        ? 'bg-[#3a7bd5]/10 text-[#1d2d50]'
                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                    }`}
                  >
                    <section.Icon className={`h-4 w-4 ${active ? 'text-[#3a7bd5]' : 'text-slate-400'}`} />
                    {section.title}
                  </button>
                )
              })}
            </nav>
            <div className="mt-6 space-y-1.5">
              {stats.map((stat) => (
                <div key={stat.label} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs">
                  <span className="text-slate-500">{stat.label}</span>
                  <span className="font-semibold text-slate-800">{stat.value}</span>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={logout}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-xs font-medium text-red-600 transition hover:bg-red-100"
            >
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </button>
          </aside>
        </div>
      )}

      <section className="mx-auto max-w-[1440px] space-y-3 lg:space-y-4">
        {/* Header */}
        <header className="glass-panel flex items-center gap-3 px-3 py-3 sm:px-4">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="rounded-lg p-2 text-slate-500 hover:bg-white/60 xl:hidden"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#3A7BD5]">E-ScriptPro</p>
            <h1 className="truncate text-sm font-semibold text-slate-900 sm:text-base">
              {isReceptionist ? 'Receptionist Dashboard' : 'Dashboard'}
            </h1>
          </div>
          <form
            onSubmit={(event) => { event.preventDefault(); searchPatients() }}
            className="glass-well hidden min-h-9 flex-1 items-center gap-2 px-3 py-2 sm:flex lg:max-w-sm"
          >
            <Search className="h-4 w-4 text-[#3A7BD5]" />
            <input
              value={patientQuery}
              onChange={(e) => setPatientQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-slate-900 outline-none placeholder:text-slate-400"
              placeholder="Search patients..."
            />
          </form>
          <button
            type="button"
            onClick={logout}
            className="button-glass hidden min-w-0 px-3 py-2 text-xs xl:inline-flex"
          >
            <LogOut className="mr-1.5 h-3.5 w-3.5" />
            Logout
          </button>
        </header>

        {/* Mobile search */}
        <form
          onSubmit={(event) => { event.preventDefault(); searchPatients() }}
          className="glass-well flex min-h-9 items-center gap-2 px-3 py-2 sm:hidden"
        >
          <Search className="h-4 w-4 text-[#3A7BD5]" />
          <input
            value={patientQuery}
            onChange={(e) => setPatientQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-slate-900 outline-none placeholder:text-slate-400"
            placeholder="Search patients..."
          />
        </form>

        {error && (
          <p className="glass-well border border-red-200/80 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className={`grid grid-cols-1 gap-3 ${sidebarCollapsed ? 'xl:grid-cols-[64px,minmax(0,1fr)]' : 'xl:grid-cols-[240px,minmax(0,1fr)]'} transition-all duration-300`}>
          <aside className="hidden space-y-3 xl:block xl:sticky xl:top-4 xl:self-start">
            {/* Collapse toggle */}
            <button
              type="button"
              onClick={() => setSidebarCollapsed((p) => !p)}
              className="glass-well mx-auto flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:text-slate-600"
            >
              {sidebarCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
            </button>

            {/* Doctor info card */}
            <div className={`glass-panel section-highlight overflow-hidden text-white ${sidebarCollapsed ? 'p-2' : 'p-4'}`}>
              {sidebarCollapsed ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-[10px] font-bold">
                    {(doctor?.name || 'D').charAt(0)}
                  </div>
                  {stats.map((stat) => (
                    <div key={stat.label} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white/10 text-xs font-semibold" title={stat.label}>
                      {stat.value}
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">
                    {isReceptionist ? 'Reception Desk' : 'Practice Console'}
                  </p>
                  <h2 className="mt-2 truncate text-base font-semibold">{doctor?.name || doctorForm.name || 'Doctor'}</h2>
                  <p className="mt-0.5 truncate text-[11px] text-white/70">
                    {isReceptionist
                      ? `Working with ${doctor?.name || 'assigned doctor'}`
                      : (doctor?.specialization || doctorForm.specialization || 'Complete your profile')}
                  </p>
                  <div className="mt-3 space-y-1.5">
                    {stats.map((stat) => (
                      <div
                        key={stat.label}
                        className="flex items-center justify-between gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-2 text-white"
                      >
                        <p className="truncate text-[10px] font-semibold uppercase tracking-[0.06em] text-white/80">{stat.label}</p>
                        <p className="shrink-0 text-sm font-semibold">{stat.value}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Nav */}
            <nav className={`glass-panel section-chroma ${sidebarCollapsed ? 'p-2' : 'p-2.5'}`}>
              {!sidebarCollapsed && (
                <p className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#4c7fe2]">Services</p>
              )}
              <div className="space-y-1">
                {availableServiceSections.map((section) => {
                  const active = activeService === section.key
                  return sidebarCollapsed ? (
                    <button
                      key={section.key}
                      type="button"
                      onClick={() => selectService(section.key)}
                      title={section.title}
                      className={`flex h-10 w-10 mx-auto items-center justify-center rounded-xl transition ${
                        active
                          ? 'bg-[#2d7da8] text-white shadow-md'
                          : 'bg-white/60 text-slate-500 hover:bg-white hover:text-slate-700'
                      }`}
                    >
                      <section.Icon className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      key={section.key}
                      type="button"
                      onClick={() => selectService(section.key)}
                      className={`flex w-full items-center gap-2.5 rounded-xl border px-2.5 py-2 text-left transition ${
                        active
                          ? 'border-white/80 bg-white/78 shadow-sm'
                          : 'border-transparent bg-white/40 hover:bg-white/60'
                      }`}
                    >
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                        active ? 'bg-[#2d7da8] text-white shadow-sm' : 'bg-white/80 text-slate-500'
                      }`}>
                        <section.Icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-semibold text-[#20304f]">{section.title}</span>
                        <span className="block truncate text-[10px] text-slate-400">{section.description}</span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </nav>

            {!isReceptionist && !sidebarCollapsed && renderAppointmentsPanel('block')}
          </aside>

          <div className="space-y-3">
            <div className="flex gap-1.5 overflow-x-auto pb-1 xl:hidden">
              {availableServiceSections.map((section) => {
                const active = activeService === section.key
                return (
                  <button
                    key={section.key}
                    type="button"
                    onClick={() => selectService(section.key)}
                    className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-medium transition ${
                      active
                        ? 'border-white/70 bg-white/70 text-cyan-800'
                        : 'border-white/60 bg-white/40 text-slate-500'
                    }`}
                  >
                    <section.Icon className="h-3 w-3" />
                    {section.shortTitle}
                  </button>
                )
              })}
            </div>

            {activeService === 'profile' && (
              <section className="glass-panel-strong section-chroma p-3 sm:p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div>
                    <p className="glass-kicker text-[10px]">Doctor Profile</p>
                    <h2 className="glass-heading text-base font-semibold">Clinic identity & printed details</h2>
                    {doctor?.id && (
                      <p className="mt-1.5 inline-flex items-center rounded-full border border-cyan-200/80 bg-white/70 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-cyan-900">
                        Doctor ID: {doctor.id}
                      </p>
                    )}
                  </div>
                </div>

                <form onSubmit={saveProfile} className="mt-5 grid grid-cols-1 gap-5 2xl:grid-cols-[minmax(0,1.1fr),320px]">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <input
                      className="glass-input md:col-span-2"
                      value={doctor?.id ? `Doctor ID: ${doctor.id}` : 'Doctor ID will appear here'}
                      readOnly
                    />
                    <input
                      className="glass-input"
                      placeholder="Name"
                      value={doctorForm.name}
                      onChange={(e) => setDoctorForm((p) => ({ ...p, name: e.target.value }))}
                    />
                    <input
                      className="glass-input"
                      placeholder="Phone"
                      value={doctorForm.phone}
                      onChange={(e) => setDoctorForm((p) => ({ ...p, phone: e.target.value }))}
                    />
                    <input
                      className="glass-input"
                      placeholder="Clinic Name"
                      value={doctorForm.clinicName}
                      onChange={(e) => setDoctorForm((p) => ({ ...p, clinicName: e.target.value }))}
                    />
                    <input
                      className="glass-input"
                      placeholder="Specialization"
                      value={doctorForm.specialization}
                      onChange={(e) => setDoctorForm((p) => ({ ...p, specialization: e.target.value }))}
                    />
                    <input
                      className="glass-input md:col-span-2"
                      placeholder="Locality / Address"
                      value={doctorForm.locality}
                      onChange={(e) => setDoctorForm((p) => ({ ...p, locality: e.target.value }))}
                    />
                    <input
                      className="glass-input"
                      placeholder="Education (MBBS/MD/BAMS...)"
                      value={doctorForm.education}
                      onChange={(e) => setDoctorForm((p) => ({ ...p, education: e.target.value }))}
                    />
                    <input
                      type="number"
                      className="glass-input"
                      placeholder="Experience (years)"
                      value={doctorForm.experience}
                      onChange={(e) => setDoctorForm((p) => ({ ...p, experience: e.target.value }))}
                    />
                  </div>

                  <div className="glass-well section-chroma-soft space-y-4 p-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Logo</label>
                      <input
                        className="glass-input"
                        placeholder="Logo URL"
                        value={doctorForm.logoUrl}
                        onChange={(e) => setDoctorForm((p) => ({ ...p, logoUrl: e.target.value }))}
                      />
                      <input
                        type="file"
                        accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                        className="glass-input border-dashed"
                        onChange={(e) => uploadAsset('logo', e.target.files?.[0])}
                      />
                      {doctorForm.logoUrl && (
                        <img
                          src={doctorForm.logoUrl}
                          alt="Logo preview"
                          className="h-20 w-full rounded-[22px] border border-white/60 bg-white/75 object-contain"
                        />
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Signature</label>
                      <input
                        className="glass-input"
                        placeholder="Signature URL"
                        value={doctorForm.signatureUrl}
                        onChange={(e) => setDoctorForm((p) => ({ ...p, signatureUrl: e.target.value }))}
                      />
                      <input
                        type="file"
                        accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                        className="glass-input border-dashed"
                        onChange={(e) => uploadAsset('signature', e.target.files?.[0])}
                      />
                      {doctorForm.signatureUrl && (
                        <img
                          src={doctorForm.signatureUrl}
                          alt="Signature preview"
                          className="h-20 w-full rounded-[22px] border border-white/60 bg-white/75 object-contain"
                        />
                      )}
                    </div>
                  </div>

                  <div className="2xl:col-span-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
                    {profileMessage ? <p className="text-sm text-emerald-700">{profileMessage}</p> : <span />}
                    <button className="button-glass px-5 py-3">
                      Save Profile
                    </button>
                  </div>
                </form>
              </section>
            )}

            {activeService === 'patients' && (
              <section className="glass-panel-strong section-chroma p-3 sm:p-4 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="glass-kicker text-[10px]">Patient Desk</p>
                    <h2 className="glass-heading text-base font-semibold">Patients</h2>
                  </div>
                  <p className="glass-pill text-[10px] text-slate-600">
                    {patients.length} record(s)
                  </p>
                </div>

                <form onSubmit={createPatient} className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <input
                    required
                    className="glass-input"
                    placeholder="Name"
                    value={newPatient.name}
                    onChange={(e) => setNewPatient((p) => ({ ...p, name: e.target.value }))}
                  />
                  <input
                    required
                    type="number"
                    className="glass-input"
                    placeholder="Age"
                    value={newPatient.age}
                    onChange={(e) => setNewPatient((p) => ({ ...p, age: e.target.value }))}
                  />
                  <select
                    className="glass-input"
                    value={newPatient.gender}
                    onChange={(e) => setNewPatient((p) => ({ ...p, gender: e.target.value }))}
                  >
                    <option value="MALE">MALE</option>
                    <option value="FEMALE">FEMALE</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                  <input
                    required
                    className="glass-input"
                    placeholder="Mobile"
                    value={newPatient.mobile}
                    onChange={(e) => setNewPatient((p) => ({ ...p, mobile: e.target.value }))}
                  />
                  <label className="date-input-shell relative md:col-span-2 xl:col-span-1">
                    {!newPatient.appointmentDate && !newPatientAppointmentFocused && (
                      <span className="date-input-overlay pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-sm text-slate-400">
                        Appointment Date
                      </span>
                    )}
                    <input
                      ref={newPatientAppointmentInputRef}
                      type="date"
                      className={`glass-input w-full pr-12 ${!newPatient.appointmentDate ? 'date-input-empty' : ''}`}
                      aria-label="Appointment Date"
                      value={newPatient.appointmentDate}
                      onFocus={() => setNewPatientAppointmentFocused(true)}
                      onBlur={() => setNewPatientAppointmentFocused(false)}
                      onChange={(e) => setNewPatient((p) => ({ ...p, appointmentDate: e.target.value }))}
                    />
                    <button
                      type="button"
                      aria-label="Open appointment date calendar"
                      onClick={() => openDatePicker(newPatientAppointmentInputRef)}
                      className="absolute right-3 top-1/2 z-10 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/70 text-[#3A7BD5] shadow-[0_8px_20px_rgba(58,123,213,0.14)] transition hover:bg-white"
                    >
                      <CalendarDays className="h-4 w-4" />
                    </button>
                  </label>
                  <label className="date-input-shell relative md:col-span-2 xl:col-span-1">
                    <input
                      ref={newPatientAppointmentTimeInputRef}
                      type={newPatientAppointmentTimeFocused || newPatient.appointmentTime ? 'time' : 'text'}
                      className="glass-input w-full pr-14"
                      aria-label="Appointment Time"
                      placeholder="Appointment Time"
                      value={newPatient.appointmentTime}
                      onFocus={() => setNewPatientAppointmentTimeFocused(true)}
                      onBlur={() => setNewPatientAppointmentTimeFocused(false)}
                      onChange={(e) => setNewPatient((p) => ({ ...p, appointmentTime: e.target.value }))}
                    />
                    <button
                      type="button"
                      aria-label="Open appointment time picker"
                      onClick={() => openTimePicker(newPatientAppointmentTimeInputRef)}
                      className="absolute right-3 top-1/2 z-10 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/70 text-[#3A7BD5] shadow-[0_8px_20px_rgba(58,123,213,0.14)] transition hover:bg-white"
                    >
                      <Clock3 className="h-4 w-4" />
                    </button>
                  </label>
                  <select
                    className="glass-input"
                    value={newPatient.appointmentStatus}
                    onChange={(e) => setNewPatient((p) => ({ ...p, appointmentStatus: e.target.value }))}
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
                    className="glass-input"
                    placeholder="Appointment Reminder (mins)"
                    value={newPatient.appointmentReminderMinutes}
                    onChange={(e) => setNewPatient((p) => ({ ...p, appointmentReminderMinutes: e.target.value }))}
                  />
                  <input
                    type="number"
                    className="glass-input"
                    placeholder="Height (cm) optional"
                    value={newPatient.height}
                    onChange={(e) => setNewPatient((p) => ({ ...p, height: e.target.value }))}
                  />
                  <input
                    type="number"
                    className="glass-input"
                    placeholder="Weight (kg) optional"
                    value={newPatient.weight}
                    onChange={(e) => setNewPatient((p) => ({ ...p, weight: e.target.value }))}
                  />
                  <div className="flex items-end">
                    <button className="button-glass w-full">
                      Create
                    </button>
                  </div>
                </form>

                <div className="glass-well section-chroma-soft max-h-[34rem] overflow-y-auto p-3">
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    {(patients || []).map((patient) => (
                      <article
                        key={patient.id}
                        className={`patient-card group ${
                          selectedPatientId === patient.id
                            ? 'patient-card-selected'
                            : ''
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            if (isReceptionist) {
                              setSelectedPatientId(patient.id)
                              return
                            }
                            navigate(`/patients/${patient.id}`)
                          }}
                          className="w-full text-left"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="patient-avatar flex h-10 w-10 shrink-0 items-center justify-center rounded-[18px] text-[11px] font-semibold tracking-wide text-white">
                              {patientInitials(patient.name)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <p className="truncate text-[13px] font-semibold text-[#1D2D50]">{patient.name}</p>
                                <span className="patient-id-badge shrink-0">
                                  #{resolvePatientNumber(patient)}
                                </span>
                              </div>
                              <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
                                <UserRound className="h-3.5 w-3.5" />
                                {patient.gender} • {patient.age}y
                              </div>
                            </div>
                          </div>
                          <div className="patient-meta mt-3 grid grid-cols-[1fr,auto] items-center gap-2 rounded-[20px] px-3 py-2.5">
                            <div className="min-w-0">
                              <div className="flex items-center gap-1 text-[10px] uppercase tracking-[0.08em] text-slate-400">
                                <Clock3 className="h-3.5 w-3.5 text-[#3A7BD5]" />
                                Last visit
                              </div>
                              <p className="mt-1 truncate text-[13px] font-semibold text-[#1D2D50]">
                                {selectedPatientId === patient.id ? formatDisplayDate(prescriptionHistory[0]?.visitDate) : 'Pending'}
                              </p>
                            </div>
                            {patient.appointmentDate && (
                              <div className="text-right">
                                <p className="text-[10px] uppercase tracking-[0.08em] text-cyan-700">Appointment</p>
                                <p className="text-[11px] font-semibold text-[#24539a]">
                                  {formatAppointmentLabel(patient.appointmentDate, patient.appointmentTime)}
                                </p>
                              </div>
                            )}
                          </div>
                        </button>

                        <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100/80 pt-2.5">
                          {!isReceptionist && (
                            <button
                              type="button"
                              onClick={() => navigate(`/patients/${patient.id}`)}
                              className="button-action-light patient-card-button"
                            >
                              Open
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              if (isReceptionist) {
                                setSelectedPatientId(patient.id)
                                return
                              }
                              openPrescriptionForPatient(patient.id)
                            }}
                            className="button-action-strong patient-card-button min-h-10 rounded-full px-3 py-1 text-[11px] font-medium transition"
                          >
                            {selectedPatientId === patient.id ? 'Selected' : isReceptionist ? 'View' : 'Use'}
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                  {patients.length === 0 && (
                    <p className="px-3 py-6 text-center text-sm text-slate-500">No patients found.</p>
                  )}
                </div>

                {selectedPatient && (
                  <div className="glass-well section-chroma-soft p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">
                          <ActivitySquare className="h-3.5 w-3.5" />
                          Selected Patient
                        </p>
                        <p className="text-sm font-medium">{selectedPatient.name}</p>
                      </div>
                      {!isReceptionist && (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => selectService('prescriptions')}
                            className="button-glass-secondary min-h-0 px-3 py-1 text-xs"
                          >
                            Write Prescription
                          </button>
                          <button
                            type="button"
                            onClick={() => navigate(`/patients/${selectedPatient.id}`)}
                            className="button-glass-secondary min-h-0 px-3 py-1 text-xs"
                          >
                            Open Profile
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-600">
                      ID: {resolvePatientNumber(selectedPatient)} | Age: {selectedPatient.age} | Gender: {selectedPatient.gender} |
                      Mobile: {selectedPatient.mobile}
                    </p>
                    {(selectedPatient.height || selectedPatient.weight) && (
                      <p className="mt-1 text-xs text-slate-600">
                        {selectedPatient.height ? `Height: ${selectedPatient.height} cm` : null}
                        {selectedPatient.height && selectedPatient.weight ? ' | ' : ''}
                        {selectedPatient.weight ? `Weight: ${selectedPatient.weight} kg` : null}
                      </p>
                    )}
                    {selectedPatient.appointmentDate && (
                      <p className="mt-1 text-xs text-slate-600">
                        Appointment: {formatAppointmentLabel(selectedPatient.appointmentDate, selectedPatient.appointmentTime)}
                      </p>
                    )}
                    {(selectedPatient.appointmentStatus || selectedPatient.appointmentReminderMinutes != null) && (
                      <p className="mt-1 text-xs text-slate-600">
                        Status: {selectedPatient.appointmentStatus || 'BOOKED'}
                        {selectedPatient.appointmentReminderMinutes != null
                          ? ` | Reminder: ${selectedPatient.appointmentReminderMinutes} min before`
                          : ''}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-slate-600">
                      Previous Prescriptions: {prescriptionHistory.length}
                    </p>
                    {selectedPatient.appointmentDate && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {!isReceptionist && (
                          <button
                            type="button"
                            onClick={() => connectAndSyncGoogleCalendar(selectedPatient)}
                            className="button-glass-secondary min-h-0 px-3 py-1 text-xs"
                          >
                            Google Calendar
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => downloadCalendarInvite(selectedPatient.id)}
                          className="button-glass-secondary min-h-0 px-3 py-1 text-xs"
                        >
                          iPhone Calendar (.ics)
                        </button>
                      </div>
                    )}
                    <div className="mt-2 max-h-36 overflow-y-auto space-y-1 text-xs">
                      {prescriptionHistory.map((p) => (
                        <div key={p.id} className="glass-well rounded-xl px-2 py-1.5">
                          {p.visitDate}: {p.diagnosis}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            {activeService === 'appointments' && !isReceptionist && (
              <section className="glass-panel-strong section-chroma p-3 sm:p-4">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div>
                    <p className="glass-kicker text-[10px]">Appointment Desk</p>
                    <h2 className="glass-heading text-base font-semibold">Calendar & reminders</h2>
                  </div>
                </div>
                {renderAppointmentsPanel()}
              </section>
            )}

            {activeService === 'prescriptions' && (
              <section className="glass-panel-strong section-chroma p-3 sm:p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div>
                    <p className="glass-kicker text-[10px]">Prescription Studio</p>
                    <h2 className="glass-heading text-base font-semibold">Build & export prescription</h2>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {selectedPatient ? (
                      <span className="glass-pill text-cyan-800">
                        Patient: {selectedPatient.name} #{resolvePatientNumber(selectedPatient)}
                      </span>
                    ) : (
                      <span className="glass-pill text-amber-700">
                        No patient selected
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => selectService('patients')}
                      className="button-glass-secondary min-h-0 px-3 py-1 text-xs"
                    >
                      Open Patients
                    </button>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="flex flex-wrap gap-3 text-sm">
                    <label className="glass-pill gap-2 rounded-full px-3 py-2">
                      <input
                        type="radio"
                        checked={prescriptionMode === 'PATIENT'}
                        onChange={() => setPrescriptionMode('PATIENT')}
                      />
                      Patient-Based
                    </label>
                    <label className="glass-pill gap-2 rounded-full px-3 py-2">
                      <input
                        type="radio"
                        checked={prescriptionMode === 'QUICK'}
                        onChange={() => setPrescriptionMode('QUICK')}
                      />
                      Quick Prescription
                    </label>
                  </div>

                  <form onSubmit={submitPrescription} className="mt-4 space-y-4">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                      <input
                        className="glass-input"
                        placeholder="Diagnosis"
                        value={diagnosis}
                        onChange={(e) => setDiagnosis(e.target.value)}
                      />
                      <input
                        className="glass-input"
                        placeholder="BP"
                        value={bp}
                        onChange={(e) => setBp(e.target.value)}
                      />
                      <input
                        className="glass-input"
                        placeholder="Sugar"
                        value={sugar}
                        onChange={(e) => setSugar(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-2 lg:grid-cols-[minmax(0,1fr),minmax(240px,320px)]">
                      <label className="glass-well flex items-center justify-between gap-3 px-4 py-3 text-sm text-slate-700">
                        <div>
                          <p className="font-medium text-slate-900">Clinical Notes</p>
                          <p className="text-xs text-slate-500">Keep the prescription compact unless you want to add notes.</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={showClinicalNotes}
                          onChange={(e) => setShowClinicalNotes(e.target.checked)}
                        />
                      </label>
                      <label className="glass-well flex flex-col justify-center px-4 py-3 shadow-sm">
                        <span className="text-xs font-medium text-slate-600">Follow up date</span>
                        <input
                          type="date"
                          className="glass-input mt-1 px-3 py-2"
                          aria-label="Follow up date"
                          title="Follow up date"
                          value={followUpDate}
                          onChange={(e) => setFollowUpDate(e.target.value)}
                        />
                      </label>
                    </div>

                    <div className="glass-well section-chroma-soft p-4">
                      {showClinicalNotes ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                            <textarea
                              className="glass-textarea px-3 py-2"
                              placeholder="Complaints"
                              rows={3}
                              value={complaints}
                              onChange={(e) => setComplaints(e.target.value)}
                            />
                            <textarea
                              className="glass-textarea px-3 py-2"
                              placeholder="Examination"
                              rows={3}
                              value={examination}
                              onChange={(e) => setExamination(e.target.value)}
                            />
                            <textarea
                              className="glass-textarea md:col-span-2 px-3 py-2"
                              placeholder="Investigation Advice"
                              rows={3}
                              value={investigationAdvice}
                              onChange={(e) => setInvestigationAdvice(e.target.value)}
                            />
                            <textarea
                              className="glass-textarea md:col-span-2 px-3 py-2"
                              placeholder="Treatment"
                              rows={3}
                              value={treatment}
                              onChange={(e) => setTreatment(e.target.value)}
                            />
                            <input
                              className="glass-input px-3 py-2"
                              placeholder="Advice"
                              value={advice}
                              onChange={(e) => setAdvice(e.target.value)}
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">X-Ray Upload</label>
                            <input
                              type="file"
                              accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                              className="glass-input"
                              onChange={(e) => uploadXray(e.target.files?.[0])}
                            />
                            {xrayUploading && <p className="text-xs text-slate-500">Uploading x-ray...</p>}
                            {xrayImageUrl && (
                              <div className="space-y-2">
                                <img
                                  src={xrayImageUrl}
                                  alt="X-ray preview"
                                  className="max-h-48 rounded-[22px] border border-white/60 bg-white/75 object-contain"
                                />
                                <p className="break-all text-xs text-slate-500">{xrayImageUrl}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <div className="glass-well section-chroma-soft p-4 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                        <div className="flex items-center gap-2">
                          <Pill className="h-4 w-4 text-cyan-700" />
                          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">Medicine Builder</span>
                        </div>
                        <div>
                          <select
                            className="glass-input text-xs py-1 px-2"
                            value={selectedMedicineType}
                            onChange={(e) => handleMedicineTypeChange(e.target.value)}
                          >
                            <option value="TABLET">Tablet</option>
                            <option value="SYRUP">Syrup</option>
                            <option value="INJECTION">Injection</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                        <AutocompleteInput
                          value={
                            selectedMedicineType === 'SYRUP'
                              ? medicineDraft.brand
                                ? `${medicineDraft.brand} — ${medicineDraft.syrupName || ''}`.trim()
                                : medicineDraft.syrupName
                              : medicineDraft.brand
                                ? `${medicineDraft.brand} — ${medicineDraft.medicineName || ''}`.trim()
                                : medicineDraft.medicineName
                          }
                          placeholder={`Search ${selectedMedicineType.toLowerCase()} (brand or name)`}
                          suggestions={suggestions[combinedSuggestionKey] || []}
                          onChange={(value) => {
                            // Split value into brand and name if possible
                            const [brand, ...rest] = value.split('—').map((v) => v.trim())
                            if (selectedMedicineType === 'SYRUP') {
                              updateMedicineDraft('brand', brand)
                              updateMedicineDraft('syrupName', rest.join('—'))
                            } else {
                              updateMedicineDraft('brand', brand)
                              updateMedicineDraft('medicineName', rest.join('—'))
                            }
                            fetchMedicineSuggestions(selectedMedicineType, combinedSuggestionKey, value, 'combined')
                          }}
                          onSelect={(value) => {
                            const [brand, ...rest] = value.split('—').map((v) => v.trim())
                            if (selectedMedicineType === 'SYRUP') {
                              updateMedicineDraft('brand', brand)
                              updateMedicineDraft('syrupName', rest.join('—'))
                            } else {
                              updateMedicineDraft('brand', brand)
                              updateMedicineDraft('medicineName', rest.join('—'))
                            }
                            setSuggestions((prev) => ({ ...prev, [combinedSuggestionKey]: [] }))
                          }}
                        />
                      </div>
                      {selectedMedicineType === 'TABLET' && (
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <label className="inline-flex items-center gap-1">
                              <input
                                type="checkbox"
                                checked={Boolean(medicineDraft.morning)}
                                onChange={(e) => updateMedicineDraft('morning', e.target.checked)}
                              />
                              <Sun className="h-3 w-3 text-yellow-500" /> Morning
                            </label>
                            <label className="inline-flex items-center gap-1">
                              <input
                                type="checkbox"
                                checked={Boolean(medicineDraft.afternoon)}
                                onChange={(e) => updateMedicineDraft('afternoon', e.target.checked)}
                              />
                              <CloudSun className="h-3 w-3 text-orange-400" /> Afternoon
                            </label>
                            <label className="inline-flex items-center gap-1">
                              <input
                                type="checkbox"
                                checked={Boolean(medicineDraft.night)}
                                onChange={(e) => updateMedicineDraft('night', e.target.checked)}
                              />
                              <Moon className="h-3 w-3 text-indigo-500" /> Night
                            </label>
                            <label className="inline-flex items-center gap-1">
                              <input
                                type="checkbox"
                                checked={Boolean(medicineDraft.withWater)}
                                onChange={(e) => updateMedicineDraft('withWater', e.target.checked)}
                              />
                              <GlassWater className="h-3 w-3 text-cyan-600" /> Water
                            </label>
                            <label className="inline-flex items-center gap-1">
                              <input
                                type="checkbox"
                                checked={Boolean(medicineDraft.chew)}
                                onChange={(e) => updateMedicineDraft('chew', e.target.checked)}
                              />
                              <Cookie className="h-3 w-3 text-amber-600" /> Chew
                            </label>
                          </div>
                          <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                            <select
                              className="glass-input px-2 py-1 text-xs"
                              value={medicineDraft.scheduleType || 'DAILY'}
                              onChange={(e) => updateMedicineDraft('scheduleType', e.target.value)}
                            >
                              <option value="DAILY">Daily</option>
                              <option value="WEEKLY">Weekly</option>
                            </select>
                            <input
                              type="number"
                              className="glass-input px-2 py-1 text-xs"
                              value={medicineDraft.duration ?? ''}
                              onChange={(e) =>
                                updateMedicineDraft('duration', e.target.value === '' ? '' : Number(e.target.value))
                              }
                              placeholder={medicineDraft.scheduleType === 'WEEKLY' ? 'Duration (weeks)' : 'Duration (days)'}
                            />
                            <input
                              type="number"
                              className="glass-input px-2 py-1 text-xs"
                              value={medicineDraft.quantity ?? ''}
                              onChange={(e) =>
                                updateMedicineDraft('quantity', e.target.value === '' ? '' : Number(e.target.value))
                              }
                              placeholder="Quantity"
                            />
                          </div>
                          {medicineDraft.scheduleType === 'WEEKLY' && (
                            <WeekdaySelector selectedDays={medicineDraft.weeklyDays} onToggle={toggleWeeklyDay} />
                          )}
                          <div className="flex flex-wrap gap-2 mt-2">
                            <button
                              type="button"
                              className={`glass-pill flex items-center gap-1 px-3 py-1 text-xs font-medium ${
                                medicineDraft.instruction === 'AFTER_FOOD' ? 'bg-cyan-700 text-white' : 'bg-white text-cyan-700 border border-cyan-200'
                              }`}
                              onClick={() => handleFoodInstructionSelect('AFTER_FOOD')}
                            >
                              <Cookie className="h-3 w-3" /> After Food
                            </button>
                            <button
                              type="button"
                              className={`glass-pill flex items-center gap-1 px-3 py-1 text-xs font-medium ${
                                medicineDraft.instruction === 'BEFORE_FOOD' ? 'bg-cyan-700 text-white' : 'bg-white text-cyan-700 border border-cyan-200'
                              }`}
                              onClick={() => handleFoodInstructionSelect('BEFORE_FOOD')}
                            >
                              <Timer className="h-3 w-3" /> Before Food
                            </button>
                            <button
                              type="button"
                              className={`glass-pill flex items-center gap-1 px-3 py-1 text-xs font-medium ${
                                medicineDraft.instruction === 'EMPTY_STOMACH' ? 'bg-cyan-700 text-white' : 'bg-white text-cyan-700 border border-cyan-200'
                              }`}
                              onClick={() => handleFoodInstructionSelect('EMPTY_STOMACH')}
                            >
                              <Hash className="h-3 w-3" /> Empty Stomach
                            </button>
                          </div>
                        </div>
                      )}
                      {selectedMedicineType === 'SYRUP' && (
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <label className="inline-flex items-center gap-1">
                              <input
                                type="checkbox"
                                checked={Boolean(medicineDraft.morning)}
                                onChange={(e) => updateMedicineDraft('morning', e.target.checked)}
                              />
                              <Sun className="h-3 w-3 text-yellow-500" /> Morning
                            </label>
                            <label className="inline-flex items-center gap-1">
                              <input
                                type="checkbox"
                                checked={Boolean(medicineDraft.afternoon)}
                                onChange={(e) => updateMedicineDraft('afternoon', e.target.checked)}
                              />
                              <CloudSun className="h-3 w-3 text-orange-400" /> Afternoon
                            </label>
                            <label className="inline-flex items-center gap-1">
                              <input
                                type="checkbox"
                                checked={Boolean(medicineDraft.night)}
                                onChange={(e) => updateMedicineDraft('night', e.target.checked)}
                              />
                              <Moon className="h-3 w-3 text-indigo-500" /> Night
                            </label>
                          </div>
                          <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                            <select
                              className="glass-input px-2 py-1 text-xs"
                              value={medicineDraft.scheduleType || 'DAILY'}
                              onChange={(e) => updateMedicineDraft('scheduleType', e.target.value)}
                            >
                              <option value="DAILY">Daily</option>
                              <option value="WEEKLY">Weekly</option>
                            </select>
                            <input
                              type="number"
                              className="glass-input px-2 py-1 text-xs"
                              value={medicineDraft.duration ?? ''}
                              onChange={(e) =>
                                updateMedicineDraft('duration', e.target.value === '' ? '' : Number(e.target.value))
                              }
                              placeholder={medicineDraft.scheduleType === 'WEEKLY' ? 'Duration (weeks)' : 'Duration (days)'}
                            />
                            <input
                              type="number"
                              className="glass-input px-2 py-1 text-xs"
                              value={medicineDraft.quantity ?? ''}
                              onChange={(e) =>
                                updateMedicineDraft('quantity', e.target.value === '' ? '' : Number(e.target.value))
                              }
                              placeholder="Quantity (ml)"
                            />
                          </div>
                          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                            <select
                              className="glass-input px-2 py-1 text-xs"
                              value={medicineDraft.intakeType || 'TEASPOON'}
                              onChange={(e) => updateMedicineDraft('intakeType', e.target.value)}
                            >
                              <option value="TEASPOON">Teaspoon</option>
                              <option value="QUANTITY_PER_INTAKE">Quantity (per intake)</option>
                            </select>
                            <input
                              type="number"
                              min="1"
                              className="glass-input px-2 py-1 text-xs"
                              value={medicineDraft.intakeValue ?? ''}
                              onChange={(e) => updateMedicineDraft('intakeValue', e.target.value)}
                              placeholder={
                                medicineDraft.intakeType === 'QUANTITY_PER_INTAKE'
                                  ? 'Quantity per intake (ml)'
                                  : 'Teaspoon count'
                              }
                            />
                          </div>
                          {medicineDraft.scheduleType === 'WEEKLY' && (
                            <WeekdaySelector selectedDays={medicineDraft.weeklyDays} onToggle={toggleWeeklyDay} />
                          )}
                          <div className="flex flex-wrap gap-2 mt-2">
                            <button
                              type="button"
                              className={`glass-pill flex items-center gap-1 px-3 py-1 text-xs font-medium ${
                                medicineDraft.instruction === 'AFTER_FOOD' ? 'bg-cyan-700 text-white' : 'bg-white text-cyan-700 border border-cyan-200'
                              }`}
                              onClick={() => handleFoodInstructionSelect('AFTER_FOOD')}
                            >
                              <Cookie className="h-3 w-3" /> After Food
                            </button>
                            <button
                              type="button"
                              className={`glass-pill flex items-center gap-1 px-3 py-1 text-xs font-medium ${
                                medicineDraft.instruction === 'BEFORE_FOOD' ? 'bg-cyan-700 text-white' : 'bg-white text-cyan-700 border border-cyan-200'
                              }`}
                              onClick={() => handleFoodInstructionSelect('BEFORE_FOOD')}
                            >
                              <Timer className="h-3 w-3" /> Before Food
                            </button>
                            <button
                              type="button"
                              className={`glass-pill flex items-center gap-1 px-3 py-1 text-xs font-medium ${
                                medicineDraft.instruction === 'EMPTY_STOMACH' ? 'bg-cyan-700 text-white' : 'bg-white text-cyan-700 border border-cyan-200'
                              }`}
                              onClick={() => handleFoodInstructionSelect('EMPTY_STOMACH')}
                            >
                              <Hash className="h-3 w-3" /> Empty Stomach
                            </button>
                          </div>
                        </div>
                      )}
                      {selectedMedicineType === 'INJECTION' && (
                        <div className="space-y-2">
                          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                            <label className="flex flex-col gap-1 text-xs text-slate-700">
                              <span className="font-medium">Schedule</span>
                              <select
                                className="glass-input px-2 py-1 text-xs"
                                value={medicineDraft.scheduleType || 'DAILY'}
                                onChange={(e) => handleInjectionScheduleAndAdd(e.target.value)}
                              >
                                <option value="DAILY">Daily</option>
                                <option value="WEEKLY">Weekly</option>
                              </select>
                            </label>
                          </div>
                          {medicineDraft.scheduleType === 'WEEKLY' && (
                            <WeekdaySelector selectedDays={medicineDraft.weeklyDays} onToggle={toggleWeeklyDay} />
                          )}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
                      <MedicineList
                        title="Tablets"
                        items={tablets}
                        type="TABLET"
                        onRemove={(index) => removeMedicine('TABLET', index)}
                      />
                      <MedicineList
                        title="Syrups"
                        items={syrups}
                        type="SYRUP"
                        onRemove={(index) => removeMedicine('SYRUP', index)}
                      />
                      <MedicineList
                        title="Injections"
                        items={injections}
                        type="INJECTION"
                        onRemove={(index) => removeMedicine('INJECTION', index)}
                      />
                    </div>

                    <div className="glass-well section-chroma-soft p-4">
                      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(240px,300px),1fr] lg:items-end">
                        <label className="flex flex-col gap-1">
                          <span className="text-xs font-medium text-slate-600">Consultation Fee</span>
                          <input
                            type="number"
                            className="glass-input"
                            placeholder="Consultation Fee"
                            value={consultationFee}
                            onChange={(e) => setConsultationFee(e.target.value)}
                          />
                        </label>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                          <label className="glass-well flex items-center justify-between gap-3 px-4 py-3 text-sm text-slate-700 sm:min-w-[280px]">
                            <div>
                              <p className="font-medium text-slate-900">Show Doctor Details</p>
                              <p className="text-xs text-slate-500">
                                Print logo, doctor, clinic, address, phone, and email in the PDF header.
                              </p>
                            </div>
                            <input
                              type="checkbox"
                              checked={showDoctorDetails}
                              onChange={(e) => setShowDoctorDetails(e.target.checked)}
                            />
                          </label>
                          <button className="button-glass px-4 py-3">
                            Save Prescription & Download PDF
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </section>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}

function MedicineList({ title, items, type, onRemove }) {
  return (
    <div className="glass-well space-y-2 p-3">
      <h3 className="text-sm font-medium text-slate-900">{title}</h3>
      {items.length === 0 && <p className="text-xs text-slate-500">No medicines added.</p>}
      {items.map((item, index) => (
        <div key={`${title}-${index}`} className="glass-well rounded-xl p-3 space-y-2">
          <p className="text-sm text-slate-700">{summarizeMedicine(type, item)}</p>
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="button-glass-danger min-h-0 rounded-lg px-2 py-1 text-xs"
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  )
}

function WeekdaySelector({ selectedDays, onToggle }) {
  return (
    <div className="glass-well rounded-xl p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-800">Weekly Days</p>
        <p className="text-[11px] text-slate-500">Choose the exact days to store and print in the PDF.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {weekDayOptions.map((day) => {
          const selected = selectedDays.includes(day)
          return (
            <button
              key={day}
              type="button"
              onClick={() => onToggle(day)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                selected
                  ? 'border-[#1173dd] bg-[#1173dd] text-white shadow-sm'
                  : 'border-white/70 bg-white/72 text-slate-700 hover:border-cyan-300 hover:text-cyan-800'
              }`}
            >
              {formatWeeklyDay(day)}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function AutocompleteInput({ value, onChange, onSelect, suggestions, placeholder }) {
  const [isOpen, setIsOpen] = useState(false)
  const normalizedValue = (value || '').trim().toLowerCase()
  const filteredSuggestions = (suggestions || []).filter(
    (item) => item && item.toLowerCase() !== normalizedValue
  )

  return (
    <div className="relative">
      <input
        className="glass-input px-3 py-2"
        value={value}
        placeholder={placeholder}
        onChange={(e) => {
          onChange(e.target.value)
          setIsOpen(true)
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 120)}
      />
      {isOpen && filteredSuggestions.length > 0 && (
        <div className="glass-panel absolute z-20 mt-1 max-h-40 w-full overflow-y-auto rounded-[22px] p-1">
          {filteredSuggestions.map((item) => (
            <button
              key={`${placeholder}-${item}`}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onSelect(item)
                setIsOpen(false)
              }}
              className="w-full rounded-2xl border-b border-white/40 px-2 py-2 text-left text-xs hover:bg-white/60 last:border-b-0"
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default Dashboard
