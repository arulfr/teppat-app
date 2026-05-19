import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import { getBillingHistory, confirmBillingPayment } from '@/stores/BillingSlice';
import { CreditCard, Copy, ArrowLeft, ShieldCheck, AlertCircle, MessageCircle } from 'lucide-react';
import Swal from 'sweetalert2';

const PaymentConfirmation = () => {
  const { id_order } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  // State untuk menyimpan settings dari API
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  
  // Perbaikan: Gunakan 'history' sesuai dengan initialState di BillingSlice.ts
  const { history, loading } = useAppSelector((state: any) => state.BillingSlice);

  // Normalisasi: Pastikan data selalu berupa array dan tangani pembungkus .data jika ada
  const billingList = useMemo(() => {
    if (Array.isArray(history)) return history;
    if ((history as any)?.data && Array.isArray((history as any).data)) return (history as any).data;
    return [];
  }, [history]);

  // Gunakan String() untuk membandingkan ID agar menghindari tipe data mismatch (ObjectId vs String)
  const order = billingList.find((o: any) => String(o._id) === String(id_order));

  useEffect(() => {
    // Mengambil detail order dari riwayat untuk ditampilkan
    dispatch(getBillingHistory());
    
    // Simulasi fetch Global Settings (Pastikan ada endpoint untuk ini)
    // axiosInstance.get('/public/settings').then(res => {
    //   setPaymentMethods(res.data.metode_pembayaran.filter((m: any) => m.is_active));
    // });

    // Contoh data dummy jika API belum siap:
    setPaymentMethods([
      { provider: 'BCA', nomor: '8830-221-111', atas_nama: 'PT. TEKKAT APLIKASI INDONESIA' },
      { provider: 'DANA', nomor: '08123456789', atas_nama: 'TEKKAT ADMIN' }
    ]);
  }, [dispatch]);

  // Pecah harga untuk menonjolkan kode unik
  const baseAmount = order ? Math.floor(order.total_harga / 1000) * 1000 : 0;
  const uniqueCode = order ? order.total_harga % 1000 : 0;

  const handleConfirm = async () => {
    const result = await dispatch(confirmBillingPayment({
      id_order: id_order as string,
      bukti_pembayaran: `Transfer Kode Unik: ${order.total_harga}` 
    }));

    if (confirmBillingPayment.fulfilled.match(result)) {
      Swal.fire('Berhasil', 'Konfirmasi terkirim. Akun Anda akan aktif setelah Admin memverifikasi nominal unik Anda.', 'success');
      navigate('/');
    }
  };

  const handleWAConfirmation = () => {
    const text = encodeURIComponent(
      `Halo Admin TEPPAT, saya ingin konfirmasi pembayaran.\n\n` +
      `Order ID: ${order._id}\n` +
      `Paket: ${order.paket_tujuan} (${order.durasi})\n` +
      `Total Transfer: Rp ${order.total_harga.toLocaleString('id-ID')}`
    );
    window.open(`https://wa.me/628123456789?text=${text}`, '_blank');
  };

  // Render Loading dengan Spinner yang konsisten dengan tema Enigma
  if (loading && !order) return <div className="p-10 text-center flex flex-col items-center gap-3"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div><span>Memuat detail pesanan...</span></div>;
  
  // Tampilkan error hanya jika loading sudah selesai dan data benar-benar tidak ada
  if (!loading && !order) return <div className="p-10 text-center text-danger font-bold">Pesanan tidak ditemukan. Pastikan ID pesanan benar atau cek riwayat tagihan Anda.</div>;

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 mb-6 hover:text-slate-800 transition-colors">
        <ArrowLeft size={20} /> Kembali
      </button>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="bg-slate-900 p-8 text-white">
          <p className="text-slate-400 text-sm uppercase font-bold tracking-widest">Total Pembayaran</p>
          <h1 className="text-4xl font-black mt-2">
            Rp {baseAmount.toLocaleString('id-ID').slice(0, -3)}
            <span className="text-yellow-400">{uniqueCode.toString().padStart(3, '0')}</span>
          </h1>
          <div className="mt-4 flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/20 p-3 rounded-xl text-yellow-200 text-xs">
            <AlertCircle size={16} className="shrink-0" />
            <p>Mohon transfer <b>tepat</b> sampai 3 digit terakhir agar verifikasi otomatis.</p>
          </div>
        </div>

        <div className="p-8 space-y-8">
          <div className="space-y-4">
            <p className="text-sm font-bold text-slate-500 italic uppercase">Pilih Metode Pembayaran:</p>
            {paymentMethods.map((method, index) => (
              <div key={index} className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <CreditCard className="text-blue-600 mt-1" />
                <div className="flex-1">
                  <p className="font-bold text-slate-800">{method.provider}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="bg-white px-2 py-1 rounded border text-lg font-mono">{method.nomor}</code>
                    <button onClick={() => navigator.clipboard.writeText(method.nomor.replace(/-/g, ''))} className="text-blue-600"><Copy size={16} /></button>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 uppercase">A/N {method.atas_nama}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-slate-900">Rincian Upgrade:</h4>
            <div className="flex justify-between py-2 border-b border-dashed">
              <span className="text-slate-500">Paket</span>
              <span className="font-bold capitalize text-blue-600">{order.paket_tujuan}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-dashed">
              <span className="text-slate-500">Durasi</span>
              <span className="font-bold capitalize">{order.durasi === 'monthly' ? 'Bulanan' : 'Tahunan'}</span>
            </div>
          </div>

          <div className="pt-6 space-y-3">
            <button 
              onClick={handleConfirm}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck size={20} /> Saya Sudah Bayar
            </button>
            
            <button 
              onClick={handleWAConfirmation}
              className="w-full bg-green-50 text-green-600 py-3 rounded-2xl font-semibold hover:bg-green-100 transition-all flex items-center justify-center gap-2 border border-green-200"
            >
              <MessageCircle size={18} /> Konfirmasi via WhatsApp
            </button>

            <p className="text-center text-xs text-slate-400 mt-4">
              Admin akan melakukan pengecekan mutasi bank secara berkala.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentConfirmation;