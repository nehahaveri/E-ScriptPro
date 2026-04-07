import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
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

function Dashboard() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
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

  const [newPatient, setNewPatient] = useState({
    name: '',
    age: '',
    gender: 'MALE',
    mobile: '',
    address: '',
    height: '',
    weight: '',
  })

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

  const loadInitialData = async () => {
    setLoading(true)
    setError('')
    try {
      const [doctorRes, patientsRes] = await Promise.all([
        api.get('/doctors/me'),
        api.get('/patients'),
      ])
      setDoctor(doctorRes.data)
      setDoctorForm({
        name: doctorRes.data?.name || '',
        phone: doctorRes.data?.phone || '',
        clinicName: doctorRes.data?.clinicName || '',
        locality: doctorRes.data?.locality || '',
        specialization: doctorRes.data?.specialization || '',
        education: doctorRes.data?.education || '',
        experience:
          doctorRes.data?.experience !== null && doctorRes.data?.experience !== undefined
            ? String(doctorRes.data.experience)
            : '',
        logoUrl: doctorRes.data?.logoUrl || '',
        signatureUrl: doctorRes.data?.signatureUrl || '',
      })
      setPatients(patientsRes.data || [])
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
        address: newPatient.address.trim(),
        height: newPatient.height === '' ? null : Number(newPatient.height),
        weight: newPatient.weight === '' ? null : Number(newPatient.weight),
      }
      const response = await api.post('/patients', payload)
      setPatients((prev) => [response.data, ...prev])
      setNewPatient({ name: '', age: '', gender: 'MALE', mobile: '', address: '', height: '', weight: '' })
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
    window.location.href = '/'
  }

  if (loading) {
    return <main className="min-h-screen bg-slate-100 p-6">Loading dashboard...</main>
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.14),_transparent_28%),linear-gradient(180deg,_#f8fafc_0%,_#e2e8f0_100%)] p-4 md:p-6">
      <section className="max-w-7xl mx-auto space-y-5">
        <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/70 bg-white/85 px-5 py-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700">E-ScriptPro</p>
            <h1 className="text-2xl font-semibold text-slate-900">Doctor Workspace</h1>
          </div>
          <button
            type="button"
            onClick={logout}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
          >
            Logout
          </button>
        </header>

        {error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 border border-red-200">
            {error}
          </p>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-1 rounded-xl bg-white border border-slate-200 p-4 space-y-4">
            <h2 className="text-lg font-semibold">Doctor Profile</h2>
            <form onSubmit={saveProfile} className="space-y-3">
              <input
                className="w-full rounded border px-3 py-2 text-sm"
                placeholder="Name"
                value={doctorForm.name}
                onChange={(e) => setDoctorForm((p) => ({ ...p, name: e.target.value }))}
              />
              <input
                className="w-full rounded border px-3 py-2 text-sm"
                placeholder="Phone"
                value={doctorForm.phone}
                onChange={(e) => setDoctorForm((p) => ({ ...p, phone: e.target.value }))}
              />
              <input
                className="w-full rounded border px-3 py-2 text-sm"
                placeholder="Clinic Name"
                value={doctorForm.clinicName}
                onChange={(e) => setDoctorForm((p) => ({ ...p, clinicName: e.target.value }))}
              />
              <input
                className="w-full rounded border px-3 py-2 text-sm"
                placeholder="Locality / Address"
                value={doctorForm.locality}
                onChange={(e) => setDoctorForm((p) => ({ ...p, locality: e.target.value }))}
              />
              <input
                className="w-full rounded border px-3 py-2 text-sm"
                placeholder="Specialization"
                value={doctorForm.specialization}
                onChange={(e) => setDoctorForm((p) => ({ ...p, specialization: e.target.value }))}
              />
              <input
                className="w-full rounded border px-3 py-2 text-sm"
                placeholder="Education (MBBS/MD/BAMS...)"
                value={doctorForm.education}
                onChange={(e) => setDoctorForm((p) => ({ ...p, education: e.target.value }))}
              />
              <input
                type="number"
                className="w-full rounded border px-3 py-2 text-sm"
                placeholder="Experience (years)"
                value={doctorForm.experience}
                onChange={(e) => setDoctorForm((p) => ({ ...p, experience: e.target.value }))}
              />
              <input
                className="w-full rounded border px-3 py-2 text-sm"
                placeholder="Logo URL"
                value={doctorForm.logoUrl}
                onChange={(e) => setDoctorForm((p) => ({ ...p, logoUrl: e.target.value }))}
              />
              <input
                type="file"
                accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                className="w-full rounded border px-3 py-2 text-sm"
                onChange={(e) => uploadAsset('logo', e.target.files?.[0])}
              />
              {doctorForm.logoUrl && (
                <img
                  src={doctorForm.logoUrl}
                  alt="Logo preview"
                  className="h-16 w-auto rounded border bg-slate-50 object-contain"
                />
              )}
              <input
                className="w-full rounded border px-3 py-2 text-sm"
                placeholder="Signature URL"
                value={doctorForm.signatureUrl}
                onChange={(e) => setDoctorForm((p) => ({ ...p, signatureUrl: e.target.value }))}
              />
              <input
                type="file"
                accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                className="w-full rounded border px-3 py-2 text-sm"
                onChange={(e) => uploadAsset('signature', e.target.files?.[0])}
              />
              {doctorForm.signatureUrl && (
                <img
                  src={doctorForm.signatureUrl}
                  alt="Signature preview"
                  className="h-16 w-auto rounded border bg-slate-50 object-contain"
                />
              )}
              <button className="w-full rounded bg-slate-900 text-white py-2 text-sm">Save Profile</button>
              {profileMessage && <p className="text-xs text-emerald-700">{profileMessage}</p>}
            </form>
          </div>

          <div className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-[0_20px_40px_rgba(15,23,42,0.05)] space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Patient Desk</p>
                <h2 className="text-lg font-semibold text-slate-900">Patients</h2>
              </div>
              <p className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {patients.length} patient record(s)
              </p>
            </div>

            <form onSubmit={createPatient} className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              <input
                required
                className="rounded border px-3 py-2 text-sm"
                placeholder="Name"
                value={newPatient.name}
                onChange={(e) => setNewPatient((p) => ({ ...p, name: e.target.value }))}
              />
              <input
                required
                type="number"
                className="rounded border px-3 py-2 text-sm"
                placeholder="Age"
                value={newPatient.age}
                onChange={(e) => setNewPatient((p) => ({ ...p, age: e.target.value }))}
              />
              <select
                className="rounded border px-3 py-2 text-sm"
                value={newPatient.gender}
                onChange={(e) => setNewPatient((p) => ({ ...p, gender: e.target.value }))}
              >
                <option value="MALE">MALE</option>
                <option value="FEMALE">FEMALE</option>
                <option value="OTHER">OTHER</option>
              </select>
              <input
                required
                className="rounded border px-3 py-2 text-sm"
                placeholder="Mobile"
                value={newPatient.mobile}
                onChange={(e) => setNewPatient((p) => ({ ...p, mobile: e.target.value }))}
              />
              <input
                className="rounded border px-3 py-2 text-sm md:col-span-2 xl:col-span-1"
                placeholder="Address"
                value={newPatient.address}
                onChange={(e) => setNewPatient((p) => ({ ...p, address: e.target.value }))}
              />
              <input
                type="number"
                className="rounded border px-3 py-2 text-sm"
                placeholder="Height (cm) optional"
                value={newPatient.height}
                onChange={(e) => setNewPatient((p) => ({ ...p, height: e.target.value }))}
              />
              <input
                type="number"
                className="rounded border px-3 py-2 text-sm"
                placeholder="Weight (kg) optional"
                value={newPatient.weight}
                onChange={(e) => setNewPatient((p) => ({ ...p, weight: e.target.value }))}
              />
              <button className="rounded bg-emerald-600 text-white text-sm py-2 shadow-sm transition hover:bg-emerald-500">
                Create
              </button>
            </form>

            <div className="flex gap-2">
              <input
                className="flex-1 rounded border px-3 py-2 text-sm"
                placeholder="Search by patient name or mobile"
                value={patientQuery}
                onChange={(e) => setPatientQuery(e.target.value)}
              />
              <button
                type="button"
                onClick={searchPatients}
                className="rounded bg-slate-900 text-white px-3 py-2 text-sm"
              >
                Search
              </button>
            </div>

            <div className="max-h-[30rem] overflow-y-auto rounded-2xl border border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(248,250,252,0.95))] p-2.5">
              <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-3 xl:grid-cols-4">
                {(patients || []).map((patient) => (
                  <article
                    key={patient.id}
                    className={`group rounded-xl border p-3 shadow-sm transition ${
                      selectedPatientId === patient.id
                        ? 'border-cyan-400 bg-cyan-50 shadow-[0_10px_30px_rgba(8,145,178,0.12)]'
                        : 'border-slate-200 bg-white hover:border-cyan-200 hover:shadow-[0_10px_30px_rgba(15,23,42,0.08)]'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => navigate(`/patients/${patient.id}`)}
                      className="w-full text-left"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-600 to-slate-900 text-xs font-semibold tracking-wide text-white shadow-sm">
                          {patientInitials(patient.name)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-semibold text-slate-900">{patient.name}</p>
                          <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">
                            Patient ID
                          </p>
                          <p className="text-[13px] text-cyan-700">#{resolvePatientNumber(patient)}</p>
                        </div>
                      </div>
                    </button>

                    <div className="mt-3 flex items-center justify-between gap-1.5 border-t border-slate-100 pt-2.5">
                      <button
                        type="button"
                        onClick={() => navigate(`/patients/${patient.id}`)}
                        className="rounded-full border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 transition hover:border-cyan-300 hover:text-cyan-800"
                      >
                        Open
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedPatientId(patient.id)}
                        className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
                          selectedPatientId === patient.id
                            ? 'bg-cyan-700 text-white'
                            : 'border border-slate-300 bg-slate-50 text-slate-700 hover:border-cyan-300 hover:text-cyan-800'
                        }`}
                      >
                        {selectedPatientId === patient.id ? 'Selected' : 'Use'}
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
              <div className="rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-50 via-white to-slate-50 p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">Selected Patient</p>
                    <p className="text-sm font-medium">{selectedPatient.name}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(`/patients/${selectedPatient.id}`)}
                    className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700"
                  >
                    Open Profile
                  </button>
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
                {selectedPatient.address && (
                  <p className="text-xs text-slate-600 mt-1">Address: {selectedPatient.address}</p>
                )}
                <p className="text-xs text-slate-600 mt-2">
                  Previous Prescriptions: {prescriptionHistory.length}
                </p>
                <div className="mt-2 max-h-36 overflow-y-auto text-xs space-y-1">
                  {prescriptionHistory.map((p) => (
                    <div key={p.id} className="rounded border px-2 py-1 bg-white">
                      {p.visitDate}: {p.diagnosis}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <section className="rounded-xl bg-white border border-slate-200 p-4 space-y-4">
          <h2 className="text-lg font-semibold">Prescription</h2>
          <div className="flex gap-3 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={prescriptionMode === 'PATIENT'}
                onChange={() => setPrescriptionMode('PATIENT')}
              />
              Patient-Based
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={prescriptionMode === 'QUICK'}
                onChange={() => setPrescriptionMode('QUICK')}
              />
              Quick Prescription
            </label>
          </div>

          <form onSubmit={submitPrescription} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <input
                className="rounded border px-3 py-2 text-sm"
                placeholder="Diagnosis"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
              />
              <input
                className="rounded border px-3 py-2 text-sm"
                placeholder="BP"
                value={bp}
                onChange={(e) => setBp(e.target.value)}
              />
              <input
                className="rounded border px-3 py-2 text-sm"
                placeholder="Sugar"
                value={sugar}
                onChange={(e) => setSugar(e.target.value)}
              />
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-slate-600">Consultation Fee</span>
                <input
                  type="number"
                  className="rounded border px-3 py-2 text-sm"
                  placeholder="Consultation Fee"
                  value={consultationFee}
                  onChange={(e) => setConsultationFee(e.target.value)}
                />
              </label>
            </div>

            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
              <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
                <div>
                  <p className="font-medium text-slate-900">Show Doctor Details</p>
                  <p className="text-xs text-slate-500">
                    Toggle doctor name, clinic, qualification, address, phone, and contact details in the PDF.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={showDoctorDetails}
                  onChange={(e) => setShowDoctorDetails(e.target.checked)}
                />
              </label>
              <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
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
              <label className="flex flex-col justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <span className="text-xs font-medium text-slate-600">Follow up date</span>
                <input
                  type="date"
                  className="mt-1 rounded border px-3 py-2 text-sm"
                  aria-label="Follow up date"
                  title="Follow up date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                />
              </label>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 space-y-3 shadow-sm">

              {showClinicalNotes && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <textarea
                      className="rounded border px-3 py-2 text-sm"
                      placeholder="Complaints"
                      rows={3}
                      value={complaints}
                      onChange={(e) => setComplaints(e.target.value)}
                    />
                    <textarea
                      className="rounded border px-3 py-2 text-sm"
                      placeholder="Examination"
                      rows={3}
                      value={examination}
                      onChange={(e) => setExamination(e.target.value)}
                    />
                    <textarea
                      className="rounded border px-3 py-2 text-sm md:col-span-2"
                      placeholder="Investigation Advice"
                      rows={3}
                      value={investigationAdvice}
                      onChange={(e) => setInvestigationAdvice(e.target.value)}
                    />
                    <textarea
                      className="rounded border px-3 py-2 text-sm md:col-span-2"
                      placeholder="Treatment"
                      rows={3}
                      value={treatment}
                      onChange={(e) => setTreatment(e.target.value)}
                    />
                    <input
                      className="rounded border px-3 py-2 text-sm"
                      placeholder="Follow Up"
                      value={followUp}
                      onChange={(e) => setFollowUp(e.target.value)}
                    />
                    <input
                      className="rounded border px-3 py-2 text-sm"
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
                      className="w-full rounded border px-3 py-2 text-sm"
                      onChange={(e) => uploadXray(e.target.files?.[0])}
                    />
                    {xrayUploading && <p className="text-xs text-slate-500">Uploading x-ray...</p>}
                    {xrayImageUrl && (
                      <div className="space-y-2">
                        <img
                          src={xrayImageUrl}
                          alt="X-ray preview"
                          className="max-h-48 rounded border border-slate-200 bg-slate-50 object-contain"
                        />
                        <p className="text-xs text-slate-500 break-all">{xrayImageUrl}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[220px,1fr] gap-3 items-start">
              <div className="space-y-1">
                <label htmlFor="medicine-type" className="text-sm font-medium text-slate-700">
                  Medicine Type
                </label>
                <select
                  id="medicine-type"
                  className="w-full rounded border px-3 py-2 text-sm"
                  value={selectedMedicineType}
                  onChange={(e) => handleMedicineTypeChange(e.target.value)}
                >
                  {medicineTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500">
                  Switch between medicine types to add or edit entries without showing all sections at once.
                </p>
                <p className="text-xs text-slate-500">
                  Added: {medicineCounts.TABLET} tablets, {medicineCounts.SYRUP} syrups,{' '}
                  {medicineCounts.INJECTION} injections.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-cyan-50/40 p-4 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
                      Medicine Builder
                    </p>
                    <h3 className="text-sm font-semibold text-slate-900">
                      Add {medicineTypeOptions.find((option) => option.value === selectedMedicineType)?.label}
                    </h3>
                  </div>
                  {medicineDraft.scheduleType === 'WEEKLY' && (
                    <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-medium text-cyan-800">
                      Weekly plan: {medicineDraft.weeklyDays.length || 0} day(s) selected
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <AutocompleteInput
                    value={medicineDraft.brand}
                    placeholder={`${selectedMedicineType} Brand`}
                    suggestions={suggestions[brandSuggestionKey] || []}
                    onChange={(value) => {
                      updateMedicineDraft('brand', value)
                      fetchMedicineSuggestions(selectedMedicineType, brandSuggestionKey, value, 'brand')
                    }}
                    onSelect={(value) => {
                      updateMedicineDraft('brand', value)
                      setSuggestions((prev) => ({ ...prev, [brandSuggestionKey]: [] }))
                    }}
                  />
                  <AutocompleteInput
                    value={medicineDraft[getMedicineNameField(selectedMedicineType)] || ''}
                    placeholder={`${selectedMedicineType} Name`}
                    suggestions={suggestions[nameSuggestionKey] || []}
                    onChange={(value) => {
                      updateMedicineDraft(getMedicineNameField(selectedMedicineType), value)
                      fetchMedicineSuggestions(selectedMedicineType, nameSuggestionKey, value, 'name')
                    }}
                    onSelect={(value) => {
                      updateMedicineDraft(getMedicineNameField(selectedMedicineType), value)
                      setSuggestions((prev) => ({ ...prev, [nameSuggestionKey]: [] }))
                    }}
                  />
                </div>

                {selectedMedicineType === 'TABLET' && (
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <label className="inline-flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={Boolean(medicineDraft.morning)}
                          onChange={(e) => updateMedicineDraft('morning', e.target.checked)}
                        />
                        Morning
                      </label>
                      <label className="inline-flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={Boolean(medicineDraft.afternoon)}
                          onChange={(e) => updateMedicineDraft('afternoon', e.target.checked)}
                        />
                        Afternoon
                      </label>
                      <label className="inline-flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={Boolean(medicineDraft.night)}
                          onChange={(e) => updateMedicineDraft('night', e.target.checked)}
                        />
                        Night
                      </label>
                      <label className="inline-flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={Boolean(medicineDraft.withWater)}
                          onChange={(e) => updateMedicineDraft('withWater', e.target.checked)}
                        />
                        With water
                      </label>
                      <label className="inline-flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={Boolean(medicineDraft.chew)}
                          onChange={(e) => updateMedicineDraft('chew', e.target.checked)}
                        />
                        Chew
                      </label>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-[minmax(0,160px)_minmax(0,1fr)_minmax(0,1fr)] gap-2">
                      <select
                        className="rounded border px-3 py-2 text-sm"
                        value={medicineDraft.scheduleType || 'DAILY'}
                        onChange={(e) => updateMedicineSchedule(e.target.value)}
                      >
                        <option value="DAILY">Daily</option>
                        <option value="WEEKLY">Weekly</option>
                      </select>
                      <input
                        type="number"
                        className="rounded border px-3 py-2 text-sm"
                        value={medicineDraft.duration ?? ''}
                        onChange={(e) =>
                          updateMedicineDraft('duration', e.target.value === '' ? '' : Number(e.target.value))
                        }
                        placeholder={medicineDraft.scheduleType === 'WEEKLY' ? 'Duration (weeks)' : 'Duration (days)'}
                      />
                      <input
                        type="number"
                        className="rounded border px-3 py-2 text-sm"
                        value={medicineDraft.quantity ?? ''}
                        onChange={(e) =>
                          updateMedicineDraft('quantity', e.target.value === '' ? '' : Number(e.target.value))
                        }
                        placeholder="Quantity"
                      />
                    </div>
                    {medicineDraft.scheduleType === 'WEEKLY' && (
                      <WeekdaySelector
                        selectedDays={medicineDraft.weeklyDays}
                        onToggle={toggleWeeklyDay}
                      />
                    )}
                    <div className="grid grid-cols-1 gap-2">
                      <select
                        className="w-full rounded border px-3 py-2 text-sm md:max-w-[220px]"
                        value={medicineDraft.instruction || 'AFTER_FOOD'}
                        onChange={(e) => updateMedicineDraft('instruction', e.target.value)}
                      >
                        <option value="AFTER_FOOD">After Food</option>
                        <option value="BEFORE_FOOD">Before Food</option>
                        <option value="EMPTY_STOMACH">Empty Stomach</option>
                      </select>
                    </div>
                  </div>
                )}

                {selectedMedicineType === 'SYRUP' && (
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <label className="inline-flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={Boolean(medicineDraft.morning)}
                          onChange={(e) => updateMedicineDraft('morning', e.target.checked)}
                        />
                        Morning
                      </label>
                      <label className="inline-flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={Boolean(medicineDraft.afternoon)}
                          onChange={(e) => updateMedicineDraft('afternoon', e.target.checked)}
                        />
                        Afternoon
                      </label>
                      <label className="inline-flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={Boolean(medicineDraft.night)}
                          onChange={(e) => updateMedicineDraft('night', e.target.checked)}
                        />
                        Night
                      </label>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-[minmax(0,160px)_minmax(0,1fr)_minmax(0,1fr)] gap-2">
                      <select
                        className="rounded border px-3 py-2 text-sm"
                        value={medicineDraft.scheduleType || 'DAILY'}
                        onChange={(e) => updateMedicineSchedule(e.target.value)}
                      >
                        <option value="DAILY">Daily</option>
                        <option value="WEEKLY">Weekly</option>
                      </select>
                      <input
                        type="number"
                        className="rounded border px-3 py-2 text-sm"
                        value={medicineDraft.duration ?? ''}
                        onChange={(e) =>
                          updateMedicineDraft('duration', e.target.value === '' ? '' : Number(e.target.value))
                        }
                        placeholder={medicineDraft.scheduleType === 'WEEKLY' ? 'Duration (weeks)' : 'Duration (days)'}
                      />
                      <input
                        type="number"
                        className="rounded border px-3 py-2 text-sm"
                        value={medicineDraft.quantity ?? ''}
                        onChange={(e) =>
                          updateMedicineDraft('quantity', e.target.value === '' ? '' : Number(e.target.value))
                        }
                        placeholder="Quantity (ml)"
                      />
                    </div>
                    {medicineDraft.scheduleType === 'WEEKLY' && (
                      <WeekdaySelector
                        selectedDays={medicineDraft.weeklyDays}
                        onToggle={toggleWeeklyDay}
                      />
                    )}
                  </div>
                )}

                {selectedMedicineType === 'INJECTION' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <label className="flex flex-col gap-1 text-sm text-slate-700">
                        <span className="text-xs font-medium text-slate-600">Schedule</span>
                        <select
                          className="rounded border px-3 py-2 text-sm"
                          value={medicineDraft.scheduleType || 'DAILY'}
                          onChange={(e) => updateMedicineSchedule(e.target.value)}
                        >
                          <option value="DAILY">Daily</option>
                          <option value="WEEKLY">Weekly</option>
                        </select>
                      </label>
                    </div>

                    {medicineDraft.scheduleType === 'WEEKLY' && (
                      <WeekdaySelector
                        selectedDays={medicineDraft.weeklyDays}
                        onToggle={toggleWeeklyDay}
                      />
                    )}
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={addMedicine}
                    className="rounded bg-slate-900 px-4 py-2 text-sm text-white"
                  >
                    Add Medicine
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
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

            <button className="rounded bg-indigo-600 px-4 py-2 text-sm text-white shadow-sm transition hover:bg-indigo-500">
              Save Prescription & Download PDF
            </button>
          </form>
        </section>
      </section>
    </main>
  )
}

function MedicineList({ title, items, type, onRemove }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/90 p-3 shadow-sm space-y-2">
      <h3 className="font-medium text-sm text-slate-900">{title}</h3>
      {items.length === 0 && <p className="text-xs text-slate-500">No medicines added.</p>}
      {items.map((item, index) => (
        <div key={`${title}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 space-y-2">
          <p className="text-sm text-slate-700">{summarizeMedicine(type, item)}</p>
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="text-xs rounded border border-red-200 bg-white px-2 py-1 text-red-700"
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
    <div className="rounded-xl border border-cyan-100 bg-cyan-50/60 p-3">
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
                  ? 'border-cyan-700 bg-cyan-700 text-white shadow-sm'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-cyan-300 hover:text-cyan-800'
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
        className="w-full rounded border px-2 py-2 text-sm"
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
        <div className="absolute z-20 mt-1 w-full rounded border bg-white shadow max-h-40 overflow-y-auto">
          {filteredSuggestions.map((item) => (
            <button
              key={`${placeholder}-${item}`}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onSelect(item)
                setIsOpen(false)
              }}
              className="w-full text-left px-2 py-1 text-xs hover:bg-slate-100 border-b last:border-b-0"
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
