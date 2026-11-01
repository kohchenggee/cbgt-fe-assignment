import { CheckIcon } from "@radix-ui/react-icons";
import type { TransferResponse } from "../../api/types";
import { formatMoney } from "../../lib/format";

interface SuccessProps {
  transfer: TransferResponse["transfer"];
  onClose: () => void;
}

export default function SuccessScreen({ transfer, onClose }: SuccessProps) {
  return (
    <div className="dialog-step dialog-step--success" aria-live="polite">
      <div className="success-icon" aria-hidden>
        <CheckIcon />
      </div>
      <h2 className="dialog-step__title">Transfer sent!</h2>
      <dl className="review-list">
        <div className="review-list__row">
          <dt className="review-list__label">Amount</dt>
          <dd className="review-list__value amount">
            {formatMoney(transfer.amount)}
          </dd>
        </div>
        <div className="review-list__row">
          <dt className="review-list__label">Recipient</dt>
          <dd className="review-list__value">{transfer.recipient.name}</dd>
        </div>
        <div className="review-list__row">
          <dt className="review-list__label">Reference</dt>
          <dd className="review-list__value">
            <code>{transfer.reference}</code>
          </dd>
        </div>
      </dl>
      <div className="dialog-footer">
        <button type="button" className="btn-primary" onClick={onClose}>
          Back to dashboard
        </button>
      </div>
    </div>
  );
}