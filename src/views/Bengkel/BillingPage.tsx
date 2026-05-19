import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { createBillingOrder, confirmBillingPayment } from "@/stores/BillingSlice";
import Button from "@/components/Base/Button";
import Lucide from "@/components/Base/Lucide";
import { FormInput, FormLabel } from "@/components/Base/Form";
import { formatCurrency } from "@/utils/helper";

const plans = [
  { id: 'standard', name: 'Standard', price: 150000, features: ['2 Kasir', '1 Toko', 'Fitur Retail'] },
  { id: 'premium', name: 'Premium', price: 350000, features: ['5 Kasir', '2 Toko', 'Fitur Bengkel/Apotek'] },
  { id: 'enterprise', name: 'Enterprise', price: 750000, features: ['Unlimited Kasir', 'Cabang Terpusat'] },
];

const BillingPage = () => {
  const dispatch = useAppDispatch();
  const { isLogin } = useAppSelector((state) => state.AdminSlice);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [duration, setDuration] = useState<'monthly' | 'yearly'>('monthly');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [proofUrl, setProofUrl] = useState("");

  const handleOrder = async (planId: string) => {
    const res: any = await dispatch(createBillingOrder({ paket_tujuan: planId, durasi: duration }));
    if (res.payload?.order) {
        setOrderId(res.payload.order._id);
        alert("Pesanan berhasil dibuat. Silakan transfer dan unggah bukti.");
    }
  };

  const handleConfirm = async () => {
    if (!orderId || !proofUrl) return alert("Isi bukti pembayaran");
    await dispatch(confirmBillingPayment({ id_order: orderId, bukti_pembayaran: proofUrl }));
    alert("Bukti terkirim! Admin akan memverifikasi dalam 1x24 jam.");
    setOrderId(null);
  };

  return (
    <div className="mt-5">
      <div className="intro-y flex items-center h-10">
        <h2 className="text-lg font-medium truncate mr-5">Paket Langganan</h2>
      </div>

      <div className="grid grid-cols-12 gap-6 mt-5">
        {plans.map((plan) => (
          <div key={plan.id} className="col-span-12 md:col-span-4 box p-5 flex flex-col items-center">
            <div className="text-xl font-bold mb-2">{plan.name}</div>
            <div className="text-4xl font-black text-primary mb-4">
                {formatCurrency(duration === 'monthly' ? plan.price : plan.price * 10)}
                <span className="text-sm font-normal text-slate-500">/{duration === 'monthly' ? 'bln' : 'thn'}</span>
            </div>
            <ul className="text-center space-y-2 mb-6 text-slate-600">
              {plan.features.map((f, i) => <li key={i} className="flex items-center"><Lucide icon="Check" className="w-4 h-4 mr-2 text-success" /> {f}</li>)}
            </ul>
            <Button 
              variant={isLogin.subscription_plan === plan.id ? "outline-primary" : "primary"} 
              className="w-full"
              onClick={() => handleOrder(plan.id)}
              disabled={isLogin.subscription_plan === plan.id}
            >
              {isLogin.subscription_plan === plan.id ? "Paket Saat Ini" : "Pilih Paket"}
            </Button>
          </div>
        ))}
      </div>

      {/* MODAL / SECTION KONFIRMASI */}
      {orderId && (
        <div className="mt-10 box p-5 border-2 border-primary animate-pulse">
            <div className="text-base font-bold mb-4 flex items-center">
                <Lucide icon="AlertCircle" className="mr-2" /> Konfirmasi Pembayaran Anda
            </div>
            <div className="grid grid-cols-12 gap-4 items-end">
                <div className="col-span-12 md:col-span-8">
                    <FormLabel>Unggah Bukti Transfer (URL/Link)</FormLabel>
                    <FormInput 
                        placeholder="https://link-gambar-bukti.com" 
                        value={proofUrl} 
                        onChange={(e) => setProofUrl(e.target.value)}
                    />
                </div>
                <div className="col-span-12 md:col-span-4">
                    <Button variant="success" className="w-full text-white" onClick={handleConfirm}>
                        Kirim Konfirmasi
                    </Button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default BillingPage;