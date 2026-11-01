import type { Account, AccountType } from "../api/types";
import { formatMoney } from "../lib/format";

export interface AccountCardProps {
  account?: Account;
  name?: string;
  maskedNumber?: string;
  balance?: number;
  type?: AccountType;
  className?: string;
  onClick?: () => void;
}

export function AccountCard({
  account,
  name = account?.name ?? "",
  maskedNumber = account?.maskedNumber ?? "",
  balance = account?.balance ?? 0,
  type = account?.type,
  className = "",
  onClick,
}: AccountCardProps) {
  const isCredit = type === "credit";

  return (
    <div
      className={`account-card ${className}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="account-card__header">
        <span className="account-card__name">{name}</span>
        <span className="account-card__number">{maskedNumber}</span>
      </div>
      <div className="account-card__body">
        <span className="account-card__balance amount">
          {formatMoney(balance)}
        </span>
        {isCredit && (
          <span className="account-card__due-label">Amount due</span>
        )}
      </div>
    </div>
  );
}

export default AccountCard;

