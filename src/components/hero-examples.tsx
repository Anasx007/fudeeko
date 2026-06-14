export default function HeroExamples() {
  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-3">
      <div className="rounded-2xl bg-white p-4 shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFB703' }}>Mood</p>
        <p className="mt-2 text-base font-semibold" style={{ color: '#1F2937' }}>Quiet cafe to work</p>
      </div>
      <div className="rounded-2xl bg-white p-4 shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFB703' }}>Time</p>
        <p className="mt-2 text-base font-semibold" style={{ color: '#1F2937' }}>Late-night shawarma</p>
      </div>
      <div className="rounded-2xl bg-white p-4 shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#FFB703' }}>Occasion</p>
        <p className="mt-2 text-base font-semibold" style={{ color: '#1F2937' }}>Family dinner tonight</p>
      </div>
    </div>
  );
}
