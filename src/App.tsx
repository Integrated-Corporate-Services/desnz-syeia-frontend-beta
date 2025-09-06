
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Workbasket from './pages/Workbasket';
import ApplicationSummary from './pages/ApplicationSummary';
import NetworkOperatorDetails from './pages/NetworkOperatorDetails';
import NetworkOperatorContactDetails from './pages/NetworkOperatorContactDetails';

const App = () => (
  <BrowserRouter basename="/syeia/">
    <MainLayout>
      <Routes>
        <Route path="/" element={<Workbasket />} />
        <Route path="/task-list" element={<ApplicationSummary />} />
        <Route path="/network-operator-details" element={<NetworkOperatorDetails />} />
        <Route path="/network-operator-contact-details" element={<NetworkOperatorContactDetails />} />
      </Routes>
    </MainLayout>
  </BrowserRouter>
);

export default App;
