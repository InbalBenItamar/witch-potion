import { render, screen, waitFor } from "@testing-library/react";
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
    expect(
      screen.queryByRole("button", { name: /^brew$/i }),
    ).not.toBeInTheDocument();
  });

  it("moves focus to the potion name once it is shown", async () => {
    const { brewPotion } = await import("./lib/brew");
    vi.mocked(brewPotion).mockResolvedValue(fixturePotion);

    const user = userEvent.setup();
    render(<App />);

    await user.type(
      screen.getByLabelText(/what is bothering you/i),
      "i miss someone",
    );
    await user.click(screen.getByRole("button", { name: /^brew$/i }));

    const heading = await screen.findByRole("heading", {
      level: 2,
      name: fixturePotion.name,
    });
    await waitFor(() => expect(heading).toHaveFocus());
  });

  it("returns to the form with the trouble intact when Back is clicked", async () => {
    const { brewPotion } = await import("./lib/brew");
    vi.mocked(brewPotion).mockResolvedValue(fixturePotion);

    const user = userEvent.setup();
    render(<App />);

    await user.type(
      screen.getByLabelText(/what is bothering you/i),
      "i miss someone",
    );
    await user.click(screen.getByRole("button", { name: /^brew$/i }));
    await screen.findByText(fixturePotion.name);

    await user.click(screen.getByRole("button", { name: /back/i }));

    const troubleBox = screen.getByLabelText(/what is bothering you/i);
    expect(troubleBox).toHaveValue("i miss someone");
    await waitFor(() => expect(troubleBox).toHaveFocus());
  });

  it("returns to the form when Escape is pressed while presenting", async () => {
    const { brewPotion } = await import("./lib/brew");
    vi.mocked(brewPotion).mockResolvedValue(fixturePotion);

    const user = userEvent.setup();
    render(<App />);

    await user.type(
      screen.getByLabelText(/what is bothering you/i),
      "i miss someone",
    );
    await user.click(screen.getByRole("button", { name: /^brew$/i }));
    await screen.findByText(fixturePotion.name);

    await user.keyboard("{Escape}");

    expect(screen.getByLabelText(/what is bothering you/i)).toBeVisible();
    expect(screen.queryByText(fixturePotion.name)).not.toBeInTheDocument();
  });
});
