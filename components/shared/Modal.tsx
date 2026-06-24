"use client";

import { useEffect, useRef } from "react";

/*
  Accessible modal built on the native <dialog> element — focus trap, Esc to
  close, and a dimmed backdrop come for free. Controlled via the `open` prop.
*/
export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-line bg-surface p-0 text-ink shadow-xl backdrop:bg-neutral-900/50 backdrop:backdrop-blur-sm"
    >
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="grid h-7 w-7 cursor-pointer place-items-center rounded-lg text-ink-subtle transition hover:bg-neutral-100 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:hover:bg-neutral-800"
        >
          <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="max-h-[70vh] overflow-y-auto p-4">{children}</div>
    </dialog>
  );
}
