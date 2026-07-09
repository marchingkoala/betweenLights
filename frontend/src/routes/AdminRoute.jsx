import {useSelector} from 'react-redux';
import {Navigate, Outlet} from 'react-router-dom';

const AdminRoute = () => {
    const {isAuthenticated, user, loading} = useSelector((state) => state.auth);
    if(loading) return null;
    if(!isAuthenticated){
        return <Navigate to="/login" replace/>;
    }
    if(user.role !== 'admin'){
        return <Navigate to="/" replace/>;
    }
    return <Outlet/>;
}

export default AdminRoute;