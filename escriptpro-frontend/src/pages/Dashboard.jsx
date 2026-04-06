import { useEffect, useMemo, useRef, useState } from 'react'
import api from '../services/api'

const emptyTablet = {
  brand: '',
  medicineName: '',
  morning: false,
  afternoon: false,
  night: false,
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
  duration: '',
  quantity: '',
}

const emptyInjection = {
  brand: '',
  medicineName: '',
  daily: true,
  alternateDay: false,
  weeklyOnce: false,
}

function Dashboard() {
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
  })

  const [prescriptionMode, setPrescriptionMode] = useState('PATIENT')
  const [diagnosis, setDiagnosis] = useState('')
  const [advice, setAdvice] = useState('')
  const [consultationFee, setConsultationFee] = useState(500)
  const [tablets, setTablets] = useState([{ ...emptyTablet }])
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
      }
      const response = await api.post('/patients', payload)
      setPatients((prev) => [response.data, ...prev])
      setNewPatient({ name: '', age: '', gender: 'MALE', mobile: '' })
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

      const endpoint = field === 'brand' ? '/medicines/search/brands' : '/medicines/search/names'
      const response = await api.get(endpoint, {
        params: { query: normalizedQuery, type },
      })
      const data = Array.isArray(response.data) ? response.data : []
      const values = [
        ...new Set(data.map((item) => (typeof item === 'string' ? item : '')).filter(Boolean)),
      ].slice(0, 10)

      suggestionCacheRef.current.set(cacheKey, values)
      setSuggestions((prev) => ({ ...prev, [key]: values }))
    } catch {
      setSuggestions((prev) => ({ ...prev, [key]: [] }))
    }
  }

  const onTabletChange = (index, field, value) => {
    setTablets((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)))
  }

  const onSyrupChange = (index, field, value) => {
    setSyrups((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)))
  }

  const onInjectionChange = (index, field, value) => {
    setInjections((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)))
  }

  const submitPrescription = async (event) => {
    event.preventDefault()
    setError('')
    try {
      const payload = {
        patientId: prescriptionMode === 'PATIENT' ? selectedPatientId : null,
        doctorName: doctorForm.name,
        clinicName: doctorForm.clinicName,
        locality: doctorForm.locality,
        education: doctorForm.education,
        logoUrl: doctorForm.logoUrl,
        signatureUrl: doctorForm.signatureUrl,
        diagnosis: diagnosis.trim(),
        advice: advice.trim(),
        consultationFee: Number(consultationFee),
        tablets: tablets.filter((t) => t.brand || t.medicineName),
        syrups: syrups.filter((s) => s.brand || s.syrupName),
        injections: injections.filter((i) => i.brand || i.medicineName),
      }

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
    <main className="min-h-screen bg-slate-100 p-4 md:p-6">
      <section className="max-w-7xl mx-auto space-y-5">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-slate-900">Doctor Workspace</h1>
          <button
            type="button"
            onClick={logout}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white"
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

          <div className="xl:col-span-2 rounded-xl bg-white border border-slate-200 p-4 space-y-4">
            <h2 className="text-lg font-semibold">Patients</h2>

            <form onSubmit={createPatient} className="grid grid-cols-1 md:grid-cols-5 gap-2">
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
              <button className="rounded bg-emerald-600 text-white text-sm py-2">Create</button>
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

            <div className="max-h-56 overflow-y-auto border rounded">
              {(patients || []).map((patient) => (
                <button
                  key={patient.id}
                  type="button"
                  onClick={() => setSelectedPatientId(patient.id)}
                  className={`w-full text-left px-3 py-2 text-sm border-b ${
                    selectedPatientId === patient.id ? 'bg-slate-100' : 'bg-white'
                  }`}
                >
                  <strong>{patient.name}</strong> | {patient.age} | {patient.gender} | {patient.mobile}
                </button>
              ))}
              {patients.length === 0 && (
                <p className="px-3 py-2 text-sm text-slate-500">No patients found.</p>
              )}
            </div>

            {selectedPatient && (
              <div className="rounded border p-3 bg-slate-50">
                <p className="text-sm font-medium">Selected Patient: {selectedPatient.name}</p>
                <p className="text-xs text-slate-600">
                  Age: {selectedPatient.age} | Gender: {selectedPatient.gender} | Mobile:{' '}
                  {selectedPatient.mobile}
                </p>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <input
                className="rounded border px-3 py-2 text-sm"
                placeholder="Diagnosis"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
              />
              <input
                className="rounded border px-3 py-2 text-sm"
                placeholder="Advice"
                value={advice}
                onChange={(e) => setAdvice(e.target.value)}
              />
              <input
                type="number"
                className="rounded border px-3 py-2 text-sm"
                placeholder="Consultation Fee"
                value={consultationFee}
                onChange={(e) => setConsultationFee(e.target.value)}
              />
            </div>

            <MedicineSection
              title="Tablets"
              items={tablets}
              onAdd={() => setTablets((prev) => [...prev, { ...emptyTablet }])}
              onRemove={(idx) => setTablets((prev) => prev.filter((_, i) => i !== idx))}
              renderItem={(row, index) => (
                <div className="space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                    <AutocompleteInput
                      value={row.brand}
                      placeholder="Tablet Brand"
                      suggestions={suggestions[`tablet-brand-${index}`] || []}
                      onChange={(value) => {
                        onTabletChange(index, 'brand', value)
                        fetchMedicineSuggestions('TABLET', `tablet-brand-${index}`, value, 'brand')
                      }}
                      onSelect={(value) => {
                        onTabletChange(index, 'brand', value)
                        setSuggestions((prev) => ({ ...prev, [`tablet-brand-${index}`]: [] }))
                      }}
                    />
                    <AutocompleteInput
                      value={row.medicineName}
                      placeholder="Tablet Name"
                      suggestions={suggestions[`tablet-name-${index}`] || []}
                      onChange={(value) => {
                        onTabletChange(index, 'medicineName', value)
                        fetchMedicineSuggestions('TABLET', `tablet-name-${index}`, value, 'name')
                      }}
                      onSelect={(value) => {
                        onTabletChange(index, 'medicineName', value)
                        setSuggestions((prev) => ({ ...prev, [`tablet-name-${index}`]: [] }))
                      }}
                    />
                    <input
                      type="number"
                      className="rounded border px-2 py-2 text-sm"
                      value={row.duration}
                      onChange={(e) =>
                        onTabletChange(
                          index,
                          'duration',
                          e.target.value === '' ? '' : Number(e.target.value)
                        )
                      }
                      placeholder="Duration (days)"
                    />
                    <input
                      type="number"
                      className="rounded border px-2 py-2 text-sm"
                      value={row.quantity}
                      onChange={(e) =>
                        onTabletChange(
                          index,
                          'quantity',
                          e.target.value === '' ? '' : Number(e.target.value)
                        )
                      }
                      placeholder="Quantity (tablets)"
                    />
                    <select
                      className="rounded border px-2 py-2 text-sm"
                      value={row.instruction}
                      onChange={(e) => onTabletChange(index, 'instruction', e.target.value)}
                    >
                      <option value="BEFORE_FOOD">Before Food</option>
                      <option value="AFTER_FOOD">After Food</option>
                      <option value="EMPTY_STOMACH">Empty Stomach</option>
                    </select>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <label className="inline-flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={row.morning}
                        onChange={(e) => onTabletChange(index, 'morning', e.target.checked)}
                      />
                      Morning
                    </label>
                    <label className="inline-flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={row.afternoon}
                        onChange={(e) => onTabletChange(index, 'afternoon', e.target.checked)}
                      />
                      Afternoon
                    </label>
                    <label className="inline-flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={row.night}
                        onChange={(e) => onTabletChange(index, 'night', e.target.checked)}
                      />
                      Night
                    </label>
                    <label className="inline-flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={row.withWater}
                        onChange={(e) => onTabletChange(index, 'withWater', e.target.checked)}
                      />
                      With Water
                    </label>
                    <label className="inline-flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={row.chew}
                        onChange={(e) => onTabletChange(index, 'chew', e.target.checked)}
                      />
                      Chew
                    </label>
                  </div>
                </div>
              )}
            />

            <MedicineSection
              title="Syrups"
              items={syrups}
              onAdd={() => setSyrups((prev) => [...prev, { ...emptySyrup }])}
              onRemove={(idx) => setSyrups((prev) => prev.filter((_, i) => i !== idx))}
              renderItem={(row, index) => (
                <div className="space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <AutocompleteInput
                      value={row.brand}
                      placeholder="Syrup Brand"
                      suggestions={suggestions[`syrup-brand-${index}`] || []}
                      onChange={(value) => {
                        onSyrupChange(index, 'brand', value)
                        fetchMedicineSuggestions('SYRUP', `syrup-brand-${index}`, value, 'brand')
                      }}
                      onSelect={(value) => {
                        onSyrupChange(index, 'brand', value)
                        setSuggestions((prev) => ({ ...prev, [`syrup-brand-${index}`]: [] }))
                      }}
                    />
                    <AutocompleteInput
                      value={row.syrupName}
                      placeholder="Syrup Name"
                      suggestions={suggestions[`syrup-name-${index}`] || []}
                      onChange={(value) => {
                        onSyrupChange(index, 'syrupName', value)
                        fetchMedicineSuggestions('SYRUP', `syrup-name-${index}`, value, 'name')
                      }}
                      onSelect={(value) => {
                        onSyrupChange(index, 'syrupName', value)
                        setSuggestions((prev) => ({ ...prev, [`syrup-name-${index}`]: [] }))
                      }}
                    />
                    <input
                      type="number"
                      className="rounded border px-2 py-2 text-sm"
                      value={row.duration}
                      onChange={(e) =>
                        onSyrupChange(
                          index,
                          'duration',
                          e.target.value === '' ? '' : Number(e.target.value)
                        )
                      }
                      placeholder="Duration (days)"
                    />
                    <input
                      type="number"
                      className="rounded border px-2 py-2 text-sm"
                      value={row.quantity}
                      onChange={(e) =>
                        onSyrupChange(
                          index,
                          'quantity',
                          e.target.value === '' ? '' : Number(e.target.value)
                        )
                      }
                      placeholder="Quantity (ml)"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <label className="inline-flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={row.morning}
                        onChange={(e) => onSyrupChange(index, 'morning', e.target.checked)}
                      />
                      Morning
                    </label>
                    <label className="inline-flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={row.afternoon}
                        onChange={(e) => onSyrupChange(index, 'afternoon', e.target.checked)}
                      />
                      Afternoon
                    </label>
                    <label className="inline-flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={row.night}
                        onChange={(e) => onSyrupChange(index, 'night', e.target.checked)}
                      />
                      Night
                    </label>
                  </div>
                </div>
              )}
            />

            <MedicineSection
              title="Injections"
              items={injections}
              onAdd={() => setInjections((prev) => [...prev, { ...emptyInjection }])}
              onRemove={(idx) => setInjections((prev) => prev.filter((_, i) => i !== idx))}
              renderItem={(row, index) => (
                <div className="space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <AutocompleteInput
                      value={row.brand}
                      placeholder="Injection Brand"
                      suggestions={suggestions[`inj-brand-${index}`] || []}
                      onChange={(value) => {
                        onInjectionChange(index, 'brand', value)
                        fetchMedicineSuggestions('INJECTION', `inj-brand-${index}`, value, 'brand')
                      }}
                      onSelect={(value) => {
                        onInjectionChange(index, 'brand', value)
                        setSuggestions((prev) => ({ ...prev, [`inj-brand-${index}`]: [] }))
                      }}
                    />
                    <AutocompleteInput
                      value={row.medicineName}
                      placeholder="Injection Name"
                      suggestions={suggestions[`inj-name-${index}`] || []}
                      onChange={(value) => {
                        onInjectionChange(index, 'medicineName', value)
                        fetchMedicineSuggestions('INJECTION', `inj-name-${index}`, value, 'name')
                      }}
                      onSelect={(value) => {
                        onInjectionChange(index, 'medicineName', value)
                        setSuggestions((prev) => ({ ...prev, [`inj-name-${index}`]: [] }))
                      }}
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <label className="inline-flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={row.daily}
                        onChange={(e) => onInjectionChange(index, 'daily', e.target.checked)}
                      />
                      Daily
                    </label>
                    <label className="inline-flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={row.alternateDay}
                        onChange={(e) => onInjectionChange(index, 'alternateDay', e.target.checked)}
                      />
                      Alternate Day
                    </label>
                    <label className="inline-flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={row.weeklyOnce}
                        onChange={(e) => onInjectionChange(index, 'weeklyOnce', e.target.checked)}
                      />
                      Weekly Once
                    </label>
                  </div>
                </div>
              )}
            />

            <button className="rounded bg-indigo-600 text-white px-4 py-2 text-sm">
              Save Prescription & Download PDF
            </button>
          </form>
        </section>
      </section>
    </main>
  )
}

function MedicineSection({ title, items, onAdd, onRemove, renderItem }) {
  return (
    <div className="rounded border p-3 space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm">{title}</h3>
        <button type="button" onClick={onAdd} className="text-xs px-2 py-1 rounded border">
          + Add
        </button>
      </div>
      {items.length === 0 && <p className="text-xs text-slate-500">No entries</p>}
      {items.map((item, index) => (
        <div key={`${title}-${index}`} className="rounded border p-2 space-y-2">
          {renderItem(item, index)}
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="text-xs rounded border px-2 py-1 text-red-700"
          >
            Remove
          </button>
        </div>
      ))}
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
