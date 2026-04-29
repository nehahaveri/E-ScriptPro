import { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  motion,
  useInView,
  AnimatePresence,
} from 'framer-motion'
import {
  FileText,
  Search,
  ShieldCheck,
  Users,
  CalendarDays,
  ArrowRight,
  ChevronDown,
  Stethoscope,
  CheckCircle2,
  Star,
  Menu,
  X,
  ArrowUpRight,
  Zap,
  Sun,
  Moon,
  Download,
  AlertTriangle,
  Clock,
  Globe,
  Pencil,
} from 'lucide-react'


/* ─────────────────────────────────────────────
   helpers
   ───────────────────────────────────────────── */

const ease = [0.22, 1, 0.36, 1]

function Reveal({ children, className = '', delay = 0, y = 40, id }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.15 })
  return (
    <motion.div
      ref={ref}
      id={id}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ─────────────────────────────────────────────
   dashboard mockup — realistic product preview
   ───────────────────────────────────────────── */

function DashboardMockup() {
  return (
    <div className="relative">
      {/* Glow beneath */}
      <div className="pointer-events-none absolute inset-0 -z-10 translate-y-8 scale-90 rounded-[40px] bg-gradient-to-br from-[#3a7bd5]/20 via-[#6ee7f8]/15 to-transparent blur-[60px]" />

      {/* Browser chrome */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_32px_80px_rgba(29,45,80,0.14)]">
        {/* Title bar */}
        <div className="flex items-center gap-2 border-b border-slate-100 bg-[#f8fafc] px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          <div className="ml-3 flex-1 max-w-[220px] rounded-md bg-slate-100 px-3 py-1 text-[9px] text-slate-400">
            app.justgp-rx.com/dashboard
          </div>
        </div>

        {/* Layout */}
        <div className="flex h-[360px] sm:h-[400px]">
          {/* Sidebar — patient list */}
          <div className="hidden w-[165px] flex-col gap-1.5 border-r border-slate-100 bg-[#fafbfc] p-3 sm:flex">
            <p className="mb-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">
              Today's Patients
            </p>
            {[
              { name: 'Ravi Kumar',   age: 42, status: 'Active',   active: true },
              { name: 'Priya Singh',  age: 28, status: 'Waiting',  active: false },
              { name: 'Amit Sharma',  age: 55, status: 'Done',     active: false },
              { name: 'Sunita Rao',   age: 35, status: 'Waiting',  active: false },
            ].map((p) => (
              <div
                key={p.name}
                className={`flex cursor-pointer items-center gap-2 rounded-xl p-2 transition-colors ${
                  p.active ? 'bg-[#1d2d50]' : 'hover:bg-white'
                }`}
              >
                <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                  p.active ? 'bg-white/20 text-white' : 'bg-[#e8f0fe] text-[#3a7bd5]'
                }`}>
                  {p.name[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-[10px] font-semibold ${p.active ? 'text-white' : 'text-slate-700'}`}>
                    {p.name}
                  </p>
                  <p className={`text-[8.5px] ${
                    p.active ? 'text-white/60'
                    : p.status === 'Done' ? 'text-emerald-500'
                    : p.status === 'Active' ? 'text-blue-500'
                    : 'text-slate-400'
                  }`}>
                    {p.status}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Prescription area */}
          <div className="flex-1 overflow-hidden p-4">
            {/* Row: title + actions */}
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-[12px] font-bold text-[#1d2d50]">Rx — Ravi Kumar, 42M</p>
                <p className="text-[9px] text-slate-400">29 Apr 2026 · 10:30 AM · Dr. Rahul Mehta</p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[8.5px] font-semibold text-emerald-600">
                  ✓ Saved
                </span>
                <span className="cursor-pointer rounded-full bg-[#1d2d50] px-3 py-1 text-[9px] font-bold text-white transition-colors hover:bg-[#2a3f6e]">
                  ↓ PDF
                </span>
              </div>
            </div>

            {/* Medicine entries */}
            <p className="mb-2 text-[9px] font-bold uppercase tracking-wider text-slate-400">Medications</p>
            <div className="space-y-1.5">
              {[
                { name: 'Amoxicillin 500mg', form: 'Capsule', dose: '1-0-1', note: 'After food',    days: '7d', color: '#3a7bd5' },
                { name: 'Paracetamol 650mg', form: 'Tablet',  dose: '1-1-1', note: 'As needed',     days: '5d', color: '#26b4ff' },
                { name: 'Benadryl SF 10ml',  form: 'Syrup',   dose: '0-0-1', note: 'Before sleep',  days: '7d', color: '#6ee7f8' },
              ].map((m) => (
                <div key={m.name} className="flex items-center gap-2 rounded-xl border border-slate-100 bg-white p-2 shadow-sm">
                  <div
                    className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg"
                    style={{ background: m.color + '18' }}
                  >
                    <span className="h-2 w-2 rounded-full" style={{ background: m.color }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold text-[#1d2d50]">{m.name}</p>
                    <p className="text-[8.5px] text-slate-400">{m.form} · {m.dose} · {m.note}</p>
                  </div>
                  <span className="text-[9px] font-bold text-[#3a7bd5]">{m.days}</span>
                </div>
              ))}

              <div className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-200 p-2 text-slate-400 transition-colors hover:border-[#3a7bd5] hover:text-[#3a7bd5]">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-slate-50 text-sm font-bold">+</span>
                <span className="text-[9px] font-medium">Add another medicine…</span>
              </div>
            </div>

            {/* Footer note */}
            <div className="mt-2.5 flex items-start gap-2 rounded-xl border border-slate-100 bg-[#f8fafc] p-2">
              <div className="flex-1">
                <p className="mb-0.5 text-[8.5px] text-slate-400">Advice</p>
                <p className="text-[9.5px] text-slate-600">Avoid cold foods. Complete full course. Follow up in 7 days.</p>
              </div>
              <div className="flex-shrink-0 text-right text-[8px] text-slate-400">
                <p className="font-semibold text-slate-600">Dr. Rahul Mehta</p>
                <p>MBBS · Reg. MH-12345</p>
                <div className="ml-auto mt-1 h-4 w-14 rounded bg-slate-200/80" title="Signature preview" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating badge — top right */}
      <motion.div
        animate={{ y: [0, -7, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        className="absolute -right-3 -top-4 flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-white px-3 py-2 shadow-lg sm:-right-6 sm:-top-5"
      >
        <span className="h-2 w-2 rounded-full bg-emerald-400" />
        <span className="text-[11px] font-semibold text-emerald-700 whitespace-nowrap">PDF in 0.8 s</span>
      </motion.div>

      {/* Floating badge — bottom left */}
      <motion.div
        animate={{ y: [0, 7, 0] }}
        transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut', delay: 0.6 }}
        className="absolute -left-3 bottom-14 flex items-center gap-1.5 rounded-xl border border-blue-100 bg-white px-3 py-2 shadow-lg sm:-left-8"
      >
        <Stethoscope size={12} className="text-[#3a7bd5]" />
        <span className="text-[11px] font-semibold text-[#1d2d50] whitespace-nowrap">Autocomplete on</span>
      </motion.div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   navbar
   ───────────────────────────────────────────── */

function Navbar({ darkMode, setDarkMode }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  const navLinks = [
    { label: 'Features',     href: '#features' },
    { label: 'How it Works', href: '#how-it-works' },
    { label: 'Testimonials', href: '#testimonials' },
    { label: 'FAQ',          href: '#faq' },
  ]

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-2xl shadow-[0_1px_0_rgba(29,45,80,0.07)]'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-10">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <img src="/favicon.svg" alt="JustGP-Rx" className="h-7 w-7" />
          <span className="text-[15px] font-bold tracking-tight">
            <span className="text-[#1d2d50]">JustGP</span>
            <span className="text-[#3a7bd5]">-Rx</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-[13px] font-medium text-slate-500 transition-colors duration-200 hover:text-[#1d2d50]"
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 md:flex">
          <button
            type="button"
            onClick={() => setDarkMode((d) => !d)}
            className="rounded-full border border-slate-200 bg-white p-2 text-slate-500 transition hover:border-slate-300 hover:text-slate-800"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <Link
            to="/login"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-[13px] font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            className="group inline-flex items-center gap-1.5 rounded-full bg-[#1d2d50] px-5 py-2 text-[13px] font-semibold text-white transition-all hover:bg-[#2a3f6e] hover:shadow-[0_8px_24px_rgba(29,45,80,0.2)]"
          >
            Get Started
            <ArrowRight size={13} className="transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={() => setDarkMode((d) => !d)}
            className="rounded-full border border-slate-200 bg-white p-2 text-slate-500"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="rounded-lg p-2 text-slate-600"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease }}
            className="overflow-hidden border-t border-slate-100 bg-white/95 backdrop-blur-2xl md:hidden"
          >
            <div className="flex flex-col gap-4 px-5 py-5">
              {navLinks.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="text-[14px] font-medium text-slate-600"
                >
                  {l.label}
                </a>
              ))}
              <hr className="border-slate-100" />
              <Link to="/login" onClick={() => setMenuOpen(false)} className="text-[14px] font-medium text-slate-600">
                Sign In
              </Link>
              <Link
                to="/signup"
                onClick={() => setMenuOpen(false)}
                className="rounded-full bg-[#1d2d50] px-5 py-3 text-center text-[14px] font-semibold text-white"
              >
                Get Started Free
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

/* ─────────────────────────────────────────────
   hero
   ───────────────────────────────────────────── */

function Hero() {
  return (
    <section className="relative min-h-[100dvh] overflow-hidden bg-[#f8fcff] pb-20 pt-24">
      {/* ambient blurs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-16 h-[600px] w-[600px] rounded-full bg-[#3a7bd5]/[0.06] blur-[130px]" />
        <div className="absolute -right-32 top-28 h-[500px] w-[500px] rounded-full bg-[#6ee7f8]/[0.07] blur-[110px]" />
        <div className="absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-[#7ce4d8]/[0.05] blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100dvh-5rem)] max-w-7xl flex-col items-center gap-14 px-5 lg:flex-row lg:gap-16 lg:px-10">
        {/* ── Left: copy ── */}
        <div className="flex-1 text-center lg:text-left">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1, ease }}
            className="inline-flex items-center gap-2 rounded-full border border-[#3a7bd5]/15 bg-[#3a7bd5]/5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#3a7bd5]"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#3a7bd5]" />
            Digital Prescription Platform for Doctors
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.22, ease }}
            className="mt-6 text-[clamp(2.4rem,5.2vw,4.2rem)] font-extrabold leading-[1.05] tracking-[-0.04em] text-[#1d2d50]"
          >
            Write Prescriptions.
            <br />
            <span className="bg-gradient-to-r from-[#3a7bd5] via-[#26b4ff] to-[#6ee7f8] bg-clip-text text-transparent">
              Run Your Clinic.
            </span>
            <br />
            All in One Place.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.38, ease }}
            className="mx-auto mt-6 max-w-xl text-[clamp(0.95rem,1.5vw,1.08rem)] leading-[1.8] text-slate-500 lg:mx-0"
          >
            JustGP-Rx gives doctors a complete digital clinic — write structured prescriptions,
            manage patient records, generate clinic-branded PDFs, and sync follow-ups to Google Calendar.
            All from your browser.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.52, ease }}
            className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start"
          >
            <Link
              to="/signup"
              className="group inline-flex items-center gap-2 rounded-full bg-[#1d2d50] px-8 py-3.5 text-[14px] font-semibold text-white transition-all hover:bg-[#2a3f6e] hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(29,45,80,0.22)]"
            >
              Start Free — No Credit Card
              <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-7 py-3.5 text-[14px] font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Sign In
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.68, ease }}
            className="mt-6 flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-400 lg:justify-start"
          >
            {['Free forever plan', '5 min setup', 'No lock-in', 'Role-based access'].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle2 size={11} className="text-emerald-400" />
                {t}
              </span>
            ))}
          </motion.div>
        </div>

        {/* ── Right: dashboard mockup ── */}
        <motion.div
          initial={{ opacity: 0, x: 40, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.32, ease }}
          className="w-full flex-1 max-w-[580px]"
        >
          <DashboardMockup />
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.div
        animate={{ y: [0, 5, 0] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-300"
        aria-hidden
      >
        <ChevronDown size={20} strokeWidth={1.5} />
      </motion.div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   trust bar — quick social proof
   ───────────────────────────────────────────── */

function TrustBar() {
  const items = [
    { value: '10,000+', label: 'Prescriptions generated' },
    { value: '500+',    label: 'Doctors onboarded' },
    { value: '< 1s',    label: 'PDF export time' },
    { value: '99.9%',   label: 'Platform uptime' },
  ]
  return (
    <section className="border-y border-slate-100 bg-white py-10">
      <div className="mx-auto max-w-6xl px-5 lg:px-10">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {items.map((item, i) => (
            <Reveal key={item.label} delay={i * 0.06} y={16}>
              <div className="text-center">
                <p className="text-[clamp(1.4rem,3vw,2rem)] font-extrabold tracking-tight text-[#1d2d50]">
                  {item.value}
                </p>
                <p className="mt-0.5 text-[12px] text-slate-400">{item.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   pain points — the problem
   ───────────────────────────────────────────── */

function PainPoints() {
  const pains = [
    {
      icon: Pencil,
      title: 'Illegible handwriting',
      desc: 'Paper prescriptions get misread by pharmacists, leading to wrong dosages and serious patient safety risks.',
      color: '#f97316',
    },
    {
      icon: Clock,
      title: 'Hours wasted on paperwork',
      desc: 'Doctors lose 2+ hours daily writing and organising paper prescriptions instead of focusing on patient care.',
      color: '#ef4444',
    },
    {
      icon: AlertTriangle,
      title: 'No patient history on hand',
      desc: "Paper records go missing and there's no quick way to see previous prescriptions without digging through folders.",
      color: '#eab308',
    },
  ]

  return (
    <section className="relative py-24 sm:py-32" style={{ background: 'linear-gradient(180deg,#f8fcff 0%,#ffffff 100%)' }}>
      <div className="mx-auto max-w-6xl px-5 lg:px-10">
        <Reveal className="mx-auto mb-14 max-w-2xl text-center">
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#3a7bd5]">
            The Problem
          </span>
          <h2 className="mt-4 text-[clamp(1.8rem,3.8vw,2.8rem)] font-extrabold leading-[1.1] tracking-[-0.03em] text-[#1d2d50]">
            Still relying on paper prescriptions?
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-slate-500">
            Paper-based workflows cost you time, accuracy, and patient trust every single day.
          </p>
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-3">
          {pains.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.1} y={30}>
              <div className="relative overflow-hidden rounded-[22px] border border-slate-100 bg-white p-7 shadow-[0_4px_20px_rgba(29,45,80,0.05)] transition-all duration-300 hover:shadow-[0_12px_36px_rgba(29,45,80,0.08)]">
                <div
                  className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-[14px]"
                  style={{ background: p.color + '12' }}
                >
                  <p.icon size={20} style={{ color: p.color }} />
                </div>
                <h3 className="text-[15px] font-bold text-[#1d2d50]">{p.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-slate-500">{p.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Transition nudge */}
        <Reveal className="mt-10 text-center" delay={0.32}>
          <div className="inline-flex items-center gap-3 rounded-full border border-[#3a7bd5]/20 bg-[#3a7bd5]/5 px-6 py-3">
            <span className="text-[13px] font-semibold text-[#3a7bd5]">
              JustGP-Rx solves all of this →
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   features grid
   ───────────────────────────────────────────── */

const FEATURES = [
  {
    icon: FileText,
    title: 'Structured Digital Prescriptions',
    desc: 'Write prescriptions for tablets, capsules, syrups, injections, and more — all neatly structured with dosage, timing, and patient instructions.',
    badge: 'Core',
    color: '#3a7bd5',
  },
  {
    icon: Search,
    title: 'Smart Medicine Autocomplete',
    desc: 'Instantly search medicines by brand or generic name via Redis-powered autocomplete. Eliminate spelling errors and manual lookups.',
    badge: 'AI-Powered',
    color: '#26b4ff',
  },
  {
    icon: Download,
    title: 'Clinic-Branded PDF Export',
    desc: 'Generate professional PDFs with your clinic logo and digital signature in under a second. Download, print, or share instantly.',
    badge: 'Popular',
    color: '#6ee7f8',
  },
  {
    icon: Users,
    title: 'Complete Patient Records',
    desc: 'Register patients, view full prescription history, track vitals, and manage follow-ups — all within a single clean patient profile.',
    badge: 'Essential',
    color: '#3a7bd5',
  },
  {
    icon: CalendarDays,
    title: 'Google Calendar Sync',
    desc: 'Push patient appointments and follow-up reminders straight to Google Calendar. Never miss a scheduled review again.',
    badge: 'Integration',
    color: '#26b4ff',
  },
  {
    icon: ShieldCheck,
    title: 'Enterprise-Grade Security',
    desc: 'JWT auth, multi-factor OTP, and role-based access for doctors and receptionists. Your patient data stays private and protected.',
    badge: 'Secure',
    color: '#6ee7f8',
  },
]

function Features() {
  return (
    <section id="features" className="relative bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-10">
        <Reveal className="mx-auto mb-16 max-w-2xl text-center">
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#3a7bd5]">
            Features
          </span>
          <h2 className="mt-4 text-[clamp(1.8rem,3.8vw,2.8rem)] font-extrabold leading-[1.1] tracking-[-0.03em] text-[#1d2d50]">
            Everything a modern clinic needs
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-slate-500">
            From the first prescription to the final follow-up — one platform covers your entire clinical workflow.
          </p>
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.07} y={30}>
              <div className="group relative flex h-full flex-col overflow-hidden rounded-[22px] border border-slate-100 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-slate-200 hover:shadow-[0_20px_50px_rgba(29,45,80,0.08)]">
                {/* top accent bar */}
                <span
                  className="absolute left-7 top-0 h-0.5 w-10 rounded-full transition-all duration-300 group-hover:w-20"
                  style={{ background: f.color }}
                />

                <div className="mb-5 flex items-start justify-between">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-[14px] transition-transform duration-300 group-hover:scale-105"
                    style={{ background: f.color + '15' }}
                  >
                    <f.icon size={20} style={{ color: f.color }} />
                  </div>
                  <span
                    className="rounded-full border px-2.5 py-0.5 text-[10px] font-semibold"
                    style={{ borderColor: f.color + '30', color: f.color, background: f.color + '08' }}
                  >
                    {f.badge}
                  </span>
                </div>

                <h3 className="text-[15px] font-bold text-[#1d2d50]">{f.title}</h3>
                <p className="mt-2 flex-1 text-[13px] leading-[1.7] text-slate-500">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   how it works — 3-step numbered flow
   ───────────────────────────────────────────── */

function HowItWorks() {
  const steps = [
    {
      number: '01',
      icon: Stethoscope,
      title: 'Set up your digital clinic',
      desc: 'Sign up in minutes. Enter your clinic name, upload your logo and digital signature. Your professional identity is ready for every prescription you write.',
      tag: 'One-time setup',
      color: '#3a7bd5',
    },
    {
      number: '02',
      icon: FileText,
      title: 'Write smart prescriptions',
      desc: 'Search medicines with intelligent autocomplete, set dosage and timing for tablets, syrups, injections, and more. Structured, clear, and error-free every time.',
      tag: 'Every patient visit',
      color: '#26b4ff',
    },
    {
      number: '03',
      icon: Download,
      title: 'Export and share instantly',
      desc: 'Generate a clinic-branded PDF in under a second. Download, print, or hand it to your patient — all from your browser, any device.',
      tag: 'Instant delivery',
      color: '#6ee7f8',
    },
  ]

  return (
    <section
      id="how-it-works"
      className="relative py-24 sm:py-32"
      style={{ background: 'linear-gradient(180deg,#f8fcff 0%,#eef4fc 100%)' }}
    >
      <div className="mx-auto max-w-6xl px-5 lg:px-10">
        <Reveal className="mx-auto mb-16 max-w-2xl text-center">
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#3a7bd5]">
            How It Works
          </span>
          <h2 className="mt-4 text-[clamp(1.8rem,3.8vw,2.8rem)] font-extrabold leading-[1.1] tracking-[-0.03em] text-[#1d2d50]">
            First prescription in under 5 minutes
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-slate-500">
            No training required. No complex onboarding. Just sign up and start prescribing.
          </p>
        </Reveal>

        <div className="relative grid gap-10 lg:grid-cols-3 lg:gap-6">
          {/* Connector line — desktop only */}
          <div className="pointer-events-none absolute top-[22px] left-[calc(50%/3+40px)] right-[calc(50%/3+40px)] hidden h-px bg-gradient-to-r from-[#3a7bd5]/40 via-[#6ee7f8]/60 to-[#3a7bd5]/40 lg:block" />

          {steps.map((s, i) => (
            <Reveal key={s.number} delay={i * 0.13} y={30}>
              <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                {/* Step bubble */}
                <div className="relative mb-5 flex h-11 w-11 items-center justify-center rounded-full border-2 bg-white text-[13px] font-extrabold tracking-tight text-[#1d2d50] shadow-[0_4px_20px_rgba(29,45,80,0.1)]"
                  style={{ borderColor: s.color + '70' }}
                >
                  {s.number}
                  <div
                    className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full shadow-sm"
                    style={{ background: s.color }}
                  >
                    <s.icon size={10} className="text-white" />
                  </div>
                </div>

                <span
                  className="mb-2 rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
                  style={{ background: s.color + '12', color: s.color }}
                >
                  {s.tag}
                </span>
                <h3 className="text-[16px] font-bold text-[#1d2d50]">{s.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-slate-500">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   testimonials
   ───────────────────────────────────────────── */

const TESTIMONIALS = [
  {
    name: 'Dr. Priya Sharma',
    role: 'General Physician',
    location: 'Mumbai, Maharashtra',
    quote:
      'JustGP-Rx transformed how I write prescriptions. The autocomplete saves me 10 minutes per patient, and the PDF quality is exactly what my patients expect from a professional clinic.',
    initials: 'PS',
    color: '#3a7bd5',
    stars: 5,
  },
  {
    name: 'Dr. Arjun Mehta',
    role: 'Family Medicine Specialist',
    location: 'Pune, Maharashtra',
    quote:
      'Setting up my clinic logo and signature took under 2 minutes. Now my patients comment on how professional the prescriptions look — something I could never achieve with handwritten scripts.',
    initials: 'AM',
    color: '#26b4ff',
    stars: 5,
  },
  {
    name: 'Dr. Kavitha Nair',
    role: 'Pediatrician',
    location: 'Kochi, Kerala',
    quote:
      'The Google Calendar sync for follow-ups is a game changer. I never miss a patient check-in now, and my receptionist loves how easy the patient management section is to use.',
    initials: 'KN',
    color: '#6ee7f8',
    stars: 5,
  },
]

function Testimonials() {
  return (
    <section id="testimonials" className="relative bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-10">
        <Reveal className="mx-auto mb-16 max-w-2xl text-center">
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#3a7bd5]">
            Testimonials
          </span>
          <h2 className="mt-4 text-[clamp(1.8rem,3.8vw,2.8rem)] font-extrabold leading-[1.1] tracking-[-0.03em] text-[#1d2d50]">
            Loved by doctors across India
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-slate-500">
            Hear from the doctors who've made the switch from paper to digital.
          </p>
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.1} y={30}>
              <div className="flex h-full flex-col rounded-[22px] border border-slate-100 bg-white p-7 shadow-[0_4px_20px_rgba(29,45,80,0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(29,45,80,0.09)]">
                {/* Stars */}
                <div className="mb-4 flex gap-0.5">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} size={13} fill="currentColor" className="text-amber-400" />
                  ))}
                </div>
                {/* Quote */}
                <blockquote className="flex-1 text-[14px] leading-[1.75] text-slate-600">
                  "{t.quote}"
                </blockquote>
                {/* Author */}
                <div className="mt-6 flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white"
                    style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}99)` }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-[#1d2d50]">{t.name}</p>
                    <p className="text-[11px] text-slate-400">{t.role} · {t.location}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   faq — accordion
   ───────────────────────────────────────────── */

const FAQ_ITEMS = [
  {
    q: 'Is JustGP-Rx free to use?',
    a: 'Yes! JustGP-Rx offers a free tier with no payment information required. Sign up, set up your clinic profile, and start writing digital prescriptions right away.',
  },
  {
    q: 'How does the medicine autocomplete work?',
    a: 'Our autocomplete is backed by a Redis cache storing thousands of brand and generic medicine names. As you type, it instantly surfaces relevant matches so you can add medicines in seconds — no spelling errors, no manual lookup.',
  },
  {
    q: 'What does the generated PDF look like?',
    a: 'The PDF includes your clinic name, uploaded logo, digital signature, patient details, and all prescribed medicines with dosage, timing, and instructions — cleanly formatted and professional enough to print or share directly.',
  },
  {
    q: 'Can I add a receptionist to help manage my clinic?',
    a: 'Yes. JustGP-Rx supports role-based access control. Create a receptionist account linked to your doctor ID. Receptionists handle patient registration and appointments, while you retain full control of all prescriptions.',
  },
  {
    q: 'How is patient data kept secure?',
    a: "We use JWT authentication, multi-factor OTP verification, and role-based access controls. Each doctor's patients are completely isolated — no other user on the platform can access your records.",
  },
  {
    q: 'Does it work on mobile and tablets?',
    a: 'JustGP-Rx is fully responsive and works on any modern browser — desktop, tablet, or phone. No app download required. Write prescriptions from your phone between patient consultations if needed.',
  },
]

function FAQ() {
  const [open, setOpen] = useState(null)

  return (
    <section id="faq" className="relative bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-5 lg:px-10">
        <Reveal className="mb-12 text-center">
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#3a7bd5]">FAQ</span>
          <h2 className="mt-4 text-[clamp(1.8rem,3.8vw,2.8rem)] font-extrabold leading-[1.1] tracking-[-0.03em] text-[#1d2d50]">
            Questions? Answered.
          </h2>
        </Reveal>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <Reveal key={i} delay={i * 0.04} y={16}>
              <div className="overflow-hidden rounded-[18px] border border-slate-100 bg-white transition-colors hover:border-slate-200">
                <button
                  type="button"
                  onClick={() => setOpen(open === i ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left"
                >
                  <span className="text-[14px] font-semibold text-[#1d2d50]">{item.q}</span>
                  <span className="flex-shrink-0">
                    <motion.span
                      animate={{ rotate: open === i ? 180 : 0 }}
                      transition={{ duration: 0.25, ease }}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-[#f0f6ff] text-[#3a7bd5]"
                      style={{ display: 'flex' }}
                    >
                      <ChevronDown size={13} />
                    </motion.span>
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {open === i && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease }}
                    >
                      <p className="border-t border-slate-50 px-6 pb-5 pt-3 text-[13px] leading-relaxed text-slate-500">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   final cta
   ───────────────────────────────────────────── */

function FinalCTA() {
  return (
    <section
      className="relative overflow-hidden py-24 sm:py-32"
      style={{ background: 'linear-gradient(180deg,#f6fbff 0%,#eef4fc 100%)' }}
    >
      {/* decorative blurs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-20 h-[500px] w-[500px] rounded-full bg-[#3a7bd5]/[0.07] blur-[100px]" />
        <div className="absolute -left-32 bottom-0 h-[400px] w-[400px] rounded-full bg-[#6ee7f8]/[0.06] blur-[100px]" />
      </div>

      <Reveal className="relative z-10 mx-auto max-w-3xl px-5 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-[#3a7bd5]/15 bg-[#3a7bd5]/5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#3a7bd5]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#3a7bd5]" />
          Free to start
        </span>

        <h2 className="mt-6 text-[clamp(2rem,4.5vw,3.5rem)] font-extrabold leading-[1.06] tracking-[-0.04em] text-[#1d2d50]">
          Ready to go paperless?
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-[clamp(0.95rem,1.5vw,1.05rem)] leading-relaxed text-slate-500">
          Join hundreds of doctors already using JustGP-Rx to write better prescriptions and run smarter clinics.
          No credit card. No lock-in. Just a better way to practise medicine.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/signup"
            className="group inline-flex items-center gap-2 rounded-full bg-[#1d2d50] px-9 py-4 text-[15px] font-semibold text-white transition-all hover:bg-[#2a3f6e] hover:-translate-y-0.5 hover:shadow-[0_20px_50px_rgba(29,45,80,0.22)]"
          >
            Start Free Today
            <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-400 transition-colors hover:text-[#3a7bd5]"
          >
            Already have an account? Sign in <ArrowUpRight size={13} />
          </Link>
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-5 text-[12px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={12} className="text-emerald-400" />
            Secure &amp; private
          </span>
          <span className="flex items-center gap-1.5">
            <Zap size={12} className="text-amber-400" />
            5-minute setup
          </span>
          <span className="flex items-center gap-1.5">
            <Globe size={12} className="text-blue-400" />
            Works on any device
          </span>
        </div>
      </Reveal>
    </section>
  )
}

/* ─────────────────────────────────────────────
   footer
   ───────────────────────────────────────────── */

function Footer() {
  const cols = {
    Product: [
      { label: 'Features',     href: '#features',     external: true },
      { label: 'How It Works', href: '#how-it-works', external: true },
      { label: 'FAQ',          href: '#faq',          external: true },
    ],
    Account: [
      { label: 'Sign Up',  href: '/signup', external: false },
      { label: 'Sign In',  href: '/login',  external: false },
    ],
    Legal: [
      { label: 'Privacy Policy', href: '/privacy', external: false },
    ],
  }

  return (
    <footer className="border-t border-slate-100 bg-white py-14">
      <div className="mx-auto max-w-7xl px-5 lg:px-10">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-[2fr,1fr,1fr,1fr]">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <div className="mb-4 flex items-center gap-2.5">
              <img src="/favicon.svg" alt="JustGP-Rx" className="h-6 w-6" />
              <span className="text-[15px] font-bold">
                <span className="text-[#1d2d50]">JustGP</span>
                <span className="text-[#3a7bd5]">-Rx</span>
              </span>
            </div>
            <p className="max-w-[200px] text-[13px] leading-relaxed text-slate-400">
              The digital prescription platform built for modern Indian doctors.
            </p>
            <div className="mt-4 flex gap-2">
              <span className="flex items-center gap-1.5 rounded-full border border-slate-100 bg-[#f8fafc] px-3 py-1.5 text-[11px] font-medium text-slate-500">
                <ShieldCheck size={11} className="text-emerald-500" />
                Secure
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-slate-100 bg-[#f8fafc] px-3 py-1.5 text-[11px] font-medium text-slate-500">
                <Zap size={11} className="text-amber-500" />
                Fast
              </span>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(cols).map(([heading, links]) => (
            <div key={heading}>
              <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {heading}
              </p>
              <ul className="space-y-2">
                {links.map((l) => (
                  <li key={l.label}>
                    {l.external ? (
                      <a href={l.href} className="text-[13px] text-slate-500 transition-colors hover:text-[#1d2d50]">
                        {l.label}
                      </a>
                    ) : (
                      <Link to={l.href} className="text-[13px] text-slate-500 transition-colors hover:text-[#1d2d50]">
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-slate-100 pt-8 sm:flex-row">
          <p className="text-[12px] text-slate-400">
            © {new Date().getFullYear()}{' '}
            <span className="font-semibold text-[#1d2d50]">JustGP</span>
            <span className="font-semibold text-[#3a7bd5]">-Rx</span>
            . All rights reserved.
          </p>
          <p className="text-[11px] text-slate-400">Built with ♥ for Indian doctors</p>
        </div>
      </div>
    </footer>
  )
}

/* ─────────────────────────────────────────────
   page root
   ───────────────────────────────────────────── */

export default function LandingPage() {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark')

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [darkMode])

  return (
    <div className="overflow-x-hidden">
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
      <Hero />
      <TrustBar />
      <PainPoints />
      <Features />
      <HowItWorks />
      <Testimonials />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  )
}