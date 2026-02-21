export default function CheckpointsList({ checkpoints }) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="font-semibold">Reading Checkpoints</h2>
      <div className="mt-3 space-y-2">
        {checkpoints.map((cp) => (
          <div key={cp.index} className="rounded-xl border p-2 text-sm">
            <div className="font-medium">Checkpoint {cp.index}</div>
            <div className="text-slate-600">By {cp.date}</div>
            <div>
              Pages {cp.startPage}–{cp.endPage}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
