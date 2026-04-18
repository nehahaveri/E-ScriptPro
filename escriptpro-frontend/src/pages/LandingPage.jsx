import { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
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
  Pill,
  Stethoscope,
  CheckCircle2,
  Star,
  Menu,
  X,
  ArrowUpRight,
  Zap,
  Clock,
  BarChart3,
} from 'lucide-react'
import {
  HeroMedicalIllustration,
  ClipboardCheckIllustration,
  PrescriptionPenIllustration,
  MedicalSearchIllustration,
  ChecklistIllustration,
  HospitalBedIllustration,
} from '../components/MedicalIllustrations.jsx'

/* ─────────────────────────────────────────────
   helpers
   ───────────────────────────────────────────── */

const ease = [0.22, 1, 0.36, 1]

function useIsMobile() {
  const [m, setM] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    setM(mq.matches)
    const h = (e) => setM(e.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [])
  return m
}

/* cursor blob — desktop only */
function CursorBlob() {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 30, damping: 28 })
  const sy = useSpring(y, { stiffness: 30, damping: 28 })
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    setIsMobile(mq.matches)
    const handler = (e) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  useEffect(() => {
    if (isMobile) return
    const move = (e) => { x.set(e.clientX - 220); y.set(e.clientY - 220) }
    window.addEventListener('mousemove', move, { passive: true })
    return () => window.removeEventListener('mousemove', move)
  }, [x, y, isMobile])
  if (isMobile) return null
  return (
    <motion.div
      style={{ x: sx, y: sy, willChange: 'transform' }}
      className="pointer-events-none fixed z-0 h-[440px] w-[440px] rounded-full opacity-[0.05] blur-[120px]"
      aria-hidden
    >
      <div className="h-full w-full rounded-full bg-gradient-to-br from-[#3a7bd5] via-[#6ee7f8] to-[#7ce4d8]" />
    </motion.div>
  )
}

/* mouse-tracking parallax wrapper for illustrations */
function MouseParallax({ children, className = '', intensity = 20, rotateIntensity = 5 }) {
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 50, damping: 30 })
  const springY = useSpring(y, { stiffness: 50, damping: 30 })
  const rotateX = useTransform(springY, [-intensity, intensity], [rotateIntensity, -rotateIntensity])
  const rotateY = useTransform(springX, [-intensity, intensity], [-rotateIntensity, rotateIntensity])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const handle = (e) => {
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      x.set(((e.clientX - cx) / (rect.width / 2)) * intensity)
      y.set(((e.clientY - cy) / (rect.height / 2)) * intensity)
    }
    const reset = () => { x.set(0); y.set(0) }
    window.addEventListener('mousemove', handle, { passive: true })
    el.addEventListener('mouseleave', reset)
    return () => { window.removeEventListener('mousemove', handle); el.removeEventListener('mouseleave', reset) }
  }, [x, y, intensity])

  return (
    <motion.div
      ref={ref}
      style={{
        x: springX,
        y: springY,
        rotateX,
        rotateY,
        perspective: 800,
        transformStyle: 'preserve-3d',
        willChange: 'transform',
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* scroll-reveal wrapper */
function Reveal({ children, className = '', id, delay = 0, y = 50 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.15 })
  return (
    <motion.div
      ref={ref}
      id={id}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease }}
      className={className}
      style={{ willChange: 'transform, opacity' }}
    >
      {children}
    </motion.div>
  )
}

function AnimatedCounter({ target, suffix = '', duration = 2.2 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!inView) return
    let s = 0
    const step = target / (duration * 60)
    const id = setInterval(() => {
      s += step
      if (s >= target) { setCount(target); clearInterval(id) }
      else setCount(Math.floor(s))
    }, 1000 / 60)
    return () => clearInterval(id)
  }, [inView, target, duration])
  return <span ref={ref}>{count}{suffix}</span>
}

/* ─────────────────────────────────────────────
   navbar
   ───────────────────────────────────────────── */

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/70 backdrop-blur-2xl shadow-[0_1px_0_rgba(29,45,80,0.06)]'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
        <Link to="/" className="flex items-center gap-2.5">
          <img src="/favicon.svg" alt="" className="h-7 w-7" />
          <span className="text-[15px] font-bold tracking-tight text-[#1d2d50]">
            GP-Script<span className="text-[#3a7bd5]">Pro</span>
          </span>
        </Link>

        <div className="hidden items-center gap-10 md:flex">
          {['Features', 'Story', 'Why Us'].map((t) => (
            <a key={t} href={`#${t.toLowerCase().replace(/\s+/g, '-')}`}
              className="text-[13px] font-medium text-slate-500 transition-colors duration-300 hover:text-[#1d2d50]">{t}</a>
          ))}
          <Link to="/login" className="text-[13px] font-medium text-slate-500 transition-colors hover:text-[#1d2d50]">Login</Link>
          <Link to="/signup"
            className="rounded-full bg-[#1d2d50] px-5 py-2 text-[13px] font-semibold text-white transition-all duration-300 hover:bg-[#2a3f6e] hover:shadow-[0_8px_30px_rgba(29,45,80,0.18)]">
            Get Started
          </Link>
        </div>

        <button onClick={() => setMenuOpen(!menuOpen)} className="rounded-lg p-2 text-slate-600 md:hidden">
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease }}
            className="overflow-hidden border-t border-slate-100/60 bg-white/90 backdrop-blur-2xl md:hidden"
          >
            <div className="flex flex-col gap-5 px-6 py-6">
              {['Features', 'Story', 'Why Us'].map((t) => (
                <a key={t} href={`#${t.toLowerCase().replace(/\s+/g, '-')}`} onClick={() => setMenuOpen(false)}
                  className="text-sm font-medium text-slate-600">{t}</a>
              ))}
              <Link to="/login" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-slate-600">Login</Link>
              <Link to="/signup" onClick={() => setMenuOpen(false)}
                className="rounded-full bg-[#1d2d50] px-5 py-2.5 text-center text-sm font-semibold text-white">Get Started</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

/* ─────────────────────────────────────────────
   hero — cinematic split with 3D image
   ───────────────────────────────────────────── */

function Hero() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const yText = useTransform(scrollYProgress, [0, 1], [0, 120])
  const yImg = useTransform(scrollYProgress, [0, 1], [0, -60])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const imgScale = useTransform(scrollYProgress, [0, 0.4], [1, 1.08])
  const imgRotate = useTransform(scrollYProgress, [0, 1], [0, -3])

  return (
    <section ref={ref} className="relative min-h-[100dvh] overflow-hidden bg-[#f8fcff]">
      {/* ambient blurs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-20 h-[500px] w-[500px] rounded-full bg-[#3a7bd5]/[0.06] blur-[100px]" />
        <div className="absolute -right-20 top-40 h-[400px] w-[400px] rounded-full bg-[#6ee7f8]/[0.07] blur-[90px]" />
        <div className="absolute bottom-0 left-1/3 h-[350px] w-[350px] rounded-full bg-[#7ce4d8]/[0.05] blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[100dvh] max-w-7xl flex-col items-center justify-center gap-12 px-6 pt-24 lg:flex-row lg:gap-16 lg:px-10 lg:pt-0">
        {/* text */}
        <motion.div style={{ y: yText, opacity }} className="flex-1 text-center lg:text-left">
          <motion.span
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease }}
            className="inline-flex items-center gap-2 rounded-full border border-[#1d2d50]/[0.06] bg-white/60 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#3a7bd5] backdrop-blur-lg"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#3a7bd5] animate-pulse" />
            GP-Prescription Platform
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease }}
            className="mt-7 text-[clamp(2.2rem,5.5vw,4.8rem)] font-extrabold leading-[1.04] tracking-[-0.04em] text-[#1d2d50]"
          >
            Prescriptions,
            <br />
            <span className="bg-gradient-to-r from-[#3a7bd5] via-[#26b4ff] to-[#6ee7f8] bg-clip-text text-transparent">
              reimagined.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45, ease }}
            className="mx-auto mt-6 max-w-lg text-[clamp(0.95rem,1.6vw,1.1rem)] leading-[1.75] text-slate-500 lg:mx-0"
          >
            The modern clinic platform that lets you manage patients, write prescriptions, and generate
            professional PDFs — beautifully fast.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6, ease }}
            className="mt-9 flex flex-col items-center gap-4 sm:flex-row lg:justify-start"
          >
            <Link to="/signup"
              className="group inline-flex items-center gap-2.5 rounded-full bg-[#1d2d50] px-8 py-3.5 text-[14px] font-semibold text-white transition-all duration-400 hover:bg-[#2a3f6e] hover:shadow-[0_16px_50px_rgba(29,45,80,0.22)] hover:-translate-y-0.5">
              Start Free
              <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link to="/login"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/50 px-7 py-3.5 text-[14px] font-medium text-slate-600 backdrop-blur-sm transition-all duration-300 hover:border-slate-300 hover:bg-white hover:text-[#1d2d50]">
              Sign In
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.75, ease }}
            className="mt-7 flex items-center justify-center gap-5 text-[11px] text-slate-400 lg:justify-start"
          >
            <span className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-emerald-400" /> No credit card</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-emerald-400" /> 5 min setup</span>
          </motion.div>
        </motion.div>

        {/* hero image */}
        <motion.div
          style={{ y: yImg, scale: imgScale, rotate: imgRotate }}
          initial={{ opacity: 0, x: 60, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.4, ease }}
          className="relative flex-1"
        >
          <div className="relative mx-auto w-full max-w-[480px]">
            {/* glow behind image */}
            <div className="absolute inset-0 -z-10 translate-y-8 scale-90 rounded-[40px] bg-gradient-to-br from-[#3a7bd5]/20 via-[#6ee7f8]/15 to-[#7ce4d8]/10 blur-[50px]" />
            <MouseParallax intensity={18} rotateIntensity={6}>
              <HeroMedicalIllustration className="w-full drop-shadow-[0_30px_60px_rgba(29,45,80,0.15)]" />
            </MouseParallax>
          </div>
        </motion.div>
      </div>

      {/* scroll indicator */}
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-slate-300"
      >
        <ChevronDown size={20} strokeWidth={1.5} />
      </motion.div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white to-transparent" />
    </section>
  )
}

/* ─────────────────────────────────────────────
   features — clean grid with icons
   ───────────────────────────────────────────── */

const features = [
  { icon: FileText, title: 'Digital Prescriptions', desc: 'Tablets, syrups, injections — structured and professional.' },
  { icon: Search, title: 'Medicine Autocomplete', desc: 'Redis-powered search by brand or generic name.' },
  { icon: Pill, title: 'Instant PDF Export', desc: 'Clinic-branded PDFs generated in under a second.' },
  { icon: Users, title: 'Patient Management', desc: 'Doctor-scoped records with complete history.' },
  { icon: CalendarDays, title: 'Calendar Sync', desc: 'Google Calendar integration for follow-ups.' },
  { icon: ShieldCheck, title: 'Enterprise Security', desc: 'JWT, MFA, and role-based access control.' },
]

function Features() {
  return (
    <section
      id="features"
      className="relative py-28 sm:py-36"
      style={{ background: 'linear-gradient(180deg, #f6fbff 0%, #ffffff 50%, #f6fbff 100%)' }}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#3a7bd5]">Features</span>
          <h2 className="mt-4 text-[clamp(1.8rem,4vw,3rem)] font-extrabold leading-[1.1] tracking-[-0.03em] text-[#1d2d50]">
            Everything your clinic needs
          </h2>
        </Reveal>

        <div className="mt-20 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.08} y={30}>
              <div className="group flex h-full flex-col rounded-[24px] border border-slate-100/80 bg-white/60 p-7 backdrop-blur-sm transition-all duration-500 hover:border-slate-200/80 hover:bg-white hover:shadow-[0_20px_60px_rgba(29,45,80,0.06)] hover:-translate-y-1">
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#f0f6ff] text-[#3a7bd5] transition-all duration-300 group-hover:bg-[#1d2d50] group-hover:text-white group-hover:shadow-[0_8px_24px_rgba(29,45,80,0.15)]">
                  <f.icon size={20} strokeWidth={1.8} />
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
   cinematic scroll storytelling
   ───────────────────────────────────────────── */

const chapters = [
  {
    kicker: 'Chapter 01',
    title: 'Create your digital clinic',
    body: 'Sign up in seconds. Upload your clinic logo and digital signature. Your professional identity, ready for every prescription you write.',
    Illustration: ClipboardCheckIllustration,
    icon: Stethoscope,
    color: '#3a7bd5',
  },
  {
    kicker: 'Chapter 02',
    title: 'Smart prescriptions, zero hassle',
    body: 'Write prescriptions with intelligent medicine autocomplete. Tablets, syrups, injections — all structured, searchable, and ready for PDF export in one click.',
    Illustration: PrescriptionPenIllustration,
    icon: FileText,
    color: '#6ee7f8',
  },
  {
    kicker: 'Chapter 03',
    title: 'Manage patients effortlessly',
    body: 'Register and search patients instantly. Complete medical histories, follow-up scheduling, and Google Calendar sync — all in one place.',
    Illustration: MedicalSearchIllustration,
    icon: Users,
    color: '#7ce4d8',
  },
]

function StoryChapter({ chapter, index }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const imgY = useTransform(scrollYProgress, [0, 0.5, 1], [80, 0, -40])
  const imgScale = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [0.85, 1, 1, 0.95])
  const imgRotate = useTransform(scrollYProgress, [0, 0.5, 1], [index % 2 === 0 ? 4 : -4, 0, index % 2 === 0 ? -2 : 2])
  const textY = useTransform(scrollYProgress, [0, 0.5, 1], [60, 0, -30])
  const textOpacity = useTransform(scrollYProgress, [0, 0.25, 0.7, 1], [0, 1, 1, 0.3])
  const isReversed = index % 2 !== 0

  return (
    <div ref={ref} className="relative py-20 sm:py-32">
      <div className={`mx-auto flex max-w-7xl flex-col items-center gap-12 px-6 lg:gap-20 lg:px-10 ${
        isReversed ? 'lg:flex-row-reverse' : 'lg:flex-row'
      }`}>
        {/* text */}
        <motion.div style={{ y: textY, opacity: textOpacity }} className="flex-1 text-center lg:text-left">
          <span className="text-[11px] font-bold uppercase tracking-[0.25em]" style={{ color: chapter.color }}>
            {chapter.kicker}
          </span>
          <h2 className="mt-4 text-[clamp(1.6rem,3.5vw,2.8rem)] font-extrabold leading-[1.1] tracking-[-0.03em] text-[#1d2d50]">
            {chapter.title}
          </h2>
          <p className="mt-5 max-w-md text-[15px] leading-[1.8] text-slate-500 lg:max-w-lg">
            {chapter.body}
          </p>
          <div className="mt-6 flex items-center justify-center gap-2 lg:justify-start">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: chapter.color + '18' }}>
              <chapter.icon size={16} style={{ color: chapter.color }} />
            </div>
            <span className="text-[13px] font-semibold text-[#1d2d50]">
              {index === 0 ? 'One-time setup' : index === 1 ? 'AI-powered workflow' : 'Complete patient care'}
            </span>
          </div>
        </motion.div>

        {/* image */}
        <motion.div
          style={{ y: imgY, scale: imgScale, rotate: imgRotate }}
          className="relative flex-1"
        >
          <div className="relative mx-auto w-full max-w-[420px]">
            {/* cinematic glow */}
            <div
              className="absolute inset-0 -z-10 translate-y-10 scale-[0.85] rounded-[50px] blur-[60px] opacity-30"
              style={{ background: `radial-gradient(circle, ${chapter.color}, transparent 70%)` }}
            />
            <MouseParallax intensity={14} rotateIntensity={5}>
              <chapter.Illustration className="w-full drop-shadow-[0_25px_50px_rgba(29,45,80,0.12)]" />
            </MouseParallax>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function StorySection() {
  return (
    <section id="story" className="relative bg-white">
      {/* section intro */}
      <div className="pb-8 pt-24 sm:pt-32">
        <Reveal className="mx-auto max-w-2xl px-6 text-center">
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#3a7bd5]">The Journey</span>
          <h2 className="mt-4 text-[clamp(1.8rem,4vw,3rem)] font-extrabold leading-[1.1] tracking-[-0.03em] text-[#1d2d50]">
            Your clinic, transformed
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-500">
            Three simple steps from paper chaos to digital clarity.
          </p>
        </Reveal>
      </div>

      {chapters.map((ch, i) => (
        <StoryChapter key={ch.kicker} chapter={ch} index={i} />
      ))}
    </section>
  )
}

/* ─────────────────────────────────────────────
   stats
   ───────────────────────────────────────────── */

const stats = [
  { value: 7, suffix: '', label: 'Microservices', sub: 'Independently deployable', icon: BarChart3 },
  { value: 100, suffix: '%', label: 'Digital', sub: 'Paperless workflow', icon: Zap },
  { value: 1, suffix: 's', label: 'PDF Export', sub: 'Instant generation', icon: Clock },
  { value: 99, suffix: '%', label: 'Uptime', sub: 'Production ready', icon: ShieldCheck },
]

function Stats() {
  return (
    <section id="why-us" className="relative py-28 sm:py-36" style={{ background: 'linear-gradient(180deg, #f6fbff 0%, #eef4fc 100%)' }}>
      <div className="mx-auto max-w-6xl px-6 lg:px-10">
        <Reveal>
          <div
            className="overflow-hidden rounded-[32px] p-10 sm:p-16"
            style={{
              background: 'linear-gradient(135deg, #1d2d50 0%, #2a4a7f 50%, #3a7bd5 100%)',
              boxShadow: '0 40px 100px rgba(29,45,80,0.3)',
            }}
          >
            <div className="text-center">
              <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-extrabold leading-[1.1] tracking-[-0.03em] text-white">
                Built for scale & speed
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-white/50">
                Enterprise-grade microservices architecture that grows with your practice.
              </p>
            </div>

            <div className="mt-14 grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-10">
              {stats.map((s, i) => (
                <Reveal key={s.label} delay={i * 0.12} className="text-center">
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                    <s.icon size={18} className="text-white/70" />
                  </div>
                  <div className="text-[clamp(2rem,5vw,3.2rem)] font-extrabold tracking-tight text-white">
                    <AnimatedCounter target={s.value} suffix={s.suffix} />
                  </div>
                  <div className="mt-1 text-[13px] font-semibold text-white/75">{s.label}</div>
                  <div className="mt-0.5 text-[11px] text-white/35">{s.sub}</div>
                </Reveal>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ───────────────── testimonial ───────────────── */

function Testimonial() {
  return (
    <section className="relative py-28 sm:py-36 bg-white">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <Reveal>
          <div className="flex justify-center gap-1 text-amber-400/80">
            {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
          </div>
          <blockquote className="mt-8 text-[clamp(1.2rem,2.5vw,1.6rem)] font-medium leading-[1.5] tracking-[-0.01em] text-[#1d2d50]">
            "GP-ScriptPro replaced our paper prescriptions overnight. The autocomplete and instant PDF export
            save us over an hour every day."
          </blockquote>
          <div className="mt-8">
            <div className="mx-auto h-12 w-12 rounded-full bg-gradient-to-br from-[#3a7bd5] to-[#6ee7f8] shadow-[0_8px_24px_rgba(58,123,213,0.2)]" />
            <p className="mt-4 text-sm font-semibold text-[#1d2d50]">Dr. Priya Sharma</p>
            <p className="text-[12px] text-slate-400">General Physician · Mumbai</p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   final CTA
   ───────────────────────────────────────────── */

function FinalCTA() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const imgY = useTransform(scrollYProgress, [0, 1], [40, -40])
  const imgRotate = useTransform(scrollYProgress, [0, 1], [3, -3])

  return (
    <section ref={ref} className="relative overflow-hidden py-28 sm:py-36"
      style={{ background: 'linear-gradient(180deg, #f6fbff 0%, #eef4fc 100%)' }}>
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-12 px-6 lg:flex-row lg:gap-20 lg:px-10">
        {/* floating image */}
        <motion.div style={{ y: imgY, rotate: imgRotate }} className="relative flex-1">
          <div className="absolute inset-0 -z-10 translate-y-8 scale-75 rounded-full bg-gradient-to-br from-[#3a7bd5]/15 to-[#6ee7f8]/10 blur-[70px]" />
          <MouseParallax intensity={16} rotateIntensity={5}>
            <HeroMedicalIllustration className="mx-auto w-full max-w-[360px] drop-shadow-[0_30px_60px_rgba(29,45,80,0.12)]" />
          </MouseParallax>
        </motion.div>

        {/* text */}
        <Reveal className="flex-1 text-center lg:text-left">
          <h2 className="text-[clamp(1.8rem,4vw,3.2rem)] font-extrabold leading-[1.08] tracking-[-0.04em] text-[#1d2d50]">
            Ready to modernize
            <br />
            your practice?
          </h2>
          <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-slate-500 lg:mx-0">
            Join doctors who prescribe smarter. Free to start, no lock-in, no credit card.
          </p>
          <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
            <Link to="/signup"
              className="group inline-flex items-center gap-2.5 rounded-full bg-[#1d2d50] px-9 py-4 text-[15px] font-semibold text-white transition-all duration-400 hover:bg-[#2a3f6e] hover:shadow-[0_20px_60px_rgba(29,45,80,0.22)] hover:-translate-y-0.5">
              Get Started — It's Free
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <a href="#features"
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-400 transition-colors duration-300 hover:text-[#3a7bd5]">
              Explore features <ArrowUpRight size={13} />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   footer
   ───────────────────────────────────────────── */

function Footer() {
  return (
    <footer className="border-t border-slate-100/60 bg-white py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row lg:px-10">
        <div className="flex items-center gap-2">
          <img src="/favicon.svg" alt="" className="h-5 w-5 opacity-60" />
          <span className="text-[13px] font-semibold text-slate-400">GP-Script<span className="text-slate-500">Pro</span></span>
        </div>
        <p className="text-[11px] text-slate-400">© {new Date().getFullYear()} GP-ScriptPro. All rights reserved.</p>
        <div className="flex items-center gap-8">
          <a href="#features" className="text-[12px] text-slate-400 transition hover:text-slate-600">Features</a>
          <a href="#story" className="text-[12px] text-slate-400 transition hover:text-slate-600">Story</a>
          <Link to="/login" className="text-[12px] text-slate-400 transition hover:text-slate-600">Login</Link>
        </div>
      </div>
    </footer>
  )
}

/* ─────────────────────────────────────────────
   showcase — large 3D image with parallax
   ───────────────────────────────────────────── */

function Showcase() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [60, -60])
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.92, 1, 0.96])
  const rotate = useTransform(scrollYProgress, [0, 0.5, 1], [2, 0, -1])

  return (
    <section ref={ref} className="relative overflow-hidden bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-6">
        <Reveal className="text-center">
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#3a7bd5]">Platform Preview</span>
          <h2 className="mt-4 text-[clamp(1.8rem,4vw,3rem)] font-extrabold leading-[1.1] tracking-[-0.03em] text-[#1d2d50]">
            Built for the way you work
          </h2>
        </Reveal>

        <motion.div style={{ y, scale, rotate }} className="relative mt-16">
          <div className="absolute inset-0 -z-10 translate-y-12 scale-[0.8] rounded-[60px] bg-gradient-to-br from-[#3a7bd5]/15 via-[#6ee7f8]/10 to-transparent blur-[80px]" />
          <MouseParallax intensity={12} rotateIntensity={4}>
            <ChecklistIllustration className="mx-auto w-full max-w-[600px] drop-shadow-[0_40px_80px_rgba(29,45,80,0.14)]" />
          </MouseParallax>
        </motion.div>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   gallery — floating 3D images ribbon
   ───────────────────────────────────────────── */

function ImageRibbon() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const x = useTransform(scrollYProgress, [0, 1], ['5%', '-15%'])

  const illustrations = [
    HeroMedicalIllustration,
    ClipboardCheckIllustration,
    PrescriptionPenIllustration,
    MedicalSearchIllustration,
    ChecklistIllustration,
    HospitalBedIllustration,
  ]

  return (
    <section ref={ref} className="relative overflow-hidden bg-[#f6fbff] py-20">
      <motion.div style={{ x }} className="flex gap-8 px-8">
        {illustrations.map((Illust, i) => (
          <div key={i} className="relative flex-shrink-0">
            <div className="flex h-[220px] w-[220px] items-center justify-center overflow-hidden rounded-[28px] bg-white/60 p-5 shadow-[0_12px_40px_rgba(29,45,80,0.06)] backdrop-blur-sm sm:h-[280px] sm:w-[280px]">
              <Illust className="h-full w-full" />
            </div>
          </div>
        ))}
      </motion.div>
    </section>
  )
}

/* ─────────────────────────────────────────────
   page
   ───────────────────────────────────────────── */

export default function LandingPage() {
  return (
    <div className="overflow-x-hidden">
      <CursorBlob />
      <Navbar />
      <Hero />
      <StorySection />
      <Features />
      <Showcase />
      <Stats />
      <Testimonial />
      <ImageRibbon />
      <FinalCTA />
      <Footer />
    </div>
  )
}
