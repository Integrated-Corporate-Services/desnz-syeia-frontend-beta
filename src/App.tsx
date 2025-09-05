
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Workbasket from './pages/Workbasket';
import TaskList from './pages/task-list';
import NetworkOperatorDetails from './pages/networkOperatorDetails';
import NetworkOperatorContactDetails from './pages/NetworkOperatorContactDetails';

const App = () => (
  <BrowserRouter basename="/">
    <MainLayout>
      <Routes>
        <Route path="/" element={<Workbasket />} />
        <Route path="/task-list" element={<TaskList />} />
        <Route path="/network-operator-details" element={<NetworkOperatorDetails />} />
        <Route path="/network-operator-contact-details" element={<NetworkOperatorContactDetails />} />
      </Routes>
    </MainLayout>
  </BrowserRouter>
);

export default App;
