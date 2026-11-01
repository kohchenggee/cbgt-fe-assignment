import { z } from "zod";
import type { Account } from "../api/types";
import { formatMoney } from "./format";

export const BANKS = [
  "DBS",
  "OCBC",
  "UOB",
  "POSB",
  "Citibank",
  "Standard Chartered",
  "HSBC",
  "Maybank",
] as const;

export const recipientSchema = z.object({
  name: z
    .string()
    .min(2, "Enter a recipient name (2–50 characters).")
    .max(50, "Name must be 50 characters or fewer."),
  accountNumber: z
    .string()
    .regex(/^\d{8}$/, "Enter a valid 8-digit account number."),
  bank: z.string().min(2, "Choose a bank.").max(30, "Bank name too long."),
});

export const createAmountSchema = (accounts: Account[], dailyLimit: number) =>
  z
    .object({
      fromAccountId: z.string().min(1, "Choose an account to transfer from."),
      amount: z
        .string()
        .min(1, "Enter an amount.")
        .refine(
          (v) => !isNaN(Number(v)) && Number(v) > 0,
          "Enter a valid amount greater than 0.",
        )
        .refine(
          (v) => /^\d+(\.\d{1,2})?$/.test(v.trim()),
          "Use at most 2 decimal places.",
        ),
      note: z
        .string()
        .max(50, "Keep the note to 50 characters or fewer.")
        .optional(),
    })
    .superRefine((values, ctx) => {
      const amount = Number(values.amount);

      const selectedAccount = accounts.find(
        (account) => account.id === values.fromAccountId,
      );

      if (!selectedAccount || !values.amount || isNaN(amount) || amount <= 0) {
        return;
      }

      if (amount > selectedAccount.balance) {
        ctx.addIssue({
          code: "custom",
          path: ["amount"],
          message: `Amount can't be more than your available balance (${formatMoney(selectedAccount.balance)}).`,
        });
      }

      if (amount > dailyLimit) {
        ctx.addIssue({
          code: "custom",
          path: ["amount"],
          message: `This transfer exceeds your remaining daily limit (${formatMoney(dailyLimit)}).`,
        });
      }
    });

export type AmountFormValues = z.infer<ReturnType<typeof createAmountSchema>>;

export type RecipientFormValues = z.infer<typeof recipientSchema>;
