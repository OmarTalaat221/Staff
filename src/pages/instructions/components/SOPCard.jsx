import React, { useCallback } from "react";
import { ChevronDown, ChevronRight, Lightbulb, Users } from "lucide-react";
import PriorityBadge from "./PriorityBadge";
import CategoryBadge from "./CategoryBadge";
import SOPStepItem from "./SOPStepItem";
import { ROLES } from "../data/sopsData";

const SOPCard = React.memo(({ sop, expanded, onToggle }) => {
  const handleToggle = useCallback(() => {
    onToggle(sop.id);
  }, [onToggle, sop.id]);

  const roleLabels = sop.roles
    .map((rKey) => {
      const found = ROLES.find((r) => r.key === rKey);
      return found ? found.label : rKey;
    })
    .join(", ");

  return (
    <div className="rounded-[18px] border border-border bg-surface overflow-hidden transition-shadow hover:shadow-sm">
      {/* Header — always visible */}
      <button
        onClick={handleToggle}
        className="flex w-full items-center gap-3 p-4 text-left cursor-pointer sm:p-5"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-bg text-text/40">
          {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-text sm:text-base truncate">
              {sop.title}
            </h3>
            <PriorityBadge priority={sop.priority} />
            <CategoryBadge category={sop.category} />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-text/40">
            <Users size={12} />
            <span>{roleLabels}</span>
            <span className="mx-1">·</span>
            <span>
              {sop.steps.length} step{sop.steps.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </button>

      {/* Expandable content */}
      {expanded && (
        <div className="border-t border-border px-4 pb-5 pt-4 sm:px-5">
          <div className="space-y-4">
            {sop.steps.map((step, idx) => (
              <SOPStepItem key={step.id} step={step} index={idx} />
            ))}
          </div>

          {sop.tips && (
            <div className="mt-5 flex items-start gap-2 rounded-[12px] bg-primary/5 px-4 py-3">
              <Lightbulb size={16} className="text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-text/70 leading-relaxed">{sop.tips}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

SOPCard.displayName = "SOPCard";

export default SOPCard;
