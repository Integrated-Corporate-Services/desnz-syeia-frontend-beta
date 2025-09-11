import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AppRouter from './routes/AppRouter';

const App = () => (
  <BrowserRouter basename="/syeia/">
    <MainLayout>
      <AppRouter />
    </MainLayout>
  </BrowserRouter>
);

export default App;