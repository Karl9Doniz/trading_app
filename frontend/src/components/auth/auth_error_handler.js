import React from 'react';
import { useNavigate } from 'react-router-dom';

function AuthErrorHandler({ message }) {
  const navigate = useNavigate();

  const handleRedirect = () => {
    navigate('/signin');
  };

  return (
    <div className="auth-error">
      <p>{message}</p>
      <button onClick={handleRedirect}>Go to Sign In</button>
    </div>
  );
}

export default AuthErrorHandler;