
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import TaskList from './features/TaskList/pages/TaskList';
import NetworkOperatorDetails from './features/ApplicantInfo/pages/NetworkOperatorDetails';
import NetworkOperatorContactDetails from './features/ApplicantInfo/pages/NetworkOperatorContactDetails';
import Workbasket from './features/Workbasket/pages/Workbasket';
import ApplicationSubmitted from './features/TaskList/pages/ApplicationSubmitted';

const App = () => (
  <BrowserRouter basename="/syeia/">
    <MainLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/workbasket/" replace />} />
        <Route path="/workbasket/" element={<Workbasket />} />
        <Route path="/task-list" element={<TaskList />} />
        <Route path="/network-operator-details" element={<NetworkOperatorDetails />} />
        <Route path="/network-operator-contact-details" element={<NetworkOperatorContactDetails />} />
        <Route path="/application-submitted" element={<ApplicationSubmitted />} />
      </Routes>
    </MainLayout>
  </BrowserRouter>
);

export default App;
