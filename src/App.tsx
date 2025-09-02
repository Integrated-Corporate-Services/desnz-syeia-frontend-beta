import { MemoryRouter, Routes, Route, Link, BrowserRouter } from 'react-router-dom';
import { BackLink, Footer, TopNav } from 'govuk-react';
import Crown from '@govuk-react/icon-crown'
import { useNavigate } from 'react-router-dom';
import Workbasket from './pages/Workbasket';
import React from 'react';
import NetworkOperatorDetails from './pages/NetworkOperatorDetails';
import NetworkOperatorContactDetails from './pages/NetworkOperatorContactDetails';


const BackButton =()=> {
  const navigate = useNavigate();
  return <BackLink  href="#" onClick={()=>navigate(-1)} className="govuk-back-link" />
};
const App = () => (
<BrowserRouter basename="/">
<TopNav company={<TopNav.Anchor href="https://example.com" target="new"><TopNav.IconTitle icon={<Crown height="32" width="36"/>}>GOV.UK</TopNav.IconTitle></TopNav.Anchor>} />
<div className="govuk-width-container"><BackButton/></div>
<Routes>
            <Route path="/" element={<Workbasket />} />
            <Route path="/network-operator-details" element={<NetworkOperatorDetails />} />
            <Route path="/network-operator-contact-details" element={<NetworkOperatorContactDetails />} />
        </Routes>
        <Footer />
    </BrowserRouter>)
export default App;
