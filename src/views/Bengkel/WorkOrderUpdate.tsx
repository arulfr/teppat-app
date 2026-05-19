import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { fetchWorkOrderById, workOrderUpdate, fetchMekaniks } from "@/stores/BengkelSlice";
import { fetchLayanan } from "@/stores/LayananSlice";
import { getBarangList } from "@/stores/BarangSlice";
import Button from "@/components/Base/Button";
import { FormLabel, FormInput } from "@/components/Base/Form";
import Lucide from "@/components/Base/Lucide";
import { ILayanan } from "@/utils/types";
import { toast } from "react-toastify";

interface IBarang {
  _id: string;
  kode_barang: string;
  nama_barang: string;
  harga_jual: number;
  stok: number;
}

const WorkOrderUpdate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { mekanik, loading } = useAppSelector((state) => state.BengkelSlice);
  const { layanan } = useAppSelector((state) => state.LayananSlice);
  const { BarangList } = useAppSelector((state) => state.BarangSlice);

  const [currentWO, setCurrentWO] = useState<any>(null);
  const [selectedLayanan, setSelectedLayanan] = useState<any[]>([]);
  const [selectedSparepart, setSelectedSparepart] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      dispatch(getBarangList());
      dispatch(fetchLayanan());
      dispatch(fetchMekaniks());
      if (id) {
        try {
          const res = await dispatch(fetchWorkOrderById(id)).unwrap();
          setCurrentWO(res);
          setSelectedLayanan(res.item_layanan || []);
          setSelectedSparepart(res.item_sparepart || []);
        } catch (err: any) {
          toast.error(err || "Data SPK tidak ditemukan");
          navigate("/bengkel/work_order");
        }
      }
    };
    loadData();
  }, [id, dispatch]);

  const addLayanan = (l: ILayanan) => {
    if (selectedLayanan.find((i) => i.id_layanan === l._id)) return;
    setSelectedLayanan([...selectedLayanan, { 
        id_layanan: l._id, 
        nama_layanan: l.nama_layanan, 
        jumlah: 1, 
        harga_satuan: l.harga, 
        sub_total: l.harga 
    }]);
  };

  const addSparepart = (s: IBarang) => {
    if (selectedSparepart.find((i) => i.id_barang === s._id)) return;
    if (s.stok <= 0) {
      toast.error(`Stok ${s.nama_barang} sudah habis!`);
      return;
    }
    setSelectedSparepart([...selectedSparepart, { 
        id_barang: s._id, 
        kode_barang: s.kode_barang,
        nama_barang: s.nama_barang, 
        jumlah: 1, 
        harga_jual: s.harga_jual, 
        sub_total: s.harga_jual 
    }]);
  };

  const removeLayanan = (idx: number) => {
    const updated = [...selectedLayanan];
    updated.splice(idx, 1);
    setSelectedLayanan(updated);
  };

  const removeSparepart = (idx: number) => {
    const updated = [...selectedSparepart];
    updated.splice(idx, 1);
    setSelectedSparepart(updated);
  };

  const calculateTotal = () => {
    const jasa = selectedLayanan.reduce((a, b) => a + b.sub_total, 0);
    const parts = selectedSparepart.reduce((a, b) => a + b.sub_total, 0);
    return { jasa, parts, total: jasa + parts };
  };

  const handleUpdate = async () => {
    try {
      const totals = calculateTotal();
      const payload = {
        _id: id,
        item_layanan: selectedLayanan,
        item_sparepart: selectedSparepart,
        total_biaya_jasa: totals.jasa,
        total_biaya_sparepart: totals.parts,
        total_tagihan: totals.total
      };

      await dispatch(workOrderUpdate(payload)).unwrap();
      toast.success("Item SPK Berhasil diperbarui");
      navigate("/bengkel/work_order");
    } catch (error: any) {
      toast.error(error || "Gagal memperbarui item");
    }
  };

  if (!currentWO) return <div className="p-5">Memuat data SPK...</div>;

  return (
    <div className="p-5">
      <div className="flex items-center mb-5 gap-3">
        <Button variant="secondary" onClick={() => navigate(-1)} size="sm">
            <Lucide icon="ArrowLeft" className="w-4 h-4" />
        </Button>
        <h2 className="text-lg font-bold">Update Item SPK: {currentWO.no_spk}</h2>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Info Kendaraan (Read Only) */}
        <div className="col-span-12 lg:col-span-4 box p-5">
            <div className="border-b pb-3 mb-3 font-bold text-slate-500 uppercase text-xs">Informasi Kendaraan</div>
            <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Plat Nomor:</span> <span className="font-bold">{currentWO.id_kendaraan?.plat_nomor}</span></div>
                <div className="flex justify-between"><span>Unit:</span> <span>{currentWO.id_kendaraan?.merk} {currentWO.id_kendaraan?.model}</span></div>
                <div className="flex justify-between"><span>Tahun / KM:</span> <span>{currentWO.id_kendaraan?.tahun} / {currentWO.id_kendaraan?.odometer?.toLocaleString()} KM</span></div>
                <div className="flex justify-between"><span>No. Rangka:</span> <span className="uppercase text-xs">{currentWO.id_kendaraan?.nomor_rangka || "-"}</span></div>
                <div className="flex justify-between"><span>No. Mesin:</span> <span className="uppercase text-xs">{currentWO.id_kendaraan?.nomor_mesin || "-"}</span></div>
                <div className="flex justify-between"><span>Pelanggan:</span> <span>{currentWO.id_pelanggan?.nama_pelanggan}</span></div>
                <div className="flex justify-between"><span>Mekanik:</span> <span>{currentWO.id_mekanik_utama?.nama_mekanik}</span></div>
            </div>
        </div>

        {/* Editor Item */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
            {/* Bagian Jasa */}
            <div className="box p-5">
                <div className="flex items-center justify-between mb-4">
                    <FormLabel className="mb-0 font-bold">Daftar Jasa / Layanan</FormLabel>
                    <select className="form-control form-control-sm w-48" onChange={(e) => {
                        const l = (layanan || []).find(item => item._id === e.target.value);
                        if (l) addLayanan(l);
                    }} value="">
                        <option value="">+ Tambah Jasa</option>
                        {(layanan || []).map(l => <option key={l._id} value={l._id}>{l.nama_layanan}</option>)}
                    </select>
                </div>
                <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="p-2 text-left">Nama Layanan</th>
                            <th className="p-2 text-right">Harga</th>
                            <th className="p-2 text-center w-16">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {selectedLayanan.map((l, idx) => (
                            <tr key={idx} className="border-b">
                                <td className="p-2">{l.nama_layanan}</td>
                                <td className="p-2 text-right">Rp {l.harga_satuan?.toLocaleString()}</td>
                                <td className="p-2 text-center">
                                    <button onClick={() => removeLayanan(idx)} className="text-danger"><Lucide icon="Trash2" className="w-4 h-4" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Bagian Sparepart */}
            <div className="box p-5">
                <div className="flex items-center justify-between mb-4">
                    <FormLabel className="mb-0 font-bold">Daftar Suku Cadang / Part</FormLabel>
                    <select className="form-control form-control-sm w-48" onChange={(e) => {
                        const s = (BarangList as IBarang[] || []).find(item => item._id === e.target.value);
                        if (s) addSparepart(s);
                    }} value="">
                        <option value="">+ Tambah Part</option>
                        {(BarangList as IBarang[] || []).map(s => <option key={s._id} value={s._id}>{s.nama_barang} (Stok: {s.stok})</option>)}
                    </select>
                </div>
                <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="p-2 text-left">Nama Barang</th>
                            <th className="p-2 text-center w-24">Qty</th>
                            <th className="p-2 text-right">Subtotal</th>
                            <th className="p-2 text-center w-16">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {selectedSparepart.map((s, idx) => (
                            <tr key={idx} className="border-b">
                                <td className="p-2 text-xs">{s.nama_barang}</td>
                                <td className="p-2 text-center flex flex-col items-center">
                                    <div className="flex items-center justify-center w-full">
                                        <input 
                                            type="number" 
                                            className="w-16 border rounded text-center text-xs" 
                                            value={s.jumlah}
                                            onChange={(e) => {
                                                const val = Math.max(1, parseInt(e.target.value) || 1);
                                                
                                                // Cari data master barang untuk cek stok real-time
                                                const masterPart = (BarangList as IBarang[]).find(p => p._id === s.id_barang);
                                                if (masterPart && val > masterPart.stok) {
                                                    toast.warning(`Stok tidak mencukupi! Maksimal stok ${masterPart.nama_barang} adalah ${masterPart.stok}`);
                                                    return;
                                                }

                                                const updated = [...selectedSparepart];
                                                updated[idx].jumlah = val;
                                                updated[idx].sub_total = val * updated[idx].harga_jual;
                                                setSelectedSparepart(updated);
                                            }}
                                        />
                                    </div>
                                    {/* Menampilkan sisa stok */}
                                    {(() => {
                                        const masterPart = (BarangList as IBarang[]).find(p => p._id === s.id_barang);
                                        return masterPart ? <span className="text-[10px] text-slate-500 mt-1">Stok: {masterPart.stok}</span> : null;
                                    })()}
                                </td>
                                <td className="p-2 text-right">Rp {s.sub_total?.toLocaleString()}</td>
                                <td className="p-2 text-center">
                                    <button onClick={() => removeSparepart(idx)} className="text-danger"><Lucide icon="Trash2" className="w-4 h-4" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Ringkasan & Aksi */}
            <div className="box p-5 bg-slate-100 border-2 border-dashed">
                <div className="flex justify-between items-center mb-4">
                    <div className="text-sm font-medium">Total Estimasi Baru:</div>
                    <div className="text-xl font-black text-primary">Rp {calculateTotal().total.toLocaleString()}</div>
                </div>
                <div className="flex gap-2">
                    <Button 
                        variant="primary" 
                        className="w-full" 
                        onClick={handleUpdate}
                        disabled={loading}
                    >
                        {loading ? "Menyimpan..." : "Update Item SPK"}
                    </Button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default WorkOrderUpdate;