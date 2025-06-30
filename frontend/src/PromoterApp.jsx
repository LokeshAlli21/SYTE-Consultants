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
    <div className="min-h-screen w-full bg-[#F3F4FF]">
      <ToastContainer 
        position='top-right'
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        className="!mt-safe-top"
        toastClassName="!text-sm !rounded-lg"
        bodyClassName="!text-sm"
      />
      <div className="w-full max-w-none mx-auto px-4 sm:px-6 lg:px-8">
        <div className="w-full">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default PromoterApp