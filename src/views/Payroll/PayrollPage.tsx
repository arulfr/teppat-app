import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { userGet } from "@/stores/UserSlice";
import { generatePayroll, clearPayrollError } from "@/stores/PayrollSlice";
import Button from "@/components/Base/Button";
import { FormInput, FormLabel, FormSelect } from "@/components/Base/Form";
import Lucide from "@/components/Base/Lucide";
import { formatCurrency } from "@/utils/helper";
import LoadingIcon from "@/components/Base/LoadingIcon";

const PayrollPage = () => {
  const dispatch = useAppDispatch();
  const { userData } = useAppSelector((state) => state.UserSlice);
  const { lastGenerated, loading, error } = useAppSelector((state) => state.PayrollSlice);
  const activeStoreId = useAppSelector((state) => state.AdminSlice.activeStoreId);

  const [form, setForm] = useState({
    employeeId: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    baseSalary: 0,
  });

  useEffect(() => {
    dispatch(userGet());
  }, [dispatch]);

  const handleGenerate = () => {
    if (!form.employeeId || !activeStoreId) return alert("Pilih karyawan terlebih dahulu");
    dispatch(generatePayroll({ ...form, id_store: activeStoreId }));
  };

  return (
    <div className="grid grid-cols-12 gap-6 mt-5">
      <div className="col-span-12 lg:col-span-4">
        <div className="box p-5 space-y-4">
          <div className="text-base font-medium border-b pb-3">Kalkulasi Gaji</div>
          <div>
            <FormLabel>Pilih Karyawan</FormLabel>
            <FormSelect 
              value={form.employeeId} 
              onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
            >
              <option value="">-- Pilih --</option>
              {userData.map((user) => (
                <option key={user._id} value={user._id}>{user.nama} ({user.role})</option>
              ))}
            </FormSelect>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FormLabel>Bulan</FormLabel>
              <FormInput type="number" value={form.month} onChange={(e) => setForm({...form, month: Number(e.target.value)})} />
            </div>
            <div>
              <FormLabel>Tahun</FormLabel>
              <FormInput type="number" value={form.year} onChange={(e) => setForm({...form, year: Number(e.target.value)})} />
            </div>
          </div>
          <div>
            <FormLabel>Gaji Pokok (Rp)</FormLabel>
            <FormInput 
              type="number" 
              value={form.baseSalary} 
              onChange={(e) => setForm({...form, baseSalary: Number(e.target.value)})} 
            />
          </div>
          <Button variant="primary" className="w-full" onClick={handleGenerate} disabled={loading}>
            {loading ? <LoadingIcon icon="spinning-circles" className="w-4 h-4 mr-2" /> : <Lucide icon="Calculator" className="w-4 h-4 mr-2" />}
            Hitung Gaji
          </Button>
          {error && <div className="text-danger text-xs mt-2 text-center">{error}</div>}
        </div>
      </div>

      <div className="col-span-12 lg:col-span-8">
        {lastGenerated ? (
          <div className="box p-5 animate-fade-in">
            <div className="flex items-center justify-between border-b pb-4 mb-4">
              <div className="text-lg font-bold uppercase tracking-tight">Slip Gaji Estimasi</div>
              <div className="text-slate-500">Periode: {lastGenerated.periode.bulan}/{lastGenerated.periode.tahun}</div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                    <div className="text-slate-500 text-xs">Nama Karyawan</div>
                    <div className="font-medium text-base">{lastGenerated.karyawan.nama}</div>
                </div>
                <div className="text-right">
                    <div className="text-slate-500 text-xs">Tipe Bisnis</div>
                    <div className="font-medium text-base uppercase">{lastGenerated.karyawan.tipe_bisnis}</div>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-dashed">
                    <span>Gaji Pokok</span>
                    <span className="font-mono">{formatCurrency(lastGenerated.rincian.gaji_pokok)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-dashed">
                    <span>Lembur</span>
                    <span className="font-mono text-success">+{formatCurrency(lastGenerated.rincian.total_lembur)}</span>
                </div>
                {lastGenerated.karyawan.is_mekanik && (
                    <div className="flex justify-between py-2 border-b border-dashed bg-primary/5 px-2">
                        <span className="font-bold text-primary italic">Insentif Jasa Mekanik</span>
                        <span className="font-mono text-primary">+{formatCurrency(lastGenerated.rincian.insentif_jasa_bengkel)}</span>
                    </div>
                )}
                <div className="flex justify-between py-2 border-b border-dashed">
                    <span>Potongan Terlambat</span>
                    <span className="font-mono text-danger">-{formatCurrency(lastGenerated.rincian.potongan_telat)}</span>
                </div>
                <div className="flex justify-between py-4 text-xl font-black">
                    <span>GAJI BERSIH</span>
                    <span className="text-primary">{formatCurrency(lastGenerated.gaji_bersih)}</span>
                </div>
            </div>
            
            <div className="mt-8 flex gap-2">
                <Button variant="outline-secondary" className="w-full">Cetak Slip</Button>
                <Button variant="success" className="w-full text-white">Simpan ke Pengeluaran</Button>
            </div>
          </div>
        ) : (
          <div className="box p-20 flex flex-col items-center justify-center text-slate-400 italic">
            <Lucide icon="FileSearch" className="w-16 h-16 mb-4 opacity-20" />
            Silakan pilih karyawan dan klik hitung untuk melihat rincian gaji.
          </div>
        )}
      </div>
    </div>
  );
};

export default PayrollPage;