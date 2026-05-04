import React, { Fragment } from "react";
import { Check } from "lucide-react";

// Pill-style step bar. Completed steps clickable; current/upcoming inert.
// Connecting line: solid emerald between completed segments, dashed gray
// for upcoming. Step count label always reflects steps.length (fixed count
// per redesign — no more dynamic step insertion).
export default function StepIndicator({ steps, currentStep, onStepClick }) {
  return (
    <div className="w-full">
      <div className="flex items-center">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentStep;
          const isCurrent = idx === currentStep;
          const isClickable = isCompleted && typeof onStepClick === "function";

          const circleClass = isCompleted
            ? "bg-emerald-500 text-white"
            : isCurrent
              ? "bg-orange-500 text-white"
              : "border-2 border-gray-300 bg-white text-gray-400";

          const labelClass = isCompleted
            ? "text-emerald-600"
            : isCurrent
              ? "text-orange-600"
              : "text-gray-400";

          return (
            <Fragment key={step.id}>
              <button
                type="button"
                onClick={isClickable ? () => onStepClick(idx) : undefined}
                disabled={!isClickable}
                aria-current={isCurrent ? "step" : undefined}
                className={`flex items-center gap-2 ${isClickable ? "cursor-pointer" : "cursor-default"}`}
              >
                <span
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold transition-colors duration-150 ${circleClass}`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : idx + 1}
                </span>
                <span className={`text-sm font-medium hidden sm:block ${labelClass}`}>
                  {step.label}
                </span>
              </button>

              {idx < steps.length - 1 && (
                <div className="flex-1 mx-3 relative h-0">
                  {idx < currentStep ? (
                    <div className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-emerald-500" />
                  ) : (
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-gray-300" />
                  )}
                </div>
              )}
            </Fragment>
          );
        })}
      </div>

      <div className="mt-3 text-xs text-gray-500">
        Step {currentStep + 1} of {steps.length}
      </div>
    </div>
  );
}
