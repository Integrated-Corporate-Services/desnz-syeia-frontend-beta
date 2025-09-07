import React from 'react';
import logo from '../assets/images/DESNZ_logo.png';
import '../constants/content'; 
import { CONTENT } from '../constants/content';
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
