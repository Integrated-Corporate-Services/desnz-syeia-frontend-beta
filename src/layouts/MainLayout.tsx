import React, { ReactNode } from 'react';
import '../constants/content';
import Header from './component/Header';
import ServiceNavigation from './component/ServiceNavigation';
import PhaseBanner from './component/PhaseBanner';
import Footer from './component/Footer';
import SkipLink from '../components/SkipLink';

interface MainLayoutProps {
    children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => (
    <>
        <SkipLink />
        <Header />
        <ServiceNavigation />
        <PhaseBanner />
        {/* Main Content */}
        <div className="govuk-width-container">
            <main
                className="govuk-main-wrapper govuk-!-padding-top-2 govuk-!-padding-bottom-2"
                id="main-content"
                tabIndex={-1}
            >
                {children}
            </main>
        </div>
        <Footer />
    </>
);

export default MainLayout;
