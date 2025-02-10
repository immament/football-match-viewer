import "@vitest/browser/providers/playwright";
import { describe, expect, test } from "vitest";
import { getInitialState, updateStep } from "../../../../match/match.slice";
import { MediaHeaderComponent } from "../MediaHeader.component";
import { setupStore } from "/app/store";
import { renderWithProviders } from "/src/utils/test-utils";

describe("MediaHeader", () => {
  test("Uses preloaded state to render", () => {
    const initialMatch = getInitialState();
    initialMatch.teams.homeTeam = {
      ...initialMatch.teams.homeTeam,
      name: "Test home team",
      goals: 21,
    };

    const { getByText } = renderWithProviders(<MediaHeaderComponent />, {
      preloadedState: { match: initialMatch },
    });
    expect(getByText(/21/)).toBeInTheDocument();
    expect(getByText(/Test home team/)).toBeInTheDocument();
  });

  test("Sets up initial state state with actions", () => {
    const store = setupStore();
    store.dispatch(updateStep(10));

    const { getByText } = renderWithProviders(<MediaHeaderComponent />, {
      store,
    });
    expect(getByText(/00:05/)).toBeInTheDocument();
  });
});
