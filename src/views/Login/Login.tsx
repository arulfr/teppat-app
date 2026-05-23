import React, { useState, useEffect } from 'react'; // Import useEffect
import logoUrl from "@/assets/images/Logo.png";
import LogoTeppat from "@/assets/images/Logo_teppat.png";
import illustrationUrl from "@/assets/images/illustration.svg";
import { FormInput, FormCheck } from "@/components/Base/Form";
import Button from "@/components/Base/Button";
import clsx from "clsx";
import { useAppDispatch } from '@/stores/hooks'; // Pastikan path ini benar
import { LoginAdmin, setAutoLogin, LoginGoogle } from '@/stores/AdminSlice';
import { useNavigate, useLocation } from 'react-router-dom'; // Import useLocation
import { toast } from 'react-toastify';

// Import Firebase
import { auth } from "@/utils/firebase"; 
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";

const Login = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation(); // Dapatkan objek lokasi untuk mengakses query params
  const [loginState,setLoginState] = useState({username:'',password:''});

  // Efek untuk auto-login dari URL setelah registrasi
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const regType = queryParams.get('reg_type');
    const source = queryParams.get('source');
    
    // --- 1. LOGIKA AUTO-LOGIN SETELAH REGISTRASI MANUAL ---
    const token = queryParams.get('token');
    const urlUsername = queryParams.get('user');
    const urlKodeUser = queryParams.get('kode');
    const urlId = queryParams.get('_id');

    // Hanya jalankan auto-login jika parameter lengkap dan reg_type adalah manual
    if (token && urlUsername && urlKodeUser && urlId && regType === 'manual') {
      // Melakukan dispatch langsung agar Redux State terisi.
      dispatch(setAutoLogin({ 
        token, 
        username: urlUsername, 
        kode_user: urlKodeUser,
        _id: urlId,
        id_store: null,
        role: 'owner',
        available_stores: [],
        subscription_plan: 'free',
        subscription_status: 'trial',
        subscription_expiry: null
      }));

      toast.success('Login otomatis berhasil! Selamat datang.');
      
      // Arahkan ke wizard untuk melengkapi data bisnis
      // Gunakan replace: true agar user tidak bisa back ke halaman login dengan parameter lama
      navigate(`/wizard_form?reg_type=manual&nama_bisnis=${queryParams.get('nama_bisnis')}&alamat=${queryParams.get('alamat')}`);
      return;
    }

    // --- 2. LOGIKA AUTO-TRIGGER GOOGLE ---
    if (regType === 'google' && source === 'register') {
      // Jangan memicu popup otomatis di useEffect karena akan diblokir browser.
      // Berikan instruksi kepada user untuk klik tombol secara manual.
      toast.info("Silakan klik tombol 'Sign in with Google' untuk menyelesaikan registrasi.");
    }
  }, [location, navigate, dispatch]);

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      const firebaseUser = result.user;

      // Kirim token ke backend dan dapatkan data user lengkap
      const response = await dispatch(LoginGoogle(idToken)).unwrap();

      toast.success(`Selamat datang, ${firebaseUser.displayName}!`);

      // LOGIKA NAVIGASI:
      // Jika user tidak memiliki tipe_bisnis (User Baru), wajib ke Wizard.
      // Jika user sudah memiliki data bisnis, langsung ke Dashboard.
      if (!response.tipe_bisnis || response.tipe_bisnis === "pending") {
        navigate('/wizard_form?reg_type=google');
      } else {
        navigate('/');
      }
    } catch (error: any) {
      // Jika error berasal dari unwrap(), nilainya bisa berupa string langsung
      let errorMessage = "Terjadi kesalahan";
      
      if (typeof error === 'string') errorMessage = error;
      else if (error?.response?.data?.message) errorMessage = error.response.data.message;
      else if (error?.message) errorMessage = error.message;

      if (error !== 'auth/popup-closed-by-user' && error?.code !== 'auth/popup-closed-by-user') {
        toast.error(`Gagal login dengan Google: ${errorMessage}`);
      }
    }
  };

  const loginHandle = async () => {
      try {
        const result = await dispatch(LoginAdmin(loginState)).unwrap();
        if (result && result.token) {
        toast.success('Login successful');
          navigate('/');
        }
      } catch (error:string | any) {
          toast.error(error,{
            position:'top-right',
            autoClose:3000
          });
    }
  }
  

  return (
        <>
          <div
            className={clsx([
              "p-3 sm:px-8 relative h-screen lg:overflow-hidden bg-primary xl:bg-white dark:bg-darkmode-800 xl:dark:bg-darkmode-600",
              "before:hidden before:xl:block before:content-[''] before:w-[57%] before:-mt-[28%] before:-mb-[16%] before:-ml-[13%] before:absolute before:inset-y-0 before:left-0 before:transform before:rotate-[-4.5deg] before:bg-primary/20 before:rounded-[100%] before:dark:bg-darkmode-400",
              "after:hidden after:xl:block after:content-[''] after:w-[57%] after:-mt-[20%] after:-mb-[13%] after:-ml-[13%] after:absolute after:inset-y-0 after:left-0 after:transform after:rotate-[-4.5deg] after:bg-primary after:rounded-[100%] after:dark:bg-darkmode-700",
            ])}
          >
            <div className="container relative z-10 sm:px-10">
              <div className="block grid-cols-2 gap-4 xl:grid">
                {/* BEGIN: Login Info */}
                <div className="flex-col hidden min-h-screen xl:flex">
                  <a href="" className="flex items-center pt-5 -intro-x">
                    <img
                      alt="Teppat POS Logo"
                      className="w-12"
                      src={LogoTeppat}
                    />
                    <span className="ml-3 text-2xl font-bold text-white uppercase tracking-wider"> TEPPAT </span>
                  </a>
                  <div className="my-auto">
                    <img
                      alt="Teppat POS Illustration"
                      className="w-1/2 -mt-16 -intro-x"
                      src={illustrationUrl}
                    />
                    <div className="mt-10 text-4xl font-medium leading-tight text-white -intro-x">
                      Digitalisasi Bisnis <br />
                      Jadi Lebih Tepat.
                    </div>
                    <div className="mt-5 text-lg text-white -intro-x text-opacity-70 dark:text-slate-400">
                      Solusi Kasir Digital Terpadu untuk Bengkel, Apotek, dan Toko Retail.
                    </div>
                  </div>
                </div>
                {/* END: Login Info */}
                {/* BEGIN: Login Form */}
                <div className="flex h-screen py-5 my-10 xl:h-auto xl:py-0 xl:my-0">
                  <div className="w-full px-5 py-8 mx-auto my-auto bg-white rounded-md shadow-md xl:ml-20 dark:bg-darkmode-600 xl:bg-transparent sm:px-8 xl:p-0 xl:shadow-none sm:w-3/4 lg:w-2/4 xl:w-auto">
                    <img
                      alt="Teppat POS Logo"
                      className="w-28 mx-auto mb-6 intro-x xl:mx-0"
                      src={logoUrl}
                    />
                    <h2 className="text-2xl font-bold text-center intro-x xl:text-3xl xl:text-left">
                      Masuk ke Akun
                    </h2>
                    <div className="mt-2 text-center intro-x text-slate-400 xl:hidden">
                      Kelola bisnis jadi lebih mudah & menyenangkan dengan Teppat POS Cloud.
                    </div>
                    <div className="mt-8 intro-x">
                      <FormInput
                        type="text"
                        className="block px-4 py-3 intro-x min-w-full xl:min-w-[350px]"
                        placeholder="Username"
                        value={loginState.username}
                        onChange={(e)=>setLoginState({...loginState,username:e.target.value})}
                      />
                      <FormInput
                        type="password"
                        className="block px-4 py-3 mt-4 intro-x min-w-full xl:min-w-[350px]"
                        placeholder="Password"
                        value={loginState.password}
                        onChange={(e)=>setLoginState({...loginState,password:e.target.value})}
                      />
                    </div>
                    <div className="flex mt-4 text-xs intro-x text-slate-600 dark:text-slate-500 sm:text-sm">
                      <div className="flex items-center mr-auto">
                        <FormCheck.Input
                          id="remember-me"
                          type="checkbox"
                          className="mr-2 border"
                        />
                        <label
                          className="cursor-pointer select-none"
                          htmlFor="remember-me"
                        >
                          Remember me
                        </label>
                      </div>
                      <a href="">Forgot Password?</a>
                    </div>
                    <div className="mt-5 text-center intro-x xl:mt-8 xl:text-left">
                      <Button
                        variant="primary"
                        onClick={() => loginHandle()}
                        className="w-full px-4 py-3 align-top xl:w-40 xl:mr-3"
                      >
                        Login
                      </Button>
                      <Button
                        variant="outline-secondary"
                        className="w-full px-4 py-3 mt-3 align-top xl:w-40 xl:mt-0"
                        onClick={() => navigate('/register')}
                      >
                        Daftar Akun
                      </Button>
                      
                      <button 
                        onClick={() => handleGoogleLogin()}
                        className="flex items-center justify-center gap-2 w-full px-4 py-3 mt-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all font-semibold"
                      >
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" className="w-5 h-5" />
                        Sign in with Google
                      </button>

                    </div>
                    <div className="mt-10 text-center intro-x xl:mt-24 text-slate-600 dark:text-slate-500 xl:text-left">
                      By signin up, you agree to our{" "}
                      <a className="text-primary dark:text-slate-200" href="">
                        Terms and Conditions
                      </a>{" "}
                      &{" "}
                      <a className="text-primary dark:text-slate-200" href="">
                        Privacy Policy
                      </a>
                    </div>
                  </div>
                </div>
                {/* END: Login Form */}
              </div>
            </div>
          </div>

    </>
  )
}

export default Login