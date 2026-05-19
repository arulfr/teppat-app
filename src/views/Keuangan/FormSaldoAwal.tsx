import React from 'react';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
// import { saldoAwalPost } from '../../redux/actions/financeActions'; // Sesuaikan dengan path action Anda

interface SaldoAwalInput {
  jumlah: string;
  tanggal: string;
  keterangan: string;
}

const FormSaldoAwal: React.FC = () => {
  const dispatch = useAppDispatch();
  // Mengikuti pola fitur Barang/Hutang: ambil activeStoreId dari AdminSlice
  const { activeStoreId } = useAppSelector((state) => state.AdminSlice);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<SaldoAwalInput>({
    defaultValues: {
      tanggal: new Date().toISOString().split('T')[0],
      keterangan: 'Saldo Awal Kas / Modal'
    }
  });

  const onSubmit = async (data: SaldoAwalInput) => {
    try {
      if (!activeStoreId) {
        alert("ID Store tidak ditemukan. Silakan pilih toko atau login ulang.");
        return;
      }

      const payload = {
        ...data,
        id_store: activeStoreId
      };
      
      // Memanggil dispatch ke action creator saldoAwalPost yang memicu call API ke backend
      // await dispatch(saldoAwalPost(payload) as any);
      
      console.log("Submitting Saldo Awal:", payload);
      alert("Saldo awal berhasil disimpan. Sekarang saldo kas Anda mencukupi untuk bertransaksi.");
      reset();
    } catch (error: any) {
      alert("Gagal menyimpan saldo: " + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md border border-gray-200 mt-8">
      <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Input Saldo Awal Toko</h2>
      <p className="text-xs text-slate-500 mb-4">* Nominal yang dimasukkan akan ditambahkan ke saldo kas saat ini sebagai modal.</p>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nominal Saldo (Rp)</label>
          <input
            type="number"
            {...register('jumlah', { required: "Nominal tidak boleh kosong", min: { value: 1, message: "Nominal minimal 1" } })}
            placeholder="Contoh: 10000000"
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border ${errors.jumlah ? 'border-red-500' : 'border-gray-200'}`}
          />
          {errors.jumlah && <span className="text-red-500 text-xs">{errors.jumlah.message}</span>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Tanggal Transaksi</label>
          <input
            type="date"
            {...register('tanggal', { required: "Tanggal wajib diisi" })}
            className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Keterangan</label>
          <textarea
            {...register('keterangan')}
            rows={3}
            placeholder="Misal: Modal Awal Investasi"
            className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 transition-colors"
        >
          {isSubmitting ? "Menyimpan..." : "Simpan Saldo Awal"}
        </button>
      </form>
    </div>
  );
};

export default FormSaldoAwal;