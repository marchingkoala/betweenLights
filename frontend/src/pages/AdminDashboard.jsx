import React, {useEffect} from "react";
import { useDispatch, useSelector } from 'react-redux';
import { fetchSoldProducts, fetchOrders } from '../redux/adminSlice';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const {user, token} = useSelector((state) => state.auth);
  const {soldProducts, loading, error, orders, ordersLoading, ordersError} = useSelector((state) => state.admin)

  // calling api for stock unit + orders upon landing
  useEffect(()=> {
    if(user?.role === 'admin' && token){
      dispatch(fetchSoldProducts({view: 'summary', token}));
      dispatch(fetchOrders({token}));
    }
  }, [dispatch, user?.role, token])
  
  return (
    <div className="adminDashboard">
      <h1>Admin Dashboard</h1>
      <iframe
        className="airtable-embed"
        src="https://airtable.com/embed/appZNOiF4rsQDRklv/shrOanTF2EARMJV3S"
        frameBorder="0"
        width="100%"
        height="900"
        style={{ background: 'transparent', border: '1px solid #ccc' }}
      />
    </div>
  );
};

export default AdminDashboard;
