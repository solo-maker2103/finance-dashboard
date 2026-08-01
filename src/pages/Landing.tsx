import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  BadgeCheck,
  ChartColumn,
  ChartPie,
  Columns3,
  RefreshCw,
  Rocket,
  ShieldCheck,
  Sparkles,
  Upload,
  WandSparkles,
} from 'lucide-react'
import { db } from '../store'
import { demoTransactions } from '../lib/demoData'
import type { Transaction } from '../types'

function Landing() {
  const navigate = useNavigate()
  const [loadingDemo, setLoadingDemo] = useState(false)

  async function handleTryDemo() {
    if (loadingDemo) return
    setLoadingDemo(true)
    try {
      await db.transactions.clear()
      await db.transactions.bulkAdd(demoTransactions)
      navigate('/dashboard')
    } finally {
      setLoadingDemo(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-950">
        {/* Decorative background */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
          <div className="absolute top-1/2 right-0 h-[28rem] w-[28rem] -translate-y-1/2 rounded-full bg-indigo-600/20 blur-3xl" />
          <div className="absolute -bottom-40 left-1/3 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-blue-200 backdrop-blur">
              <Sparkles className="h-4 w-4" />
              Smart, private & completely free
            </div>

            <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Turn Your Spreadsheet Into a{' '}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                Financial Dashboard
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">
              Upload your Excel or CSV file and get instant insights. No need to start from
              scratch.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/import"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-500 sm:w-auto"
              >
                <Upload className="h-4 w-4" />
                Upload Your File
              </Link>
              <button
                type="button"
                onClick={handleTryDemo}
                disabled={loadingDemo}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {loadingDemo ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Rocket className="h-4 w-4" />
                )}
                {loadingDemo ? 'Loading sample data…' : 'Try Demo Data'}
              </button>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-slate-400">
              {['No sign-up required', '100% private', 'Works offline'].map((item) => (
                <span key={item} className="inline-flex items-center gap-1.5">
                  <BadgeCheck className="h-4 w-4 text-emerald-400" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold tracking-widest text-blue-600 uppercase">
              Why you&rsquo;ll love it
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Powerful insights, zero hassle
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-gray-600">
              Everything you need to turn raw numbers into clarity — without ever leaving your
              browser.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="group rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                <WandSparkles className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-gray-900">Smart Import</h3>
              <p className="mt-3 leading-relaxed text-gray-600">
                Automatically detects dates, amounts, and categories
              </p>
            </div>

            <div className="group rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:border-violet-200 hover:shadow-xl">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600 transition group-hover:bg-violet-600 group-hover:text-white">
                <ChartColumn className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-gray-900">Beautiful Analytics</h3>
              <p className="mt-3 leading-relaxed text-gray-600">
                See your finances with modern charts and graphs
              </p>
            </div>

            <div className="group rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-600 group-hover:text-white">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-gray-900">100% Private</h3>
              <p className="mt-3 leading-relaxed text-gray-600">
                All data stays in your browser. Nothing is uploaded to servers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold tracking-widest text-blue-600 uppercase">
              How it works
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              From spreadsheet to dashboard in minutes
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-gray-600">
              No technical setup required. Just three simple steps.
            </p>
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <div className="flex items-center justify-between">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/25">
                  <Upload className="h-6 w-6" />
                </div>
                <span className="text-4xl font-bold text-gray-100">01</span>
              </div>
              <h3 className="mt-6 text-lg font-semibold text-gray-900">
                Step 1: Upload your spreadsheet
              </h3>
              <p className="mt-3 leading-relaxed text-gray-600">
                Drag and drop your Excel or CSV file. We instantly read and preview your data.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <div className="flex items-center justify-between">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600 text-white shadow-lg shadow-violet-600/25">
                  <Columns3 className="h-6 w-6" />
                </div>
                <span className="text-4xl font-bold text-gray-100">02</span>
              </div>
              <h3 className="mt-6 text-lg font-semibold text-gray-900">
                Step 2: Map your columns
              </h3>
              <p className="mt-3 leading-relaxed text-gray-600">
                Tell us which columns hold your dates, amounts, and categories.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <div className="flex items-center justify-between">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/25">
                  <ChartPie className="h-6 w-6" />
                </div>
                <span className="text-4xl font-bold text-gray-100">03</span>
              </div>
              <h3 className="mt-6 text-lg font-semibold text-gray-900">
                Step 3: Get instant insights
              </h3>
              <p className="mt-3 leading-relaxed text-gray-600">
                See your spending, income, and trends with beautiful charts — instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-white py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 px-8 py-16 text-center shadow-xl shadow-indigo-600/20 sm:px-16">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/10 blur-2xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-white/10 blur-2xl"
            />

            <h2 className="relative text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to see your finances clearly?
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-lg text-blue-100">
              Upload your first spreadsheet or explore with sample data — it takes less than a
              minute.
            </p>

            <div className="relative mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/import"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-blue-700 shadow-lg shadow-indigo-950/20 transition hover:bg-blue-50 sm:w-auto"
              >
                <Upload className="h-4 w-4" />
                Upload Your File
              </Link>
              <button
                type="button"
                onClick={handleTryDemo}
                disabled={loadingDemo}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {loadingDemo ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Rocket className="h-4 w-4" />
                )}
                {loadingDemo ? 'Loading sample data…' : 'Try Demo Data'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-sm text-gray-500">Finance Dashboard</p>
          <p className="text-sm text-gray-400">
            100% private — your data never leaves your browser.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Landing