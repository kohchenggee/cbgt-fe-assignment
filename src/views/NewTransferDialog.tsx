import { useState, useId } from "react";
import Modal from "react-modal";
import { Cross2Icon} from "@radix-ui/react-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { apiFetch } from "../api/client";
import type {
  Payee,
  TransferResponse,
  CreateTransferRequest,
} from "../api/types";
import {
  recipientSchema,
  createAmountSchema,
} from "../lib/transferSchema";
import Stepper, { type Step } from "../components/Stepper";
import RecipientStep from "./DialogSteps/RecipientStep";
import AmountStep from "./DialogSteps/AmountStep";
import ReviewStep from "./DialogSteps/ReviewStep";
import SuccessScreen from "./DialogSteps/SuccessScreen";

export type RecipientFormValues = z.infer<typeof recipientSchema>;
export type AmountFormValues = z.infer<
  ReturnType<typeof createAmountSchema>
>;
export interface NewRecipient {
  name: string;
  accountNumber: string;
  bank: string;
}


interface NewTransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function NewTransferDialog({
  open,
  onOpenChange,
}: NewTransferDialogProps) {
  const queryClient = useQueryClient();

  // ── Wizard state ──────────────────────────────────────────────────────────
  const [step, setStep] = useState<Step>(1);
  const [selectedPayee, setSelectedPayee] = useState<Payee | null>(null);
  const [newRecipient, setNewRecipient] = useState<NewRecipient | null>(null);
  const [fromAccountId, setFromAccountId] = useState("");
  const [amountStr, setAmountStr] = useState("");
  const [note, setNote] = useState("");
  const [sendError, setSendError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<
    TransferResponse["transfer"] | null
  >(null);

  // ── Mutation ──────────────────────────────────────────────────────────────
  const mutation = useMutation({
    mutationFn: (body: CreateTransferRequest) =>
      apiFetch<TransferResponse>("/api/transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["account"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      setSuccessData(data.transfer);
      setStep("success");
      setSendError(null);
    },
    onError: (err: Error) => {
      setSendError(err.message);
    },
  });

  function resetState() {
    setStep(1);
    setSelectedPayee(null);
    setNewRecipient(null);
    setFromAccountId("");
    setAmountStr("");
    setNote("");
    setSendError(null);
    setSuccessData(null);
  }

  function handleOpenChange(value: boolean) {
    if (!value) resetState();
    onOpenChange(value);
  }

  function handleStep1Continue() {
    setStep(2);
  }

  function handleStep2Continue(acctId: string, amt: string, n: string) {
    setFromAccountId(acctId);
    setAmountStr(amt);
    setNote(n);
    setStep(3);
  }

  function handleConfirm() {
    setSendError(null);
    const body: CreateTransferRequest = {
      fromAccountId,
      amount: Number(amountStr),
      ...(note.trim() ? { note: note.trim() } : {}),
      ...(selectedPayee ? { payeeId: selectedPayee.id } : {}),
      ...(newRecipient && !selectedPayee ? { recipient: newRecipient } : {}),
    };
    mutation.mutate(body);
  }

  const descId = useId();

  return (
    <Modal
      isOpen={open}
      onRequestClose={() => handleOpenChange(false)}
      shouldCloseOnOverlayClick={true}
      shouldCloseOnEsc={true}
      className="dialog-content"
      overlayClassName="dialog-overlay"
      aria={{
        labelledby: "transfer-dialog-title",
        describedby: descId,
      }}
    >
      <div className="dialog-header">
        <h2 id="transfer-dialog-title" className="dialog-title">
          New transfer
        </h2>

        <button
          type="button"
          className="dialog-close"
          aria-label="Close dialog"
          onClick={() => handleOpenChange(false)}
        >
          <Cross2Icon aria-hidden />
        </button>
      </div>

      <p id={descId} className="sr-only">
        Transfer money to a recipient in three steps: choose recipient, enter
        amount, then review and confirm.
      </p>

      {step !== "success" && <Stepper step={step} />}

      {step === 1 && (
        <RecipientStep
          selectedPayee={selectedPayee}
          newRecipient={newRecipient}
          onSelectPayee={setSelectedPayee}
          onSetNewRecipient={setNewRecipient}
          onContinue={handleStep1Continue}
        />
      )}

      {step === 2 && (
        <AmountStep
          fromAccountId={fromAccountId}
          amountStr={amountStr}
          note={note}
          onBack={() => setStep(1)}
          onContinue={handleStep2Continue}
        />
      )}

      {step === 3 && (
        <ReviewStep
          selectedPayee={selectedPayee}
          newRecipient={newRecipient}
          fromAccountId={fromAccountId}
          amountStr={amountStr}
          note={note}
          sendError={sendError}
          isSending={mutation.isPending}
          onBack={() => {
            setSendError(null);
            setStep(2);
          }}
          onConfirm={handleConfirm}
        />
      )}

      {step === "success" && successData && (
        <SuccessScreen
          transfer={successData}
          onClose={() => handleOpenChange(false)}
        />
      )}
    </Modal>
  );
}
