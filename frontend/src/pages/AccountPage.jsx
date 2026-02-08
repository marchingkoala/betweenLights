import React from 'react';
import {  useSelector } from 'react-redux';
import '../styles/AccountPage.css'

const AccountPage = () => {
  const { user } = useSelector((state) => state.auth);

  if (!user) return null; // safety guard

  return (
    <div className='accountRoot' >
      <div className = 'leftSection'>
        <img src="/accountPageimg.png" alt="account page image"/>
      </div>
      <div className='rightSection'>
      <h1 className='accountHeading'>My Account</h1>
      {/* Account details */}
      <section className='accountSection'>
        <h2 className='accountSubheading'>Account Details</h2>
        <p><strong>First name:</strong> {user.first_name}</p>
        <p><strong>Last name:</strong> {user.last_name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p>
          <strong>Member since:</strong>{' '}
          {new Date(user.created_at).toLocaleDateString()}
        </p>
      </section>

      {/* Orders placeholder */}
      <section className='accountSection'>
        <h2 className='accountSubheading'>Orders</h2>
        <p>No orders yet.</p>
      </section>

      {/* Favorites placeholder */}
      <section className='accountSection'>
        <h2 className='accountSubheading'>Favorites</h2>
        <p>You haven’t added any favorites yet.</p>
      </section>
      </div>
    </div>
  );
};

export default AccountPage;