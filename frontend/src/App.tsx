import { useEffect, useState } from "react";
import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
import { getServerStatus } from "./api";
import AlgorithmsPage from "./features/algorithms/page";
import HomePage from "./features/dashboard/page";
import DatasetsPage from "./features/datasets/page";
import ExperimentsPage from "./features/experiments/page";
import FilesPage from "./features/files/page";
import ProjectWizardPage from "./features/project/page";
import { useProjectWizardStore } from "./features/project/stores/useProjectWizardStore";
import ResultsPage from "./features/results/page";
import SavePage from "./features/save/page";
import SettingsPage from "./features/settings/page";
import { AppLayout } from "./shared/components/layout/AppLayout";
import { useProjectStore } from "./shared/stores/useProjectStore";

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isInitialized, setIsInitialized] = useState(false);

  const fetchProjectSettings = useProjectStore(
    (state) => state.fetchProjectSettings
  );
  const { setMode, reset: resetWizard } = useProjectWizardStore();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check server status first
        const status = await getServerStatus();

        if (status.create_mode && !status.project_initialized) {
          // In create mode with no project - set up wizard for creation
          resetWizard();
          setMode("create");

          // Redirect to project wizard if not already there
          if (location.pathname !== "/project") {
            navigate("/project");
          }
        } else if (status.project_initialized) {
          // Existing project - load settings
          await fetchProjectSettings();
        }
      } catch (err) {
        console.error("Failed to initialize app:", err);
        // Try to load project settings anyway
        try {
          await fetchProjectSettings();
        } catch {
          // Project might not exist yet
        }
      }
      setIsInitialized(true);
    };

    initializeApp();
  }, [fetchProjectSettings, setMode, resetWizard, navigate, location.pathname]);

  // Show loading state until initialized
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <p className="text-white/60 font-display text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/project" element={<ProjectWizardPage />} />
        <Route path="/experiments" element={<ExperimentsPage />} />
        <Route path="/datasets" element={<DatasetsPage />} />
        <Route path="/algorithms" element={<AlgorithmsPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/files" element={<FilesPage />} />
        <Route path="/save" element={<SavePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </AppLayout>
  );
}
