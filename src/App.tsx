import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { EXPERIMENT_SIZE_TOOL_PATH } from "./lib/experimentSizeUrlState";
import { applyMetadata } from "./lib/metadata";
import { TOOL_PATH } from "./lib/urlState";
import { ExperimentSizePage } from "./pages/ExperimentSizePage";
import { HomePage } from "./pages/HomePage";
import { LegacyScenarioRedirect } from "./pages/LegacyScenarioRedirect";
import { RetargetingPage } from "./pages/RetargetingPage";
import { useEffect } from "react";

function HomeRoute() {
  useEffect(() => {
    applyMetadata({
      title: "Incrementality Lab",
      description:
        "Interactive tools to explore the gap between attribution and incremental performance.",
      url: "https://lab.mzhirnov.com/",
      image: "https://lab.mzhirnov.com/og/home.png",
    });
  }, []);

  return (
    <>
      <LegacyScenarioRedirect />
      <HomePage />
    </>
  );
}

function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname]);

  return null;
}

function App() {
  return (
    <AppLayout>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route path={TOOL_PATH} element={<RetargetingPage />} />
        <Route path={EXPERIMENT_SIZE_TOOL_PATH} element={<ExperimentSizePage />} />
        <Route path="*" element={<Navigate replace to="/" />} />
      </Routes>
    </AppLayout>
  );
}

export default App;
