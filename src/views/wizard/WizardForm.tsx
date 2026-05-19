import React, { useState, useEffect } from 'react'
import Button from "@/components/Base/Button";
import { FormInput, FormLabel, FormSelect } from "@/components/Base/Form";
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import { StoreCreate, StoreGetAction } from '@/stores/StoreSlice';
import { UpdateUser } from '@/stores/AdminSlice';
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';
import Lucide from "@/components/Base/Lucide";

const WizardForm = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const owner = useAppSelector(state => state.AdminSlice.isLogin);
  const stores = useAppSelector(state => state.StoreSlice.stores);
  const location = useLocation(); // Hook untuk mengakses objek lokasi

  // Mengambil daftar toko milik owner untuk pengecekan
  // Guard: Jika sudah ada toko, jangan izinkan akses ke wizard
  useEffect(() => {
    dispatch(StoreGetAction());
  }, [dispatch]);

  useEffect(() => {
    if (stores.length > 0 && step === 1) { // Hanya redirect jika di step 1 dan toko sudah ada
      navigate('/dashboard', { replace: true });
    }
  }, [stores, navigate]);
  
  const [step, setStep] = useState(1);

  // UPGRADE: Gunakan fungsi inisialisasi agar state hanya terbentuk sekali saat mount
  // Ini jauh lebih aman daripada menggunakan useEffect untuk 'sync' data URL
  const [storeData, setStoreData] = useState({
    nama_store: new URLSearchParams(location.search).get('nama_bisnis') || '',
    alamat: new URLSearchParams(location.search).get('alamat') || '',
    deskripsi: '',
    header_struk: '',
    footer_struk: '',
    id_owner: owner._id as string, // Pastikan id_owner terisi dari awal
    tipe_bisnis: owner.tipe_bisnis === 'pending' ? '' : (owner.tipe_bisnis || ''),
    reg_type: new URLSearchParams(location.search).get('reg_type') || ''
  });

  useEffect(() => {
    // Pesan khusus untuk pendaftaran Google
    if (storeData.reg_type === 'google' && step === 1 && owner?._id) {
      toast.info("Selamat datang! Silakan lengkapi informasi toko Anda untuk memulai.");
    }
  }, [owner?._id]); 

  const handleNextStep = () => {
    // Validasi dasar
    if (!storeData.nama_store || !storeData.alamat) {
      toast.error("Nama dan Alamat Store wajib diisi");
      return;
    }

    if (owner.tipe_bisnis === 'pending' && !storeData.tipe_bisnis) {
      toast.error("Silakan pilih Tipe Bisnis terlebih dahulu");
      return;
    }

    setStep(2);
  }

  const handleFinalSubmit = async () => {
    try {
      // 1. Jika tipe bisnis masih pending, update user terlebih dahulu
      // Pastikan kita mengirim tipe_bisnis yang ada di state storeData
      if (owner.tipe_bisnis === 'pending' || !owner.tipe_bisnis) {
        if (!storeData.tipe_bisnis) {
          throw new Error("Tipe bisnis belum dipilih");
        }
        await dispatch(UpdateUser({ 
          id: owner._id as string, 
          tipe_bisnis: storeData.tipe_bisnis 
        })).unwrap();
      }

      // 2. Buat toko utama
      const payload = { 
        nama_store: storeData.nama_store,
        alamat: storeData.alamat,
        deskripsi: storeData.deskripsi,
        header_struk: storeData.header_struk,
        footer_struk: storeData.footer_struk,
        id_owner: owner._id as string
      };

      await dispatch(StoreCreate(payload as any)).unwrap();
      toast.success("Toko berhasil dikonfigurasi!");
      setStep(3); // Pindah ke layar finalisasi
    } catch (error: any) {
      toast.error(error);
    }
  }

  return (
    <>
      <div className="flex items-center mt-8">
        <h2 className="mr-auto text-lg font-medium intro-y">Wizard Layout</h2>
      </div>
      {/* BEGIN: Wizard Layout */}
      <div className="py-10 mt-5 intro-y box sm:py-20">
        <div className="relative before:hidden before:lg:block before:absolute before:w-[69%] before:h-[3px] before:top-0 before:bottom-0 before:mt-4 before:bg-slate-100 before:dark:bg-darkmode-400 flex flex-col lg:flex-row justify-center px-5 sm:px-20">
          <div className="z-10 flex items-center flex-1 intro-x lg:text-center lg:block">
            <Button variant={step === 1 ? "primary" : "secondary"} className="w-10 h-10 rounded-full">
              1
            </Button>
            <div className="ml-3 text-base font-medium lg:w-32 lg:mt-3 lg:mx-auto">
              Setup Your Store
            </div>
          </div>
          <div className="z-10 flex items-center flex-1 mt-5 intro-x lg:text-center lg:mt-0 lg:block">
            <Button variant={step === 2 ? "primary" : "secondary"} className="w-10 h-10 rounded-full">
              2
            </Button>
            <div className="ml-3 text-base lg:w-32 lg:mt-3 lg:mx-auto text-slate-600 dark:text-slate-400">
              Struk Layout
            </div>
          </div>
          <div className="z-10 flex items-center flex-1 mt-5 intro-x lg:text-center lg:mt-0 lg:block">
            <Button variant={step === 3 ? "primary" : "secondary"} className="w-10 h-10 rounded-full">
              3
            </Button>
            <div className="ml-3 text-base lg:w-32 lg:mt-3 lg:mx-auto text-slate-600 dark:text-slate-400">
              Finalize
            </div>
          </div>
        </div>
        <div className="px-5 pt-10 mt-10 border-t sm:px-20 border-slate-200/60 dark:border-darkmode-400">
          {step === 1 && (
            <>
              <div className="flex flex-col mb-5">
                <div className="text-base font-medium">Informasi Toko Utama</div>
                {owner.tipe_bisnis === 'pending' && (
                  <div className="p-3 mt-2 text-xs border rounded-lg bg-blue-50 border-blue-100 text-blue-600">
                    <span className="font-bold">Info:</span> Silakan pilih tipe bisnis dan lengkapi data toko Anda. 
                    Tipe bisnis akan menentukan menu yang tersedia di aplikasi.
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-12 gap-4 mt-5 gap-y-5">
                {owner.tipe_bisnis === 'pending' && (
                  <div className="col-span-12 intro-y">
                    <FormLabel htmlFor="tipe-bisnis">Tipe Bisnis</FormLabel>
                    <FormSelect
                      id="tipe-bisnis"
                      value={storeData.tipe_bisnis}
                      onChange={(e) => setStoreData({ ...storeData, tipe_bisnis: e.target.value })}
                    >
                      <option value="">-- Pilih Tipe Bisnis --</option>
                      <option value="bengkel">Bengkel (Otomotif)</option>
                      <option value="apotek">Apotek (Farmasi)</option>
                      <option value="grosir">Grosir / Retail Umum</option>
                    </FormSelect>
                    <div className="mt-2 text-xs text-slate-500">
                      Aplikasi akan menyesuaikan fitur berdasarkan pilihan ini.
                    </div>
                  </div>
                )}

                <div className="col-span-12 intro-y sm:col-span-6">
                  <FormLabel htmlFor="nama-store">Nama Store / Cabang</FormLabel>
                  <FormInput
                    id="nama-store"
                    type="text"
                    placeholder="Contoh: TEPPAT POS Cabang Pusat"
                    value={storeData.nama_store}
                    onChange={(e) => setStoreData({ ...storeData, nama_store: e.target.value })}
                  />
                </div>
                <div className="col-span-12 intro-y sm:col-span-6">
                  <FormLabel htmlFor="alamat-store">Alamat Lengkap</FormLabel>
                  <FormInput
                    id="alamat-store"
                    type="text"
                    placeholder="Jl. Merdeka No. 45"
                    value={storeData.alamat}
                    onChange={(e) => setStoreData({ ...storeData, alamat: e.target.value })}
                  />
                </div>
                <div className="col-span-12 intro-y">
                  <FormLabel htmlFor="deskripsi-store">Catatan Singkat (Opsional)</FormLabel>
                  <FormInput
                    id="deskripsi-store"
                    type="text"
                    placeholder="Pusat distribusi utama"
                    value={storeData.deskripsi}
                    onChange={(e) => setStoreData({ ...storeData, deskripsi: e.target.value })}
                  />
                </div>
                <div className="flex items-center justify-center col-span-12 mt-5 intro-y sm:justify-end">
                  <Button 
                    variant="primary" 
                    className="w-24 ml-2"
                    onClick={handleNextStep}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <div className="text-base font-medium">Pengaturan Struk Kasir</div>
              <div className="grid grid-cols-12 gap-4 mt-5 gap-y-5">
                <div className="col-span-12 intro-y">
                  <FormLabel htmlFor="header-struk">Header Struk</FormLabel>
                  <FormInput
                    id="header-struk"
                    type="text"
                    placeholder="Contoh: Selamat Datang di Toko Kami"
                    value={storeData.header_struk}
                    onChange={(e) => setStoreData({ ...storeData, header_struk: e.target.value })}
                  />
                </div>
                <div className="col-span-12 intro-y">
                  <FormLabel htmlFor="footer-struk">Footer Struk</FormLabel>
                  <FormInput
                    id="footer-struk"
                    type="text"
                    placeholder="Contoh: Barang yang sudah dibeli tidak dapat ditukar"
                    value={storeData.footer_struk}
                    onChange={(e) => setStoreData({ ...storeData, footer_struk: e.target.value })}
                  />
                </div>
                <div className="flex items-center justify-center col-span-12 mt-5 intro-y sm:justify-end">
                  <Button 
                    variant="secondary" 
                    className="w-24"
                    onClick={() => setStep(1)}
                  >
                    Previous
                  </Button>
                  <Button 
                    variant="primary" 
                    className="w-24 ml-2"
                    onClick={handleFinalSubmit}
                  >
                    Finish
                  </Button>
                </div>
              </div>
            </>
          )}
          {step === 3 && (
            <div className="flex flex-col items-center justify-center py-10 text-center intro-y">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-success/10 text-success">
                <Lucide icon="CheckCircle" className="w-12 h-12" />
              </div>
              <div className="mt-5 text-3xl font-medium">Konfigurasi Awal Selesai!</div>
              <div className="mt-3 text-slate-500">
                Selamat! Toko dan sistem kasir Anda telah berhasil dikonfigurasi. <br/> 
                Sekarang Anda siap untuk mulai mengelola bisnis dan transaksi Anda.
              </div>
              <div className="mt-10">
                <Button 
                  variant="primary" 
                  className="px-10 py-3 text-base"
                  onClick={() => navigate('/dashboard', { replace: true })}
                >
                  LANJUT
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* END: Wizard Layout */}
    </>
  )
}

export default WizardForm