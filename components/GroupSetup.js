export default function GroupSetup({ groupName, setGroupName, members, newMember, setNewMember, onAddMember }) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="font-semibold">1. Set Up Your Group</h2>
      <label className="mt-3 block text-sm">
        Group name
        <input
          className="mt-1 w-full rounded-xl border p-2"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />
      </label>

      <div className="mt-3 flex gap-2">
        <input
          className="flex-1 rounded-xl border p-2"
          placeholder="Add member name"
          value={newMember}
          onChange={(e) => setNewMember(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onAddMember()}
        />
        <button className="rounded-xl border px-3 py-2 text-sm" onClick={onAddMember}>
          Add
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {members.map((m) => (
          <span key={m.id} className="rounded-full bg-slate-100 px-3 py-1 text-sm">
            {m.name}
          </span>
        ))}
      </div>
    </section>
  );
}
