import HeroExamples from '@/components/hero-examples';
import SearchForm from '@/components/search-form';

export default function HomePage() {
  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8" style={{ backgroundColor: '#FFFDF8', color: '#1F2937' }}>
      <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-5xl flex-col justify-center gap-8 py-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl text-white font-bold" style={{ backgroundColor: '#FF6B35' }}>F</div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em]" style={{ color: 'rgba(31,41,55,0.7)' }}>Fudeeko</p>
            </div>
          </div>
        </header>

        <section className="w-full rounded-2xl bg-white p-6 shadow-soft sm:p-10">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.28em]" style={{ color: '#FFB703' }}>Dining discovery</p>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl" style={{ color: '#1F2937' }}>
              Find the perfect place to eat right now.
            </h1>
            <p className="mt-3 max-w-2xl text-lg leading-7" style={{ color: 'rgba(31,41,55,0.8)' }}>
              Discover restaurants by food, mood, or occasion — fast, warm, and focused on what matters.
            </p>

            <div className="mt-6">
              <SearchForm />
            </div>

            <div className="mt-6">
              <HeroExamples />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
