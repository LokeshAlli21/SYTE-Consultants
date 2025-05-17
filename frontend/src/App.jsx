import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Outlet } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import SideBar from './components/SideBar';
import authService from './backend-services/auth/auth';
import { login, logout} from './store/authSlice'

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    authService.getCurrentUser()
    .then((userData) => {
      if(userData) {
        dispatch(login(userData))
      } else {
        dispatch(logout())
      }
      console.log("userData : ",userData);
    })
    .catch((error) => console.log("Login Error : ",error))
  }, [])

  return (
    <div className="flex min-h-screen max-w-[1575px] bg-[#F3F4FF]">
      <SideBar />
      <ToastContainer position='top-right' />
      <div className=" flex-1">
        <Outlet />
      </div>
    </div>
  );
}

export default App;
