import { useState, useEffect } from "react";
import { Modal, Button, Input, Switch } from "antd";
import { Plus, Trash2, Coffee } from "lucide-react";

export default function BreakTimeSettings({ open, onClose, presets, onSave }) {
  const [localPresets, setLocalPresets] = useState([]);

  useEffect(() => {
    if (open) {
      setLocalPresets(presets.map((p) => ({ ...p })));
    }
  }, [open, presets]);

  const handleAddPreset = () => {
    setLocalPresets((prev) => [
      ...prev,
      {
        id: Date.now(),
        label: "",
        minutes: 15,
        isActive: true,
      },
    ]);
  };

  const handleRemovePreset = (id) => {
    setLocalPresets((prev) => prev.filter((p) => p.id !== id));
  };

  const handleUpdatePreset = (id, field, value) => {
    setLocalPresets((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <div className="flex items-center gap-2">
          <Coffee size={18} className="text-primary" />
          <span className="font-semibold">Break Time Settings</span>
        </div>
      }
      footer={
        <div className="flex gap-3 justify-end">
          <Button onClick={onClose} style={{ height: 44 }}>
            Cancel
          </Button>
          <Button
            type="primary"
            onClick={() => onSave(localPresets)}
            style={{ height: 44 }}
          >
            Save Settings
          </Button>
        </div>
      }
      width={500}
    >
      <p className="text-sm text-text/60 mb-5">
        Configure break time presets that can be applied to shifts.
      </p>

      <div className="space-y-3">
        {localPresets.map((preset) => (
          <div
            key={preset.id}
            className="flex items-center gap-3 p-3 rounded-xl border border-border bg-bg/50"
          >
            <Switch
              size="small"
              checked={preset.isActive}
              onChange={(checked) =>
                handleUpdatePreset(preset.id, "isActive", checked)
              }
            />
            <Input
              value={preset.label}
              onChange={(e) =>
                handleUpdatePreset(preset.id, "label", e.target.value)
              }
              placeholder="Break name"
              className="flex-1"
              style={{ height: 38 }}
            />
            <Input
              type="number"
              value={preset.minutes}
              onChange={(e) =>
                handleUpdatePreset(preset.id, "minutes", Number(e.target.value))
              }
              suffix="min"
              style={{ width: 100, height: 38 }}
              min={0}
            />
            <button
              onClick={() => handleRemovePreset(preset.id)}
              className="p-1.5 rounded-lg text-text/30 hover:text-danger hover:bg-danger/10 transition-all"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={handleAddPreset}
        className="w-full mt-3 flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-border text-text/50 hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all text-sm font-medium"
      >
        <Plus size={16} />
        Add Break Preset
      </button>
    </Modal>
  );
}
