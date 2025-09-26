import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import MainLayout from './layouts/MainLayout';
import AppRouter from './routes/AppRouter';
import { AuthUserProvider } from './context/AuthUserContext';
import SandboxRouter from './routes/SandboxRouter';


const App = () => (
  <BrowserRouter basename="/syeia/">
    <AuthUserProvider>
      <MainLayout>
        <AppRouter />
        <SandboxRouter />
      </MainLayout>
    </AuthUserProvider>
  </BrowserRouter>
);

export default App;