import React from "react";
import { AlertCircle } from "lucide-react";

const SOPStepItem = React.memo(({ step, index }) => {
  return (
    <div className="flex gap-3">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary mt-0.5">
        {index + 1}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-text leading-relaxed">{step.text}</p>
        {step.note && (
          <div className="mt-1.5 flex items-start gap-1.5 rounded-[10px] bg-warning/8 px-3 py-2">
            <AlertCircle size={14} className="text-warning shrink-0 mt-0.5" />
            <p className="text-xs text-warning leading-relaxed">{step.note}</p>
          </div>
        )}
      </div>
    </div>
  );
});

SOPStepItem.displayName = "SOPStepItem";

export default SOPStepItem;
