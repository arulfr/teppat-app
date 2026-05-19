import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import { createBillingOrder } from '@/stores/BillingSlice';
import { getPricingPlans, IPricingPlan } from '@/stores/PricingSlice';
import { Check, Zap, Rocket, Crown } from 'lucide-react';
import Swal from 'sweetalert2';

// Data Paket (Best Practice: Bisa dipindah ke file konstanta)

const PaketSelect = ({ onClose }: { onClose?: () => void }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { plans, loading: fetchLoading } = useAppSelector((state) => state.PricingSlice);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(getPricingPlans());
  }, [dispatch]);

  // Helper untuk memetakan ikon berdasarkan nama paket
  const getPlanIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('premium') || n.includes('rocket')) return <Rocket className="text-purple-500" size={24} />;
    if (n.includes('enterprise') || n.includes('crown')) return <Crown className="text-yellow-500" size={24} />;
    return <Zap className="text-blue-500" size={24} />;
  };


  const handleSelectPlan = async (plan: IPricingPlan) => {
    try {
      setLoading(true);
      
      // Memanggil endpoint backend yang sudah kita buat sebelumnya
      const result = await dispatch(createBillingOrder({
        paket_tujuan: plan.id_plan,
        durasi: billingCycle
      }));

      if (createBillingOrder.fulfilled.match(result)) {
        if (onClose) onClose(); // Tutup modal jika ada
       // navigate(`/upgrade/confirm/${result.payload._id}`);
        navigate(`/upgrade/confirm/${result.payload.data._id}`);

      } else {
        // Tampilkan pesan error dari backend jika request ditolak (Rejection)
        const errorMsg = (result.payload as string) || 'Gagal membuat pesanan';
        Swal.fire('Gagal', errorMsg, 'error');
      }
    } catch (error: any) {
      Swal.fire('Gagal', 'Terjadi kesalahan sistem', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-2 md:p-6 rounded-2xl w-full max-w-6xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Upgrade Paket Bisnis</h2>
        <p className="text-slate-500 mt-2">Pilih paket yang sesuai dengan kebutuhan operasional toko Anda.</p>
        
        {/* Toggle Bulanan / Tahunan */}
        <div className="flex items-center justify-center mt-8 gap-2 bg-slate-100 w-fit mx-auto p-1.5 rounded-xl">
          <button 
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${billingCycle === 'monthly' ? 'bg-white shadow-sm text-primary' : 'text-slate-500'}`}
          >
            Bulanan
          </button>
          <button 
            onClick={() => setBillingCycle('yearly')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${billingCycle === 'yearly' ? 'bg-white shadow-sm text-primary' : 'text-slate-500'}`}
          >
            Tahunan <span className="ml-1 text-[10px] bg-green-500 text-white px-1.5 py-0.5 rounded-full">Hemat 20%</span>
          </button>
        </div>
      </div>

      {fetchLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div 
              key={plan._id}
              className={`relative border-2 rounded-3xl p-8 flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${
                plan.nama_paket.toLowerCase().includes('premium') ? 'border-primary ring-4 ring-primary/5' : 'border-slate-100'
              }`}
            >
              {plan.nama_paket.toLowerCase().includes('premium') && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                  Paling Populer
                </div>
              )}

              <div className="mb-6">{getPlanIcon(plan.nama_paket)}</div>
              <h3 className="text-xl font-bold text-slate-900">{plan.nama_paket}</h3>
              
              <div className="mt-4 mb-8">
                <span className="text-4xl font-black text-slate-900">
                  Rp {(billingCycle === 'monthly' ? plan.harga_bulanan : plan.harga_tahunan).toLocaleString('id-ID')}
                </span>
                <span className="text-slate-400 text-sm">/{billingCycle === 'monthly' ? 'bln' : 'thn'}</span>
              </div>

              <div className="flex-1 space-y-4 mb-10">
                {plan.fitur.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-slate-600">
                    <Check size={18} className="text-primary shrink-0" />
                    {f}
                  </div>
                ))}
              </div>

              <button 
                onClick={() => handleSelectPlan(plan)}
                disabled={loading}
                className="w-full py-4 rounded-2xl font-bold transition-all bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Pilih Paket'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PaketSelect;