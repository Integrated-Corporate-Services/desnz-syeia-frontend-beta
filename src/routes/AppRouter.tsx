import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import TaskList from '../features/TaskList/pages/TaskList';
import NetworkOperatorDetails from '../features/ApplicantInfo/pages/NetworkOperatorDetails';
import NetworkOperatorContactDetails from '../features/ApplicantInfo/pages/NetworkOperatorContactDetails';
import Workbasket from '../features/Workbasket/pages/Workbasket';
import ApplicationSubmitted from '../features/TaskList/pages/ApplicationSubmitted';

const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/workbasket/" replace />} />
      <Route path="/workbasket/" element={<Workbasket />} />
      <Route path="/task-list" element={<TaskList />} />
      <Route path="/network-operator-details" element={<NetworkOperatorDetails />} />
      <Route path="/network-operator-contact-details" element={<NetworkOperatorContactDetails />} />
      <Route path="/application-submitted" element={<ApplicationSubmitted />} />
    </Routes>
  );
};

export default AppRouter;