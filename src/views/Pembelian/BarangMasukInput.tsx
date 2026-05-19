import Button from '@/components/Base/Button'
import { FormInput, FormLabel, FormSelect } from '@/components/Base/Form'
import Litepicker from '@/components/Base/Litepicker';
import TomSelect from '@/components/Base/TomSelect';
import { getBarangList } from '@/stores/BarangSlice';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { ScanInput } from '../Components/ScanInput';
import { IBarang, PembelianPayload } from '@/utils/types';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { pembelianPost } from '@/stores/PembelianSlice';
import { SupplierGet } from '@/stores/AdminSlice';
import { toast } from 'react-toastify';
import LoadingIcon from '@/components/Base/LoadingIcon';
import BarangAdd from '../Barang/BarangAdd';
import { errorMonitor } from 'events';

interface CartItem {
  _id: string;
  kode_barang: string;
  nama_barang: string;
  satuan: string; // misal 'Pcs'
  pengali: number; // nilai konversi
  harga_beli: number; // Harga beli saat ini (bisa diedit)
  qty: number;
  subtotal: number;
  konversi_satuan?: any[]; // simpan pilihan konversi dari master
  satuan_dasar: string; // simpan satuan dasar master
}

const generateTransactionID = () => {
  const now = new Date();
  // Ambil komponen tanggal: 20260215
  const dateStr = now.toISOString().slice(0,10).replace(/-/g, ""); 
  // Ambil jam menit detik: 114530
  const timeStr = now.toTimeString().slice(0,8).replace(/:/g, "");
  // Tambah 3 digit random untuk mencegah tabrakan di detik yang sama
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  // Format Akhir: Trx-20260215-114530-123
  // Lebih rapi, tanpa karakter aneh, dan kemungkinan tabrakan hampir 0.
  return `Trx-${dateStr}${timeStr}-${random}`;
};

const BarangMasukInput = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [tglTransaksi,setTglTransaksi] = useState<string>(new Date().toLocaleDateString('en-CA'));
  const [idStore] = useState(localStorage.getItem("id_store"));
  const [noTransaksi, setNoTransaksi] = useState('');
  const [barangAddModal,setBarangAddModal] = useState(false);
  
  // State tambahan untuk Hutang/Supplier
  const suppliers = useAppSelector((state) => state.AdminSlice.supplier);
  const [kodeSupplier, setKodeSupplier] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [metodePembayaran, setMetodePembayaran] = useState("Cash");
  const [tanggalJatuhTempo, setTanggalJatuhTempo] = useState("");

  const barangList = useAppSelector(state=>state.BarangSlice.BarangList);

  useEffect(() => {
    dispatch(getBarangList()); // Assuming this is correct
    dispatch(SupplierGet());
  }, [dispatch]);

  // Generate ID SATU KALI SAJA saat halaman dimuat
  useEffect(() => {
      setNoTransaksi(generateTransactionID());
  }, []);

// ============================== Keranjang Pembelian Barang ======================================
    // A. STATE UTAMA: Daftar barang di keranjang
  const [cart, setCart] = useState<CartItem[]>([]);

  // B. FUNGSI: Tambah Barang ke Tabel
  const handleAddToCart = (barang: any) => {
    setCart((prevCart) => {
      // Cek: Barang sudah ada di tabel belum?
      const existingItem = prevCart.find((item) => item._id === barang._id);

      if (existingItem) {
        // SKENARIO 1: Barang sudah ada -> Tambahkan Qty-nya saja (+1)
        return prevCart.map((item) =>
          item._id === barang._id
            ? { ...item, qty: item.qty + 1, subtotal: (item.qty + 1) * item.harga_beli }
            : item
        );
      } else {
        // SKENARIO 2: Barang baru -> Masukkan baris baru
        const newItem: CartItem = {
          _id: barang._id,
          kode_barang: barang.kode_barang,
          nama_barang: barang.nama_barang,
          satuan: barang.satuan || "Pcs",
          pengali: 1,
          harga_beli: barang.harga_beli || 0, 
          qty: 1,
          subtotal: barang.harga_beli || 0,
          konversi_satuan: barang.konversi_satuan || [],
          satuan_dasar: barang.satuan || "Pcs"
        };
        return [newItem, ...prevCart]; // Barang baru taruh paling atas biar kelihatan
      }
    });
  };

  // C. FUNGSI: Update Data di Tabel (Ganti Qty atau Harga)
  const handleUpdateItem = (id: string, field: "qty" | "harga_beli", value: number) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item._id === id
          ? {
              ...item,
              [field]: value,
              subtotal: (field === "qty" ? value : item.qty) * (field === "harga_beli" ? value : item.harga_beli),
            }
          : item
      )
    );
  };

  const handleUpdateUnit = (id: string, satuan: string, pengali: number) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item._id === id) {
          const basePrice = item.harga_beli / (item.pengali || 1);
          const newHargaBeli = Math.round(basePrice * pengali);
          return { ...item, satuan, pengali, harga_beli: newHargaBeli, subtotal: item.qty * newHargaBeli };
        }
        return item;
      })
    );
  };

  // D. FUNGSI: Hapus Baris
  const handleDeleteItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item._id !== id));
  };

  // E. HITUNG GRAND TOTAL (Otomatis)
  const grandTotal = useMemo(() => {
    return cart.reduce((acc, curr) => acc + curr.subtotal, 0);
  }, [cart]);

// ==================================================================================================================

const loading = useAppSelector(state=>state.AdminSlice?.loading);
const handleSubmit = async() => {
  try {
    if (!kodeSupplier) return toast.warning("Pilih Supplier terlebih dahulu");
    if (metodePembayaran === "Tempo" && !tanggalJatuhTempo) {
      return toast.warning("Tanggal Jatuh Tempo wajib diisi untuk metode Tempo");
    }
    if (cart.length === 0) return toast.warning("Keranjang masih kosong");

    const payload: any = {
      no_transaksi : noTransaksi,
      tgl_transaksi : tglTransaksi,
      total_harga : grandTotal,
      kode_supplier: kodeSupplier,
      keterangan: keterangan,
      metode_pembayaran: metodePembayaran,
      tanggal_jatuh_tempo: metodePembayaran === "Tempo" ? tanggalJatuhTempo : null,
      listBarang: cart.map(item => ({
                kode_barang: item.kode_barang, // Wajib ada
                harga_beli: item.harga_beli,
                jumlah: item.qty, // Di cart kita pakai 'qty', di backend 'jumlah'
                satuan: item.satuan,
                pengali: item.pengali
            }))
    }
    await dispatch(pembelianPost(payload)).unwrap();
    toast.success('Transaksi Pembelian Berhasil Diinput'); 
    navigate('/inventaris/barang_masuk');
  } catch (error:string | any) {
      toast.error(error,{
        position:'top-right',
        autoClose:3000
      });
      setNoTransaksi(generateTransactionID());
  }
}


  return (
    <>
    <div className="flex items-center mt-12 intro-y">
        <h2 className="mr-auto text-lg font-medium">Input Transaksi Barang Masuk</h2>
        <button className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded flex gap-2"
        onClick={() => navigate(-1)} >
          <ArrowLeft size={20} />
          Kembali
        </button>
      </div>
      <div className="grid grid-cols-12 gap-6 mt-5">
        <div className="col-span-12 intro-y lg:col-span-12">
          {/* BEGIN: Form Layout */}

          <div className="p-5 intro-y box grid grid-cols-12 gap-4">
            <div className="col-span-12 sm:col-span-6">
              <FormLabel htmlFor="nama_kategori">No Transaksi : </FormLabel>
              <FormInput
                id="nama_kategori"
                type="text"
                className="w-full"
                placeholder="Input text"
                value={noTransaksi}
                onChange={(e)=>{}}
                readOnly
              />
            </div>
            <div className="col-span-12 sm:col-span-6">
              <FormLabel htmlFor="nama_kategori">tanggal Transaksi</FormLabel>
              <Litepicker
                value={tglTransaksi}
                onChange={(e) => {
                  setTglTransaksi(e.target.value);
                }}
                options={{
                  autoApply: false,
                  format: 'YYYY-MM-DD',
                  showWeekNumbers: true,
                  dropdowns: {
                    minYear: 1990,
                    maxYear: null,
                    months: true,
                    years: true,
                  },
                }}
              />
            </div>
            <div className="col-span-12 sm:col-span-6">
              <FormLabel>Supplier</FormLabel>
              <FormSelect 
                value={kodeSupplier}
                onChange={(e) => setKodeSupplier(e.target.value)}
              >
                <option value="">-- Pilih Supplier --</option>
                {suppliers.map((s: any) => (
                  <option key={s.kode_supplier} value={s.kode_supplier}>
                    {s.nama_supplier}
                  </option>
                ))}
              </FormSelect>
            </div>
            <div className="col-span-12 sm:col-span-6">
              <FormLabel>Keterangan</FormLabel>
              <FormInput
                type="text"
                placeholder="Contoh: Belanja sparepart bulanan"
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
              />
            </div>

            {/* buat garis pembatas */}
            <div className='col-span-12 sm:col-span-12'>
                <hr className='border-t border-slate-200 w-full' />
            </div>

            {/* BAGIAN METODE PEMBAYARAN */}
            <div className="col-span-12 sm:col-span-6">
              <FormLabel>Metode Pembayaran</FormLabel>
              <FormSelect 
                value={metodePembayaran}
                onChange={(e) => setMetodePembayaran(e.target.value)}
              >
                <option value="Cash">Cash (Langsung Potong Kas)</option>
                <option value="Tempo">Tempo (Masuk ke Hutang)</option>
              </FormSelect>
            </div>

            {metodePembayaran === "Tempo" && (
              <div className="col-span-12 sm:col-span-6 animate-fade-in">
                <FormLabel className="text-danger">Tanggal Jatuh Tempo</FormLabel>
                <FormInput
                  type="date"
                  className="border-danger"
                  value={tanggalJatuhTempo}
                  onChange={(e) => setTanggalJatuhTempo(e.target.value)}
                />
              </div>
            )}

            <div className='col-span-12 sm:col-span-12'>
                <hr className='border-t border-slate-200 w-full' />
            </div>

            <div className="col-span-12 sm:col-span-12">
                <FormLabel htmlFor="Search">
                  Cari/Pilih Barang :
                </FormLabel>
                <div className='flex gap-4'>
                  <ScanInput 
                      items={barangList} 
                      onSelect={handleAddToCart} 
                  />
                  <button 
                      onClick={()=>{setBarangAddModal(!barangAddModal)}} // Buka Modal
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-md flex items-center gap-2 whitespace-nowrap transition-colors"
                      title="Tambah Barang Baru ke Master Data"
                  >
                      <Plus size={20} /> {/* Icon Plus dari Lucide/Heroicons */}
                      <span className="hidden sm:inline">Barang Baru</span>
                  </button>

                </div>
              <div className="text-gray-500 text-xs mt-1">
                    *Tekan Enter setelah scan atau memilih barang.
                </div>
                
            </div>
            {/* 2. AREA TABEL */}
            <div className="bg-white rounded-lg shadow overflow-hidden border col-span-12 ">
              <div className='w-full overflow-x-auto'>
                <table className="w-full text-left text-sm min-w-[600px]">
                  <thead className="bg-gray-100 uppercase text-gray-600 font-bold">
                    <tr>
                      <th className="p-4">Nama Barang</th>
                      <th className="p-4 w-24">Qty</th>
                      <th className="p-4 w-40">Harga Beli</th>
                      <th className="p-4 w-40">Subtotal</th>
                      <th className="p-4 w-16">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {cart.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-gray-400 italic">
                          Belum ada barang. Scan atau cari barang diatas.
                        </td>
                      </tr>
                    ) : (
                      cart.map((item) => (
                        <tr key={item._id} className="hover:bg-gray-50">
                          {/* Nama & Kode */}
                          <td className="p-4">
                            <div className="font-medium text-gray-900">{item.nama_barang}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                              <span>{item.kode_barang}</span>
                              {/* Badge Satuan */}
                              <span className="bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded text-[10px] font-semibold text-gray-600">
                                {item.satuan || 'Pcs'}
                              </span>
                            </div>
                          </td>

                          {/* Input Qty */}
                          <td className="p-4">
                            <div className="flex flex-col gap-2"> 
                              <input
                                type="number"
                                min="1"
                                className="w-full border rounded px-2 py-1 text-center"
                                value={item.qty}
                                onChange={(e) =>
                                  handleUpdateItem(item._id, "qty", parseInt(e.target.value) || 0)
                                }
                              />
                              <FormSelect 
                                className="text-xs py-1"
                                value={item.satuan}
                                onChange={(e) => {
                                  const selectedVal = e.target.value;
                                  const findKonv = item.konversi_satuan?.find((k: any) => k.satuan === selectedVal);
                                  const multiplier = findKonv ? findKonv.pengali : 1;
                                  // Tips: Jika Master memiliki standard harga beli per satuan, bisa di-update otomatis di sini
                                  handleUpdateUnit(item._id, selectedVal, multiplier);
                                }}
                              >
                                <option value={item.satuan_dasar}>{item.satuan_dasar} (x1)</option>
                                {item.konversi_satuan?.map((konv: any, i: number) => (
                                  <option key={i} value={konv.satuan}>
                                    {konv.satuan} (x{konv.pengali})
                                  </option>
                                ))}
                              </FormSelect>
                            </div>
                          </td>

                          {/* Input Harga Beli (Editable) */}
                          <td className="p-4">
                            <input
                              type="number"
                              className="w-full border rounded px-2 py-1 text-right"
                              value={item.harga_beli}
                              onChange={(e) => (
                                handleUpdateItem(item._id, "harga_beli", parseInt(e.target.value) || 0)
                              )}
                            />
                          </td>

                          {/* Subtotal (Read Only) */}
                          <td className="p-4 text-center font-medium">
                            Rp {item.subtotal.toLocaleString("id-ID")}
                          </td>

                          {/* Tombol Hapus */}
                          <td className="p-4 text-center">
                            <button
                              onClick={() => handleDeleteItem(item._id)}
                              className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  {/* Footer Grand Total */}
                  <tfoot className="bg-gray-50 font-bold">
                    <tr>
                      <td colSpan={3} className="p-4 text-right">Total Akhir:</td>
                      <td className="p-4 text-right text-lg text-blue-600">
                        Rp {grandTotal.toLocaleString("id-ID")}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>


            <div className="col-span-12 mt-5 text-right">
              <Button
                type="button"
                variant="outline-secondary"
                className="w-24 mr-1"
                // kembali ke halaman sebelumnya
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button type="button" variant="primary" className="w-24" onClick={handleSubmit} 
               disabled={loading}
              >
                {loading? <LoadingIcon icon='spinning-circles' className='w-6 h-6 text-white' color='white' />:'Submit'}
              </Button>
            </div>
          </div>

        </div>
      </div>

    {/* ADD MODAL */}
    <BarangAdd barangAddModal={barangAddModal} setBarangAddModal={setBarangAddModal} />
    </>
  )
}

export default BarangMasukInput