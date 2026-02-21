"use client";

import { useMemo, useState } from "react";
import GroupSetup from "@/components/GroupSetup";
import BookRecommendations from "@/components/BookRecommendations";
import BookVoting from "@/components/BookVoting";
import FinalPlanCard from "@/components/FinalPlanCard";
import CheckpointsList from "@/components/CheckpointsList";
import { sampleBooks } from "@/data/sampleBooks";
import { addDays, formatDateInput, generateCheckpoints } from "@/lib/checkpointGenerator";

export default function MeetupPlanner() {
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
    return generateCheckpoints({ totalPages: winningBook.pages, startDate, meetupDate, pace });
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
        meetup: { startDate, meetupDate, meetupTime, pace, locationSuggestion, vibe },
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
      setVoiceState({ loading: false, audioUrl: "", error: err.message || "Voice summary failed" });
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <GroupSetup
            groupName={groupName}
            setGroupName={setGroupName}
            members={members}
            newMember={newMember}
            setNewMember={setNewMember}
            onAddMember={handleAddMember}
          />

          <BookRecommendations
            recommendationPrompt={recommendationPrompt}
            setRecommendationPrompt={setRecommendationPrompt}
            onFetch={fetchBookRecommendations}
            loading={loadingRecs}
            error={recError}
            bookOptions={bookOptions}
            selectedBookId={selectedBookId}
            setSelectedBookId={setSelectedBookId}
          />

          <BookVoting
            members={members}
            votes={votes}
            setVotes={setVotes}
            selectedBookId={selectedBookId}
            bookOptions={bookOptions}
            winningBook={winningBook}
          />

          <section className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="font-semibold">4. Meetup + Reading Plan</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="text-sm">Start date
                <input type="date" className="mt-1 w-full rounded-xl border p-2" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </label>
              <label className="text-sm">Meetup date
                <input type="date" className="mt-1 w-full rounded-xl border p-2" value={meetupDate} onChange={(e) => setMeetupDate(e.target.value)} />
              </label>
              <label className="text-sm">Meetup time
                <input type="time" className="mt-1 w-full rounded-xl border p-2" value={meetupTime} onChange={(e) => setMeetupTime(e.target.value)} />
              </label>
              <label className="text-sm">Reading pace
                <select className="mt-1 w-full rounded-xl border p-2" value={pace} onChange={(e) => setPace(e.target.value)}>
                  <option value="light">Light</option>
                  <option value="medium">Medium</option>
                  <option value="intense">Intense</option>
                </select>
              </label>
              <label className="text-sm sm:col-span-2">Location suggestion
                <input className="mt-1 w-full rounded-xl border p-2" value={locationSuggestion} onChange={(e) => setLocationSuggestion(e.target.value)} />
              </label>
              <label className="text-sm sm:col-span-2">Playlist vibe
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
          <FinalPlanCard
            groupName={groupName}
            winningBook={winningBook}
            meetupDate={meetupDate}
            meetupTime={meetupTime}
            locationSuggestion={locationSuggestion}
            vibe={vibe}
            onSave={savePlan}
            saveState={saveState}
            onVoice={generateVoiceSummary}
            voiceState={voiceState}
          />

          <CheckpointsList checkpoints={checkpoints} />

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
