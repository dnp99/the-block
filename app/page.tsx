/*
  Temporary home — replaced by the Search page in the next build step.
  Exists now to verify the token system + theming render correctly.
*/
export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold tracking-wide text-primary-700 uppercase">
        The Block
      </span>
      <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        Vehicle auction prototype
      </h1>
      <p className="max-w-md text-sm text-ink-muted">
        Scaffold is up. Search, vehicle detail, and bidding are coming next.
      </p>
      <div className="mt-2 flex gap-3">
        <button className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700">
          Primary action
        </button>
        <button className="rounded-xl bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700">
          Secondary
        </button>
      </div>
    </main>
  );
}
