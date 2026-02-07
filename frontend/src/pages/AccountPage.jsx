import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/authSlice';
import { useNavigate } from 'react-router-dom';

const AccountPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  if (!user) return null; // safety guard

  return (
    <div style={styles.root}>
      <h1 style={styles.heading}>My Account</h1>

      {/* Account details */}
      <section style={styles.section}>
        <h2 style={styles.subheading}>Account Details</h2>
        <p><strong>First name:</strong> {user.first_name}</p>
        <p><strong>Last name:</strong> {user.last_name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p>
          <strong>Member since:</strong>{' '}
          {new Date(user.created_at).toLocaleDateString()}
        </p>
      </section>

      {/* Orders placeholder */}
      <section style={styles.section}>
        <h2 style={styles.subheading}>Orders</h2>
        <p>No orders yet.</p>
      </section>

      {/* Favorites placeholder */}
      <section style={styles.section}>
        <h2 style={styles.subheading}>Favorites</h2>
        <p>You haven’t added any favorites yet.</p>
      </section>
    </div>
  );
};

const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '100vh',
    width: '100%',
    maxWidth: '800px',
    marginTop: '100px',
    marginBottom: '115px',
    padding: '0 20px',
    textAlign: 'left',
  },
  heading: {
    fontSize: '28px',
    marginBottom: '24px',
  },
  subheading: {
    fontSize: '18px',
    marginBottom: '12px',
  },
  section: {
    marginBottom: '32px',
    paddingBottom: '16px',
    borderBottom: '1px solid #e5e5e5',
  },
  logoutBtn: {
    marginTop: '24px',
    padding: '10px 16px',
    background: '#000',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
  },
};

export default AccountPage;