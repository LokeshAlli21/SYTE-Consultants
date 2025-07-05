import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import authService from './backend-services/auth/auth';
import { login, logout} from './store/authSlice'
import databaseService from './backend-services/database/database';
import Header from './components/Header';
import Login from './pages/Login';

function App() {
  const dispatch = useDispatch();

  const location = useLocation(); // 👈 get location object

  useEffect(() => {
    console.log("Current Pathname:", location.pathname); // 👈 log pathname
  }, [location.pathname]);

    const userData = useSelector((state) => state.auth.userData);
useEffect(() => {
  console.log("User Data in App Component:", userData);
  
  if(userData?.id && !userData?.channelPartner){
    databaseService.getChannelPartnerByPromoterId(userData.id)
    .then((channelPartnerData) => {
      if(channelPartnerData) {
        console.log("Channel Partner Data:", channelPartnerData);
        dispatch(login({
          ...userData,
          channelPartner: channelPartnerData
        }));
      } else {
        console.log("Channel Partner not found for the promoter.");
      }
    })
    .catch((error) => {
      console.error("Error fetching channel partner:", error);
      toast.error("Failed to fetch channel partner data.");
      dispatch(logout());
    });
  }
}, [userData]);

  useEffect(() => {
    authService.getCurrentPromoter()
    .then((promoterData) => {
      if(promoterData) {
        dispatch(login(promoterData))
      } else {
        dispatch(logout())
      }
      console.log("promoterData : ",promoterData);
    })
    .catch((error) => {
      console.log("Login Error : ",error)
      dispatch(logout())
      return
    })
  }, [])

  if(location.pathname === '/login') {
    return (
      <>
        <ToastContainer position='top-right' />
        <Login />
      </>
    );
  }

  return (
    <div className="flex flex-col max-w-screen w-full min-h-screen mx-auto bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <ToastContainer position='top-right' />
      <Header />
      <div className=" flex-1 flex-grow mx-auto max-w-6xl  px-4 pb-8 pt-4">
        <Outlet />
      </div>
    </div>
  );
}


export default App