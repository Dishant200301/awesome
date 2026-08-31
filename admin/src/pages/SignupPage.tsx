import React from 'react';
import { LoginPage } from './LoginPage';

export const SignupPage: React.FC<any> = ({ onSignupSuccess }) => {
  return <LoginPage onLoginSuccess={onSignupSuccess} />;
};
