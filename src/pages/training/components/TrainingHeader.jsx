import React from "react";
import { Button } from "antd";
import { Plus, Video } from "lucide-react";

const TrainingHeader = React.memo(
  ({ total, filteredCount, hasActiveFilters, onAddVideo }) => {
    return (
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-primary/10">
            <Video size={20} className="text-primary" />
          </div>

          <div>
            <h1 className="text-xl font-bold text-text sm:text-2xl">
              Training Videos
            </h1>
            <p className="text-sm text-text/50">
              {hasActiveFilters
                ? `Showing ${filteredCount} of ${total} videos`
                : `${total} videos available for staff training`}
            </p>
          </div>
        </div>

        <Button type="primary" icon={<Plus size={16} />} onClick={onAddVideo}>
          Upload Video
        </Button>
      </div>
    );
  }
);

TrainingHeader.displayName = "TrainingHeader";

export default TrainingHeader;
