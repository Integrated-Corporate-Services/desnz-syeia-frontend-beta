import React from 'react';
import { useAuthUserContext } from '../context/AuthUserContext';
import { logout } from '../services/auth/logoutService';

const SignOutButton: React.FC = () => {
  const { user, loading } = useAuthUserContext();
  if (loading || !user) return null;
  return (
    <div>
      <ul id="navigation" className="govuk-header__navigation-list">
        <li className="govuk-header__navigation-item">
          <a
            className='govuk-header__link'
            href="#"
            onClick={async (event) => {
              event.preventDefault();
              await logout();
            }}
          >
            Sign out
          </a>
        </li>
      </ul>
    </div>
  );
};

export default SignOutButton;