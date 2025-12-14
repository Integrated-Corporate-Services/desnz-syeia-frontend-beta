import '../constants/content'; 
import Header from './component/Header';
import ServiceNavigation from './component/ServiceNavigation';
import Footer from './component/Footer';

import React, { ReactNode } from 'react';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => (
  <>
    <Header />
    <ServiceNavigation />
    {/* Main Content */}
    <div className="govuk-width-container">
      <main className="govuk-main-wrapper" id="main-content" style={{ paddingTop: 16, paddingBottom: 16 }}>
        {children}
      </main>
    </div>
    <Footer />
  </>
);

export default MainLayout;
