import React from 'react';
import '../constants/content'; 
import Header from './component/Header';
import ServiceNavigation from './component/ServiceNavigation';
import Footer from './component/Footer';

const MainLayout = ({ children }) => (
  <>
    <Header />
    <ServiceNavigation />
    {/* Main Content */}
    <div className="govuk-width-container">
      <main className="govuk-main-wrapper" id="main-content">
        {children}
      </main>
    </div>
    <Footer />
  </>
);

export default MainLayout;
