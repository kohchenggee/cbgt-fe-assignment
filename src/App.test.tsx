import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";
import { server } from "./test/setup";
import { http, HttpResponse } from "msw";

function renderApp() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>,
  );
}

// describe("starter", () => {
//   it("reaches the mock API", async () => {
//     renderApp();

//     const status = screen.getByRole("status");
//     await waitFor(
//       () => expect(status).toHaveTextContent("Mock API: connected"),
//       { timeout: 3000 },
//     );
//   });
// });

describe("Dashboard loaded", () => {
  it("shows greeting message", async () => {
    renderApp();

    await waitFor(
      () =>
        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
          "Good evening, Ava",
        ),
      { timeout: 3000 },
    );
  });

  it("shows couldn't load dashboard error", async () => {
    server.use(
      http.get("*/api/customer", () =>
        HttpResponse.json(
          { message: "Internal server error" },
          { status: 500 },
        ),
      ),
    );

    renderApp();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "We couldn't load your dashboard.",
    );
    server.resetHandlers();

    const retryButton = screen.getByRole("button", {
      name: "Retry",
    });

    fireEvent.click(retryButton);
    await waitFor(
      () =>
        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
          "Good evening, Ava",
        ),
      { timeout: 3000 },
    );
  });

  it("shows validation error", async () => {
    renderApp();

    await waitFor(
      () =>
        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
          "Good evening, Ava",
        ),
      { timeout: 3000 },
    );
    const transferButtons = screen.getAllByRole("button", {
      name: "New transfer",
    });

    fireEvent.click(transferButtons[0]);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText("Who are you sending to?")).toBeInTheDocument();
    });
    const dialog = screen.getByRole("dialog");

    fireEvent.click(
      within(dialog).getByRole("button", { name: "+ Send to someone new" }),
    );

    expect(
      within(dialog).getByRole("button", {
        name: "Continue",
      }),
    ).toBeEnabled();

    const continueButton = within(dialog).getByRole("button", {
      name: "Continue",
    });
    fireEvent.click(continueButton);
    await waitFor(() => {
      expect(
        within(dialog).getByText("Enter a recipient name (2–50 characters)."),
      ).toBeInTheDocument();
      expect(
        within(dialog).getByText("Enter a valid 8-digit account number."),
      ).toBeInTheDocument();
      expect(within(dialog).getByText("Choose a bank.")).toBeInTheDocument();
    });
  });

  it("shows user not allowed to transfer exceeding balance limit", async () => {
    renderApp();

    await waitFor(
      () =>
        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
          "Good evening, Ava",
        ),
      { timeout: 3000 },
    );
    const transferButtons = screen.getAllByRole("button", {
      name: "New transfer",
    });

    fireEvent.click(transferButtons[0]);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText("Who are you sending to?")).toBeInTheDocument();
    });
    const dialog = screen.getByRole("dialog");
    await waitFor(() => {
      expect(
        within(dialog).getByRole("radiogroup", {
          name: "Saved payees",
        }),
      ).toHaveAttribute("aria-busy", "false");
      expect(
        within(dialog).getByRole("button", {
          name: "Continue",
        }),
      ).toBeDisabled();
    });

    const payee = within(screen.getByRole("dialog")).getByRole("radio", {
      name: /Jamie Tan/,
    });

    fireEvent.click(payee);
    expect(
      within(dialog).getByRole("button", {
        name: "Continue",
      }),
    ).toBeEnabled();

    const continueButton = within(dialog).getByRole("button", {
      name: "Continue",
    });
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(screen.getByText("How much to send?")).toBeInTheDocument();
      expect(
        within(dialog).getByRole("button", { name: "Back" }),
      ).toBeInTheDocument();
    });

    const amountInput = within(screen.getByRole("dialog")).getByRole(
      "textbox",
      {
        name: "Amount (SGD)",
      },
    );
    fireEvent.change(amountInput, {
      target: { value: "50000" },
    });
    expect(amountInput).toHaveValue("50000");
    fireEvent.click(
      within(dialog).getByRole("button", {
        name: "Continue",
      }),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Amount can't be more than your available balance",
    );
  });

  it("shows successful adding new transfer flow", async () => {
    renderApp();
    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Good evening, Ava",
      }),
    ).toBeInTheDocument();
    const transferButtons = screen.getAllByRole("button", {
      name: "New transfer",
    });

    fireEvent.click(transferButtons[0]);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText("Who are you sending to?")).toBeInTheDocument();
    });
    const dialog = screen.getByRole("dialog");
    await waitFor(() => {
      expect(
        within(dialog).getByRole("radiogroup", {
          name: "Saved payees",
        }),
      ).toHaveAttribute("aria-busy", "false");
      expect(
        within(dialog).getByRole("button", {
          name: "Continue",
        }),
      ).toBeDisabled();
    });

    const payee = within(screen.getByRole("dialog")).getByRole("radio", {
      name: /Jamie Tan/,
    });

    fireEvent.click(payee);
    expect(
      within(dialog).getByRole("button", {
        name: "Continue",
      }),
    ).toBeEnabled();

    const continueButton = within(dialog).getByRole("button", {
      name: "Continue",
    });
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(screen.getByText("How much to send?")).toBeInTheDocument();
      expect(
        within(dialog).getByRole("button", { name: "Back" }),
      ).toBeInTheDocument();
    });

    fireEvent.click(within(dialog).getByRole("button", { name: "250" }));
    const amountInput = within(screen.getByRole("dialog")).getByRole(
      "textbox",
      {
        name: "Amount (SGD)",
      },
    );
    expect(amountInput).toHaveValue("250");

    fireEvent.click(
      within(dialog).getByRole("button", {
        name: "Continue",
      }),
    );

    await waitFor(() => {
      expect(screen.getByText("Review your transfer")).toBeInTheDocument();
      expect(
        within(dialog).getByRole("button", { name: "Confirm transfer" }),
      ).toBeInTheDocument();
    });

    fireEvent.click(
      within(dialog).getByRole("button", {
        name: "Confirm transfer",
      }),
    );

    await waitFor(() => {
      expect(screen.getByText("Transfer sent!")).toBeInTheDocument();
      expect(
        within(dialog).getByRole("button", { name: "Back to dashboard" }),
      ).toBeInTheDocument();
    });

    fireEvent.click(
      within(dialog).getByRole("button", {
        name: "Back to dashboard",
      }),
    );
    await waitFor(() => {
      expect(dialog).not.toBeVisible();
    });
  });
});
