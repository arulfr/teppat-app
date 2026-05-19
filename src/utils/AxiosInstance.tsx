import axios from "axios";
import { store } from "../stores/store";
import { resetLogin, setSessionExpired } from "../stores/AdminSlice";
import { toast } from "react-toastify";

// const getAuthHeader = () => {
//     const isLogin = useAppSelector(state=>state.AdminSlice.isLogin);
//     if(!isLogin) return; 
//     const token = isLogin?.token;
//   return {
//     Authorization: `${token}`
//   };
// };
const getAuthHeader = (): { Authorization: string } => {
    const token = store.getState().AdminSlice.isLogin?.token;
    return {
        Authorization: token ? `${token}` : ''
    };
};

const axiosInstance = axios.create({
    baseURL:import.meta.env.VITE_BASE_URL
});

// interceptor untuk request
axiosInstance.interceptors.request.use(
  (config) => {
    const { Authorization } = getAuthHeader();
    if (Authorization) {
      config.headers.set('Authorization',Authorization);
    }
    return config;
  },
   (error) => {
        return Promise.reject(error);
    }
);

//interceptor untuk response
axiosInstance.interceptors.response.use(
    (response)=>response,
    (error)=>{
        if (axios.isAxiosError(error)) {
            if(error.response?.status === 401 || error.response?.data.message === 'jwt expired'){
                // Pemicu modal muncul
                store.dispatch(setSessionExpired(true));
            }
            
            if(error.response?.status === 402) {
                toast.error(error.response?.data.message || 'Masa langganan Anda telah habis.');
                //store.dispatch(resetLogin());
                // Jangan lakukan resetLogin() agar user tetap bisa melihat Dashboard 
                // dan melakukan upgrade paket melalui modal.
            }
        }
    return Promise.reject(error); // biar bisa ditangkap catch lokal juga
    }
)



export default axiosInstance;
