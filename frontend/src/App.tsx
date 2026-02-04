import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import AlgorithmsPage from "./features/algorithms/page";
import HomePage from "./features/dashboard/page";
import DatasetsPage from "./features/datasets/page";
import ExperimentsPage from "./features/experiments/page";
import FilesPage from "./features/files/page";
import MetricsPage from "./features/metrics/page";
import ProjectWizardPage from "./features/project/page";
import ResultsPage from "./features/results/page";
import SavePage from "./features/save/page";
import SettingsPage from "./features/settings/page";
import { AppLayout } from "./shared/components/layout/AppLayout";
import { useProjectStore } from "./shared/stores/useProjectStore";

export default function App() {
  const fetchProjectSettings = useProjectStore(
    (state) => state.fetchProjectSettings
  );

  useEffect(() => {
    fetchProjectSettings();
  }, [fetchProjectSettings]);

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/project" element={<ProjectWizardPage />} />
        <Route path="/experiments" element={<ExperimentsPage />} />
        <Route path="/datasets" element={<DatasetsPage />} />
        <Route path="/algorithms" element={<AlgorithmsPage />} />
        <Route path="/metrics" element={<MetricsPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/files" element={<FilesPage />} />
        <Route path="/save" element={<SavePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </AppLayout>
  );
}
