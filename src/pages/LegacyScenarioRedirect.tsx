import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { hasScenarioQueryParams, TOOL_PATH } from "../lib/urlState";

export function LegacyScenarioRedirect() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!hasScenarioQueryParams(location.search)) {
      return;
    }

    navigate(
      {
        pathname: TOOL_PATH,
        search: location.search,
      },
      { replace: true },
    );
  }, [location.search, navigate]);

  return null;
}
