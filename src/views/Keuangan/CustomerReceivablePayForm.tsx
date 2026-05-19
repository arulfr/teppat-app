import React from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import { payCustomerReceivable } from "@/stores/CustomerReceivableSlice";
import { toast } from "react-toastify";

interface PayReceivableInput {
  nominal_bayar: number;
  metode_pembayaran: string;
  keterangan_pembayaran: string;
}

const CustomerReceivablePayForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { activeStoreId } = useAppSelector((state) => state.AdminSlice);
  const { loading } = useAppSelector((state) => state.CustomerReceivableSlice);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<PayReceivableInput>({
    defaultValues: {
      metode_pembayaran: 'Tunai',
      keterangan_pembayaran: 'Pelunasan Piutang Pelanggan'
    }
  });

  const onSubmit = async (data: PayReceivableInput) => {
    try {
      const payload = {
        ...data,
        id_store: activeStoreId
      };
      
      await dispatch(payCustomerReceivable({ id: id as string, data: payload as any })).unwrap();
      toast.success("Pembayaran piutang berhasil dicatat");
      navigate('/keuangan/piutang_customer');
    } catch (error: any) {
      toast.error(error);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md border border-gray-200 mt-10">
      <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Form Pembayaran Piutang</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nominal Bayar (Rp)</label>
          <input
            type="number"
            {...register('nominal_bayar', { required: "Nominal wajib diisi", min: 1 })}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border ${errors.nominal_bayar ? 'border-red-500' : 'border-gray-200'}`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Metode Pembayaran</label>
          <select 
            {...register('metode_pembayaran')}
            className="mt-1 block w-full rounded-md border-gray-200 shadow-sm p-2 border"
          >
            <option value="Tunai">Tunai</option>
            <option value="Transfer">Transfer</option>
            <option value="QRIS">QRIS</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Keterangan</label>
          <textarea
            {...register('keterangan_pembayaran')}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-200 shadow-sm p-2 border"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-opacity-90 transition-colors"
        >
          {isSubmitting ? "Memproses..." : "Simpan Pembayaran"}
        </button>
      </form>
    </div>
  );
};

export default CustomerReceivablePayForm;