import React from 'react';
import { Routes, Route } from 'react-router-dom';
import RouteMapPage from '../features/RouteMap/page/RouteMapPage';
import SensitiveAreaPage from '../features/sensitiveArea/page/SensitiveAreaPage';
import SensitiveAreaReviewPage from '../features/sensitiveArea/page/SensitiveAreaReviewPage';
import RouteOverviewPage from '../features/RouteMap/page/RouteOverviewPage';

const SandboxRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/route-overview/:applicationId" element={<RouteOverviewPage />} />
      <Route path="/route-map" element={<RouteMapPage />} />
      <Route path="/sensitive-area-check" element={<SensitiveAreaPage />} />
      <Route path="/sensitive-area-review" element={<SensitiveAreaReviewPage />} />
    </Routes>
  );
};

export default SandboxRouter;
