import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import authService from './backend-services/auth/auth';
import { login, logout} from './store/authSlice'
import databaseService from './backend-services/database/database';
import Header from './components/Header';

function App() {
  const dispatch = useDispatch();

  
  const navigate = useNavigate();

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

  return (
    <div className="flex flex-col max-w-screen w-full mx-auto bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <ToastContainer position='top-right' />
            {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-200/30 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      <Header />
      <div className=" flex-1 flex-grow mx-auto max-w-6xl  px-4 pb-8 pt-4">
        <Outlet />
      </div>
    </div>
  );
}


export default App