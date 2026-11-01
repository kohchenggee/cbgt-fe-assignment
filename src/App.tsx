import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "./api/client";
import type { Health, CustomerResponse } from "./api/types";
import TotalAndAccounts from "./views/TotalAndAccounts";
import RecentTransactions from "./views/RecentTransactions";
import Headers from "./views/Headers";
import NewTransferDialog from "./views/NewTransferDialog";
import Greetings from "./views/Greetings";
import { formatMoney } from "./lib/format";

export default function App() {
  const [transferOpen, setTransferOpen] = useState(false);

  const health = useQuery({
    queryKey: ["health"],
    queryFn: () => apiFetch<Health>("/api/health"),
    retry: false,
  });

  const status = health.isPending
    ? "checking…"
    : health.isError
      ? "not connected"
      : "connected";
  void status; // used for debug / health indicator

  const { isError, error, refetch } = useQuery({
    queryKey: ["customer"],
    queryFn: () => apiFetch<CustomerResponse>("/api/customer"),
  });

  if (isError || error)
    return (
      <div className="container">
        <Headers />
        <div className="transactions-error" role="alert">
          We couldn't load your dashboard.
          <button type="button" className="btn-retry" onClick={() => refetch()}>
            Retry
          </button>
        </div>
      </div>
    );

  return (
    <div className="container">
      <Headers />
      <main className="main-layout">
        <div className="main-content">
          <Greetings />
          <TotalAndAccounts onNewTransfer={() => setTransferOpen(true)} />
          <RecentTransactions />
        </div>
        <aside className="main-rail">
          <section className="daily-limit">
            <div className="daily-limit__header">
              <span className="daily-limit__label">DAILY LIMIT</span>
            </div>

            <div className="daily-limit__amount">{formatMoney(5000)}</div>

            <span className="daily-limit__subtitle">Remaining today</span>

            <div
              className="daily-limit__progress"
              role="progressbar"
              aria-label="Remaining daily transfer limit"
              aria-valuemin={0}
              aria-valuemax={5000}
              aria-valuenow={5000}
            >
              <div
                className="daily-limit__progress-fill"
                style={{ width: `${100}%` }}
              />
            </div>

            <div className="daily-limit__footer">
              <span>Resets daily. Applies to all transfers.</span>
            </div>
          </section>
        </aside>
      </main>

      <div className="mobile-bottom-cta">
        <button
          type="button"
          className="btn-new-transfer"
          onClick={() => setTransferOpen(true)}
          aria-label="New transfer"
        >
          + New transfer
        </button>
      </div>

      <NewTransferDialog open={transferOpen} onOpenChange={setTransferOpen} />
    </div>
  );
}
