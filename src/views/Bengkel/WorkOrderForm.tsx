import React, { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import Button from "@/components/Base/Button";
import { FormInput, FormLabel, FormTextarea } from "@/components/Base/Form";
import Lucide from "@/components/Base/Lucide";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { fetchMekaniks, workOrderPost, fetchVehicles, kendaraanPost } from "@/stores/BengkelSlice";
import { fetchLayanan } from "@/stores/LayananSlice";
import { getBarangList } from "@/stores/BarangSlice";
import { pelangganGet } from "@/stores/PelangganSlice";
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
  const { pelanggan } = useAppSelector((state) => state.PelangganSlice);
  const { activeStoreId } = useAppSelector((state) => state.AdminSlice);

  const [activeTab, setActiveTab] = useState<"kendaraan" | "penugasan" | "items" | "tindakan">("kendaraan");
  const [suggestedVehicles, setSuggestedVehicles] = useState<any[]>([]);
  const [selectedLayanan, setSelectedLayanan] = useState<any[]>([]);
  const [selectedSparepart, setSelectedSparepart] = useState<any[]>([]);
  
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
  }, [dispatch]);

  // Otomatisasi Pencarian Plat Nomor
  useEffect(() => {
    if (plat_nomor && plat_nomor.length >= 4) {
      // Clear previous suggestions immediately when typing
      setSuggestedVehicles([]);
      const delayDebounceFn = setTimeout(async () => {
        try {
          const result: any = await dispatch(fetchVehicles({ plat_nomor: plat_nomor.toUpperCase() })).unwrap();
          
          if (result && result.length > 0) {
            setSuggestedVehicles(result);
            toast.info(`Ditemukan ${result.length} kendaraan.`);
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
      }, 1000);

      return () => clearTimeout(delayDebounceFn);
    } else {
      setSuggestedVehicles([]); // Clear suggestions if plat_nomor is too short or empty
    }
  }, [plat_nomor, dispatch, methods]);

  const handleSelectVehicle = (v: any) => {
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

  const onSubmit = async (data: WorkOrderFields) => {
    try {
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
                tahun: data.tahun,
                nomor_rangka: data.nomor_rangka,
                nomor_mesin: data.nomor_mesin,
                odometer: data.odometer,
                id_store: activeStoreId
            })).unwrap();
            kendaraanId = newVeh._id;
        }

        const total_biaya_jasa = selectedLayanan.reduce((a, b) => a + b.sub_total, 0);
        const total_biaya_sparepart = selectedSparepart.reduce((a, b) => a + b.sub_total, 0);

        const finalData = { 
            ...data, 
            id_kendaraan: kendaraanId,
            plat_nomor: data.plat_nomor.toUpperCase(),
            item_layanan: selectedLayanan.map(l => ({
                id_layanan: l._id,
                nama_layanan: l.nama_layanan,
                jumlah: l.jumlah,
                harga_satuan: l.harga_satuan,
                sub_total: l.sub_total
            })),
            item_sparepart: selectedSparepart,
            total_biaya_jasa,
            total_biaya_sparepart,
            total_tagihan: total_biaya_jasa + total_biaya_sparepart
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
                <FormLabel>Pemilik / Pelanggan</FormLabel>
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
                <FormLabel>Mekanik Utama</FormLabel>
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
                    <FormLabel>Pilih Jasa / Layanan</FormLabel>
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
                    <FormLabel>Pilih Sparepart</FormLabel>
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
               <Button variant="primary" type="button" onClick={async () => {
                   if (await validateTab(activeTab)) {
                      if (activeTab === 'kendaraan') setActiveTab('penugasan');
                      else if (activeTab === 'penugasan') setActiveTab('items');
                      else if (activeTab === 'items') setActiveTab('tindakan');
                   }
               }}>
                 Lanjut <Lucide icon="ChevronRight" className="w-4 h-4 ml-2" />
               </Button>
            ) : (
              <Button variant="success" type="submit" className="text-white">
                <Lucide icon="Save" className="w-4 h-4 mr-2" /> Simpan Work Order
              </Button>
            )}
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default WorkOrderForm;