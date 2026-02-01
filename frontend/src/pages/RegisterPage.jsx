import React , { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/LoginPage.css';
import AccountForm from '../common/AccountForm';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
    });
     const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

      const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);

      const res = await axios.post("http://localhost:5000/api/auth/register", {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      console.log("REGISTER SUCCESS:", res.data);

      // Option A: redirect to login
      navigate("/login");

      // Option B: if your backend returns a token and you want auto-login:
      // localStorage.setItem("token", res.data.token);
      // navigate("/");
    } catch (err) {
      console.error("REGISTER ERROR:", err);
      setError(err.response?.data?.error || err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

    return (
        <div className="accountRoot">
            <AccountForm 
            text="Create an account to check order status, order history, and make checking out faster."
            inputs={[
                {type: 'text',
                placeholder: 'First Name',
                name: 'firstName',
                value: formData.firstName,
                onChange: handleChange,
                required: true},
                {type: 'text',
                placeholder: 'Last Name',
                name: 'lastName',
                value: formData.lastName,
                onChange: handleChange,
                required: true},
                {type: 'email',
                placeholder: 'Email',
                name: 'email',
                value: formData.email,
                onChange: handleChange,
                required: true},
                {type: 'password',
                placeholder: 'Password',
                name: 'password',
                value: formData.password,
                onChange: handleChange,
                required: true},
            ]}
            primaryButtonLabel={loading ? "Submitting..." : "Submit"}
            secondaryButtonLabel="Cancel"
            onSubmit={handleSubmit}
            showLink={false}
            linkTo="/login"
            onSecondaryClick={() => navigate('/')}
            />
             {error && (
        <div style={{ marginTop: "12px", color: "red", fontSize: "0.9rem" }}>
          {error}
        </div>
      )}
        </div>
    );
};

export default RegisterPage;
