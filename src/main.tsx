import ScrollToTop from "@/components/Base/ScrollToTop";
import ReactDOM from "react-dom/client";
import { BrowserRouter, useNavigate } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./stores/store";
import Router from "./router";
import "./assets/css/app.css";
import { ToastContainer } from "react-toastify";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { resetLogin } from "@/stores/AdminSlice";
import SessionExpiredModal from "@/components/SessionExpiredModal";
import ChatWidget from "@/views/Widget/ChatWidget";

const RootApp = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  // Mengambil state visibilitas modal dari AdminSlice
  const showModal = useAppSelector((state) => state.AdminSlice.showSessionExpiredModal);
  const isLogin = useAppSelector((state) => state.AdminSlice.isLogin);

  const handleLoginAgain = () => {
    dispatch(resetLogin()); // Membersihkan token dan state login
    navigate("/login");    // Redirect ke halaman login
  };

  return (
    <>
      <Router />
      {isLogin?.token && <ChatWidget />}
      <SessionExpiredModal isOpen={showModal} onLoginAgain={handleLoginAgain} />
    </>
  );
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <BrowserRouter>
    <Provider store={store}>
      <RootApp />
    </Provider>
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
    />
    <ScrollToTop />
  </BrowserRouter>
);
