// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { DietSession } from "../../shared/types";
import { CurrentDietSession } from "./current-diet-session";

const session = (overrides: Partial<DietSession> = {}): DietSession => ({
  id: "session-1",
  name: "令和8年第3回定例会",
  slug: "r8-3",
  shugiin_url: null,
  start_date: "2026-09-01",
  end_date: "2026-09-30",
  is_active: false,
  created_at: "2026-09-01T00:00:00.000Z",
  updated_at: "2026-09-01T00:00:00.000Z",
  ...overrides,
});

describe("CurrentDietSession", () => {
  it("閉会中は終了した会期名と100%の進行バーを出し、閉会予定とは書かない", () => {
    render(
      <CurrentDietSession
        session={null}
        closedSession={session()}
        now={new Date("2026-10-15T00:00:00.000Z")}
      />
    );

    expect(
      screen.getByText(/令和8年第3回定例会は終了しました/)
    ).toBeInTheDocument();
    // Progress コンポーネントは value をバーの transform で表す（100%なら -0%）。
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
    expect(
      document.querySelector('[data-slot="progress-indicator"]')
    ).toHaveStyle({ transform: "translateX(-0%)" });
    expect(screen.getByText(/閉会$/)).toBeInTheDocument();
    expect(screen.queryByText(/閉会予定/)).not.toBeInTheDocument();
    expect(screen.queryByText(/閉会まで/)).not.toBeInTheDocument();
  });

  it("会期中は閉会までの残り日数と閉会予定を出す", () => {
    render(
      <CurrentDietSession
        session={session({ is_active: true })}
        closedSession={null}
        now={new Date("2026-09-15T00:00:00.000Z")}
      />
    );

    expect(screen.getByText(/閉会まで/)).toBeInTheDocument();
    expect(screen.getByText(/閉会予定/)).toBeInTheDocument();
  });
});
