import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import '../styles/AccountPage.css';

const AccountPage = () => {
  const { user, token } = useSelector((state) => state.auth);
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  const [orders, setOrders] = useState(null);
  const [ordersError, setOrdersError] = useState(null);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setOrders([]);
      setOrdersLoading(false);
      return;
    }

    let cancelled = false;
    setOrdersLoading(true);
    setOrdersError(null);

    axios
      .get(`${API_BASE_URL}/api/orders/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (!cancelled) setOrders(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        if (!cancelled) {
          setOrdersError(
            err.response?.data?.error || err.message || 'Could not load orders.'
          );
          setOrders([]);
        }
      })
      .finally(() => {
        if (!cancelled) setOrdersLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, API_BASE_URL]);

  if (!user) return null;

  const formatOrderTotal = (cents, currency) => {
    const code = (currency || 'usd').toUpperCase();
    const amount = (Number(cents) / 100).toFixed(2);
    return `${code} $${amount}`;
  };

  return (
    <div className="accountRoot">
      <div className="leftSection">
        <img src="/accountPageimg.png" alt="account page image" />
      </div>
      <div className="rightSection">
        <h1 className="accountHeading">My Account</h1>
        <section className="accountSection">
          <h2 className="accountSubheading">Account Details</h2>
          <p>
            <strong>First name:</strong> {user.first_name}
          </p>
          <p>
            <strong>Last name:</strong> {user.last_name}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Member since:</strong>{' '}
            {new Date(user.created_at).toLocaleDateString()}
          </p>
        </section>

        <section className="accountSection ordersSection">
          <h2 className="accountSubheading">Orders</h2>
          {ordersLoading && <p className="accountOrders_status">Loading orders…</p>}
          {ordersError && (
            <p className="accountOrders_error" role="alert">
              {ordersError}
            </p>
          )}
          {!ordersLoading && !ordersError && orders?.length === 0 && (
            <p>No orders yet.</p>
          )}
          {!ordersLoading && !ordersError && orders?.length > 0 && (
            <ul className="accountOrders_list">
              {orders.map((order) => (
                <li key={order.id} className="accountOrders_card">
                  <div className="accountOrders_cardHeader">
                    <span className="accountOrders_number">
                      {order.order_number}
                    </span>
                    <span className="accountOrders_total">
                      {formatOrderTotal(order.amount_total, order.currency)}
                    </span>
                  </div>
                  <div className="accountOrders_meta">
                    {new Date(order.created_at).toLocaleString()}
                    {order.status ? (
                      <span className="accountOrders_statusBadge">
                        {order.status}
                      </span>
                    ) : null}
                  </div>
                  {order.items?.length > 0 && (
                    <ul className="accountOrders_items">
                      {order.items.map((line, idx) => (
                        <li key={`${order.id}-${idx}`}>
                          {line.quantity}× {line.name} —{' '}
                          {formatOrderTotal(
                            line.unit_amount * line.quantity,
                            order.currency
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* <section className="accountSection">
          <h2 className="accountSubheading">Favorites</h2>
          <p>You haven’t added any favorites yet.</p>
        </section> */}
      </div>
    </div>
  );
};

export default AccountPage;
