import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { apiFetch } from "../api/client";
import type { AccountsResponse } from "../api/types";
import { formatMoney } from "../lib/format";
import { Skeleton } from "../components/Skeleton";
import { AccountCard } from "../components/AccountCard";

const totalAvailableTypes = ["checking", "savings"];

interface TotalAndAccountsProps {
  onNewTransfer?: () => void
}

export default function TotalAndAccounts({ onNewTransfer }: TotalAndAccountsProps) {
  const {
    data: accountData,
    isLoading: isRetrievingAccount,
    isError: isAccountError,
    error: accountError,
    refetch,
  } = useQuery({
    queryKey: ["account"],
    queryFn: () => apiFetch<AccountsResponse>("/api/accounts"),
  });

  const totalAvailable = useMemo(() => {
    return (
      accountData?.accounts.reduce((acc, val) => {
        if (totalAvailableTypes.includes(val.type)) {
          return val.balance + acc;
        }
        return acc;
      }, 0) ?? 0
    );
  }, [accountData?.accounts]);

  if (isRetrievingAccount) {
    return (
      <div className="accounts-overview">
        <div className="total-available-card">
          <Skeleton width="120px" height="14px" />
          <Skeleton width="220px" height="32px" />
          <Skeleton width="160px" height="14px" />
        </div>
        <div className="accounts-section">
          <Skeleton width="100px" height="20px" />
          <div className="accounts-grid">
            <Skeleton height="90px" borderRadius="var(--radius-lg)" />
            <Skeleton height="90px" borderRadius="var(--radius-lg)" />
            <Skeleton height="90px" borderRadius="var(--radius-lg)" />
          </div>
        </div>
      </div>
    );
  }

  if (isAccountError) {
    return (
      <div className="accounts-error" role="alert">
        <p>Error loading accounts: {accountError.message}</p>
        <button type="button" className="btn-retry" onClick={() => refetch()}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="accounts-overview">
      <div className="total-available-card">
        <div className="total-available-card__top">
          <span className="total-available-card__title">Total available</span>
          <button
            type="button"
            className="btn-new-transfer btn-new-transfer--desktop"
            onClick={onNewTransfer}
            aria-label="New transfer"
          >
            + New transfer
          </button>
        </div>
        <div className="total-available-card__amount amount">
          {formatMoney(totalAvailable)}
        </div>
        <span className="total-available-card__caption">
          Across 2 deposit accounts
        </span>
      </div>

      <div className="accounts-section">
        <h2 className="accounts-section__title">Accounts</h2>
        <div className="accounts-grid">
          {accountData?.accounts.map((account) => (
            <AccountCard key={account.id} account={account} />
          ))}
        </div>
      </div>
    </div>
  );
}

