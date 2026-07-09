import React, {useEffect} from "react";
import { useDispatch, useSelector } from 'react-redux';
import { fetchSoldProducts } from '../redux/adminSlice';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const {user, token} = useSelector((state) => state.auth);
  const {soldProducts, loading, error} = useSelector((state) => state.admin)

  // calling api for stock unit upon landing
  useEffect(()=> {
    if(user?.role === 'admin' && token){
      dispatch(fetchSoldProducts({view: 'summary', token}));
    }
  }, [dispatch, user?.role, token])
  
  return (
    <div className="adminDashboard">
      <h1>Admin Dashboard</h1>
      <p>Admin-only area</p>
    </div>
  );
};

export default AdminDashboard;
