import { render } from "@testing-library/react";
import "@vitest/browser/providers/playwright";
import { describe, expect, test } from "vitest";
import { MediaHeaderComponent } from "../MediaHeader.component";
import { useAppZuStore } from "/app/app.zu.store";

describe("MediaHeader", () => {
  test("Uses preloaded state to render", () => {
    const initialMatch = useAppZuStore.getState();
    initialMatch.teams.homeTeam = {
      ...initialMatch.teams.homeTeam,
      name: "Test home team",
      goals: 21,
    };

    const { getByText } = render(<MediaHeaderComponent />);
    // const { getByText } = renderWithProviders(<MediaHeaderComponent />, {
    //   preloadedState: { match: initialMatch },
    // });
    expect(getByText(/21/)).toBeInTheDocument();
    expect(getByText(/Test home team/)).toBeInTheDocument();
  });

  test("Sets up initial state state with actions", () => {
    // const store = setupStore();
    // store.dispatch(updateStep(10));
    // const initialMatch = useAppZuStore.getState();

    const { getByText } = render(<MediaHeaderComponent />);
    expect(getByText(/00:05/)).toBeInTheDocument();
  });
});
