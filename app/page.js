"use client";

import { useMemo, useState } from "react";
import { sampleBooks } from "@/data/sampleBooks";
import { generateCheckpoints, formatDateInput, addDays } from "@/lib/checkpointGenerator";

function vibePlaylist(vibe) {
  const map = {
    cozy: "Cozy Reading Session",
    focus: "Deep Focus Reading",
    chill: "Lo-fi Book Club",
  };
  return map[vibe] || "Reading Mix";
}

export default function HomePage() {
  const [groupName, setGroupName] = useState("Saturday Readers");
  const [members, setMembers] = useState([
    { id: "m1", name: "Aisha" },
    { id: "m2", name: "Ben" },
    { id: "m3", name: "Maya" },
  ]);
  const [newMember, setNewMember] = useState("");

  const [bookOptions, setBookOptions] = useState(sampleBooks);
  const [selectedBookId, setSelectedBookId] = useState(sampleBooks[0].id);
  const [votes, setVotes] = useState({ m1: "b1", m2: "b2", m3: "b1" });

  const today = formatDateInput(new Date());
  const [startDate, setStartDate] = useState(today);
  const [meetupDate, setMeetupDate] = useState(addDays(today, 21));
  const [meetupTime, setMeetupTime] = useState("18:30");
  const [pace, setPace] = useState("medium");
  const [locationSuggestion, setLocationSuggestion] = useState("Campus Library (Quiet Zone)");
  const [vibe, setVibe] = useState("cozy");

  const [recommendationPrompt, setRecommendationPrompt] = useState("short fiction for beginners");
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [recError, setRecError] = useState("");

  const [saveState, setSaveState] = useState({ loading: false, message: "" });
  const [voiceState, setVoiceState] = useState({ loading: false, audioUrl: "", error: "" });

  const selectedBook = useMemo(
    () => bookOptions.find((b) => b.id === selectedBookId) || bookOptions[0],
    [bookOptions, selectedBookId]
  );

  const winningBook = useMemo(() => {
    const counts = {};
    Object.values(votes).forEach((bookId) => {
      counts[bookId] = (counts[bookId] || 0) + 1;
    });

    let winnerId = selectedBookId;
    let maxVotes = -1;
    for (const [bookId, count] of Object.entries(counts)) {
      if (count > maxVotes) {
        winnerId = bookId;
        maxVotes = count;
      }
    }

    return bookOptions.find((b) => b.id === winnerId) || selectedBook;
  }, [votes, selectedBookId, bookOptions, selectedBook]);

  const checkpoints = useMemo(() => {
    if (!winningBook) return [];
    return generateCheckpoints({
      totalPages: winningBook.pages,
      startDate,
      meetupDate,
      pace,
    });
  }, [winningBook, startDate, meetupDate, pace]);

  function handleAddMember() {
    const name = newMember.trim();
    if (!name) return;
    const id = `m${Date.now()}`;
    setMembers((prev) => [...prev, { id, name }]);
    setVotes((prev) => ({ ...prev, [id]: selectedBookId }));
    setNewMember("");
  }

  async function fetchBookRecommendations() {
    setLoadingRecs(true);
    setRecError("");
    try {
      const res = await fetch("/api/recommend-books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: recommendationPrompt, members }),
      });
      const data = await res.json();
      if (!res.ok || !Array.isArray(data.books)) throw new Error(data.error || "Failed to get recommendations");

      const now = Date.now();
      const mapped = data.books.slice(0, 5).map((b, idx) => ({
        id: `g-${now}-${idx}`,
        title: b.title,
        author: b.author || "Unknown",
        pages: Number(b.pages) || 250,
        tags: Array.isArray(b.tags) ? b.tags : ["recommended"],
        description: b.description || "Gemini recommendation",
      }));

      setBookOptions(mapped);
      setSelectedBookId(mapped[0]?.id || selectedBookId);
      setVotes((prev) => {
        const next = { ...prev };
        for (const m of members) next[m.id] = mapped[0]?.id || selectedBookId;
        return next;
      });
    } catch (err) {
      setRecError(err.message || "Could not fetch recommendations");
    } finally {
      setLoadingRecs(false);
    }
  }

  async function savePlan() {
    setSaveState({ loading: true, message: "" });
    try {
      const payload = {
        groupName,
        members,
        votes,
        selectedBook: winningBook,
        meetup: {
          startDate,
          meetupDate,
          meetupTime,
          pace,
          locationSuggestion,
          vibe,
        },
        checkpoints,
        discussionPrompts: [
          "What stood out most in this week’s pages?",
          "Which idea or character felt most relevant to your life?",
          "What would you disagree with or challenge?",
        ],
      };

      const res = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to save");
      setSaveState({ loading: false, message: `Saved plan ✅ (${data.id || "ok"})` });
    } catch (err) {
      setSaveState({ loading: false, message: `Save failed: ${err.message}` });
    }
  }

  async function generateVoiceSummary() {
    setVoiceState({ loading: true, audioUrl: "", error: "" });
    try {
      const res = await fetch("/api/voice-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupName,
          book: winningBook,
          meetupDate,
          meetupTime,
          locationSuggestion,
          nextCheckpoint: checkpoints[0],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Voice failed");
      setVoiceState({ loading: false, audioUrl: data.audioUrl || "", error: "" });
    } catch (err) {
      setVoiceState({ loading: false, audioUrl: "", error: err.message || "Voice failed" });
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl bg-white p-5 shadow-sm">
            <h1 className="text-2xl font-semibold">Reading Meetup Planner</h1>
            <p className="mt-1 text-sm text-slate-600">Plan a reading meetup with friends in under 2 minutes.</p>
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="font-semibold">1. Create Group</h2>
            <div className="mt-3 space-y-3">
              <input
                className="w-full rounded-xl border p-2"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Group name"
              />
              <div className="flex gap-2">
                <input
                  className="flex-1 rounded-xl border p-2"
                  value={newMember}
                  onChange={(e) => setNewMember(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddMember()}
                  placeholder="Add member"
                />
                <button className="rounded-xl border px-4" onClick={handleAddMember}>
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {members.map((m) => (
                  <span key={m.id} className="rounded-full bg-slate-100 px-3 py-1 text-sm">
                    {m.name}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="font-semibold">2. Smart Book Recommendations</h2>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input
                className="flex-1 rounded-xl border p-2"
                value={recommendationPrompt}
                onChange={(e) => setRecommendationPrompt(e.target.value)}
                placeholder="e.g. short fiction with good discussion themes"
              />
              <button
                className="rounded-xl border px-4 disabled:opacity-50"
                onClick={fetchBookRecommendations}
                disabled={loadingRecs}
              >
                {loadingRecs ? "Loading..." : "Get Recs"}
              </button>
            </div>
            {recError ? <p className="mt-2 text-sm text-red-600">{recError}</p> : null}

            <div className="mt-3 grid gap-3">
              {bookOptions.map((book) => (
                <label key={book.id} className="block cursor-pointer rounded-xl border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-medium">{book.title}</div>
                      <div className="text-sm text-slate-600">
                        {book.author} • {book.pages} pages
                      </div>
                      <div className="mt-1 text-sm text-slate-700">{book.description}</div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {book.tags.map((tag) => (
                          <span key={tag} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <input
                      type="radio"
                      checked={selectedBookId === book.id}
                      onChange={() => setSelectedBookId(book.id)}
                    />
                  </div>
                </label>
              ))}
            </div>
          </section>

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

          <section className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="font-semibold">4. Meetup + Reading Plan</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="text-sm">
                Start date
                <input type="date" className="mt-1 w-full rounded-xl border p-2" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </label>
              <label className="text-sm">
                Meetup date
                <input type="date" className="mt-1 w-full rounded-xl border p-2" value={meetupDate} onChange={(e) => setMeetupDate(e.target.value)} />
              </label>
              <label className="text-sm">
                Meetup time
                <input type="time" className="mt-1 w-full rounded-xl border p-2" value={meetupTime} onChange={(e) => setMeetupTime(e.target.value)} />
              </label>
              <label className="text-sm">
                Reading pace
                <select className="mt-1 w-full rounded-xl border p-2" value={pace} onChange={(e) => setPace(e.target.value)}>
                  <option value="light">Light</option>
                  <option value="medium">Medium</option>
                  <option value="intense">Intense</option>
                </select>
              </label>
              <label className="text-sm sm:col-span-2">
                Location suggestion
                <input
                  className="mt-1 w-full rounded-xl border p-2"
                  value={locationSuggestion}
                  onChange={(e) => setLocationSuggestion(e.target.value)}
                />
              </label>
              <label className="text-sm sm:col-span-2">
                Playlist vibe
                <select className="mt-1 w-full rounded-xl border p-2" value={vibe} onChange={(e) => setVibe(e.target.value)}>
                  <option value="cozy">Cozy</option>
                  <option value="focus">Focus</option>
                  <option value="chill">Chill</option>
                </select>
              </label>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
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
              <button className="rounded-xl border px-3 py-2 text-sm" onClick={savePlan} disabled={saveState.loading}>
                {saveState.loading ? "Saving..." : "Save Plan"}
              </button>
              <button className="rounded-xl border px-3 py-2 text-sm" onClick={generateVoiceSummary} disabled={voiceState.loading}>
                {voiceState.loading ? "Generating..." : "Listen to Plan"}
              </button>
            </div>
            {saveState.message ? <p className="mt-2 text-xs text-slate-600">{saveState.message}</p> : null}
            {voiceState.error ? <p className="mt-2 text-xs text-red-600">{voiceState.error}</p> : null}
            {voiceState.audioUrl ? <audio className="mt-3 w-full" controls src={voiceState.audioUrl} /> : null}
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="font-semibold">Reading Checkpoints</h2>
            <div className="mt-3 space-y-2">
              {checkpoints.map((cp) => (
                <div key={cp.index} className="rounded-xl border p-2 text-sm">
                  <div className="font-medium">Checkpoint {cp.index}</div>
                  <div className="text-slate-600">By {cp.date}</div>
                  <div>Pages {cp.startPage}–{cp.endPage}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="font-semibold">Discussion Prompts</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
              <li>What stood out most in this week’s pages?</li>
              <li>Which idea or character felt most relevant to your life?</li>
              <li>What would you disagree with or challenge?</li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}