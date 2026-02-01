import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/AccountForm.css';

const AccountForm = ({
  text,
  inputs = [],
  primaryButtonLabel = 'Submit',
  secondaryButtonLabel = 'Secondary',
  onSubmit,
  showLink = false,
  linkTo = '/',
  linkLabel = '',
  onSecondaryClick,
}) => {
  return (
    <div className="accountContainer">
      <div className="textContainer">
        <p className="accountText">{text}</p>
      </div>

      <div className="formContainer">
        <form className="accountForm" onSubmit={onSubmit}>
          {/* Inputs */}
          <div className="inputGroup">
            {inputs.map((input, idx) => (
              <input
                key={idx}
                className="accountInput"
                type={input.type || 'text'}
                placeholder={input.placeholder || ''}
                name={input.name || ''}
                value={input.value || ''}
                onChange={input.onChange}
                required={input.required || false}
              />
            ))}
          </div>

          {/* Buttons + optional link */}
          <div className="actionGroup">
            <button className="signInBtn" type="submit">
              {primaryButtonLabel}
            </button>

            <button
              className="createAccountBtn"
              type="button"
              onClick={onSecondaryClick}
            >
              {secondaryButtonLabel}
            </button>

            {showLink && (
              <Link className="forgotPasswordLink" to={linkTo}>
                {linkLabel}
              </Link>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountForm;
