import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AccountForm from '../common/AccountForm';
import '../styles/LoginPage.css';

const LoginPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
    const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('submit', formData);
  };

          return (
    <div className="accountRoot">
 <AccountForm
        text="Log in to check order status, order history, and make checking out faster. No Account? Sign up below."
        inputs={[
          {
            type: 'email',
            placeholder: 'Email',
            name: 'email',
            value: formData.email,
            onChange: handleChange,
            required: true,
          },
          {
            type: 'password',
            placeholder: 'Password',
            name: 'password',
            value: formData.password,
            onChange: handleChange,
            required: true,
          },
        ]}
        primaryButtonLabel="Sign in"
        secondaryButtonLabel="Create Account"
        onSubmit={handleSubmit}
        showLink={true}
        linkTo="/register"
        linkLabel="Forgot your Password?"
        onSecondaryClick={() => navigate('/register')}
      />
    </div>
  );
};

export default LoginPage;
