function Privacy() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-12">
      <section className="mx-auto w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm text-slate-500">Writing</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Privacy Policy</h1>
        <div className="mt-6 space-y-4 text-slate-700">
          <p>This application is a demo project.</p>
          <p>
            We collect basic user information such as email and profile data for
            authentication purposes only.
          </p>
          <p>We do not share user data with third parties.</p>
        </div>
      </section>
    </main>
  )
}

export default Privacy
