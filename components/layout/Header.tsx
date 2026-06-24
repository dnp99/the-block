import Link from "next/link";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

/** App header — sticky, borderless-blur. */
export function Header() {
  return (
    <header className="border-line bg-canvas/80 sticky top-0 z-30 border-b backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="text-ink focus-visible:ring-primary-500 flex items-center gap-2 rounded-lg font-semibold tracking-tight focus-visible:ring-2 focus-visible:outline-none"
        >
          <span
            aria-hidden
            className="bg-primary-600 grid h-7 w-7 place-items-center rounded-lg text-sm font-bold text-white"
          >
            O
          </span>
          Openlane
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-ink-subtle hidden text-xs font-medium sm:inline"></span>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
