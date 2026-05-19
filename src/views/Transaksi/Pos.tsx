import Button from '@/components/Base/Button';
import { FormInput, FormLabel, FormSelect } from '@/components/Base/Form';
import Lucide from '@/components/Base/Lucide';
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom';
import { ScanInput } from '../Components/ScanInput';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import { getBarangList } from '@/stores/BarangSlice';
import { set } from 'lodash';
import { formatRupiah } from '@/utils/helper';
import { useReactToPrint } from 'react-to-print';
import ReceiptTemplate from './ReceiptTemplate';
import CreateTableSelect from 'react-select/creatable';
import CreatableSelect from 'react-select/creatable';
import { IPelanggan } from '@/utils/types';
import { pelangganGet } from '@/stores/PelangganSlice';
import PelangganAdd from '../Pelanggan/PelangganAdd';
import { TransaksiPost } from '@/stores/TransaksiSlice';
import { fetchWorkOrders } from '@/stores/BengkelSlice';
import { toast } from 'react-toastify';

const DEFAULT_CUSTOMER = { value: 'UMUM', label: 'Pelanggan Umum',nama_cetak:'Pelanggan Umum' };

export interface CartItem {
  _id: string;
  kode_barang: string;
  nama_barang: string;
  satuan: string;
  pengali: number;
  harga_jual: number;
  jumlah: number;
  sub_total: number;
  konversi_satuan?: any[];
  satuan_dasar: string;
  tipe: 'barang' | 'jasa';
  id_mekanik?: string | null;
}

export const Pos = () => {

    const [cart, setCart] = React.useState<CartItem[]>([]); // State untuk menyimpan daftar belanja (cart);
    const [diskon, setDiskon] = React.useState(0); // State untuk menyimpan nilai diskon
    const [bayar, setBayar] = React.useState(0); // State untuk menyimpan nilai diskon
    const [paymentMethod, setPaymentMethod] = useState<'Tunai' | 'Kartu' | 'QRIS' | 'Tempo'>('Tunai');
    const [dueDate, setDueDate] = useState<string>(new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0]);

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const spkId = queryParams.get('spk');

    const barangList = useAppSelector((state) => state.BarangSlice.BarangList); // Ambil data barang dari Redux
    const pelangganList = useAppSelector((state) => state.PelangganSlice.pelanggan); // Ambil data pelanggan dari Redux
    const workOrders = useAppSelector((state) => state.BengkelSlice.workOrders);
    const { isLogin } = useAppSelector((state) => state.AdminSlice);
    const tipeBisnis = isLogin?.tipe_bisnis

  //================================================================================================
    const formatDataPelanggan = useMemo(() => {
        const options = pelangganList.map((pel:IPelanggan) => ({
          value: pel._id || "", // Gunakan _id jika ada, jika tidak gunakan nama
          label: `${pel.nama_pelanggan || '-'} - ${pel.no_telp}`, // Tampilkan nomor telepon dan nama pelanggan
          nama_cetak:pel.nama_pelanggan,
        }));
        return [DEFAULT_CUSTOMER, ...options]; // Tambahkan opsi default di awal
    }, [pelangganList]);

    const [selectedCustomer, setSelectedCustomer] = useState(DEFAULT_CUSTOMER);
    //=============================================================================================

    const dispatch = useAppDispatch();
    useEffect(() => {
        dispatch(getBarangList());
        dispatch(pelangganGet());
        if (spkId) {
          dispatch(fetchWorkOrders());
        }
    }, [spkId]);

    // D. FUNGSI: Load data dari SPK jika ada parameter ?spk=ID
    useEffect(() => {
      if (spkId && workOrders.length > 0) {
        const wo = workOrders.find(item => item._id === spkId);
        if (wo) {
          const spkItems: CartItem[] = [];
          
          // Masukkan Layanan (Jasa)
          wo.item_layanan.forEach((layanan: any) => {
            spkItems.push({
              _id: layanan.id_layanan || Math.random().toString(),
              kode_barang: layanan.id_layanan || 'JASA',
              nama_barang: layanan.nama_layanan,
              satuan: 'Jasa',
              pengali: 1,
              harga_jual: layanan.harga_satuan,
              jumlah: layanan.jumlah,
              sub_total: layanan.sub_total,
              satuan_dasar: 'Jasa',
              tipe: 'jasa',
              id_mekanik: layanan.id_mekanik_bertanggung_jawab
            });
          });

          // Masukkan Sparepart
          wo.item_sparepart.forEach((part: any) => {
            spkItems.push({
              _id: part.id_barang,
              kode_barang: part.kode_barang,
              nama_barang: part.nama_barang,
              satuan: 'Pcs',
              pengali: 1,
              harga_jual: part.harga_jual,
              jumlah: part.jumlah,
              sub_total: part.sub_total,
              satuan_dasar: 'Pcs',
              tipe: 'barang'
            });
          });

          setCart(spkItems);
          
          // Set Pelanggan otomatis jika ada
          if (wo.id_pelanggan) {
            const pel = typeof wo.id_pelanggan === 'string' ? null : (wo.id_pelanggan as any);
            if (pel) {
              setSelectedCustomer({
                value: pel._id,
                label: `${pel.nama_pelanggan} - ${pel.no_telp}`,
                nama_cetak: pel.nama_pelanggan
              });
            }
          }
        }
      }
    }, [spkId, workOrders]);

    // B. FUNGSI: Tambah Barang ke Tabel
    const handleAddToCart = (barang: any) => {
      const existingItem = cart.find((item) => item._id === barang._id);
      const nextQty = existingItem ? existingItem.jumlah + 1 : 1;
      const multiplier = existingItem ? existingItem.pengali : 1;

      // Jasa tidak dicek stoknya
      if (barang.tipe !== 'jasa') {
        if ((barang.stok || 0) <= 0) {
          toast.error(`Gagal! Stok "${barang.nama_barang}" sudah habis.`);
          return;
        }

        if (nextQty * multiplier > (barang.stok || 0)) {
          toast.error(`Gagal! Stok "${barang.nama_barang}" tidak mencukupi. Sisa stok: ${barang.stok ?? 0}`);
          return;
        }
      }

      setCart((prevCart) => {
        // Cek: Barang sudah ada di tabel belum?
        const existingItem = prevCart.find((item) => item._id === barang._id);
        // console.log(existingItem);
        if (existingItem) {
          // SKENARIO 1: Barang sudah ada -> Tambahkan Qty-nya saja (+1)
          return prevCart.map((item) =>
            item._id === barang._id
              ? { ...item, jumlah: item.jumlah + 1, sub_total: (item.jumlah + 1) * item.harga_jual }
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
            harga_jual: Number(barang.harga_jual) || 0,
            jumlah: 1,
            sub_total: Number(barang.harga_jual) || 0,
            konversi_satuan: barang.konversi_satuan || [],
            satuan_dasar: barang.satuan || "Pcs",
            tipe: barang.isNonStock ? 'jasa' : 'barang', // Tentukan tipe berdasarkan isNonStock
            id_mekanik: null // Default null, bisa diubah nanti jika perlu
            
          };
          return [newItem, ...prevCart]; // Barang baru taruh paling atas biar kelihatan
        }

      });
    };

  // C. FUNGSI: Update Data di Tabel (Ganti Qty atau Harga)
  const handleUpdateItem = (id: string, field: "jumlah" | "harga_jual", value: number) => {
    if (field === "jumlah") {
      const masterBarang = barangList.find((i) => i._id === id);
      const itemInCart = cart.find((i) => i._id === id);
      if (masterBarang && itemInCart && itemInCart.tipe !== 'jasa') {
        const totalBaseQty = value * itemInCart.pengali;
        if (totalBaseQty > (masterBarang.stok ?? 0)) {
          toast.error(`Stok "${masterBarang.nama_barang}" tidak mencukupi! Sisa stok: ${masterBarang.stok ?? 0}`);
          return;
        }
      }
    }
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item._id === id) {
          const updatedItem = { ...item, [field]: value };
          // Hitung ulang subtotal otomatis
          updatedItem.sub_total = updatedItem.jumlah * updatedItem.harga_jual;
          return updatedItem;
        }
        return item;
      })
    );
  };

  const handleUpdateUnit = (id: string, satuan: string, pengali: number) => {
    const masterBarang = barangList.find((i) => i._id === id);
    const itemInCart = cart.find((i) => i._id === id);

    if (masterBarang && itemInCart && itemInCart.tipe !== 'jasa') {
      const totalBaseQty = itemInCart.jumlah * pengali;
      if (totalBaseQty > (masterBarang.stok ?? 0)) {
        toast.error(`Stok "${masterBarang.nama_barang}" tidak mencukupi untuk satuan ini! Sisa stok: ${masterBarang.stok ?? 0}`);
        return;
      }
    }
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item._id === id) {
          const findKonv = item.konversi_satuan?.find((k: any) => k.satuan === satuan);
          let newHargaJual: number;
          
          if (findKonv && findKonv.harga_jual) {
            // Gunakan harga khusus satuan ini jika ada di master
            newHargaJual = findKonv.harga_jual;
          } else {
            // Hitung proporsional (Base Price * Pengali Baru)
            const basePrice = item.harga_jual / (item.pengali || 1);
            newHargaJual = Math.round(basePrice * pengali);
          }
          return { ...item, satuan, pengali, harga_jual: newHargaJual, sub_total: item.jumlah * newHargaJual };
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
    const subtotalCart = useMemo(() => {
        return cart.reduce((acc, curr) => acc + curr.sub_total, 0);
      }, [cart]);

    const grandTotal = useMemo(() => {
      const hasil = subtotalCart - diskon;
      // Validasi pengaman: Jangan biarkan grand total menjadi minus jika kasir salah ketik diskon
      return hasil > 0 ? hasil : 0; 
    }, [subtotalCart, diskon]);

    const kembalian = useMemo(() => {
      const hasil = bayar - grandTotal;
      return hasil > 0 ? hasil : 0;
    }, [bayar, grandTotal]);

    const totalQty = useMemo(()=>{
      return cart.reduce((acc,curr)=> acc + curr.jumlah,0)
    },[cart]);


    useEffect(() => {
      if (paymentMethod === 'Kartu' || paymentMethod === 'QRIS') {
        // Jika non-tunai (Bank/QRIS), otomatis set bayar sesuai grandTotal
        setBayar(grandTotal);
      } else if (paymentMethod === 'Tempo') {
        // Jika tempo, uang diterima set nol (masuk piutang)
        setBayar(0);
      }
    }, [paymentMethod, grandTotal]);

  const handleReset = () => {
    if (confirm("Apakah Anda yakin ingin menghapus seluruh daftar belanja?")) {
      setCart([]);
      setDiskon(0);
      setBayar(0);
      setPaymentMethod('Tunai');
      setDueDate(new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0]);
      setSelectedCustomer(DEFAULT_CUSTOMER);
      // Jika ada state transaksi lain, reset di sini
    }
  };

  // ===============================================================================================
  const [isPrinting, setIsPrinting] = useState(false);
  const componentRef = useRef<HTMLDivElement>(null);

    // Logika Pencetakan
  const handlePrint = useReactToPrint({
    contentRef: componentRef, // Gunakan contentRef dan panggil variabel ref-nya langsung
    onAfterPrint: () => {
      setIsPrinting(false);
      handleReset(); // Reset keranjang setelah sukses cetak
    },
  });

  // Fungsi Save & Print
  const handleSaveAndPrint = async () => {
    if (cart.length === 0) {
      alert("Keranjang masih kosong.");
      return;
    }
    if (paymentMethod !== 'Tempo' && bayar < grandTotal) {
      toast.error("Jumlah pembayaran kurang.");
      return;
    }

    // Validasi Pelanggan untuk Tempo (Wajib terdaftar di database)
    if (paymentMethod === 'Tempo' && selectedCustomer.value === 'UMUM') {
      toast.error("Metode pembayaran Tempo wajib memilih data Pelanggan.");
      return;
    }

    try {
      // Gunakan unwrap() untuk menunggu hingga transaksi benar-benar sukses di database
      await dispatch(TransaksiPost({
        total_harga: grandTotal,
        uang_diterima: bayar,
        kembalian: kembalian,
        keterangan: "Transaksi Penjualan",
        diskon: diskon,
        metode_pembayaran: paymentMethod,
        items: cart,
        id_work_order: spkId ?? undefined,
        id_kendaraan: workOrders.find((wo: any) => wo._id === spkId)?.id_kendaraan?._id,
        id_pelanggan: selectedCustomer.value !== 'UMUM' ? selectedCustomer.value : undefined,
        tanggal_jatuh_tempo: paymentMethod === 'Tempo' ? dueDate : undefined
      })).unwrap();

      // Tampilkan template struk dan picu cetak hanya jika save berhasil
      setIsPrinting(true);
      setTimeout(() => { 
        handlePrint();
      }, 500); 
    } catch (error: any) {
      toast.error("Gagal memproses transaksi: " + error);
    }
  };

  // Menambahkan Shortcut Keyboard (F12)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F12') {
        e.preventDefault();
        handleSaveAndPrint();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, bayar, grandTotal]);

// State untuk mengontrol Modal PelangganAdd
  const [modalPelangganAdd, setModalPelangganAdd] = useState(false);
  const [namaKetikanBaru, setNamaKetikanBaru] = useState("");

// Fungsi ini terpanggil saat kasir mengklik "Tambah pelanggan baru:"
  const handleCreateNewCustomer = (inputValue: string) => {
    setNamaKetikanBaru(inputValue); // 1. Simpan "ani" ke state
    setModalPelangganAdd(true);     // 2. Buka Modal PelangganAdd
  };

  return (
    <>
      {/* HEADER TRANSAKSI */}
      <div className="flex flex-col items-center pb-4 mt-8 mb-4 border-b border-slate-200 intro-y sm:flex-row">
        <h2 className="flex items-center gap-2 mr-auto text-lg font-medium">
          <Lucide icon="Menu" className="w-5 h-5" /> KASIR - TRANSAKSI POS
        </h2>
        <div className="flex items-center w-full gap-4 mt-4 sm:w-auto sm:mt-0 text-slate-500">
          <div className="flex items-center gap-1">
            <Lucide icon="User" className="w-4 h-4" /> 
            <span className="font-medium">
              User: {isLogin.username || 'Admin'} ({isLogin.kode_user || 'SYS-001'})
            </span>
          </div>
          {/* <div className="pl-4 text-xs text-right border-l border-slate-300">
            <div>Dat 11 : Apr 2021</div>
            <div>03:00 AM</div>
          </div> */}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5 intro-y">
        
        {/* =======================================================
            BEGIN: KIRI - DAFTAR BELANJA (Item List)
        ======================================================= */}
        <div className="col-span-12 lg:col-span-8">
          <div className="bg-white rounded-md shadow-sm border border-slate-200/60">
            {/* Panel Header */}
            <div className="px-4 py-3 font-semibold text-white bg-slate-600 rounded-t-md">
              DAFTAR BELANJA
            </div>
            
            <div className="p-4">
              {/* Input Barcode */}
              <div className="relative mb-5">
                <ScanInput items={barangList} onSelect={handleAddToCart} />
              </div>

              {/* Tabel Daftar Belanja */}
              <div className="overflow-x-auto border rounded-sm border-slate-200">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="text-white bg-slate-500">
                    <tr>
                      <th className="px-4 py-2 text-center border-r border-slate-400 w-10">#</th>
                      <th className="px-4 py-2 border-r border-slate-400">Produk</th>
                      <th className="px-4 py-2 text-center border-r border-slate-400 w-36">Qty / Satuan</th>
                      <th className="px-4 py-2 text-right border-r border-slate-400 w-32">Harga</th>
                      <th className="px-4 py-2 text-right border-r border-slate-400 w-32">Total</th>
                      <th className="px-4 py-2 text-center w-16">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {/* Dummy Row 1 */}
                    {cart.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-gray-400 italic">
                          Belum ada barang. Scan atau cari barang diatas.
                        </td>
                      </tr>
                    ) : (
                      cart.map((item,index) => (
                        <tr className="hover:bg-slate-50" key={item._id}>
                          <td className="px-4 py-3 text-center border-r border-slate-200">{index+1}</td>
                          <td className="px-4 py-3 border-r border-slate-200">{item.nama_barang}</td>
                          <td className="px-4 py-3 text-center border-r border-slate-200">
                            <div className="flex flex-col items-center gap-2">
                              <FormInput 
                                type="number" 
                                className="w-24 text-center font-semibold" 
                                value={item.jumlah} 
                                min={0}
                                onChange={(e) => handleUpdateItem(item._id, "jumlah", parseInt(e.target.value) || 0)} 
                              />
                              <FormSelect 
                                className="text-xs py-0 h-8 w-28 mx-auto bg-slate-50 border-slate-200"
                                value={item.satuan}
                                onChange={(e) => {
                                  const selectedVal = e.target.value;
                                  const findKonv = item.konversi_satuan?.find((k: any) => k.satuan === selectedVal);
                                  const multiplier = findKonv ? findKonv.pengali : 1;
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
                          <td className="px-4 py-3 text-right border-r border-slate-200">{item?.harga_jual.toLocaleString("ID-id")}</td>
                          <td className="px-4 py-3 text-right border-r border-slate-200">{(item.sub_total).toLocaleString("ID-id")}</td>
                          <td className="px-4 py-3 text-center">
                            <Button variant="danger" className="px-2 py-1" onClick={()=>handleDeleteItem(item?._id)}>
                              <Lucide icon="X" className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                
                {/* Tabel Empty State (Jika Kosong) */}
                <div className="h-40 bg-slate-50/50"></div>
              </div>

              {/* Footer Tabel Kiri */}
              <div className="flex items-center justify-between px-4 py-3 mt-4 bg-slate-100 rounded-sm border border-slate-200">
                <div className="font-medium text-slate-600">Total Item: {totalQty}</div>
                <Button variant="secondary" className="px-6 border-slate-300" onClick={handleReset}>
                  Reset
                </Button>
              </div>
            </div>
          </div>
        </div>
        {/* END: KIRI - DAFTAR BELANJA */}


        {/* =======================================================
            BEGIN: KANAN - RINGKASAN & PEMBAYARAN
        ======================================================= */}
        <div className="col-span-12 lg:col-span-4">
          <div className="bg-white rounded-md shadow-sm border border-slate-200/60">
             {/* Panel Header */}
             <div className="px-4 py-3 font-semibold text-white bg-slate-600 rounded-t-md">
              RINGKASAN & PEMBAYARAN
            </div>

            <div className="p-4 space-y-4">
              
              {/* Pelanggan */}
              <div className="flex items-center gap-3">
                <FormLabel className="mb-0 whitespace-nowrap">Pelanggan:</FormLabel>
                <CreatableSelect
                        isClearable
                        options={formatDataPelanggan} // Masukkan hasil gabungan useMemo di sini
                        value={selectedCustomer}
                        onChange={(newValue) => {
                          // Jika kasir menekan tombol "Clear/Silang", kembalikan ke UMUM
                          if (!newValue) {
                            setSelectedCustomer(DEFAULT_CUSTOMER);
                          } else {
                            setSelectedCustomer(newValue as any);
                          }
                        }}
                        onCreateOption={handleCreateNewCustomer} // <-- Panggil sakelar modal di sini
                        formatCreateLabel={(inputValue) => `+ Tambah pelanggan baru: "${inputValue}"`}
                        placeholder="Ketik Nama..."
                        className="text-sm"
                      />
              </div>

              {/* Total Akhir Besar */}
              <div className="px-4 py-6 text-center text-white rounded-md bg-slate-800">
                <div className="mb-1 text-sm font-semibold opacity-80 uppercase">Total Akhir</div>
                <div className="text-4xl font-bold">Rp {grandTotal.toLocaleString("ID-id")}</div>
              </div>

              {/* Rincian Angka */}
              <div className="space-y-2 pb-4 border-b border-slate-200 text-slate-700">
                <div className="flex justify-between items-center">
                  <span>Subtotal Cart:</span>
                  <span className="font-medium">Rp {subtotalCart.toLocaleString("ID-id")}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Diskon (-):</span>
                  <FormInput type="text" className="w-32 text-right"  value={formatRupiah(diskon.toString())} onChange={(e) =>{
                      const nilaiMentah = e.target.value;
                      const nilaiBersih = nilaiMentah.replace(/[^0-9]/g,'');
                      setDiskon(nilaiBersih ? Number(nilaiBersih) : 0);
                  }} />
                </div>
                <div className="flex justify-between items-center pt-2 mt-2 text-lg font-bold border-t border-slate-200 text-black">
                  <span>Grand Total:</span>
                  <span>Rp {grandTotal.toLocaleString("ID-id")}</span>
                </div>
              </div>

              {/* Metode Pembayaran */}
              <div>
                <FormLabel className="text-slate-600">Pembayaran</FormLabel>
                <div className="grid grid-cols-2 gap-2"> {/* Pastikan col-2 agar muat 4 tombol (2x2) */}
                  <Button 
                    variant={paymentMethod === 'Tunai' ? 'primary' : 'secondary'} 
                    className="w-full"
                    onClick={() => setPaymentMethod('Tunai')}
                  >
                    Tunai
                  </Button>
                  <Button 
                    variant={paymentMethod === 'Kartu' ? 'primary' : 'secondary'} 
                    className="w-full border-slate-300"
                    onClick={() => setPaymentMethod('Kartu')}
                  >
                    Kartu
                  </Button>
                  <Button 
                    variant={paymentMethod === 'QRIS' ? 'primary' : 'secondary'} 
                    className="w-full border-slate-300"
                    onClick={() => setPaymentMethod('QRIS')}
                  >
                    QRIS
                  </Button>
                  <Button 
                    variant={paymentMethod === 'Tempo' ? 'primary' : 'secondary'} 
                    className="w-full border-slate-300"
                    onClick={() => setPaymentMethod('Tempo')}
                  >
                    Tempo (Piutang)
                  </Button>
                </div>
              </div>

              {/* Input Jatuh Tempo (Hanya muncul jika Tempo) */}
              {paymentMethod === 'Tempo' && (
                <div className="intro-x space-y-2">
                  <FormLabel className="text-slate-600 font-bold text-danger">Tanggal Jatuh Tempo</FormLabel>
                  <FormInput 
                    type="date"
                    className="w-full font-semibold border-danger" 
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              )}

              {/* Input Bayar */}
              <div>
                <FormLabel className="text-slate-600">BAYAR (Input Uang Tunai)</FormLabel>
                <FormInput 
                  type="text"
                  disabled={paymentMethod !== 'Tunai'} 
                  className={`w-full text-xl py-3 font-semibold ${paymentMethod !== 'Tunai' ? 'bg-slate-100' : 'text-slate-700'}`} 
                  value={formatRupiah(bayar.toString())}
                  onChange={(e)=>{
                    const nilaiBayar = e.target.value.replace(/[^0-9]/g,'');
                    setBayar(Number(nilaiBayar ? Number(nilaiBayar) : 0));
                  }}
                />
              </div>

              {/* Kembali */}
              <div className="flex justify-between items-center text-lg font-bold">
                <span>KEMBALI :</span>
                <span className="text-success">Rp {kembalian.toLocaleString("ID-id")}</span>
              </div>

              {/* Tombol Simpan */}
              <Button 
                variant="success"
                className="w-full py-4 mt-2 text-base text-white shadow-md flex items-center justify-center gap-2"
                onClick={handleSaveAndPrint}
              >
                <Lucide icon="Printer" className="w-5 h-5" /> SIMPAN & CETAK STRUK (F12)
              </Button>

            </div>
          </div>
        </div>
        {/* END: KANAN - RINGKASAN & PEMBAYARAN */}

      </div>

      {/* COMPONENT UNTUK DICETAK (Disembunyikan di UI) */}
      <div style={{ display: 'none' }}>
        <ReceiptTemplate 
          ref={componentRef}
          cart={cart}
          subtotalCart={subtotalCart}
          diskon={diskon}
          grandTotal={grandTotal}
          bayar={bayar}
          kembalian={kembalian}
          paymentMethod={paymentMethod}
          kasir="Kasir1"
          pelanggan={selectedCustomer.nama_cetak}      
        />
      </div>

      {/* pelanggan Add */}
      <PelangganAdd pelangganAddModal={modalPelangganAdd} setPelangganAddModal={setModalPelangganAdd} defaultName={namaKetikanBaru} 
      onSuccess={(newPelanggan)=>{
        // Setelah pelanggan baru berhasil ditambahkan, kita update selectedCustomer langsung ke pelanggan baru tersebut
        setSelectedCustomer({
          value: newPelanggan._id || "",
          label: `${newPelanggan.nama_pelanggan || '-'} - ${newPelanggan.no_telp}`,
          nama_cetak: newPelanggan.nama_pelanggan
        });
        dispatch(pelangganGet()); // Refresh daftar pelanggan agar opsi baru muncul di dropdown
      }} 
      />
            
    </>
  )
}

export default Pos