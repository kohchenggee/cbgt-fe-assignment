import { CheckIcon } from "@radix-ui/react-icons";

export type Step = 1 | 2 | 3 | "success";

export const STEPS = ["Recipient", "Amount", "Review"] as const;

export default function Stepper({ step }: { step: Step }) {
  const active = step === "success" ? 3 : (step as number);
  return (
    <ol className="dialog-stepper" aria-label="Transfer steps">
      {STEPS.map((label, i) => {
        const num = i + 1;
        const done = num < active;
        const current = num === active;
        return (
          <li
            key={label}
            className={[
              "dialog-stepper__item",
              done ? "dialog-stepper__item--done" : "",
              current ? "dialog-stepper__item--active" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-current={current ? "step" : undefined}
          >
            <span className="dialog-stepper__indicator">
              {done ? <CheckIcon aria-hidden /> : num}
            </span>
            <span className="dialog-stepper__label">{label}</span>
          </li>
        );
      })}
    </ol>
  );
}