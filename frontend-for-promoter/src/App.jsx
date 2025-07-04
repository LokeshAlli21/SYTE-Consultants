import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import authService from './backend-services/auth/auth';
import { login, logout} from './store/authSlice'
import databaseService from './backend-services/database/database';

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
    <div className="flex  max-w-screen w-full  bg-[#F3F4FF]">
      <ToastContainer position='top-right' />
      <div className=" flex-1 flex-grow mx-auto">
        <Outlet />
      </div>
    </div>
  );
}


export default App