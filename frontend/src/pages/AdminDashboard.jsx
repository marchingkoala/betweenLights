import React, {useEffect} from "react";
import { useDispatch, useSelector } from 'react-redux';
import { fetchSoldProducts } from '../redux/adminSlice';

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
    <div style={{ paddingTop: "80px", paddingLeft: "2rem", paddingRight: "2rem" }}>
      <h1>Admin Dashboard</h1>
      <p>Admin-only area</p>
    </div>
  );
};

export default AdminDashboard;