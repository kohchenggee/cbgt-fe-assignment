import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "./api/client";
import type { Health, CustomerResponse } from "./api/types";
import TotalAndAccounts from "./views/TotalAndAccounts";
import RecentTransactions from "./views/RecentTransactions";
import Headers from "./views/Headers";
import NewTransferDialog from "./views/NewTransferDialog";
import Greetings from "./views/Greetings";

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
      <Greetings />
      <TotalAndAccounts onNewTransfer={() => setTransferOpen(true)} />
      <RecentTransactions />

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
