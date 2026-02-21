export default function BookVoting({ members, votes, setVotes, selectedBookId, bookOptions, winningBook }) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="font-semibold">3. Vote on a Book</h2>
      <div className="mt-3 space-y-2">
        {members.map((m) => (
          <div key={m.id} className="flex items-center gap-3">
            <span className="w-24 text-sm">{m.name}</span>
            <select
              className="flex-1 rounded-xl border p-2"
              value={votes[m.id] || selectedBookId}
              onChange={(e) => setVotes((prev) => ({ ...prev, [m.id]: e.target.value }))}
            >
              {bookOptions.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title}
                </option>
              ))}
            </select>
          </div>
        ))}
        <p className="pt-2 text-sm text-slate-700">
          Winner: <span className="font-medium">{winningBook?.title}</span>
        </p>
      </div>
    </section>
  );
}
