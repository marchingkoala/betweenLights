import React , { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('submit', formData);
    };

    return (
        <div className="accountRoot">
            <AccountForm 
            text="Create an account to check order status, order history, and make checking out faster."
            inputs={[
                {type: 'firstName',
                placeholder: 'First Name',
                name: 'firstName',
                value: formData.firstName,
                onChange: handleChange,
                required: true},
                {type: 'lastName',
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
            primaryButtonLabel="Submit"
            secondaryButtonLabel="Cancel"
            onSubmit={handleSubmit}
            showLink={false}
            linkTo="/login"
            onSecondaryClick={() => navigate('/')}
            />
        </div>
    );
};

export default RegisterPage;
