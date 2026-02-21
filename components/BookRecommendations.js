export default function BookRecommendations({
  recommendationPrompt,
  setRecommendationPrompt,
  onFetch,
  loading,
  error,
  bookOptions,
  selectedBookId,
  setSelectedBookId,
}) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="font-semibold">2. Get Book Recommendations</h2>
      <div className="mt-3 flex gap-2">
        <input
          className="flex-1 rounded-xl border p-2"
          value={recommendationPrompt}
          onChange={(e) => setRecommendationPrompt(e.target.value)}
          placeholder="e.g. short fiction for beginners"
        />
        <button className="rounded-xl border px-3 py-2 text-sm" onClick={onFetch} disabled={loading}>
          {loading ? "Loading..." : "Recommend"}
        </button>
      </div>
      {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}

      <div className="mt-3 space-y-2">
        {bookOptions.map((b) => (
          <label key={b.id} className="block cursor-pointer rounded-xl border p-3 text-sm">
            <div className="flex items-start gap-3">
              <input type="radio" checked={selectedBookId === b.id} onChange={() => setSelectedBookId(b.id)} />
              <div>
                <p className="font-medium">{b.title}</p>
                <p className="text-slate-600">{b.author} • {b.pages} pages</p>
                <p className="text-slate-500">{b.description}</p>
              </div>
            </div>
          </label>
        ))}
      </div>
    </section>
  );
}
