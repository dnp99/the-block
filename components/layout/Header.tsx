import Link from "next/link";

/** App header — sticky, borderless-blur. ThemeToggle slot filled in the polish slice. */
export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-canvas/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg font-semibold tracking-tight text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          <span
            aria-hidden
            className="grid h-7 w-7 place-items-center rounded-lg bg-primary-600 text-sm font-bold text-white"
          >
            B
          </span>
          The Block
        </Link>
        <span className="text-xs font-medium text-ink-subtle">Buyer auctions</span>
      </div>
    </header>
  );
}
