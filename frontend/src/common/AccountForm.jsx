import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/AccountForm.css';

const AccountForm = ({
  text,
  subText,
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
      <div>
        <p style={{marginTop: '0px', marginBottom: '0px', fontSize: '14px'}} className="subText">{subText}</p>
      </div>
      </div>
      <div className="formContainer">
        <form className="accountForm" onSubmit={onSubmit}>
          {/* Inputs */}
          <div className="inputGroup">
            {inputs.map((input, idx) => (
              <div className="inputField">
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
              {input.error && (
                <div className="errorMessage">{input.error}</div>
              )}
              </div>
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
