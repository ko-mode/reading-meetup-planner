function vibePlaylist(vibe) {
  const map = {
    cozy: "Cozy Reading Session",
    focus: "Deep Focus Reading",
    chill: "Lo-fi Book Club",
  };
  return map[vibe] || "Reading Mix";
}

export default function FinalPlanCard({
  groupName,
  winningBook,
  meetupDate,
  meetupTime,
  locationSuggestion,
  vibe,
  onSave,
  saveState,
  onVoice,
  voiceState,
}) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="font-semibold">Final Plan</h2>
      <div className="mt-3 space-y-2 text-sm">
        <p><span className="text-slate-500">Group:</span> {groupName}</p>
        <p><span className="text-slate-500">Book:</span> {winningBook?.title} by {winningBook?.author}</p>
        <p><span className="text-slate-500">Meetup:</span> {meetupDate} at {meetupTime}</p>
        <p><span className="text-slate-500">Location:</span> {locationSuggestion}</p>
        <p><span className="text-slate-500">Playlist:</span> {vibePlaylist(vibe)}</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button className="rounded-xl border px-3 py-2 text-sm" onClick={onSave} disabled={saveState.loading}>
          {saveState.loading ? "Saving..." : "Save Plan"}
        </button>
        <button className="rounded-xl border px-3 py-2 text-sm" onClick={onVoice} disabled={voiceState.loading}>
          {voiceState.loading ? "Generating..." : "Listen to Plan"}
        </button>
      </div>
      {saveState.message ? <p className="mt-2 text-xs text-slate-600">{saveState.message}</p> : null}
      {voiceState.error ? <p className="mt-2 text-xs text-red-600">{voiceState.error}</p> : null}
      {voiceState.audioUrl ? <audio className="mt-3 w-full" controls src={voiceState.audioUrl} /> : null}
    </section>
  );
}
