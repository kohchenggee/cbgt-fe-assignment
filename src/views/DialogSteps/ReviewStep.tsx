import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../api/client";
import type { AccountsResponse, Payee } from "../../api/types";
import { formatMoney } from "../../lib/format";
import { ChevronLeftIcon } from "@radix-ui/react-icons";
import type { NewRecipient } from "../NewTransferDialog";

interface ReviewStepProps {
  selectedPayee: Payee | null;
  newRecipient: NewRecipient | null;
  fromAccountId: string;
  amountStr: string;
  note: string;
  sendError: string | null;
  isSending: boolean;
  onBack: () => void;
  onConfirm: () => void;
}

export default function ReviewStep({
  selectedPayee,
  newRecipient,
  fromAccountId,
  amountStr,
  note,
  sendError,
  isSending,
  onBack,
  onConfirm,
}: ReviewStepProps) {
  const { data: accountData } = useQuery({
    queryKey: ["account"],
    queryFn: () => apiFetch<AccountsResponse>("/api/accounts"),
  });

  const fromAccount = accountData?.accounts.find((a) => a.id === fromAccountId);
  const recipientName = selectedPayee?.name ?? newRecipient?.name ?? "—";
  const recipientBank = selectedPayee?.bank ?? newRecipient?.bank ?? "—";
  const recipientNumber =
    selectedPayee?.accountNumberMasked ??
    (newRecipient?.accountNumber
      ? `•••• ${newRecipient.accountNumber.slice(-4)}`
      : "—");
  const amount = Number(amountStr);
  const fee = 0;

  const rows: [string, React.ReactNode][] = [
    [
      "From",
      fromAccount
        ? `${fromAccount.name} (${fromAccount.maskedNumber})`
        : fromAccountId,
    ],
    ["To", `${recipientName} · ${recipientBank} · ${recipientNumber}`],
    ["Amount", <span className="amount">{formatMoney(amount)}</span>],
    ["Fee", formatMoney(fee)],
    ["Total", <strong className="amount">{formatMoney(amount + fee)}</strong>],
    ...(note ? [["Note", note] as [string, React.ReactNode]] : []),
  ];

  return (
    <div className="dialog-step">
      <h2 className="dialog-step__title">Review your transfer</h2>

      <dl className="review-list">
        {rows.map(([label, value]) => (
          <div key={label} className="review-list__row">
            <dt className="review-list__label">{label}</dt>
            <dd className="review-list__value">{value}</dd>
          </div>
        ))}
      </dl>

      {sendError && (
        <div
          className="dialog-error dialog-error--alert"
          role="alert"
          aria-live="assertive"
        >
          {sendError}
        </div>
      )}

      <div className="dialog-footer dialog-footer--split">
        <button
          type="button"
          className="btn-secondary"
          onClick={onBack}
          disabled={isSending}
        >
          <ChevronLeftIcon aria-hidden /> Back
        </button>
        <button
          type="button"
          className="btn-primary"
          onClick={onConfirm}
          disabled={isSending}
          aria-busy={isSending}
        >
          {isSending ? "Sending…" : "Confirm transfer"}
        </button>
      </div>
    </div>
  );
}
