import { fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderWithIntl } from "@/test/intl";

const { refresh } = vi.hoisted(() => ({ refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));

import { LanguageToggle } from "@/components/layout/LanguageToggle";

afterEach(() => {
  refresh.mockClear();
  document.cookie = "tb-locale=; max-age=0; path=/";
});

describe("LanguageToggle", () => {
  it("switching to French persists the cookie and refreshes", async () => {
    renderWithIntl(<LanguageToggle />); // active locale = en
    fireEvent.click(screen.getByRole("button", { name: "FR" }));
    expect(document.cookie).toContain("tb-locale=fr");
    await waitFor(() => expect(refresh).toHaveBeenCalled());
  });

  it("clicking the already-active locale does nothing", () => {
    renderWithIntl(<LanguageToggle />);
    fireEvent.click(screen.getByRole("button", { name: "EN" }));
    expect(refresh).not.toHaveBeenCalled();
  });
});
