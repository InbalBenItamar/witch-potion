import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";
import { CHIP } from "./data/chip";
import { fixturePotion } from "./fixture/potion";

vi.mock("./lib/brew", () => ({
  brewPotion: vi.fn(),
}));

afterEach(() => {
  vi.resetAllMocks();
});

describe("App", () => {
  it("refuses an empty trouble with a visible message and does not start brewing", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /brew/i }));

    expect(screen.getByRole("alert")).toHaveTextContent(/tell the witch/i);
    expect(screen.getByRole("button", { name: /brew/i })).toBeEnabled();
  });

  it("refuses a whitespace-only trouble the same way", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText(/what is bothering you/i), "   ");
    await user.click(screen.getByRole("button", { name: /brew/i }));

    expect(screen.getByRole("alert")).toHaveTextContent(/tell the witch/i);
  });

  it("fills the text box from a chip without brewing", async () => {
    const { brewPotion } = await import("./lib/brew");
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: CHIP[0] }));

    expect(screen.getByLabelText(/what is bothering you/i)).toHaveValue(
      CHIP[0],
    );
    expect(brewPotion).not.toHaveBeenCalled();
  });

  it("disables Brew while brewing and shows the potion once it resolves", async () => {
    const { brewPotion } = await import("./lib/brew");
    let resolveBrew: (potion: typeof fixturePotion) => void = () => {};
    vi.mocked(brewPotion).mockReturnValue(
      new Promise((resolve) => {
        resolveBrew = resolve;
      }),
    );

    const user = userEvent.setup();
    render(<App />);

    await user.type(
      screen.getByLabelText(/what is bothering you/i),
      "i miss someone",
    );
    await user.click(screen.getByRole("button", { name: /brew/i }));

    expect(screen.getByRole("button", { name: /brewing/i })).toBeDisabled();

    resolveBrew(fixturePotion);

    expect(await screen.findByText(fixturePotion.name)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^brew$/i })).toBeEnabled();
  });
});
