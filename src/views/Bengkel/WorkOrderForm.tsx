import React, { useState, useEffect, useRef } from "react";
import { useForm, FormProvider } from "react-hook-form";
import Button from "@/components/Base/Button";
import { FormInput, FormLabel, FormTextarea } from "@/components/Base/Form";
import Lucide from "@/components/Base/Lucide";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { fetchMekaniks, workOrderPost, fetchVehicles, kendaraanPost, mekanikPost } from "@/stores/BengkelSlice";
import { fetchLayanan, layananPost } from "@/stores/LayananSlice";
import { getBarangList } from "@/stores/BarangSlice";
import { KategoriGet, SupplierGet } from "@/stores/AdminSlice";
import { pelangganGet, pelangganPost } from "@/stores/PelangganSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ILayanan } from "@/utils/types";

interface IBarang {
  _id: string;
  kode_barang: string;
  nama_barang: string;
  harga_jual: number;
  stok: number;
}
import clsx from "clsx";

interface WorkOrderFields {
  plat_nomor: string;
  merk: string;
  model: string;
  tahun: number;
  nomor_rangka: string;
  nomor_mesin: string;
  odometer: number;
  id_mekanik_utama: string;
  deskripsi_keluhan: string;
  tindakan_saran: string;
  id_pelanggan: string;
  id_kendaraan: string;
  item_layanan: any[];
  item_sparepart: any[];
}

const WorkOrderForm = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { mekanik, loading } = useAppSelector((state) => state.BengkelSlice);
  const { layanan } = useAppSelector((state) => state.LayananSlice);
  const { BarangList } = useAppSelector((state) => state.BarangSlice);
  const { kategori, supplier, activeStoreId } = useAppSelector((state) => state.AdminSlice);
  const { pelanggan } = useAppSelector((state) => state.PelangganSlice);

  const [activeTab, setActiveTab] = useState<"kendaraan" | "penugasan" | "items" | "tindakan">("kendaraan");
  const [suggestedVehicles, setSuggestedVehicles] = useState<any[]>([]);
  const [selectedLayanan, setSelectedLayanan] = useState<any[]>([]);
  const [selectedSparepart, setSelectedSparepart] = useState<any[]>([]);

  // Ref untuk mengontrol agar pencarian plat nomor tidak loop setelah dipilih
  const isAutoFilling = useRef(false);

  // State untuk Modal Quick Add (Memperbaiki error: Cannot find name 'setModalOpen')
  const [modalOpen, setModalOpen] = useState<{ 
    pelanggan: boolean; 
    mekanik: boolean; 
    layanan: boolean; 
    barang: boolean; 
  }>({ pelanggan: false, mekanik: false, layanan: false, barang: false });
  
  const methods = useForm<WorkOrderFields>({
    defaultValues: {
      plat_nomor: "",
      merk: "",
      model: "",
      tahun: new Date().getFullYear(),
      nomor_rangka: "",
      nomor_mesin: "",
      odometer: 0,
      id_pelanggan: "",
      id_kendaraan: "",
      item_layanan: [],
      item_sparepart: [],
    },
  });

  const plat_nomor = methods.watch("plat_nomor");

  // Fungsi validasi per tab
  const validateTab = async (tabId: string) => {
    let fields: any[] = [];
    if (tabId === "kendaraan") {
      fields = ["plat_nomor", "id_pelanggan", "merk", "model", "tahun"];
    } else if (tabId === "penugasan") {
      fields = ["id_mekanik_utama"];
    }
    
    const isValid = await methods.trigger(fields);
    if (!isValid) toast.warning("Mohon lengkapi data wajib sebelum melanjutkan.");
    return isValid;
  };

  useEffect(() => {
    dispatch(fetchMekaniks());
    dispatch(pelangganGet());
    dispatch(fetchLayanan());
    dispatch(getBarangList());
    dispatch(KategoriGet()); 
    dispatch(SupplierGet()); // Fetch supplier untuk kebutuhan Quick Add Barang
  }, [dispatch]);

  // Otomatisasi Pencarian Plat Nomor
  useEffect(() => {
    if (plat_nomor && plat_nomor.length >= 2) {
      // BUG FIX 1: Jangan cari jika sedang dalam proses auto-fill setelah pemilihan
      if (isAutoFilling.current) {
        isAutoFilling.current = false;
        return;
      }

      // Clear previous suggestions immediately when typing
      setSuggestedVehicles([]);
      const delayDebounceFn = setTimeout(async () => {
        try {
          // FIX: Sertakan id_store sesuai Aturan #3 untuk menghindari 500 Error
          const result: any = await dispatch(fetchVehicles({ 
            plat_nomor: plat_nomor.toUpperCase(),
            id_store: activeStoreId 
          })).unwrap();
          
          if (result && result.length > 0) {
            setSuggestedVehicles(result);
          } else {
            setSuggestedVehicles([]);
            // Clear auto-filled fields if no vehicle found (allow new entry)
            methods.setValue("merk", "");
            methods.setValue("model", "");
            methods.setValue("tahun", new Date().getFullYear());
            methods.setValue("nomor_rangka", "");
            methods.setValue("nomor_mesin", "");
            methods.setValue("odometer", 0);
            methods.setValue("id_kendaraan", "");
          }
        } catch (error) {
          console.error("Search plate error", error);
          setSuggestedVehicles([]);
        }
      }, 400);

      return () => clearTimeout(delayDebounceFn);
    } else {
      setSuggestedVehicles([]); // Clear suggestions if plat_nomor is too short or empty
    }
  }, [plat_nomor, dispatch, methods]);

  const handleSelectVehicle = (v: any) => {
    // BUG FIX 1: Tandai sedang auto-fill agar useEffect tidak trigger search lagi
    isAutoFilling.current = true;

    // Auto-fill form
    methods.setValue("plat_nomor", v.plat_nomor); // Set plat nomor yang dipilih
    methods.setValue("merk", v.merk);
    methods.setValue("model", v.model);
    methods.setValue("tahun", v.tahun);
    methods.setValue("nomor_rangka", v.nomor_rangka || "");
    methods.setValue("nomor_mesin", v.nomor_mesin || "");
    methods.setValue("odometer", v.odometer || 0);
    methods.setValue("id_kendaraan", v._id);
    
    // Set ID Pelanggan (handle jika object atau string)
    const pelId = typeof v.id_pelanggan === 'string' ? v.id_pelanggan : (v.id_pelanggan as any)?._id;
    methods.setValue("id_pelanggan", pelId);

    setSuggestedVehicles([]); // Clear suggestions after selection
    toast.success(`Kendaraan ${v.plat_nomor} dipilih.`);
  };

  // Function to clear suggestions when input loses focus
  const handleBlur = () => {
    // Use a timeout to allow click event on suggestions to fire first
    setTimeout(() => setSuggestedVehicles([]), 100);
  };

  const addLayanan = (l: ILayanan) => {
    if (selectedLayanan.find(i => i._id === l._id)) return;
    setSelectedLayanan([...selectedLayanan, { ...l, id_layanan: l._id, jumlah: 1, harga_satuan: l.harga, sub_total: l.harga }]);
  };

  const addSparepart = (s: IBarang) => {
    if (selectedSparepart.find(i => i.id_barang === s._id)) return;
    setSelectedSparepart([...selectedSparepart, { 
        id_barang: s._id, 
        kode_barang: s.kode_barang,
        nama_barang: s.nama_barang, 
        jumlah: 1, 
        harga_jual: s.harga_jual, 
        sub_total: s.harga_jual 
    }]);
  };

  // --- Handlers for Quick Add (Memperbaiki error: handler missing) ---

  const handleQuickAddPelanggan = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const payload = {
      nama_pelanggan: formData.get("nama") as string,
      no_telp: formData.get("no_telp") as string,
      tipe_pelanggan: "perorangan",
      id_store: activeStoreId || undefined
    } as any;

    try {
      const res = await dispatch(pelangganPost(payload)).unwrap();
      const newId = (res as any)?._id || (res as any)?.data?._id;
      await dispatch(pelangganGet());
      methods.setValue("id_pelanggan", newId);
      setModalOpen({ ...modalOpen, pelanggan: false });
      toast.success("Pelanggan baru ditambahkan");
    } catch (err: any) { toast.error(err || "Gagal menambah pelanggan"); }
  };

  const handleQuickAddMekanik = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const payload = {
      nama_mekanik: formData.get("nama") as string,
      spesialisasi: formData.get("spesialisasi") as string,
      no_telepon: formData.get("no_telp") as string,
      id_store: activeStoreId || undefined
    };

    try {
      const res = await dispatch(mekanikPost(payload)).unwrap();
      const newId = res?._id || res?.data?._id;
      await dispatch(fetchMekaniks());
      methods.setValue("id_mekanik_utama", newId);
      setModalOpen({ ...modalOpen, mekanik: false });
      toast.success("Mekanik baru ditambahkan");
    } catch (err: any) { toast.error(err || "Gagal menambah mekanik"); }
  };

  const handleQuickAddLayanan = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const payload = {
      nama_layanan: formData.get("nama") as string,
      harga: Number(formData.get("harga")),
      id_store: activeStoreId || undefined
    } as any;

    try {
      const res = await dispatch(layananPost(payload)).unwrap();
      const newItem = (res as any)?.data || res;
      await dispatch(fetchLayanan());
      addLayanan(newItem);
      setModalOpen({ ...modalOpen, layanan: false });
      toast.success("Layanan baru ditambahkan");
    } catch (err: any) { toast.error(err || "Gagal menambah layanan"); }
  };

  // Komponen Modal Lokal (Memperbaiki error: Cannot find name 'QuickAddModal')
  const QuickAddModal = ({ title, isOpen, onClose, onSubmit, children }: any) => {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
          <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-700">{title}</h3>
            <button type="button" onClick={onClose}><Lucide icon="X" className="w-5 h-5 text-slate-400" /></button>
          </div>
          <form onSubmit={onSubmit} className="p-5 space-y-4">
            {children}
            <div className="flex gap-2 pt-4">
              <Button type="button" variant="secondary" className="w-full" onClick={onClose}>Batal</Button>
              <Button type="submit" variant="primary" className="w-full">Simpan</Button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const onSubmit = async (data: WorkOrderFields) => {
    try {
        if (!activeStoreId) {
            toast.error("Toko aktif tidak terdeteksi. Silakan pilih toko terlebih dahulu.");
            return;
        }

        if (!data.id_pelanggan) {
            toast.error("Pelanggan belum dipilih.");
            return;
        }

        let kendaraanId = data.id_kendaraan;

        // Otomatis daftarkan kendaraan jika belum ada di DB
        if (!kendaraanId) {
            const newVeh = await dispatch(kendaraanPost({
                id_pelanggan: data.id_pelanggan,
                plat_nomor: data.plat_nomor.toUpperCase(),
                merk: data.merk,
                model: data.model,
                // FIX: Konversi ke Number untuk menghindari validasi error di backend
                tahun: Number(data.tahun),
                nomor_rangka: data.nomor_rangka,
                nomor_mesin: data.nomor_mesin,
                odometer: Number(data.odometer),
                id_store: activeStoreId
            })).unwrap();
            
            // FIX: Defensive programming untuk mengambil ID dari response yang terbungkus .data (Aturan #7 & #8)
            kendaraanId = newVeh?._id || newVeh?.data?._id;
        }

        if (!kendaraanId) {
            throw new Error("Gagal mengidentifikasi kendaraan. Silakan periksa kembali data kendaraan.");
        }

        const total_biaya_jasa = selectedLayanan.reduce((a, b) => a + b.sub_total, 0);
        const total_biaya_sparepart = selectedSparepart.reduce((a, b) => a + b.sub_total, 0);

        const finalData = { 
            ...data, 
            id_store: activeStoreId, // FIX: Wajib menyertakan id_store (Aturan #3)
            id_kendaraan: kendaraanId,
            plat_nomor: data.plat_nomor.toUpperCase(),
            item_layanan: selectedLayanan.map(l => ({
                id_layanan: l.id_layanan || l._id,
                nama_layanan: l.nama_layanan,
                jumlah: l.jumlah,
                harga_satuan: l.harga_satuan,
                sub_total: l.sub_total
            })),
            item_sparepart: selectedSparepart,
            total_biaya_jasa: Number(total_biaya_jasa),
            total_biaya_sparepart: Number(total_biaya_sparepart),
            total_tagihan: Number(total_biaya_jasa + total_biaya_sparepart)
        };
        await dispatch(workOrderPost(finalData)).unwrap();
        toast.success("SPK Berhasil dibuat");
        navigate("/bengkel/work_order");
    } catch (error: any) {
        toast.error(error || "Gagal membuat SPK");
    }
  };

  const tabs = [
    { id: "kendaraan", label: "Info Kendaraan", icon: "Truck" },
    { id: "penugasan", label: "Penugasan", icon: "UserCheck" },
    { id: "items", label: "Item & Estimasi", icon: "Package" },
    { id: "tindakan", label: "Tindakan & Keluhan", icon: "Wrench" },
  ];

  return (
    <div className="p-5 bg-white rounded-md shadow-sm border border-slate-200">
      <div className="flex items-center pb-5 mb-5 border-b border-slate-200/60">
        <div className="text-base font-medium">Buat SPK Baru (Work Order)</div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-col sm:flex-row border-b border-slate-200 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={async () => {
              const canNavigate = activeTab === tab.id || (await validateTab(activeTab));
              if (canNavigate) setActiveTab(tab.id as any);
            }}
            className={clsx(
              "flex items-center justify-center py-3 px-6 text-sm font-medium border-b-2 transition-colors",
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-700"
            )}
          >
            <Lucide icon={tab.icon as any} className="w-4 h-4 mr-2" />
            {tab.label}
          </button>
        ))}
      </div>

      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          {/* Tab 1: Info Kendaraan */}
          {activeTab === "kendaraan" && (
            <div className="grid grid-cols-12 gap-4 gap-y-5 animate-fade-in">
              <div className="col-span-12 sm:col-span-6 relative"> {/* Added relative for absolute positioning of suggestions */}
                <FormLabel>Plat Nomor</FormLabel>
                <FormInput
                  {...methods.register("plat_nomor", { required: true })}
                  placeholder="B 1234 ABC"
                  className="uppercase"
                  onBlur={handleBlur} // Clear suggestions on blur
                />
                {suggestedVehicles.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                    {suggestedVehicles.map((v) => (
                      <div
                        key={v._id}
                        className="p-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                        onMouseDown={() => handleSelectVehicle(v)} // Use onMouseDown to prevent blur from firing first
                      >
                        <div className="font-semibold text-primary">{v.plat_nomor}</div>
                        <div className="text-xs text-gray-600">{v.merk} {v.model} - {(v.id_pelanggan as any)?.nama_pelanggan || 'Pelanggan Umum'}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="col-span-12 sm:col-span-6">
                <FormLabel>Odometer (KM)</FormLabel>
                <FormInput
                  type="number"
                  {...methods.register("odometer")}
                  placeholder="0"
                />
              </div>
              <div className="col-span-12">
                <div className="flex justify-between items-center mb-2">
                    <FormLabel className="mb-0">Pemilik / Pelanggan</FormLabel>
                    <Button 
                        type="button" 
                        size="sm" 
                        variant="outline-primary" 
                        onClick={() => setModalOpen({...modalOpen, pelanggan: true})} 
                        title="Quick Add"
                        className="px-3 py-1 h-auto text-[10px] shadow-sm font-bold"
                    >
                        <Lucide icon="Plus" className="w-3 h-3 mr-1" /> Tambah Baru
                    </Button>
                </div>
                <select 
                    {...methods.register("id_pelanggan", { required: true })}
                    className="form-control w-full p-2 border rounded-md"
                >
                  <option value="">-- Pilih Pelanggan --</option>
                  {pelanggan.map((p: any) => (
                    <option key={p._id} value={p._id}>
                        {p.nama_pelanggan} ({p.no_telp})
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-12 sm:col-span-4">
                <FormLabel>Merk</FormLabel>
                <FormInput
                  {...methods.register("merk", { required: true })}
                  placeholder="Contoh: Honda"
                />
              </div>
              <div className="col-span-12 sm:col-span-4">
                <FormLabel>Model</FormLabel>
                <FormInput
                  {...methods.register("model", { required: true })}
                  placeholder="Contoh: Vario 150"
                />
              </div>
              <div className="col-span-12 sm:col-span-4">
                <FormLabel>Tahun</FormLabel>
                <FormInput
                  type="number"
                  {...methods.register("tahun", { required: true })}
                  placeholder="2022"
                />
              </div>
              <div className="col-span-12 sm:col-span-6">
                <FormLabel>Nomor Rangka (Opsional)</FormLabel>
                <FormInput
                  {...methods.register("nomor_rangka")}
                  placeholder="Masukkan Nomor Rangka"
                  className="uppercase"
                />
              </div>
              <div className="col-span-12 sm:col-span-6">
                <FormLabel>Nomor Mesin (Opsional)</FormLabel>
                <FormInput
                  {...methods.register("nomor_mesin")}
                  placeholder="Masukkan Nomor Mesin"
                  className="uppercase"
                />
              </div>
            </div>
          )}

          {/* Tab 2: Penugasan */}
          {activeTab === "penugasan" && (
            <div className="animate-fade-in space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                    <FormLabel className="mb-0">Mekanik Utama</FormLabel>
                    <Button 
                        type="button" 
                        size="sm" 
                        variant="outline-primary" 
                        onClick={() => setModalOpen({...modalOpen, mekanik: true})} 
                        title="Quick Add"
                        className="px-3 py-1 h-auto text-[10px] shadow-sm font-bold"
                    >
                        <Lucide icon="Plus" className="w-3 h-3 mr-1" /> Tambah Baru
                    </Button>
                </div>
                <select 
                    {...methods.register("id_mekanik_utama")}
                    className="form-control w-full p-2 border rounded-md"
                >
                  <option value="">-- Pilih Mekanik --</option>
                  {mekanik.map((m: any) => (
                    <option key={m._id} value={m._id}>{m.nama_mekanik}</option>
                  ))}
                </select>
              </div>
              <div className="p-4 bg-slate-50 rounded border border-dashed border-slate-300">
                <p className="text-xs text-slate-500">
                  Info: Mekanik utama akan bertanggung jawab atas keseluruhan progres Work Order ini.
                </p>
              </div>
            </div>
          )}

          {/* Tab 3: Item & Estimasi (New) */}
          {activeTab === "items" && (
            <div className="animate-fade-in space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="border p-3 rounded-md">
                    <div className="flex justify-between items-center mb-2">
                        <FormLabel className="mb-0">Pilih Jasa / Layanan</FormLabel>
                        <Button 
                            type="button" 
                            variant="primary" 
                            className="w-7 h-7 p-0 flex items-center justify-center rounded-full shadow-md"
                            title="Quick Add"
                            onClick={() => setModalOpen({...modalOpen, layanan: true})}
                        >
                            <Lucide icon="Plus" className="w-4 h-4"/>
                        </Button>
                    </div>
                    <div className="flex gap-2 mb-2">
                        <select className="form-control text-sm" value="" onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                            const l = layanan.find((item: ILayanan) => item._id === e.target.value);
                            if (l) addLayanan(l);
                        }}>
                            <option value="">+ Tambah Jasa</option>
                            {layanan.map((l: ILayanan) => <option key={l._id} value={l._id}>{l.nama_layanan} (Rp {l.harga.toLocaleString()})</option>)}
                        </select>
                    </div>
                    <table className="w-full text-xs">
                        <thead><tr className="border-b"><th>Jasa</th><th className="text-right">Total</th></tr></thead>
                        <tbody>
                            {selectedLayanan.map((l, i) => (
                                <tr key={i}><td>{l.nama_layanan}</td><td className="text-right">{l.sub_total.toLocaleString()}</td></tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="border p-3 rounded-md">
                    <div className="flex justify-between items-center mb-2">
                        <FormLabel className="mb-0">Pilih Sparepart</FormLabel>
                    </div>
                    <div className="flex gap-2 mb-2">
                        <select className="form-control text-sm" value="" onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                            const s = (BarangList as IBarang[]).find((item: IBarang) => item._id === e.target.value);
                            if (s) addSparepart(s);
                        }}>
                            <option value="">+ Tambah Part</option>
                            {(BarangList as IBarang[] || []).map((s: IBarang) => <option key={s._id} value={s._id}>{s.nama_barang} (Stok: {s.stok})</option>)}
                        </select>
                    </div>
                    <table className="w-full text-xs">
                        <thead><tr className="border-b"><th>Part</th><th className="text-center">Qty</th><th className="text-right">Total</th></tr></thead>
                        <tbody>
                            {selectedSparepart.map((s, i) => (
                                <tr key={i}>
                                    <td>{s.nama_barang}</td>
                                    <td className="text-center">
                                        <input type="number" className="w-10 border text-center" value={s.jumlah} onChange={(e) => {
                                            const val = parseInt(e.target.value) || 1;
                                            const updated = [...selectedSparepart];
                                            updated[i].jumlah = val;
                                            updated[i].sub_total = val * updated[i].harga_jual;
                                            setSelectedSparepart(updated);
                                        }} />
                                    </td>
                                    <td className="text-right">{s.sub_total.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
              </div>
              <div className="bg-primary/10 p-3 rounded text-right">
                <p className="text-xs text-slate-600">Total Estimasi Billing:</p>
                <p className="text-xl font-bold text-primary">
                    Rp {(selectedLayanan.reduce((a, b) => a + b.sub_total, 0) + selectedSparepart.reduce((a, b) => a + b.sub_total, 0)).toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {/* Tab 3: Tindakan */}
          {activeTab === "tindakan" && (
            <div className="animate-fade-in space-y-4">
              <div>
                <FormLabel>Deskripsi Keluhan Pelanggan</FormLabel>
                <FormTextarea
                  {...methods.register("deskripsi_keluhan")}
                  rows={3}
                  placeholder="Contoh: Rem bunyi mencit, ganti oli mesin..."
                />
              </div>
              <div>
                <FormLabel>Saran Tindakan / Catatan Teknisi</FormLabel>
                <FormTextarea
                  {...methods.register("tindakan_saran")}
                  rows={3}
                  placeholder="Catatan tambahan untuk teknisi..."
                />
              </div>
            </div>
          )}

          {/* Form Footer */}
          <div className="flex justify-end gap-3 mt-10 pt-5 border-t border-slate-200">
            <Button variant="secondary" type="button" onClick={() => methods.reset()}>
              Reset Form
            </Button>
            {activeTab !== "tindakan" ? (
               <Button variant="primary" type="button" disabled={loading} onClick={async () => {
                   if (await validateTab(activeTab)) {
                      if (activeTab === 'kendaraan') setActiveTab('penugasan');
                      else if (activeTab === 'penugasan') setActiveTab('items');
                      else if (activeTab === 'items') setActiveTab('tindakan');
                   }
               }}>
                 Lanjut <Lucide icon="ChevronRight" className="w-4 h-4 ml-2" />
               </Button>
            ) : (
              <Button variant="success" type="submit" className="text-white" disabled={loading}>
                {loading ? <Lucide icon="RefreshCw" className="w-4 h-4 mr-2 animate-spin" /> : <Lucide icon="Save" className="w-4 h-4 mr-2" />}
                {loading ? "Sedang Menyimpan..." : "Simpan Work Order"}
              </Button>
            )}
          </div>
        </form>
      </FormProvider>

      {/* MODALS QUICK ADD */}
      <QuickAddModal title="Tambah Pelanggan Baru" isOpen={modalOpen.pelanggan} onClose={() => setModalOpen({...modalOpen, pelanggan: false})} onSubmit={handleQuickAddPelanggan}>
        <div><FormLabel>Nama Lengkap</FormLabel><FormInput name="nama" required placeholder="Contoh: Budi Sudarsono" /></div>
        <div><FormLabel>No. Telepon / WA</FormLabel><FormInput name="no_telp" required placeholder="0812xxxx" /></div>
      </QuickAddModal>

      <QuickAddModal title="Tambah Mekanik Baru" isOpen={modalOpen.mekanik} onClose={() => setModalOpen({...modalOpen, mekanik: false})} onSubmit={handleQuickAddMekanik}>
        <div><FormLabel>Nama Mekanik</FormLabel><FormInput name="nama" required /></div>
        <div><FormLabel>Spesialisasi</FormLabel><FormInput name="spesialisasi" placeholder="Contoh: Mesin / Kelistrikan" /></div>
        <div><FormLabel>No. Telepon</FormLabel><FormInput name="no_telp" /></div>
      </QuickAddModal>

      <QuickAddModal title="Tambah Jasa Baru" isOpen={modalOpen.layanan} onClose={() => setModalOpen({...modalOpen, layanan: false})} onSubmit={handleQuickAddLayanan}>
        <div><FormLabel>Nama Layanan</FormLabel><FormInput name="nama" required placeholder="Contoh: Ganti Oli Mesin" /></div>
        <div><FormLabel>Harga Jasa (Rp)</FormLabel><FormInput name="harga" type="number" required /></div>
      </QuickAddModal>
    </div>
  );
};

export default WorkOrderForm;