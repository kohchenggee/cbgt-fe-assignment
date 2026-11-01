import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../api/client";
import type {
  Account,
  AccountsResponse,
  CustomerResponse,
} from "../../api/types";
import { useId, useMemo } from "react";
import {
  createAmountSchema,
  type AmountFormValues,
} from "../../lib/transferSchema";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Skeleton } from "../../components/Skeleton";
import { formatMoney } from "../../lib/format";
import { ChevronLeftIcon } from "@radix-ui/react-icons";

const QUICK_AMOUNTS = [50, 100, 250, 500];

interface AmountStepProps {
  fromAccountId: string;
  amountStr: string;
  note: string;
  onBack: () => void;
  onContinue: (fromAccountId: string, amountStr: string, note: string) => void;
}

export default function AmountStep({
  fromAccountId,
  amountStr,
  note,
  onBack,
  onContinue,
}: AmountStepProps) {
  const { data: accountData, isLoading: acctLoading } = useQuery({
    queryKey: ["account"],
    queryFn: () => apiFetch<AccountsResponse>("/api/accounts"),
  });

  const { data: customerData } = useQuery({
    queryKey: ["customer"],
    queryFn: () => apiFetch<CustomerResponse>("/api/customer"),
  });

  const depositAccounts = useMemo(
    () => accountData?.accounts.filter((a) => a.type !== "credit") ?? [],
    [accountData?.accounts],
  );

  const fromAcctId = useId();
  const amtId = useId();
  const noteId = useId();

  const customer = customerData?.customer;
  const schema = useMemo(
    () =>
      createAmountSchema(depositAccounts, customer?.dailyTransferLimit || 0),
    [depositAccounts, customer?.dailyTransferLimit],
  );

  const {
    register,
    handleSubmit,
    setValue,
    control,
    trigger,
    formState: { errors },
  } = useForm<AmountFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fromAccountId: fromAccountId || (depositAccounts[0]?.id ?? ""),
      amount: amountStr,
      note,
    },
  });

  const watchedAccountId = useWatch({
    control,
    name: "fromAccountId",
  });
  const watchedNote =
    useWatch({
      control,
      name: "note",
    }) ?? "";

  const watchedAmount =
    useWatch({
      control,
      name: "amount",
    }) ?? "";

  const selectedAccount: Account | undefined = depositAccounts.find(
    (a) => a.id === watchedAccountId,
  );

  const remainingLimit = customer
    ? customer.dailyTransferLimit - customer.transferredToday
    : null;

  function onSubmit(values: AmountFormValues) {
    onContinue(values.fromAccountId, values.amount, values.note ?? "");
  }

  return (
    <div className="dialog-step">
      <h2 className="dialog-step__title">How much to send?</h2>

      <form
        id="amount-form"
        className="new-recipient-form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <div className="form-field">
          <label htmlFor={fromAcctId} className="form-label">
            From account
          </label>
          {acctLoading ? (
            <Skeleton height="44px" borderRadius="var(--radius-sm)" />
          ) : (
            <select
              id={fromAcctId}
              className={[
                "form-select",
                errors.fromAccountId ? "form-input--error" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-describedby={
                errors.fromAccountId ? `${fromAcctId}-err` : undefined
              }
              aria-invalid={!!errors.fromAccountId}
              {...register("fromAccountId", {
                onChange: () => trigger("amount"),
              })}
            >
              {depositAccounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.maskedNumber}) — {formatMoney(a.balance)}
                </option>
              ))}
            </select>
          )}
          {errors.fromAccountId && (
            <p id={`${fromAcctId}-err`} className="form-error" role="alert">
              {errors.fromAccountId.message}
            </p>
          )}
          {selectedAccount && (
            <p className="form-hint">
              Available: <strong>{formatMoney(selectedAccount.balance)}</strong>
            </p>
          )}
        </div>

        {/* Amount */}
        <div className="form-field">
          <label htmlFor={amtId} className="form-label">
            Amount (SGD)
          </label>
          <div className="amount-input-wrap">
            <span className="amount-input-prefix" aria-hidden>
              SGD
            </span>
            <input
              id={amtId}
              type="text"
              inputMode="decimal"
              className={[
                "form-input form-input--amount",
                errors.amount ? "form-input--error" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              placeholder="0.00"
              aria-describedby={
                [
                  errors.amount ? `${amtId}-err` : "",
                  remainingLimit !== null ? `${amtId}-limit` : "",
                ]
                  .filter(Boolean)
                  .join(" ") || undefined
              }
              aria-invalid={!!errors.amount}
              {...register("amount")}
            />
          </div>
          {errors.amount && (
            <p id={`${amtId}-err`} className="form-error" role="alert">
              {errors.amount.message}
            </p>
          )}
          {remainingLimit !== null && (
            <p id={`${amtId}-limit`} className="form-hint">
              Available <strong>{formatMoney(remainingLimit)}</strong>
            </p>
          )}
          {customer?.dailyTransferLimit !== null && (
            <p id={`${amtId}-daily-limit`} className="form-hint">
              Remaining daily limit{" "}
              <strong>{formatMoney(customer?.dailyTransferLimit || 0)}</strong>
            </p>
          )}
        </div>

        <div
          className="quick-amounts"
          role="group"
          aria-label="Quick amount selection"
        >
          {QUICK_AMOUNTS.map((q) => (
            <button
              key={q}
              type="button"
              className={[
                "quick-amount-chip",
                watchedAmount === String(q) ? "quick-amount-chip--active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() =>
                setValue("amount", String(q), { shouldValidate: true })
              }
            >
              {q}
            </button>
          ))}
        </div>

        {/* Note */}
        <div className="form-field">
          <label htmlFor={noteId} className="form-label">
            Note <span className="form-label--optional">(optional)</span>
          </label>
          <textarea
            id={noteId}
            className="form-textarea"
            rows={2}
            maxLength={50}
            placeholder="What's this transfer for?"
            aria-describedby={`${noteId}-count`}
            {...register("note")}
          />
          <p
            id={`${noteId}-count`}
            className="form-hint form-hint--right"
            aria-live="polite"
          >
            {watchedNote.length}/50
          </p>
        </div>
      </form>

      <div className="dialog-footer dialog-footer--split">
        <button type="button" className="btn-secondary" onClick={onBack}>
          <ChevronLeftIcon aria-hidden /> Back
        </button>
        <button type="submit" form="amount-form" className="btn-primary">
          Continue
        </button>
      </div>
    </div>
  );
}
