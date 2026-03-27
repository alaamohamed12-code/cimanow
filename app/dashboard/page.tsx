'use client'

import { ReactNode, useEffect, useRef, useState } from 'react'

interface HistoryPoint {
  ts: number
  count: number
}

interface DailyVisit {
  date: string
  visits: number
}

interface Stats {
  current: number
  peakToday: number
  uniqueToday: number
  totalVisitorsAllTime: number
  dailyVisits: DailyVisit[]
  history: HistoryPoint[]
  lastUpdated: number
}

const formatCount = (value: number | null | undefined): string => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return '—'
  }
  return new Intl.NumberFormat('en-US').format(value)
}

function LiveChart({ history }: { history: HistoryPoint[] }) {
  const W = 920
  const H = 300
  const P = { top: 20, right: 22, bottom: 40, left: 50 }
  const cW = W - P.left - P.right
  const cH = H - P.top - P.bottom

  if (history.length < 2) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-3xl border border-white/10 bg-white/[0.03] text-sm text-white/35">
        جاري جمع البيانات...
      </div>
    )
  }

  const maxVal = Math.max(...history.map((p) => p.count), 1)
  const points = history.map((point, index) => ({
    x: P.left + (index / (history.length - 1)) * cW,
    y: P.top + cH - (point.count / maxVal) * cH,
    ...point,
  }))

  const linePath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
    .join(' ')

  const areaPath = [
    ...points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`),
    `L ${points[points.length - 1].x.toFixed(1)} ${(P.top + cH).toFixed(1)}`,
    `L ${points[0].x.toFixed(1)} ${(P.top + cH).toFixed(1)}`,
    'Z',
  ].join(' ')

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((tick) => ({
    y: P.top + cH - tick * cH,
    value: Math.round(tick * maxVal),
  }))

  const xLabels = [0, 0.5, 1].map((tick) => {
    const index = Math.round(tick * (history.length - 1))
    const date = new Date(history[index].ts)
    return {
      x: P.left + tick * cW,
      label: `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`,
    }
  })

  const lastPoint = points[points.length - 1]

  return (
    <div className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] p-3 sm:p-4">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
        <defs>
          <linearGradient id="dashArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f6c90e" stopOpacity="0.24" />
            <stop offset="100%" stopColor="#7c5cff" stopOpacity="0.06" />
          </linearGradient>
          <linearGradient id="dashLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ffe082" />
            <stop offset="100%" stopColor="#a58bff" />
          </linearGradient>
          <filter id="dashGlow" x="-20%" y="-40%" width="140%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {yTicks.map((tick, index) => (
          <g key={index}>
            <line x1={P.left} y1={tick.y} x2={W - P.right} y2={tick.y} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            <text
              x={P.left - 10}
              y={tick.y + 4}
              textAnchor="end"
              fill="rgba(255,255,255,0.33)"
              fontSize="12"
              fontFamily="var(--font-cairo)"
            >
              {tick.value}
            </text>
          </g>
        ))}

        <path d={areaPath} fill="url(#dashArea)" />
        <path
          d={linePath}
          fill="none"
          stroke="url(#dashLine)"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
          filter="url(#dashGlow)"
        />

        <circle cx={lastPoint.x} cy={lastPoint.y} r="9" fill="#f6c90e" opacity="0.24" />
        <circle cx={lastPoint.x} cy={lastPoint.y} r="4.5" fill="#f6c90e" />

        {xLabels.map((label, index) => (
          <text
            key={index}
            x={label.x}
            y={H - 10}
            textAnchor="middle"
            fill="rgba(255,255,255,0.34)"
            fontSize="11"
            fontFamily="var(--font-cairo)"
          >
            {label.label}
          </text>
        ))}
      </svg>
    </div>
  )
}

function KpiCard({
  title,
  value,
  icon,
}: {
  title: string
  value: ReactNode
  icon: ReactNode
}) {
  return (
    <article className="panel panel-hover rounded-[24px] p-5">
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-white/44">{title}</p>
          <p className="mt-4 text-[clamp(30px,3.7vw,46px)] font-black leading-none tabular-nums text-white">{value}</p>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-[#f6c90e]">
          {icon}
        </div>
      </div>
    </article>
  )
}

function OrbCard({ current, peak, unique }: { current: string; peak: string; unique: string }) {
  return (
    <div className="panel relative min-h-[340px] overflow-hidden rounded-[30px] p-5 sm:min-h-[360px] sm:p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.14),transparent_24%),radial-gradient(circle_at_50%_80%,rgba(246,201,14,0.14),transparent_30%)]" />

      <div className="relative z-10 flex h-full flex-col">
        <h3 className="text-center text-xl font-black text-white">الحالة الحية</h3>

        <div className="orb-stage mt-5 flex flex-1 items-center justify-center">
          <div className="orb-ring orb-ring-a" />
          <div className="orb-ring orb-ring-b" />
          <div className="orb-ring orb-ring-c" />
          <div className="orb-glow" />

          <div className="orb-core">
            <span className="text-[11px] font-black tracking-[0.18em] text-white/40">ACTIVE</span>
            <span className="mt-2 text-5xl font-black leading-none tabular-nums text-white">{current}</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-center">
            <p className="text-[11px] tracking-[0.16em] text-white/35">PEAK</p>
            <p className="mt-2 text-2xl font-black tabular-nums text-white">{peak}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-center">
            <p className="text-[11px] tracking-[0.16em] text-white/35">UNIQUE</p>
            <p className="mt-2 text-2xl font-black tabular-nums text-white">{unique}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [connected, setConnected] = useState(false)
  const [countDir, setCountDir] = useState<'up' | 'down' | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const dirTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const esRef = useRef<EventSource | null>(null)

  useEffect(() => {
    let cancelled = false

    const checkAuth = async () => {
      try {
        const response = await fetch('/api/dashboard-auth', { cache: 'no-store' })
        const data = await response.json()
        if (!cancelled) {
          setIsAuthorized(Boolean(data?.authenticated))
          setAuthChecked(true)
        }
      } catch {
        if (!cancelled) {
          setIsAuthorized(false)
          setAuthChecked(true)
        }
      }
    }

    checkAuth()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!isAuthorized) {
      return
    }

    let retryTimeout: ReturnType<typeof setTimeout> | undefined

    const connect = () => {
      esRef.current?.close()
      const es = new EventSource('/api/visitors/stream')
      esRef.current = es

      es.onopen = () => setConnected(true)
      es.onmessage = (event: MessageEvent) => {
        try {
          const next: Stats = JSON.parse(event.data as string)
          setStats((prev) => {
            if (prev) {
              const direction = next.current > prev.current ? 'up' : next.current < prev.current ? 'down' : null
              if (direction) {
                setCountDir(direction)
                if (dirTimer.current) clearTimeout(dirTimer.current)
                dirTimer.current = setTimeout(() => setCountDir(null), 1600)
              }
            }
            return next
          })
          setConnected(true)
        } catch {
          setConnected(false)
        }
      }

      es.onerror = () => {
        setConnected(false)
        es.close()
        retryTimeout = setTimeout(connect, 5000)
      }
    }

    connect()

    return () => {
      if (retryTimeout) clearTimeout(retryTimeout)
      if (dirTimer.current) clearTimeout(dirTimer.current)
      esRef.current?.close()
    }
  }, [isAuthorized])

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setAuthLoading(true)
    setAuthError('')

    try {
      const response = await fetch('/api/dashboard-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({ message: 'تعذر تسجيل الدخول.' }))
        setAuthError(data.message ?? 'تعذر تسجيل الدخول.')
        setAuthLoading(false)
        return
      }

      setPassword('')
      setIsAuthorized(true)
    } catch {
      setAuthError('تعذر تسجيل الدخول. حاول مرة أخرى.')
    }

    setAuthLoading(false)
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/dashboard-auth', { method: 'DELETE' })
    } finally {
      setIsAuthorized(false)
      setStats(null)
      setConnected(false)
      setCountDir(null)
      setAuthError('')
    }
  }

  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070512] font-[family-name:var(--font-cairo)] text-white">
        <p className="text-sm text-white/65">جاري التحقق من صلاحية الدخول...</p>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="login-screen" dir="rtl">
        <div className="login-backdrop" />

        <div className="login-page">
          <div className="login-left">
            <div className="deco-circle" />
            <div className="deco-circle" />
            <div className="deco-circle" />

            <div className="brand-block">
              <div className="brand-icon-wrap">
                <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <polygon points="40,4 76,26 76,54 40,76 4,54 4,26" stroke="#c9a96e" strokeWidth="1.5" fill="none" />
                  <polygon points="40,14 66,29 66,51 40,66 14,51 14,29" stroke="#c9a96e" strokeWidth="0.8" fill="rgba(201,169,110,0.05)" />
                  <circle cx="40" cy="40" r="12" fill="rgba(201,169,110,0.15)" stroke="#c9a96e" strokeWidth="1" />
                  <circle cx="40" cy="40" r="5" fill="#c9a96e" />
                </svg>
              </div>
              <h1 className="brand-title"><span className="brand-cima">Cima</span><span className="brand-view">View</span></h1>
              <div className="brand-divider" />
              <p className="brand-sub">Studio</p>
              <p className="brand-tag">حيث تلتقي الفكرة بالإبداع</p>
            </div>
          </div>

          <div className="login-divider" />

          <div className="login-right">
            <form onSubmit={handleLogin} className="login-form-wrap">
              <div className="form-header">
                <h2>أهلاً بعودتك</h2>
                <p>سجّل دخولك للمتابعة من حيث توقفت</p>
              </div>

              <div className="field-wrap">
                <label>اسم المستخدم</label>
                <div className="input-wrap">
                  <input
                    type="text"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="username"
                    autoComplete="username"
                    required
                  />
                  <span className="input-icon">
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 20a8 8 0 0 1 16 0" />
                    </svg>
                  </span>
                </div>
              </div>

              <div className="field-wrap">
                <label>كلمة المرور</label>
                <div className="input-wrap">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                  />
                  <span className="input-icon">
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <button type="button" className="toggle-pass" onClick={() => setShowPassword((prev) => !prev)}>
                    {showPassword ? 'إخفاء' : 'إظهار'}
                  </button>
                </div>
              </div>

              <div className="options-row">
                <label className="remember-row">
                  <input type="checkbox" />
                  <span>تذكّرني</span>
                </label>
                <a href="#" onClick={(event) => event.preventDefault()} className="forgot-link">نسيت كلمة المرور؟</a>
              </div>

              {authError ? <p className="auth-error">{authError}</p> : null}

              <button type="submit" disabled={authLoading} className={`btn-login ${authLoading ? 'loading' : ''}`}>
                <span className="btn-text">{authLoading ? 'جارٍ التحقق...' : 'دخول'}</span>
              </button>

            </form>
          </div>
        </div>

        <style jsx>{`
          .login-screen {
            position: relative;
            min-height: 100vh;
            overflow: hidden;
            background: #0a0a0f;
            font-family: var(--font-cairo), 'Tajawal', sans-serif;
            color: #f5efe6;
          }

          .login-backdrop {
            position: absolute;
            inset: 0;
            background:
              radial-gradient(ellipse 70% 55% at 22% 28%, rgba(201, 169, 110, 0.12) 0%, transparent 70%),
              radial-gradient(ellipse 65% 50% at 86% 76%, rgba(201, 169, 110, 0.09) 0%, transparent 70%),
              linear-gradient(180deg, #09060f 0%, #0a0a12 100%);
          }

          .login-page {
            position: relative;
            z-index: 1;
            display: flex;
            min-height: 100vh;
            width: 100%;
          }

          .login-left {
            flex: 1.1;
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 60px;
            overflow: hidden;
          }

          .deco-circle {
            position: absolute;
            border-radius: 50%;
            border: 1px solid rgba(201, 169, 110, 0.16);
            animation: rotateSlow linear infinite;
          }

          .deco-circle:nth-child(1) {
            width: 420px;
            height: 420px;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            animation-duration: 30s;
          }

          .deco-circle:nth-child(2) {
            width: 600px;
            height: 600px;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            border-style: dashed;
            animation-duration: 48s;
            animation-direction: reverse;
          }

          .deco-circle:nth-child(3) {
            width: 780px;
            height: 780px;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            opacity: 0.45;
            animation-duration: 76s;
          }

          .brand-block {
            position: relative;
            text-align: center;
            animation: fadeUp 0.9s ease both;
          }

          .brand-icon-wrap {
            width: 82px;
            height: 82px;
            margin: 0 auto 24px;
            filter: drop-shadow(0 0 20px rgba(201, 169, 110, 0.48));
          }

          .brand-title {
            font-size: clamp(42px, 4.4vw, 58px);
            font-weight: 900;
            line-height: 1;
            letter-spacing: -0.03em;
          }

          .brand-cima {
            color: #ffffff;
          }

          .brand-view {
            color: #f6c90e;
          }

          .brand-divider {
            width: 60px;
            height: 1px;
            margin: 18px auto;
            background: linear-gradient(90deg, transparent, #c9a96e, transparent);
          }

          .brand-sub {
            font-size: 14px;
            letter-spacing: 0.22em;
            text-transform: uppercase;
            color: rgba(245, 239, 230, 0.48);
          }

          .brand-tag {
            margin-top: 12px;
            font-size: 16px;
            color: rgba(201, 169, 110, 0.62);
          }

          .login-divider {
            width: 1px;
            background: linear-gradient(to bottom, transparent, rgba(201, 169, 110, 0.3), transparent);
          }

          .login-right {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 56px 48px;
          }

          .login-form-wrap {
            width: 100%;
            max-width: 400px;
            animation: slideIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
          }

          .form-header {
            margin-bottom: 34px;
          }

          .form-header h2 {
            font-size: 2rem;
            font-weight: 800;
            color: #f5efe6;
          }

          .form-header p {
            margin-top: 8px;
            font-size: 0.95rem;
            color: rgba(245, 239, 230, 0.42);
          }

          .field-wrap {
            margin-bottom: 20px;
          }

          .field-wrap label {
            display: block;
            margin-bottom: 8px;
            font-size: 0.82rem;
            letter-spacing: 0.1em;
            font-weight: 700;
            color: #c9a96e;
          }

          .input-wrap {
            position: relative;
          }

          .input-wrap input {
            width: 100%;
            border-radius: 12px;
            border: 1px solid rgba(201, 169, 110, 0.2);
            background: rgba(255, 255, 255, 0.04);
            color: #f5efe6;
            font-size: 1rem;
            padding: 14px 46px 14px 50px;
            outline: none;
            transition: border-color 0.3s ease, box-shadow 0.3s ease, background 0.3s ease;
            direction: ltr;
          }

          .input-wrap input::placeholder {
            color: rgba(245, 239, 230, 0.25);
          }

          .input-wrap input:focus {
            border-color: rgba(201, 169, 110, 0.6);
            background: rgba(255, 255, 255, 0.07);
            box-shadow: 0 0 0 3px rgba(201, 169, 110, 0.1);
          }

          .input-icon {
            position: absolute;
            right: 16px;
            top: 50%;
            transform: translateY(-50%);
            color: rgba(201, 169, 110, 0.44);
            pointer-events: none;
          }

          .toggle-pass {
            position: absolute;
            left: 12px;
            top: 50%;
            transform: translateY(-50%);
            border: none;
            background: none;
            color: rgba(201, 169, 110, 0.7);
            font-size: 0.8rem;
            cursor: pointer;
          }

          .options-row {
            margin-top: 4px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
          }

          .remember-row {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            font-size: 0.9rem;
            color: rgba(245, 239, 230, 0.52);
          }

          .forgot-link {
            text-decoration: none;
            color: rgba(201, 169, 110, 0.68);
            font-size: 0.9rem;
          }

          .auth-error {
            margin-top: 12px;
            font-size: 0.9rem;
            color: #ff9fb2;
          }

          .btn-login {
            margin-top: 20px;
            width: 100%;
            border: none;
            border-radius: 12px;
            padding: 15px;
            cursor: pointer;
            color: #0a0a0f;
            font-size: 1rem;
            font-weight: 800;
            letter-spacing: 0.08em;
            background: linear-gradient(135deg, #8b6914, #c9a96e, #e8cfa0);
            box-shadow: 0 6px 28px rgba(201, 169, 110, 0.26);
            transition: transform 0.2s ease, box-shadow 0.3s ease;
          }

          .btn-login:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 34px rgba(201, 169, 110, 0.38);
          }

          .btn-login.loading,
          .btn-login:disabled {
            opacity: 0.8;
            cursor: not-allowed;
          }

          @keyframes rotateSlow {
            from {
              transform: translate(-50%, -50%) rotate(0deg);
            }
            to {
              transform: translate(-50%, -50%) rotate(360deg);
            }
          }

          @keyframes fadeUp {
            from {
              opacity: 0;
              transform: translateY(16px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateX(34px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          @media (max-width: 900px) {
            .login-left,
            .login-divider {
              display: none;
            }

            .login-right {
              padding: 38px 22px;
            }

            .login-form-wrap {
              max-width: 430px;
            }
          }
        `}</style>
      </div>
    )
  }

  const timeLabel = stats ? new Date(stats.lastUpdated).toLocaleTimeString('ar-EG') : '--:--:--'
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070512] font-[family-name:var(--font-cairo)] text-white" dir="rtl">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-230px] h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[#8f65ff]/18 blur-[140px]" />
        <div className="absolute right-[-120px] top-[220px] h-[330px] w-[330px] rounded-full bg-[#f6c90e]/10 blur-[120px]" />
        <div className="absolute bottom-[-130px] left-[-130px] h-[350px] w-[350px] rounded-full bg-[#22d3a2]/8 blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#090513_0%,#06030d_42%,#080512_100%)]" />
        <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:66px_66px]" />
      </div>

      <main className="relative z-10 w-full px-0 pb-12 pt-7">
        <section className="panel rounded-[28px] px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-rose-300/25 bg-rose-300/10 px-4 py-2 text-sm font-bold text-rose-200 transition-colors hover:bg-rose-300/18"
              >
                تسجيل الخروج
              </button>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-bold text-white/80">
                <span className={`h-2.5 w-2.5 rounded-full ${connected ? 'bg-emerald-400 shadow-[0_0_16px_rgba(16,185,129,0.7)]' : 'bg-rose-500 shadow-[0_0_16px_rgba(244,63,94,0.55)]'}`} />
                {connected ? 'متصل' : 'غير متصل'}
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/45">آخر تحديث: {timeLabel}</span>
              <span className={`rounded-full border px-4 py-2 text-sm font-bold ${countDir === 'up' ? 'border-emerald-300/25 bg-emerald-300/10 text-emerald-300' : countDir === 'down' ? 'border-rose-300/25 bg-rose-300/10 text-rose-300' : 'border-[#f6c90e]/25 bg-[#f6c90e]/10 text-[#f7d76a]'}`}>
                {countDir === 'up' ? 'تصاعد' : countDir === 'down' ? 'هبوط' : 'مستقر'}
              </span>
            </div>

            <h1 className="text-[34px] font-black leading-none tracking-[-0.04em] sm:text-[40px]">
              <span className="text-white">Cima</span><span className="text-[#f6c90e]">View</span>
            </h1>
          </div>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.18fr)_360px]">
          <article className="panel rounded-[30px] px-6 py-7 sm:px-8" style={{ paddingRight: '25px' }}>
            <p className="inline-flex rounded-full border border-[#f6c90e]/25 bg-[#f6c90e]/10 px-4 py-1.5 text-xs font-black tracking-[0.18em] text-[#f7d76a]">
              LIVE COUNTER
            </p>
            <p className={`mt-6 text-[clamp(68px,10vw,122px)] font-black leading-none tracking-[-0.06em] tabular-nums ${countDir === 'up' ? 'text-emerald-300' : countDir === 'down' ? 'text-rose-300' : 'text-white'}`}>
              {formatCount(stats?.current)}
            </p>
            <p className="mt-3 text-base text-white/52">الزوار النشطون الآن</p>
          </article>

          <OrbCard
            current={formatCount(stats?.current)}
            peak={formatCount(stats?.peakToday)}
            unique={formatCount(stats?.uniqueToday)}
          />
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            title="إجمالي الزوار"
            value={formatCount(stats?.totalVisitorsAllTime)}
            icon={
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 18h16M6 15l3-4 3 2 5-7 1 2" />
              </svg>
            }
          />
          <KpiCard
            title="النشطون الآن"
            value={formatCount(stats?.current)}
            icon={
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
              </svg>
            }
          />
          <KpiCard
            title="ذروة اليوم"
            value={formatCount(stats?.peakToday)}
            icon={
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l5-5 4 4 7-8" />
              </svg>
            }
          />
          <KpiCard
            title="فريدون اليوم"
            value={formatCount(stats?.uniqueToday)}
            icon={
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0M4 20a8 8 0 0 1 16 0" />
              </svg>
            }
          />
        </section>

        <section className="mt-6">
          <article className="panel rounded-[30px] p-5 sm:p-6">
            <div className="mb-5 flex items-end justify-between gap-3">
              <h2 className="text-2xl font-black tracking-[-0.02em] text-white" style={{ paddingRight: '25px' }}>المنحنى الزمني</h2>
              <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/42">مباشر</span>
            </div>
            <LiveChart history={stats?.history ?? []} />
          </article>
        </section>

      </main>

      <style jsx>{`
        .panel {
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.09);
          background: linear-gradient(180deg, rgba(17, 13, 31, 0.88), rgba(6, 5, 16, 0.72));
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.05),
            0 20px 60px rgba(0, 0, 0, 0.28);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }

        .panel::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), transparent 40%, transparent 70%, rgba(246, 201, 14, 0.04));
          pointer-events: none;
        }

        .panel-hover {
          transition: transform 220ms ease, border-color 220ms ease, box-shadow 220ms ease;
          transform-style: preserve-3d;
        }

        .panel-hover:hover {
          transform: perspective(1300px) rotateX(3deg) rotateY(-4deg) translateY(-4px);
          border-color: rgba(246, 201, 14, 0.28);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.08),
            0 28px 70px rgba(0, 0, 0, 0.36),
            0 0 26px rgba(246, 201, 14, 0.12);
        }

        .orb-stage {
          position: relative;
          perspective: 1400px;
          transform-style: preserve-3d;
        }

        .orb-glow {
          position: absolute;
          width: 220px;
          height: 220px;
          border-radius: 999px;
          background: radial-gradient(circle, rgba(246, 201, 14, 0.25), rgba(30, 18, 56, 0.08) 70%);
          filter: blur(14px);
          transform: translateZ(-40px);
          animation: glowPulse 6.4s ease-in-out infinite;
        }

        .orb-ring {
          position: absolute;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          transform-style: preserve-3d;
        }

        .orb-ring-a {
          width: 240px;
          height: 240px;
          transform: rotateX(72deg);
          animation: spinA 14s linear infinite;
        }

        .orb-ring-b {
          width: 184px;
          height: 184px;
          border-color: rgba(175, 138, 255, 0.36);
          transform: rotateX(72deg) rotateZ(28deg) translateZ(20px);
          animation: spinB 11s linear infinite;
        }

        .orb-ring-c {
          width: 130px;
          height: 130px;
          border-color: rgba(63, 219, 171, 0.34);
          transform: rotateX(72deg) rotateZ(12deg) translateZ(42px);
          animation: spinC 8.5s linear infinite;
        }

        .orb-core {
          position: relative;
          z-index: 2;
          display: flex;
          width: 162px;
          height: 162px;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          background: radial-gradient(circle at 30% 25%, rgba(255, 255, 255, 0.18), rgba(14, 10, 28, 0.95) 66%);
          box-shadow:
            inset 0 1px 12px rgba(255, 255, 255, 0.09),
            0 0 0 1px rgba(255, 255, 255, 0.09),
            0 20px 60px rgba(0, 0, 0, 0.32),
            0 0 46px rgba(246, 201, 14, 0.16);
          animation: corePulse 4.4s ease-in-out infinite;
        }

        @keyframes spinA {
          from { transform: rotateX(72deg) rotateZ(0deg); }
          to { transform: rotateX(72deg) rotateZ(360deg); }
        }

        @keyframes spinB {
          from { transform: rotateX(72deg) rotateZ(28deg) translateZ(20px); }
          to { transform: rotateX(72deg) rotateZ(-332deg) translateZ(20px); }
        }

        @keyframes spinC {
          from { transform: rotateX(72deg) rotateZ(12deg) translateZ(42px); }
          to { transform: rotateX(72deg) rotateZ(372deg) translateZ(42px); }
        }

        @keyframes corePulse {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-4px) scale(1.02); }
        }

        @keyframes glowPulse {
          0%, 100% { opacity: 0.75; }
          50% { opacity: 1; }
        }

        @media (max-width: 767px) {
          .orb-ring-a { width: 206px; height: 206px; }
          .orb-ring-b { width: 156px; height: 156px; }
          .orb-ring-c { width: 114px; height: 114px; }
          .orb-core { width: 148px; height: 148px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .panel-hover,
          .panel-hover:hover,
          .orb-ring-a,
          .orb-ring-b,
          .orb-ring-c,
          .orb-core,
          .orb-glow {
            animation: none !important;
            transition: none !important;
            transform: none !important;
          }
        }
      `}</style>
    </div>
  )
}