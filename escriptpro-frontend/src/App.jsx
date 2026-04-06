function App() {
  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <section className="w-full max-w-lg rounded-xl bg-white border border-slate-200 p-6 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">E-ScriptPro</h1>
        <p className="mt-2 text-sm text-slate-600">
          Doctor onboarding is ready. Continue with signup or login.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <a
            href="/signup"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Signup
          </a>
          <a
            href="/login"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Login
          </a>
        </div>
      </section>
    </main>
  )
}

export default App
