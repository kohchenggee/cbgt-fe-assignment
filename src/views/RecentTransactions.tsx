import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { apiFetch } from "../api/client";
import type { TransactionsResponse, Transaction } from "../api/types";
import { formatMoney, formatShortDate } from "../lib/format";
import { Skeleton } from "../components/Skeleton";
import { MagnifyingGlassIcon, Cross2Icon } from "@radix-ui/react-icons";

export default function RecentTransactions() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["transactions"],
    queryFn: () => apiFetch<TransactionsResponse>("/api/transactions?limit=8"),
  });

  const sortedTransactions = useMemo(() => {
    const list = data?.transactions ?? [];
    return [...list].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [data?.transactions]);

  const query = searchQuery.trim().toLowerCase();

  const filteredTransactions = useMemo(() => {
    if (!query) return sortedTransactions;
    return sortedTransactions.filter(
      (tx) =>
        tx.description.toLowerCase().includes(query) ||
        tx.category.toLowerCase().includes(query),
    );
  }, [sortedTransactions, query]);

  if (isLoading) {
    return (
      <section
        className="transactions-section"
        aria-labelledby="transactions-title"
      >
        <div className="transactions-header">
          <h2 id="transactions-title" className="transactions-title">
            Recent transactions
          </h2>
        </div>
        <div className="transactions-list">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="transaction-row transaction-row--skeleton">
              <div className="transaction-row__main">
                <Skeleton width="180px" height="18px" />
                <Skeleton width="120px" height="14px" />
              </div>
              <Skeleton width="90px" height="20px" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section
        className="transactions-section"
        aria-labelledby="transactions-title"
      >
        <div className="transactions-header">
          <h2 id="transactions-title" className="transactions-title">
            Recent transactions
          </h2>
        </div>
        <div className="transactions-error" role="alert">
          <p>We couldn't load your transactions: {error.message}</p>
          <button type="button" className="btn-retry" onClick={() => refetch()}>
            Retry
          </button>
        </div>
      </section>
    );
  }

  return (
    <section
      className="transactions-section"
      aria-labelledby="transactions-title"
    >
      <div className="transactions-header">
        <h2 id="transactions-title" className="transactions-title">
          Recent transactions
        </h2>

        <div className="transactions-search">
          <MagnifyingGlassIcon
            className="transactions-search__icon"
            aria-hidden="true"
          />
          <input
            id="transaction-search"
            type="search"
            className="transactions-search__input"
            placeholder="Search description or category"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search description or category"
          />
          {searchQuery && (
            <button
              type="button"
              className="transactions-search__clear"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
            >
              <Cross2Icon />
            </button>
          )}
        </div>
      </div>

      {query && (
        <div className="transactions-search-status" role="status">
          <span>
            {filteredTransactions.length === 1
              ? "1 match found"
              : `${filteredTransactions.length} matches found`}
          </span>
          <button
            type="button"
            className="transactions-search-status__clear"
            onClick={() => setSearchQuery("")}
          >
            Clear search
          </button>
        </div>
      )}

      {filteredTransactions.length === 0 ? (
        <div className="transactions-empty">
          <p className="transactions-empty__text">
            No transactions match your search.
          </p>
          <button
            type="button"
            className="btn-clear-search"
            onClick={() => setSearchQuery("")}
          >
            Clear search
          </button>
        </div>
      ) : (
        <ul className="transactions-list" role="list">
          {filteredTransactions.map((tx: Transaction) => {
            const isMoneyIn = tx.direction === "in";
            const formattedAmount = isMoneyIn
              ? `+${formatMoney(tx.amount)}`
              : formatMoney(-tx.amount);
            const categoryCap =
              tx.category.charAt(0).toUpperCase() + tx.category.slice(1);

            return (
              <li key={tx.id} className="transaction-row">
                <div className="transaction-row__main">
                  <span className="transaction-row__desc">
                    {tx.description}
                  </span>
                  <span className="transaction-row__meta">
                    {categoryCap} · {formatShortDate(tx.date)}
                  </span>
                </div>

                <div className="transaction-row__end">
                  {tx.status === "pending" && (
                    <span className="chip-pending">Pending</span>
                  )}
                  <span
                    className={`transaction-row__amount amount ${
                      isMoneyIn
                        ? "transaction-row__amount--in"
                        : "transaction-row__amount--out"
                    }`}
                  >
                    {formattedAmount}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
