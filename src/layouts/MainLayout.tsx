import React, { ReactNode } from 'react';
import '../constants/content';
import Header from './component/Header';
import ServiceNavigation from './component/ServiceNavigation';
import PhaseBanner from './component/PhaseBanner';
import Footer from './component/Footer';

interface MainLayoutProps {
    children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => (
    <>
        <Header />
        <ServiceNavigation />
        <PhaseBanner />
        {/* Main Content */}
        <div className="govuk-width-container">
            <main
                className="govuk-main-wrapper"
                id="main-content"
                style={{ paddingTop: 16, paddingBottom: 16 }}
            >
                {children}
            </main>
        </div>
        <Footer />
    </>
);

export default MainLayout;
