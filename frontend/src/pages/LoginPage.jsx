import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AccountForm from '../common/AccountForm';
import '../styles/LoginPage.css';
import {loginUser} from '../redux/authSlice';
import { useDispatch, useSelector } from 'react-redux';

const LoginPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch()
    const {loading, error} = useSelector((state) => state.auth);

    const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

const handleLoginAndNavigate = async (credentials) => {
  try {
    // Dispatch loginUser and wait for it to finish
    const resultAction = await dispatch(loginUser(credentials));

    // Check if login succeeded
    if (loginUser.fulfilled.match(resultAction)) {
      navigate("/account"); // Navigate only if login was successful
    } else {
      console.error("Login failed:", resultAction.payload);
    }
  } catch (err) {
    console.error("Unexpected error during login:", err);
  }
};



    const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLoginAndNavigate(formData);
}

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
        linkTo="/" // this is for forgotten password
        linkLabel="Forgot your Password?"
        onSecondaryClick={() => navigate('/register')}
      />
       {error && <p style={{ color: 'red', marginTop: '12px' }}>{error}</p>}
    </div>
  );
};

export default LoginPage;
