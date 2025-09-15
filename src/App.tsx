import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import MainLayout from './layouts/MainLayout';
import AppRouter from './routes/AppRouter';
import { AuthUserProvider } from './context/AuthUserContext';


const App = () => (
  <BrowserRouter basename="/syeia/">
    <AuthUserProvider>
      <MainLayout>
        <AppRouter />
      </MainLayout>
    </AuthUserProvider>
  </BrowserRouter>
);

export default App;