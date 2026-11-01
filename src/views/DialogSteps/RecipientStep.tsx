import { useId, useState } from "react";
import type { Payee, PayeesResponse } from "../../api/types";
import type { NewRecipient, RecipientFormValues } from "../NewTransferDialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BANKS, recipientSchema } from "../../lib/transferSchema";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../api/client";
import { Skeleton } from "../../components/Skeleton";
import { CheckIcon } from "@radix-ui/react-icons";

interface RecipientStepProps {
  selectedPayee: Payee | null;
  newRecipient: NewRecipient | null;
  onSelectPayee: (payee: Payee) => void;
  onSetNewRecipient: (r: NewRecipient | null) => void;
  onContinue: () => void;
}

export default function RecipientStep({
  selectedPayee,
  newRecipient,
  onSelectPayee,
  onSetNewRecipient,
  onContinue,
}: RecipientStepProps) {
  const [search, setSearch] = useState("");
  const [showNewForm, setShowNewForm] = useState(newRecipient !== null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RecipientFormValues>({
    resolver: zodResolver(recipientSchema),
    defaultValues: newRecipient ?? { name: "", accountNumber: "", bank: "" },
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["payees"],
    queryFn: () => apiFetch<PayeesResponse>("/api/payees"),
  });

  const payees = data?.payees ?? [];
  const filtered = payees.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.bank.toLowerCase().includes(search.toLowerCase()),
  );

  const canContinue = selectedPayee !== null || newRecipient !== null;

  function onNewRecipientSubmit(values: RecipientFormValues) {
    onSetNewRecipient(values);
    onContinue();
  }

  function handleSavedPayeeContinue() {
    if (selectedPayee) onContinue();
  }

  const searchId = useId();
  const nameId = useId();
  const acctId = useId();
  const bankId = useId();

  return (
    <div className="dialog-step">
      <h2 className="dialog-step__title">Who are you sending to?</h2>

      {/* Saved payees */}
      <div className="dialog-section">
        <div className="dialog-search">
          <label htmlFor={searchId} className="sr-only">
            Search saved payees
          </label>
          <input
            id={searchId}
            type="search"
            className="dialog-search__input"
            placeholder="Search saved payees…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search saved payees"
          />
        </div>

        {isLoading && (
          <ul className="payee-list" aria-busy="true" aria-label="Saved payees">
            {[...Array(4)].map((_, i) => (
              <li
                key={i}
                className="payee-list__item payee-list__item--skeleton"
              >
                <Skeleton
                  width="40px"
                  height="40px"
                  borderRadius="var(--radius-full)"
                />
                <div style={{ flex: 1 }}>
                  <Skeleton width="120px" height="14px" />
                  <Skeleton width="80px" height="12px" />
                </div>
              </li>
            ))}
          </ul>
        )}

        {isError && (
          <p className="dialog-error" role="alert">
            Could not load payees. Try again.
          </p>
        )}

        {!isLoading && !isError && (
          <ul
            className="payee-list"
            role="radiogroup"
            aria-label="Saved payees"
            aria-busy="false"
          >
            {filtered.length === 0 && (
              <li className="payee-list__empty">
                No payees match your search.
              </li>
            )}
            {filtered.map((payee) => {
              const isSelected = selectedPayee?.id === payee.id;
              return (
                <li key={payee.id}>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    className={[
                      "payee-list__item",
                      isSelected ? "payee-list__item--selected" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => {
                      onSelectPayee(payee);
                      onSetNewRecipient(null);
                      setShowNewForm(false);
                    }}
                  >
                    <span className="payee-avatar" aria-hidden>
                      {payee.initials}
                    </span>
                    <span className="payee-info">
                      <span className="payee-info__name">{payee.name}</span>
                      <span className="payee-info__detail">
                        {payee.bank} · {payee.accountNumberMasked}
                      </span>
                    </span>
                    {isSelected && (
                      <CheckIcon className="payee-check" aria-hidden />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* New recipient disclosure */}
      <div className="dialog-section">
        <button
          type="button"
          className="new-recipient-toggle"
          aria-expanded={showNewForm}
          onClick={() => {
            setShowNewForm((v) => !v);
            if (showNewForm) onSetNewRecipient(null);
          }}
        >
          <span>+ Send to someone new</span>
        </button>

        {showNewForm && (
          <form
            id="new-recipient-form"
            className="new-recipient-form"
            onSubmit={handleSubmit(onNewRecipientSubmit)}
            noValidate
          >
            <div className="form-field">
              <label htmlFor={nameId} className="form-label">
                Recipient name
              </label>
              <input
                id={nameId}
                type="text"
                className={[
                  "form-input",
                  errors.name ? "form-input--error" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                autoComplete="off"
                aria-describedby={errors.name ? `${nameId}-err` : undefined}
                aria-invalid={!!errors.name}
                {...register("name")}
              />
              {errors.name && (
                <p id={`${nameId}-err`} className="form-error" role="alert">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="form-field">
              <label htmlFor={acctId} className="form-label">
                Account number
              </label>
              <input
                id={acctId}
                type="text"
                inputMode="numeric"
                maxLength={8}
                className={[
                  "form-input",
                  errors.accountNumber ? "form-input--error" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-describedby={
                  errors.accountNumber ? `${acctId}-err` : undefined
                }
                aria-invalid={!!errors.accountNumber}
                {...register("accountNumber")}
              />
              {errors.accountNumber && (
                <p id={`${acctId}-err`} className="form-error" role="alert">
                  {errors.accountNumber.message}
                </p>
              )}
            </div>

            <div className="form-field">
              <label htmlFor={bankId} className="form-label">
                Bank
              </label>
              <select
                id={bankId}
                className={[
                  "form-select",
                  errors.bank ? "form-input--error" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-describedby={errors.bank ? `${bankId}-err` : undefined}
                aria-invalid={!!errors.bank}
                {...register("bank")}
              >
                <option value="">Choose a bank…</option>
                {BANKS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
              {errors.bank && (
                <p id={`${bankId}-err`} className="form-error" role="alert">
                  {errors.bank.message}
                </p>
              )}
            </div>
          </form>
        )}
      </div>

      {/* Footer */}
      <div className="dialog-footer">
        {showNewForm ? (
          <button
            type="submit"
            form="new-recipient-form"
            className="btn-primary"
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            className="btn-primary"
            disabled={!canContinue}
            onClick={handleSavedPayeeContinue}
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
}
