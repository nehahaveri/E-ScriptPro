/**
 * Hyper-detailed 3D medical illustrations with depth, highlights, shadows.
 * Each component renders a richly layered SVG matching the reference images.
 */

/* ═══════════════════════════════════════════════
   1. HeroMedicalIllustration
   Medical kit box with stethoscope, pills, heart, syringe — floating upward
   ═══════════════════════════════════════════════ */

export function HeroMedicalIllustration({ className = '' }) {
  return (
    <svg viewBox="0 0 520 560" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="hm-boxBody" x1="150" y1="320" x2="370" y2="480" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" /><stop offset="1" stopColor="#e8edf4" />
        </linearGradient>
        <linearGradient id="hm-boxLid" x1="135" y1="290" x2="385" y2="330" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" /><stop offset="0.6" stopColor="#f4f7fb" /><stop offset="1" stopColor="#e2e8f0" />
        </linearGradient>
        <linearGradient id="hm-boxSide" x1="150" y1="330" x2="150" y2="470" gradientUnits="userSpaceOnUse">
          <stop stopColor="#dce4ee" /><stop offset="1" stopColor="#c8d4e2" />
        </linearGradient>
        <radialGradient id="hm-heartGlow" cx="0.5" cy="0.4" r="0.6">
          <stop stopColor="#ff6b6b" /><stop offset="1" stopColor="#dc2626" />
        </radialGradient>
        <linearGradient id="hm-syringe" x1="0" y1="0" x2="1" y2="0">
          <stop stopColor="#b8c5d6" /><stop offset="0.5" stopColor="#94a3b8" /><stop offset="1" stopColor="#7a8da4" />
        </linearGradient>
        <linearGradient id="hm-stethTube" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#2d3a5c" /><stop offset="1" stopColor="#0f172a" />
        </linearGradient>
        <filter id="hm-shadow" x="-20%" y="-10%" width="140%" height="140%">
          <feDropShadow dx="0" dy="12" stdDeviation="18" floodColor="#1d2d50" floodOpacity="0.12" />
        </filter>
        <filter id="hm-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <linearGradient id="hm-cap1" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#a78bfa" /><stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
        <linearGradient id="hm-cap2" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#67e8f9" /><stop offset="1" stopColor="#06b6d4" />
        </linearGradient>
        <linearGradient id="hm-bottle1" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#60a5fa" /><stop offset="1" stopColor="#2563eb" />
        </linearGradient>
        <linearGradient id="hm-bottle2" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#fbbf24" /><stop offset="1" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id="hm-handle" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#e2e8f0" /><stop offset="1" stopColor="#94a3b8" />
        </linearGradient>
      </defs>

      {/* ground shadow */}
      <ellipse cx="260" cy="520" rx="160" ry="22" fill="#1d2d50" opacity="0.08" />

      {/* ── medical box ── */}
      <g filter="url(#hm-shadow)">
        {/* box left side (3D depth) */}
        <path d="M148 330 L148 468 Q148 480 160 480 L162 480 L162 330 Z" fill="url(#hm-boxSide)" />
        {/* box bottom (3D depth) */}
        <path d="M162 468 Q162 480 174 480 L346 480 Q358 480 358 468 L358 470 L162 470 Z" fill="#bfc9d6" />
        {/* box body */}
        <rect x="162" y="330" width="196" height="140" rx="16" fill="url(#hm-boxBody)" />
        {/* box body border */}
        <rect x="162" y="330" width="196" height="140" rx="16" stroke="#d1d9e6" strokeWidth="1.2" />
        {/* box inner shadow */}
        <rect x="168" y="336" width="184" height="20" rx="8" fill="black" opacity="0.03" />

        {/* lid — slightly open, lifted */}
        <g>
          {/* lid shadow on box */}
          <rect x="162" y="325" width="196" height="8" rx="3" fill="black" opacity="0.04" />
          {/* lid 3D bottom edge */}
          <path d="M138 324 Q138 314 150 310 L370 310 Q382 314 382 324 L382 330 L138 330 Z" fill="#dce4ee" />
          {/* lid top face */}
          <path d="M138 318 Q138 300 156 296 L364 296 Q382 300 382 318 L382 324 L138 324 Z" fill="url(#hm-boxLid)" />
          <path d="M138 318 Q138 300 156 296 L364 296 Q382 300 382 318 L382 324 L138 324 Z" stroke="#d1d9e6" strokeWidth="1" />
          {/* lid highlight */}
          <rect x="170" y="300" width="180" height="3" rx="1.5" fill="white" opacity="0.6" />
        </g>

        {/* cross on box */}
        <rect x="244" y="378" width="32" height="10" rx="4" fill="#4a6484" />
        <rect x="255" y="367" width="10" height="32" rx="4" fill="#4a6484" />
        {/* cross highlight */}
        <rect x="244" y="378" width="32" height="3" rx="1.5" fill="white" opacity="0.15" />
        <rect x="255" y="367" width="3" height="32" rx="1.5" fill="white" opacity="0.15" />

        {/* handle */}
        <path d="M230 296 V275 Q230 260 245 260 L275 260 Q290 260 290 275 V296" stroke="url(#hm-handle)" strokeWidth="6" fill="none" strokeLinecap="round" />
        {/* handle highlight */}
        <path d="M234 296 V278 Q234 265 247 265 L273 265 Q286 265 286 278 V296" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.4" />
      </g>

      {/* ── stethoscope ── */}
      <g>
        {/* tube */}
        <path d="M290 310 Q295 270 320 240 Q340 215 330 190 Q320 170 300 180 Q285 190 290 210 Q295 230 305 220" stroke="url(#hm-stethTube)" strokeWidth="5.5" fill="none" strokeLinecap="round" />
        {/* tube highlight */}
        <path d="M292 310 Q297 272 321 243 Q339 218 330 195" stroke="white" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.15" />
        {/* chest piece outer */}
        <circle cx="298" cy="218" r="18" fill="#1d2d50" />
        <circle cx="298" cy="218" r="18" fill="url(#hm-stethTube)" />
        {/* chest piece ring */}
        <circle cx="298" cy="218" r="13" fill="none" stroke="#475569" strokeWidth="2" />
        {/* chest piece center */}
        <circle cx="298" cy="218" r="7" fill="#64748b" />
        <circle cx="298" cy="218" r="3.5" fill="#94a3b8" />
        {/* chest piece highlight */}
        <circle cx="294" cy="213" r="4" fill="white" opacity="0.2" />
        {/* earpieces */}
        <circle cx="305" cy="178" r="6" fill="#f9a8c0" />
        <circle cx="305" cy="178" r="3" fill="#fecdd3" />
        <circle cx="336" cy="208" r="6" fill="#f9a8c0" />
        <circle cx="336" cy="208" r="3" fill="#fecdd3" />
        {/* earpiece connector */}
        <path d="M310 180 Q322 175 332 192 Q338 200 338 206" stroke="#475569" strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>

      {/* ── heart ── */}
      <g transform="translate(365, 230)" filter="url(#hm-glow)">
        <path d="M0 16 C0-4 18-6 18 8 C18-6 36-4 36 16 C36 34 18 46 18 46 C18 46 0 34 0 16Z" fill="url(#hm-heartGlow)" />
        {/* heart highlight */}
        <path d="M7 10 Q10 2 18 8" stroke="white" strokeWidth="2" fill="none" opacity="0.45" strokeLinecap="round" />
        {/* heart shadow */}
        <ellipse cx="18" cy="48" rx="12" ry="3" fill="#dc2626" opacity="0.2" />
        {/* heartbeat line */}
        <path d="M-14 22 L-2 22 L2 10 L8 34 L14 18 L18 26 L22 22 L50 22" stroke="#ef4444" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.35" />
      </g>

      {/* ── syringe ── */}
      <g transform="translate(355, 300) rotate(-38)">
        {/* barrel */}
        <rect x="0" y="-6" width="65" height="12" rx="3" fill="url(#hm-syringe)" />
        {/* barrel highlight */}
        <rect x="4" y="-5" width="56" height="3" rx="1.5" fill="white" opacity="0.25" />
        {/* barrel tick marks */}
        {[12, 22, 32, 42, 52].map(x => <rect key={x} x={x} y="-5" width="1" height="10" fill="#64748b" opacity="0.2" />)}
        {/* flange */}
        <rect x="65" y="-8" width="5" height="16" rx="1.5" fill="#64748b" />
        {/* needle hub */}
        <rect x="70" y="-3.5" width="12" height="7" rx="2" fill="#94a3b8" />
        {/* needle */}
        <rect x="82" y="-1" width="22" height="2" rx="0.5" fill="#cbd5e1" />
        <circle cx="104" cy="0" r="1" fill="#94a3b8" />
        {/* plunger rod */}
        <rect x="-35" y="-3" width="35" height="6" rx="2" fill="#cbd5e1" />
        {/* plunger handle */}
        <rect x="-42" y="-7" width="8" height="14" rx="3" fill="#94a3b8" />
        {/* plunger handle highlight */}
        <rect x="-41" y="-6" width="2" height="12" rx="1" fill="white" opacity="0.3" />
        {/* liquid */}
        <rect x="14" y="-3.5" width="30" height="7" rx="2" fill="#7dd3fc" opacity="0.45" />
      </g>

      {/* ── capsule 1 (purple) ── */}
      <g transform="translate(110, 240) rotate(-22)">
        <rect x="0" y="0" width="40" height="18" rx="9" fill="url(#hm-cap1)" />
        <rect x="20" y="0" width="20" height="18" rx="9" fill="#c4b5fd" />
        {/* seam */}
        <rect x="19" y="0" width="2" height="18" fill="#7c3aed" opacity="0.15" />
        {/* highlight */}
        <rect x="4" y="2" width="14" height="4" rx="2" fill="white" opacity="0.35" />
        <rect x="24" y="2" width="12" height="3" rx="1.5" fill="white" opacity="0.25" />
        {/* shadow */}
        <ellipse cx="20" cy="22" rx="14" ry="3" fill="#7c3aed" opacity="0.1" />
      </g>

      {/* ── capsule 2 (cyan) ── */}
      <g transform="translate(160, 210) rotate(18)">
        <rect x="0" y="0" width="34" height="16" rx="8" fill="url(#hm-cap2)" />
        <rect x="17" y="0" width="17" height="16" rx="8" fill="#a5f3fc" />
        <rect x="16" y="0" width="2" height="16" fill="#06b6d4" opacity="0.12" />
        <rect x="3" y="2" width="11" height="3" rx="1.5" fill="white" opacity="0.35" />
        <ellipse cx="17" cy="20" rx="12" ry="2.5" fill="#06b6d4" opacity="0.1" />
      </g>

      {/* ── round pill (pink) ── */}
      <g>
        <circle cx="135" cy="290" r="12" fill="#fda4af" />
        <circle cx="135" cy="290" r="7" fill="#fecdd3" />
        <circle cx="132" cy="286" r="3.5" fill="white" opacity="0.35" />
        <ellipse cx="135" cy="304" rx="8" ry="2" fill="#f43f5e" opacity="0.08" />
      </g>

      {/* ── round pill (green) ── */}
      <g>
        <circle cx="175" cy="270" r="9" fill="#86efac" />
        <circle cx="175" cy="270" r="5" fill="#bbf7d0" />
        <circle cx="173" cy="267" r="2.5" fill="white" opacity="0.4" />
        <ellipse cx="175" cy="281" rx="6" ry="1.5" fill="#22c55e" opacity="0.08" />
      </g>

      {/* ── pill bottle 1 (blue) ── */}
      <g transform="translate(375, 160)">
        <rect x="0" y="14" width="28" height="40" rx="5" fill="url(#hm-bottle1)" />
        {/* cap */}
        <rect x="-2" y="6" width="32" height="14" rx="4" fill="#1e40af" />
        <rect x="-2" y="6" width="32" height="4" rx="2" fill="white" opacity="0.1" />
        {/* label */}
        <rect x="4" y="26" width="20" height="3" rx="1.5" fill="white" opacity="0.45" />
        <rect x="6" y="32" width="16" height="2" rx="1" fill="white" opacity="0.25" />
        {/* highlight */}
        <rect x="2" y="16" width="4" height="34" rx="2" fill="white" opacity="0.12" />
        {/* shadow */}
        <ellipse cx="14" cy="58" rx="10" ry="2.5" fill="#2563eb" opacity="0.12" />
      </g>

      {/* ── pill bottle 2 (amber) ── */}
      <g transform="translate(410, 175)">
        <rect x="0" y="12" width="24" height="34" rx="4" fill="url(#hm-bottle2)" />
        <rect x="-1" y="6" width="26" height="12" rx="3" fill="#92400e" />
        <rect x="-1" y="6" width="26" height="3" rx="1.5" fill="white" opacity="0.08" />
        <rect x="3" y="24" width="18" height="2.5" rx="1" fill="white" opacity="0.35" />
        <rect x="2" y="14" width="3" height="28" rx="1.5" fill="white" opacity="0.1" />
        <ellipse cx="12" cy="50" rx="8" ry="2" fill="#d97706" opacity="0.1" />
      </g>

      {/* ── small floating pill (orange, top right) ── */}
      <g>
        <circle cx="420" cy="140" r="7" fill="#fb923c" />
        <circle cx="418" cy="138" r="2" fill="white" opacity="0.35" />
      </g>
    </svg>
  )
}

/* ═══════════════════════════════════════════════
   2. ClipboardCheckIllustration
   Blue clipboard with medical cross, yellow clip, text lines
   ═══════════════════════════════════════════════ */

export function ClipboardCheckIllustration({ className = '' }) {
  return (
    <svg viewBox="0 0 400 460" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="cc-frame" x1="80" y1="60" x2="320" y2="400" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7ec4f8" /><stop offset="1" stopColor="#3b8dd9" />
        </linearGradient>
        <linearGradient id="cc-frameSide" x1="80" y1="60" x2="80" y2="400" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5a9fd4" /><stop offset="1" stopColor="#2d78b8" />
        </linearGradient>
        <linearGradient id="cc-page" x1="100" y1="98" x2="300" y2="370" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" /><stop offset="1" stopColor="#f6f8fb" />
        </linearGradient>
        <linearGradient id="cc-clip" x1="155" y1="38" x2="245" y2="80" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fde68a" /><stop offset="0.5" stopColor="#fbbf24" /><stop offset="1" stopColor="#f59e0b" />
        </linearGradient>
        <radialGradient id="cc-cross" cx="0.4" cy="0.35" r="0.65">
          <stop stopColor="#f87171" /><stop offset="1" stopColor="#b91c1c" />
        </radialGradient>
        <filter id="cc-cardShadow" x="-15%" y="-5%" width="130%" height="130%">
          <feDropShadow dx="0" dy="14" stdDeviation="20" floodColor="#1d4e89" floodOpacity="0.14" />
        </filter>
        <filter id="cc-crossGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <ellipse cx="200" cy="435" rx="120" ry="15" fill="#1d2d50" opacity="0.07" />

      <g filter="url(#cc-cardShadow)">
        {/* left 3D edge */}
        <path d="M80 88 Q68 88 68 104 L68 362 Q68 378 80 382 L80 60 Z" fill="url(#cc-frameSide)" />
        {/* bottom 3D edge */}
        <path d="M80 382 Q80 396 96 396 L304 396 Q320 396 320 382 L320 388 Q320 402 304 402 L96 402 Q80 402 80 388 Z" fill="#2874ab" />
        {/* main frame */}
        <rect x="80" y="60" width="240" height="328" rx="26" fill="url(#cc-frame)" />
        {/* frame highlight */}
        <rect x="86" y="64" width="228" height="6" rx="3" fill="white" opacity="0.2" />
        <rect x="84" y="64" width="6" height="316" rx="3" fill="white" opacity="0.08" />

        {/* inner white page */}
        <rect x="102" y="98" width="196" height="272" rx="16" fill="url(#cc-page)" />
        <rect x="102" y="98" width="196" height="272" rx="16" stroke="#e2e8f0" strokeWidth="0.8" />
        {/* page inner shadow */}
        <rect x="102" y="98" width="196" height="14" rx="8" fill="black" opacity="0.02" />
      </g>

      {/* clip */}
      <g>
        {/* clip shadow */}
        <ellipse cx="200" cy="82" rx="40" ry="4" fill="#b8860b" opacity="0.12" />
        {/* clip body */}
        <rect x="155" y="38" width="90" height="38" rx="12" fill="url(#cc-clip)" />
        {/* clip 3D bottom edge */}
        <rect x="155" y="70" width="90" height="6" rx="3" fill="#d97706" opacity="0.35" />
        {/* clip highlight */}
        <rect x="162" y="42" width="76" height="5" rx="2.5" fill="white" opacity="0.45" />
        {/* clip hole */}
        <circle cx="200" cy="55" r="7" fill="#d4912a" />
        <circle cx="200" cy="55" r="4.5" fill="#c27e1a" />
        <circle cx="198" cy="53" r="2" fill="white" opacity="0.2" />
      </g>

      {/* medical cross in circle */}
      <g filter="url(#cc-crossGlow)">
        <circle cx="200" cy="185" r="42" fill="url(#cc-cross)" />
        {/* cross highlight ring */}
        <circle cx="200" cy="185" r="38" fill="none" stroke="white" strokeWidth="1" opacity="0.12" />
        {/* cross */}
        <rect x="187" y="162" width="26" height="46" rx="5" fill="white" />
        <rect x="177" y="172" width="46" height="26" rx="5" fill="white" />
        {/* cross inner shadow */}
        <rect x="190" y="165" width="20" height="3" rx="1.5" fill="#ef4444" opacity="0.08" />
        {/* highlight on circle */}
        <path d="M172 168 Q180 155 200 155 Q210 155 218 160" stroke="white" strokeWidth="2" fill="none" opacity="0.2" strokeLinecap="round" />
      </g>

      {/* text lines with subtle variety */}
      <rect x="130" y="252" width="140" height="10" rx="5" fill="#6ba3e8" opacity="0.3" />
      <rect x="130" y="272" width="100" height="10" rx="5" fill="#6ba3e8" opacity="0.22" />
      <rect x="130" y="292" width="124" height="10" rx="5" fill="#6ba3e8" opacity="0.16" />
      <rect x="130" y="312" width="80" height="10" rx="5" fill="#6ba3e8" opacity="0.12" />
      {/* line dots */}
      <circle cx="120" cy="257" r="3" fill="#6ba3e8" opacity="0.25" />
      <circle cx="120" cy="277" r="3" fill="#6ba3e8" opacity="0.2" />
      <circle cx="120" cy="297" r="3" fill="#6ba3e8" opacity="0.15" />
      <circle cx="120" cy="317" r="3" fill="#6ba3e8" opacity="0.1" />
    </svg>
  )
}

/* ═══════════════════════════════════════════════
   3. PrescriptionPenIllustration
   Pink/purple clipboard tilted with navy pen overlapping
   ═══════════════════════════════════════════════ */

export function PrescriptionPenIllustration({ className = '' }) {
  return (
    <svg viewBox="0 0 460 520" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="pp-outer" x1="80" y1="50" x2="330" y2="420" gradientUnits="userSpaceOnUse">
          <stop stopColor="#a494d6" /><stop offset="1" stopColor="#6b5eac" />
        </linearGradient>
        <linearGradient id="pp-inner" x1="90" y1="68" x2="310" y2="400" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f0b0b0" /><stop offset="1" stopColor="#d88888" />
        </linearGradient>
        <linearGradient id="pp-page" x1="105" y1="100" x2="300" y2="390" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" /><stop offset="1" stopColor="#fdf8f6" />
        </linearGradient>
        <linearGradient id="pp-clip" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#efe0cc" /><stop offset="1" stopColor="#c4a880" />
        </linearGradient>
        <radialGradient id="pp-crossCirc" cx="0.4" cy="0.35" r="0.65">
          <stop stopColor="#f0b8b8" /><stop offset="1" stopColor="#c87070" />
        </radialGradient>
        <linearGradient id="pp-penBody" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#5a6d9a" /><stop offset="0.4" stopColor="#3d4f7c" /><stop offset="1" stopColor="#263352" />
        </linearGradient>
        <filter id="pp-shadow" x="-15%" y="-5%" width="130%" height="130%">
          <feDropShadow dx="0" dy="12" stdDeviation="18" floodColor="#4a3580" floodOpacity="0.15" />
        </filter>
        <filter id="pp-penShadow" x="-10%" y="-20%" width="120%" height="140%">
          <feDropShadow dx="4" dy="8" stdDeviation="10" floodColor="#1d2d50" floodOpacity="0.2" />
        </filter>
      </defs>

      <ellipse cx="220" cy="498" rx="140" ry="14" fill="#1d2d50" opacity="0.06" />

      {/* clipboard (tilted) */}
      <g transform="rotate(-5, 210, 260)" filter="url(#pp-shadow)">
        {/* outer frame */}
        <rect x="82" y="55" width="246" height="356" rx="24" fill="url(#pp-outer)" />
        <rect x="86" y="59" width="238" height="6" rx="3" fill="white" opacity="0.15" />

        {/* pink inner border */}
        <rect x="94" y="70" width="222" height="328" rx="18" fill="url(#pp-inner)" />

        {/* white page */}
        <rect x="108" y="100" width="194" height="282" rx="13" fill="url(#pp-page)" />
        <rect x="108" y="100" width="194" height="282" rx="13" stroke="#f0e0e0" strokeWidth="0.6" />

        {/* clip ring */}
        <path d="M175 50 Q175 30 190 25 L220 25 Q235 25 235 50" stroke="#c4b5a0" strokeWidth="5.5" fill="none" strokeLinecap="round" />
        <path d="M178 50 Q178 34 192 29" stroke="white" strokeWidth="1.2" fill="none" opacity="0.25" strokeLinecap="round" />
        {/* clip body */}
        <rect x="160" y="44" width="90" height="34" rx="9" fill="url(#pp-clip)" />
        <rect x="160" y="72" width="90" height="5" rx="2.5" fill="#a89060" opacity="0.25" />
        <rect x="167" y="48" width="76" height="4" rx="2" fill="white" opacity="0.3" />

        {/* cross circle */}
        <circle cx="174" cy="164" r="30" fill="url(#pp-crossCirc)" />
        <circle cx="174" cy="164" r="26" fill="none" stroke="white" strokeWidth="0.8" opacity="0.15" />
        <rect x="165" y="147" width="18" height="34" rx="4" fill="#f5d8c8" />
        <rect x="157" y="155" width="34" height="18" rx="4" fill="#f5d8c8" />
        <path d="M152 150 Q162 140 180 142" stroke="white" strokeWidth="1.5" fill="none" opacity="0.15" strokeLinecap="round" />

        {/* text lines — detailed with varying opacities and widths */}
        <rect x="216" y="148" width="72" height="7" rx="3.5" fill="#8b7eb8" opacity="0.3" />
        <rect x="216" y="162" width="52" height="7" rx="3.5" fill="#8b7eb8" opacity="0.22" />
        <rect x="216" y="176" width="64" height="7" rx="3.5" fill="#8b7eb8" opacity="0.18" />

        {/* separator line */}
        <rect x="125" y="198" width="160" height="1" rx="0.5" fill="#d4b8b8" opacity="0.3" />

        <rect x="125" y="214" width="148" height="7" rx="3.5" fill="#d4a0a0" opacity="0.28" />
        <rect x="125" y="230" width="108" height="7" rx="3.5" fill="#d4a0a0" opacity="0.22" />
        <rect x="125" y="246" width="130" height="7" rx="3.5" fill="#d4a0a0" opacity="0.18" />

        <rect x="125" y="272" width="148" height="7" rx="3.5" fill="#8b7eb8" opacity="0.16" />
        <rect x="125" y="288" width="96" height="7" rx="3.5" fill="#8b7eb8" opacity="0.12" />
        <rect x="125" y="304" width="120" height="7" rx="3.5" fill="#8b7eb8" opacity="0.1" />
        <rect x="125" y="320" width="80" height="7" rx="3.5" fill="#d4a0a0" opacity="0.1" />
        <rect x="125" y="336" width="100" height="7" rx="3.5" fill="#d4a0a0" opacity="0.08" />
      </g>

      {/* pen — overlapping clipboard */}
      <g filter="url(#pp-penShadow)">
        <g transform="translate(295, 155) rotate(30)">
          {/* pen body */}
          <rect x="0" y="-11" width="168" height="22" rx="4.5" fill="url(#pp-penBody)" />
          {/* body highlight */}
          <rect x="8" y="-9.5" width="130" height="4" rx="2" fill="white" opacity="0.1" />
          {/* grip section */}
          <rect x="132" y="-12" width="10" height="24" rx="2" fill="#e87070" />
          <rect x="134" y="-11" width="2" height="22" rx="1" fill="white" opacity="0.15" />
          {/* tip */}
          <path d="M-2 -8 L-22 0 L-2 8 Z" fill="#475569" />
          <path d="M-2 -4 L-12 0 L-2 4 Z" fill="#334155" />
          <circle cx="-22" cy="0" r="1" fill="#94a3b8" />
          {/* cap */}
          <rect x="158" y="-13" width="24" height="26" rx="6" fill="#1e2a48" />
          <rect x="160" y="-11" width="3" height="22" rx="1.5" fill="white" opacity="0.08" />
        </g>
      </g>
    </svg>
  )
}

/* ═══════════════════════════════════════════════
   4. MedicalSearchIllustration
   Clipboard + magnifying glass + stethoscope + floating icon cards
   ═══════════════════════════════════════════════ */

export function MedicalSearchIllustration({ className = '' }) {
  return (
    <svg viewBox="0 0 500 480" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="ms-frame" x1="140" y1="100" x2="360" y2="410" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7ec4f8" /><stop offset="1" stopColor="#3b8dd9" />
        </linearGradient>
        <linearGradient id="ms-magRing" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#fde68a" /><stop offset="1" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id="ms-magHandle" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#f5a623" /><stop offset="0.5" stopColor="#d4882a" /><stop offset="1" stopColor="#a56818" />
        </linearGradient>
        <radialGradient id="ms-cross" cx="0.4" cy="0.35" r="0.65">
          <stop stopColor="#f87171" /><stop offset="1" stopColor="#b91c1c" />
        </radialGradient>
        <filter id="ms-shadow" x="-15%" y="-5%" width="130%" height="130%">
          <feDropShadow dx="0" dy="12" stdDeviation="18" floodColor="#1d4e89" floodOpacity="0.14" />
        </filter>
        <filter id="ms-cardFloat" x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#1d2d50" floodOpacity="0.12" />
        </filter>
        <filter id="ms-magShadow" x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="2" dy="6" stdDeviation="8" floodColor="#d97706" floodOpacity="0.18" />
        </filter>
      </defs>

      <ellipse cx="250" cy="458" rx="150" ry="16" fill="#1d2d50" opacity="0.06" />

      {/* ECG heartbeat line */}
      <path d="M30 90 L130 90 L148 58 L166 122 L184 66 L202 108 L212 90 L470 90" stroke="#ef6b5e" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
      {/* ECG glow */}
      <path d="M148 58 L166 122 L184 66 L202 108" stroke="#ef6b5e" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.08" />

      {/* stethoscope draped on top */}
      <path d="M230 56 Q208 68 200 88 L198 100" stroke="#f0a0b8" strokeWidth="4.5" fill="none" strokeLinecap="round" />
      <path d="M270 56 Q292 68 300 88 L302 100" stroke="#f0a0b8" strokeWidth="4.5" fill="none" strokeLinecap="round" />
      <circle cx="198" cy="103" r="6" fill="#f9a8c0" /><circle cx="198" cy="103" r="3" fill="#fecdd3" />
      <circle cx="302" cy="103" r="6" fill="#f9a8c0" /><circle cx="302" cy="103" r="3" fill="#fecdd3" />
      <path d="M230 56 L250 42 L270 56" stroke="#c8bcd4" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M232 54 L250 46" stroke="white" strokeWidth="1" fill="none" opacity="0.2" strokeLinecap="round" />

      {/* clipboard */}
      <g filter="url(#ms-shadow)">
        <rect x="140" y="108" width="220" height="300" rx="22" fill="url(#ms-frame)" />
        <rect x="146" y="112" width="208" height="6" rx="3" fill="white" opacity="0.18" />
        <rect x="158" y="138" width="184" height="252" rx="14" fill="white" />
        <rect x="158" y="138" width="184" height="252" rx="14" stroke="#e2e8f0" strokeWidth="0.5" />
        {/* clip */}
        <rect x="205" y="94" width="90" height="30" rx="8" fill="#94a3b8" />
        <rect x="205" y="94" width="90" height="6" rx="3" fill="white" opacity="0.15" />
        <rect x="205" y="118" width="90" height="4" rx="2" fill="#64748b" opacity="0.2" />
      </g>

      {/* cross circle */}
      <circle cx="250" cy="196" r="32" fill="url(#ms-cross)" />
      <circle cx="250" cy="196" r="28" fill="none" stroke="white" strokeWidth="0.8" opacity="0.12" />
      <rect x="239" y="176" width="22" height="40" rx="4" fill="white" />
      <rect x="230" y="185" width="40" height="22" rx="4" fill="white" />
      <path d="M226 180 Q238 170 254 172" stroke="white" strokeWidth="1.5" fill="none" opacity="0.15" strokeLinecap="round" />

      {/* checklist rows */}
      {[252, 282, 312, 342].map((cy, i) => (
        <g key={i}>
          <rect x="188" y={cy} width="14" height="14" rx="4" fill="#e8edf4" />
          <path d={`M191 ${cy + 7} L195 ${cy + 11} L201 ${cy + 3}`} stroke="#22c55e" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="212" y={cy + 1} width={85 - i * 10} height="5" rx="2.5" fill="#6ba3e8" opacity={0.28 - i * 0.04} />
          <rect x="212" y={cy + 9} width={55 - i * 8} height="4" rx="2" fill="#94a3b8" opacity={0.18 - i * 0.03} />
        </g>
      ))}

      {/* magnifying glass */}
      <g transform="translate(190, 215) rotate(-18)" filter="url(#ms-magShadow)">
        <circle cx="0" cy="0" r="44" stroke="url(#ms-magRing)" strokeWidth="10" fill="white" fillOpacity="0.15" />
        {/* ring highlight */}
        <path d="M-30 -30 Q-10 -44 20 -38" stroke="white" strokeWidth="2.5" fill="none" opacity="0.35" strokeLinecap="round" />
        {/* glass sheen */}
        <ellipse cx="-10" cy="-14" rx="16" ry="10" fill="white" opacity="0.12" transform="rotate(-20)" />
        {/* handle */}
        <rect x="30" y="30" width="16" height="56" rx="7" fill="url(#ms-magHandle)" transform="rotate(45, 30, 30)" />
        <rect x="32" y="32" width="4" height="48" rx="2" fill="white" opacity="0.12" transform="rotate(45, 30, 30)" />
      </g>

      {/* floating icon cards */}
      {/* exclamation card */}
      <g transform="translate(52, 210)" filter="url(#ms-cardFloat)">
        <rect width="52" height="52" rx="14" fill="#7ec4f8" />
        <rect width="52" height="6" rx="3" fill="white" opacity="0.15" />
        <rect x="22" y="12" width="8" height="22" rx="4" fill="white" opacity="0.9" />
        <circle cx="26" cy="40" r="4" fill="white" opacity="0.9" />
      </g>

      {/* question card */}
      <g transform="translate(395, 185)" filter="url(#ms-cardFloat)">
        <rect width="52" height="52" rx="14" fill="#4a90d9" />
        <rect width="52" height="6" rx="3" fill="white" opacity="0.12" />
        <text x="26" y="38" textAnchor="middle" fontSize="26" fontWeight="bold" fill="#fbbf24" fontFamily="sans-serif">?</text>
      </g>

      {/* heart card */}
      <g transform="translate(405, 296)" filter="url(#ms-cardFloat)">
        <rect width="52" height="52" rx="14" fill="#fbbf24" />
        <rect width="52" height="6" rx="3" fill="white" opacity="0.15" />
        <path d="M16 24 C16 16 26 16 26 22 C26 16 36 16 36 24 C36 32 26 38 26 38 C26 38 16 32 16 24Z" fill="#ef4444" />
        <path d="M20 20 Q24 16 28 20" stroke="white" strokeWidth="1.2" fill="none" opacity="0.3" strokeLinecap="round" />
      </g>

      {/* calculator card */}
      <g transform="translate(58, 316)" filter="url(#ms-cardFloat)">
        <rect width="52" height="62" rx="12" fill="#c4b5fd" />
        <rect width="52" height="6" rx="3" fill="white" opacity="0.12" />
        <rect x="8" y="10" width="36" height="16" rx="5" fill="#a78bfa" />
        <rect x="10" y="12" width="32" height="3" rx="1.5" fill="white" opacity="0.2" />
        {[0, 1, 2, 3, 4, 5].map(i => (
          <g key={i}>
            <rect x={10 + (i % 3) * 13} y={32 + Math.floor(i / 3) * 13} width="9" height="9" rx="2.5" fill="white" opacity="0.5" />
            <rect x={10 + (i % 3) * 13} y={32 + Math.floor(i / 3) * 13} width="9" height="2.5" rx="1.25" fill="white" opacity="0.15" />
          </g>
        ))}
      </g>
    </svg>
  )
}

/* ═══════════════════════════════════════════════
   5. ChecklistIllustration
   Orange clipboard with blue checkmarks and pencil
   ═══════════════════════════════════════════════ */

export function ChecklistIllustration({ className = '' }) {
  return (
    <svg viewBox="0 0 420 480" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="cl-board" x1="75" y1="55" x2="310" y2="410" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fcd34d" /><stop offset="1" stopColor="#e58e09" />
        </linearGradient>
        <linearGradient id="cl-page" x1="95" y1="90" x2="290" y2="390" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" /><stop offset="1" stopColor="#fefdf5" />
        </linearGradient>
        <linearGradient id="cl-metal" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#e2e8f0" /><stop offset="0.3" stopColor="#b0bcc9" /><stop offset="0.7" stopColor="#94a3b8" /><stop offset="1" stopColor="#64748b" />
        </linearGradient>
        <linearGradient id="cl-pencil" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#fcd34d" /><stop offset="0.4" stopColor="#f59e0b" /><stop offset="1" stopColor="#b45309" />
        </linearGradient>
        <filter id="cl-shadow" x="-15%" y="-5%" width="130%" height="130%">
          <feDropShadow dx="0" dy="12" stdDeviation="16" floodColor="#92400e" floodOpacity="0.14" />
        </filter>
        <filter id="cl-pencilShadow" x="-10%" y="-20%" width="120%" height="140%">
          <feDropShadow dx="3" dy="6" stdDeviation="8" floodColor="#92400e" floodOpacity="0.18" />
        </filter>
      </defs>

      <ellipse cx="200" cy="456" rx="120" ry="15" fill="#1d2d50" opacity="0.06" />

      <g filter="url(#cl-shadow)">
        {/* board 3D left */}
        <path d="M75 84 Q63 84 63 100 L63 368 Q63 384 75 388 L75 58 Z" fill="#c27a06" opacity="0.4" />
        {/* board 3D bottom */}
        <path d="M75 388 Q75 402 91 402 L289 402 Q305 402 305 388 L305 394 Q305 408 289 408 L91 408 Q75 408 75 394 Z" fill="#a16207" opacity="0.3" />
        {/* board body */}
        <rect x="75" y="58" width="230" height="336" rx="24" fill="url(#cl-board)" />
        <rect x="81" y="62" width="218" height="6" rx="3" fill="white" opacity="0.3" />
        <rect x="79" y="62" width="5" height="325" rx="2.5" fill="white" opacity="0.1" />

        {/* white page */}
        <rect x="95" y="92" width="190" height="286" rx="15" fill="url(#cl-page)" />
        <rect x="95" y="92" width="190" height="286" rx="15" stroke="#f0e0c0" strokeWidth="0.5" />
        {/* page curl */}
        <path d="M285 350 Q285 378 258 378 L285 378 Z" fill="#f5eed8" />
        <path d="M285 350 Q285 378 258 378" stroke="#e0d4b8" strokeWidth="0.5" fill="none" />
      </g>

      {/* metal clip */}
      <g>
        <rect x="155" y="40" width="70" height="34" rx="5" fill="url(#cl-metal)" />
        <rect x="155" y="68" width="70" height="4" rx="2" fill="#475569" opacity="0.2" />
        <rect x="162" y="44" width="56" height="4" rx="2" fill="white" opacity="0.35" />
        <rect x="162" y="52" width="56" height="10" rx="3" fill="#64748b" opacity="0.15" />
        {/* clip screws */}
        <circle cx="165" cy="57" r="2.5" fill="#64748b" opacity="0.3" />
        <circle cx="215" cy="57" r="2.5" fill="#64748b" opacity="0.3" />
      </g>

      {/* checklist rows */}
      {[128, 186, 244, 302].map((cy, i) => (
        <g key={i}>
          {/* checkbox */}
          <rect x="120" y={cy} width="30" height="30" rx="8" fill="#0f172a" />
          <rect x="120" y={cy} width="30" height="6" rx="3" fill="white" opacity="0.06" />
          {/* checkmark */}
          <path d={`M127 ${cy + 15} L134 ${cy + 22} L145 ${cy + 9}`} stroke="#3b82f6" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          {/* check glow */}
          <path d={`M127 ${cy + 15} L134 ${cy + 22} L145 ${cy + 9}`} stroke="#60a5fa" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.15" />
          {/* text bars */}
          <rect x="164" y={cy + 4} width={95 - i * 10} height="10" rx="5" fill="#94a3b8" opacity={0.42 - i * 0.06} />
          <rect x="164" y={cy + 19} width={65 - i * 8} height="7" rx="3.5" fill="#cbd5e1" opacity={0.3 - i * 0.05} />
        </g>
      ))}

      {/* pencil */}
      <g filter="url(#cl-pencilShadow)">
        <g transform="translate(300, 130) rotate(26)">
          {/* body */}
          <rect x="0" y="-10" width="150" height="20" rx="3.5" fill="url(#cl-pencil)" />
          {/* facet lines (hexagonal pencil look) */}
          <rect x="6" y="-10" width="138" height="4" rx="1" fill="#fbbf24" opacity="0.45" />
          <rect x="6" y="6" width="138" height="2" rx="1" fill="#92400e" opacity="0.15" />
          {/* tip wood */}
          <path d="M0 -8 L-16 0 L0 8 Z" fill="#fde68a" />
          <path d="M0 -4 L-9 0 L0 4 Z" fill="#d4a44a" />
          {/* graphite */}
          <path d="M0 -2 L-5 0 L0 2 Z" fill="#334155" />
          <circle cx="-16" cy="0" r="1" fill="#475569" />
          {/* eraser ferrule */}
          <rect x="144" y="-11" width="8" height="22" rx="1.5" fill="#94a3b8" />
          <rect x="145" y="-10" width="1.5" height="20" rx="0.75" fill="white" opacity="0.2" />
          <rect x="149" y="-10" width="1.5" height="20" rx="0.75" fill="white" opacity="0.1" />
          {/* eraser */}
          <rect x="151" y="-9" width="16" height="18" rx="5" fill="#ef4444" />
          <rect x="153" y="-7" width="3" height="14" rx="1.5" fill="white" opacity="0.15" />
        </g>
      </g>
    </svg>
  )
}

/* ═══════════════════════════════════════════════
   6. HospitalBedIllustration
   Hospital bed with IV stand, pillows, bedside table
   ═══════════════════════════════════════════════ */

export function HospitalBedIllustration({ className = '' }) {
  return (
    <svg viewBox="0 0 440 400" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="hb-frame" x1="70" y1="195" x2="350" y2="300" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7ec4f8" /><stop offset="1" stopColor="#3b8dd9" />
        </linearGradient>
        <linearGradient id="hb-mattress" x1="90" y1="175" x2="330" y2="215" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" /><stop offset="1" stopColor="#edf2f7" />
        </linearGradient>
        <linearGradient id="hb-pillow" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#ffffff" /><stop offset="1" stopColor="#edf2f7" />
        </linearGradient>
        <linearGradient id="hb-blanket" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#dbeafe" /><stop offset="1" stopColor="#bfdbfe" />
        </linearGradient>
        <linearGradient id="hb-base" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#f1f5f9" /><stop offset="1" stopColor="#cbd5e1" />
        </linearGradient>
        <linearGradient id="hb-ivBag" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#eff6ff" /><stop offset="1" stopColor="#bfdbfe" />
        </linearGradient>
        <filter id="hb-shadow" x="-10%" y="-5%" width="120%" height="125%">
          <feDropShadow dx="0" dy="10" stdDeviation="14" floodColor="#1d4e89" floodOpacity="0.1" />
        </filter>
      </defs>

      <ellipse cx="220" cy="375" rx="160" ry="16" fill="#1d2d50" opacity="0.06" />

      <g filter="url(#hb-shadow)">
        {/* base platform */}
        <rect x="55" y="296" width="310" height="28" rx="10" fill="url(#hb-base)" />
        <rect x="55" y="296" width="310" height="5" rx="2.5" fill="white" opacity="0.4" />
        <rect x="55" y="318" width="310" height="5" rx="2.5" fill="#94a3b8" opacity="0.15" />

        {/* bed frame */}
        <rect x="80" y="200" width="260" height="100" rx="14" fill="url(#hb-frame)" />
        <rect x="84" y="204" width="252" height="5" rx="2.5" fill="white" opacity="0.15" />
        {/* frame panel lines */}
        <rect x="90" y="230" width="240" height="1" fill="white" opacity="0.06" />
        <rect x="90" y="260" width="240" height="1" fill="white" opacity="0.06" />

        {/* mattress */}
        <rect x="92" y="180" width="236" height="38" rx="12" fill="url(#hb-mattress)" />
        <rect x="92" y="180" width="236" height="38" rx="12" stroke="#d1d9e6" strokeWidth="0.6" />
        {/* mattress quilting */}
        <rect x="92" y="180" width="236" height="6" rx="3" fill="white" opacity="0.5" />

        {/* blanket fold */}
        <rect x="180" y="172" width="142" height="24" rx="8" fill="url(#hb-blanket)" />
        <rect x="180" y="172" width="142" height="4" rx="2" fill="white" opacity="0.3" />
        <rect x="180" y="190" width="142" height="3" rx="1.5" fill="#93c5fd" opacity="0.15" />
      </g>

      {/* pillow */}
      <g>
        <rect x="98" y="160" width="75" height="32" rx="14" fill="url(#hb-pillow)" />
        <rect x="98" y="160" width="75" height="32" rx="14" stroke="#d1d9e6" strokeWidth="0.5" />
        <rect x="100" y="162" width="71" height="5" rx="2.5" fill="white" opacity="0.6" />
        {/* pillow crease */}
        <path d="M110 176 Q135 170 168 176" stroke="#e2e8f0" strokeWidth="1" fill="none" />
        <path d="M115 182 Q135 178 160 182" stroke="#e2e8f0" strokeWidth="0.8" fill="none" opacity="0.5" />
      </g>

      {/* headboard */}
      <g>
        <rect x="65" y="125" width="22" height="180" rx="7" fill="url(#hb-frame)" />
        <rect x="67" y="127" width="4" height="176" rx="2" fill="white" opacity="0.1" />
        {/* headboard arch */}
        <path d="M65 135 Q65 90 130 82 Q195 75 215 82 Q235 88 240 100" stroke="#5a9fd4" strokeWidth="9" fill="none" strokeLinecap="round" />
        <path d="M68 135 Q68 95 130 87" stroke="white" strokeWidth="2" fill="none" opacity="0.12" strokeLinecap="round" />
        {/* cross badge on headboard */}
        <circle cx="76" cy="180" r="8" fill="white" opacity="0.2" />
        <rect x="73" y="175" width="6" height="10" rx="1.5" fill="white" opacity="0.3" />
        <rect x="71" y="178" width="10" height="4" rx="1" fill="white" opacity="0.3" />
      </g>

      {/* footboard */}
      <rect x="340" y="165" width="18" height="140" rx="6" fill="url(#hb-frame)" />
      <rect x="342" y="167" width="3" height="136" rx="1.5" fill="white" opacity="0.1" />

      {/* wheels */}
      {[110, 310].map(cx => (
        <g key={cx}>
          <circle cx={cx} cy="328" r="12" fill="#94a3b8" />
          <circle cx={cx} cy="328" r="8" fill="#b0bcc9" />
          <circle cx={cx} cy="328" r="4" fill="white" />
          <circle cx={cx - 2} cy={326} r="2" fill="white" opacity="0.3" />
        </g>
      ))}

      {/* IV stand */}
      <g transform="translate(38, 25)">
        {/* pole */}
        <rect x="20" y="38" width="5" height="250" rx="2.5" fill="#94a3b8" />
        <rect x="21" y="38" width="1.5" height="250" rx="0.75" fill="white" opacity="0.2" />
        {/* hooks */}
        <path d="M12 38 L33 38" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
        <path d="M6 36 L6 24 Q6 16 14 16 L18 16" stroke="#94a3b8" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M27 36 L27 24 Q27 16 35 16 L39 16" stroke="#94a3b8" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        {/* IV bag */}
        <g>
          <rect x="32" y="6" width="26" height="38" rx="8" fill="url(#hb-ivBag)" />
          <rect x="32" y="6" width="26" height="38" rx="8" stroke="#93c5fd" strokeWidth="1" />
          <rect x="34" y="8" width="22" height="5" rx="2.5" fill="white" opacity="0.5" />
          {/* liquid level */}
          <rect x="36" y="20" width="18" height="20" rx="5" fill="#93c5fd" opacity="0.35" />
          {/* cross on bag */}
          <rect x="41" y="24" width="8" height="14" rx="2" fill="white" opacity="0.5" />
          <rect x="38" y="28" width="14" height="6" rx="2" fill="white" opacity="0.5" />
        </g>
        {/* drip line */}
        <path d="M45 44 Q45 62 36 80 Q24 105 22 130" stroke="#93c5fd" strokeWidth="1.8" fill="none" strokeDasharray="4 4" opacity="0.5" />
        {/* drip drops */}
        <circle cx="45" cy="50" r="2" fill="#93c5fd" opacity="0.4" />
      </g>

      {/* bedside table */}
      <g transform="translate(362, 230)">
        <rect x="0" y="0" width="48" height="68" rx="8" fill="#5a9fd4" opacity="0.2" />
        <rect x="0" y="0" width="48" height="8" rx="4" fill="#5a9fd4" opacity="0.15" />
        {/* drawers */}
        <rect x="4" y="12" width="40" height="20" rx="5" fill="white" opacity="0.12" />
        <rect x="4" y="36" width="40" height="20" rx="5" fill="white" opacity="0.08" />
        {/* handles */}
        <rect x="18" y="19" width="12" height="3" rx="1.5" fill="white" opacity="0.25" />
        <rect x="18" y="43" width="12" height="3" rx="1.5" fill="white" opacity="0.2" />
      </g>
    </svg>
  )
}

