import { Button } from "antd";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useRotaPage from "./useRotaPage";
import RotaTable from "./components/RotaTable";
import ApplyRotaModal from "./components/ApplyRotaModal";

export default function RotaList() {
  const navigate = useNavigate();
  const {
    templates,
    loading,
    
    applyModalOpen,
    applyingTemplate,
    applyLoading,
    openApplyModal,
    closeApplyModal,
    handleApplyTemplate,
  } = useRotaPage();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-text text-2xl font-bold">Rota Templates</h1>
          <p className="text-text/60 text-sm mt-1">
            Manage and apply recurring shift patterns
          </p>
        </div>
        <Button
          type="primary"
          icon={<Plus size={18} />}
          size="large"
          className="font-medium"
          onClick={() => navigate('/rota/create')}
        >
          Create Template
        </Button>
      </div>

      {/* Table Section */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <RotaTable 
          data={templates} 
          loading={loading}
          onApply={openApplyModal}
        />
      </div>

      <ApplyRotaModal
        open={applyModalOpen}
        onClose={closeApplyModal}
        onApply={handleApplyTemplate}
        template={applyingTemplate}
        loading={applyLoading}
      />
    </div>
  );
}


