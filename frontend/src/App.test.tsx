import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";
import { CHIP } from "./data/chip";
import type { Potion } from "./type/potion";

vi.mock("./lib/brew", () => ({
  brewPotion: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn() },
}));

// A synthetic potion for the tests — test files may carry ingredient strings
// (the scope guard exempts them), so the deleted fixture lives here now.
const potion: Potion = {
  name: "The Quiet Heart Potion",
  ingredient: [
    "half a cup of water",
    "a spoonful of flour",
    "three pinches of salt",
    "a dried pasta star",
    "a spoonful of dry rice",
    "a length of ribbon",
  ],
  step: [
    {
      text: "Tip in the water and stir it three times.",
      ingredient: ["half a cup of water"],
      verb: "tip in",
    },
    {
      text: "Sprinkle in the flour and the salt together.",
      ingredient: ["a spoonful of flour", "three pinches of salt"],
      verb: "sprinkle",
    },
    {
      text: "Drop in the pasta star and whisper to it.",
      ingredient: ["a dried pasta star"],
      verb: "drop in",
    },
    {
      text: "Scatter the rice, then place the ribbon on top.",
      ingredient: ["a spoonful of dry rice", "a length of ribbon"],
      verb: "scatter",
    },
  ],
  closingLine: "Keep it warm and safe until morning.",
};

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
    let resolveBrew: (potion: Potion) => void = () => {};
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

    resolveBrew(potion);

    expect(await screen.findByText(potion.name)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /^brew$/i }),
    ).not.toBeInTheDocument();
  });

  it("surfaces a toast and returns to the form with Brew enabled when a brew fails", async () => {
    const { brewPotion } = await import("./lib/brew");
    const { toast } = await import("sonner");
    vi.mocked(brewPotion).mockRejectedValue(new Error("network down"));

    const user = userEvent.setup();
    render(<App />);

    await user.type(
      screen.getByLabelText(/what is bothering you/i),
      "i miss someone",
    );
    await user.click(screen.getByRole("button", { name: /^brew$/i }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledTimes(1));
    expect(vi.mocked(toast.error).mock.calls[0][0]).toMatch(/witch/i);

    // Back in front of an enabled Brew, trouble intact, no potion shown.
    const brewButton = screen.getByRole("button", { name: /^brew$/i });
    expect(brewButton).toBeEnabled();
    expect(screen.getByLabelText(/what is bothering you/i)).toHaveValue(
      "i miss someone",
    );
    expect(screen.queryByText(potion.name)).not.toBeInTheDocument();
  });

  it("moves focus to the potion name once it is shown", async () => {
    const { brewPotion } = await import("./lib/brew");
    vi.mocked(brewPotion).mockResolvedValue(potion);

    const user = userEvent.setup();
    render(<App />);

    await user.type(
      screen.getByLabelText(/what is bothering you/i),
      "i miss someone",
    );
    await user.click(screen.getByRole("button", { name: /^brew$/i }));

    const heading = await screen.findByRole("heading", {
      level: 2,
      name: potion.name,
    });
    await waitFor(() => expect(heading).toHaveFocus());
  });

  it("returns to the form with the trouble intact when Back is clicked", async () => {
    const { brewPotion } = await import("./lib/brew");
    vi.mocked(brewPotion).mockResolvedValue(potion);

    const user = userEvent.setup();
    render(<App />);

    await user.type(
      screen.getByLabelText(/what is bothering you/i),
      "i miss someone",
    );
    await user.click(screen.getByRole("button", { name: /^brew$/i }));
    await screen.findByText(potion.name);

    await user.click(screen.getByRole("button", { name: /back/i }));

    const troubleBox = screen.getByLabelText(/what is bothering you/i);
    expect(troubleBox).toHaveValue("i miss someone");
    await waitFor(() => expect(troubleBox).toHaveFocus());
  });

  it("returns to the form when Escape is pressed while presenting", async () => {
    const { brewPotion } = await import("./lib/brew");
    vi.mocked(brewPotion).mockResolvedValue(potion);

    const user = userEvent.setup();
    render(<App />);

    await user.type(
      screen.getByLabelText(/what is bothering you/i),
      "i miss someone",
    );
    await user.click(screen.getByRole("button", { name: /^brew$/i }));
    await screen.findByText(potion.name);

    await user.keyboard("{Escape}");

    expect(screen.getByLabelText(/what is bothering you/i)).toBeVisible();
    expect(screen.queryByText(potion.name)).not.toBeInTheDocument();
  });
});
