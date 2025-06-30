import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Outlet } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import authService from './backend-services/auth/auth';
import { login, logout} from './store/authSlice'

function PromoterApp() {
  const dispatch = useDispatch();

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
    .catch((error) => console.log("Login Error : ",error))
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


export default PromoterApp