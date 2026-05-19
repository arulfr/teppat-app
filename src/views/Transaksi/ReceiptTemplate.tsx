import React, { forwardRef, useEffect, useMemo } from 'react';
import { CartItem } from './Pos'; // Import tipe dari Pos.tsx
import { useAppSelector } from '@/stores/hooks';

interface ReceiptTemplateProps {
  cart: CartItem[];
  subtotalCart: number;
  diskon: number;
  grandTotal: number;
  bayar: number;
  kembalian: number;
  paymentMethod: string;
  kasir: string;
  pelanggan: string;
}

const ReceiptTemplate = forwardRef<HTMLDivElement, ReceiptTemplateProps>((props, ref) => {
  const { cart, subtotalCart, diskon, grandTotal, bayar, kembalian, paymentMethod, kasir, pelanggan } = props;
  
  const now = new Date();
  const formattedDate = now.toLocaleDateString('id-ID');
  const formattedTime = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  //perbaharui data props dari transaksiSlice untuk menampilkan data yang benar pada struk
  const receipt = useAppSelector(state=>state.TransaksiSlice.receiptTemp);

  // Ambil data store aktif untuk Header & Footer dinamis (Aturan #3 & #8)
  const activeStoreId = useAppSelector((state) => state.AdminSlice.activeStoreId);
  const isLoginData = useAppSelector((state) => state.AdminSlice.isLogin);
  const availableStores = isLoginData?.available_stores || [];
  
  const currentStore = useMemo(() => {
    const activeId = activeStoreId?.toString();
    const found = availableStores.find((s: any) => (s._id?.toString() === activeId) || (s.id_store?.toString() === activeId));
    // Fallback: Jika tidak ditemukan (activeStoreId kosong), ambil toko pertama dari daftar
    return found || availableStores[0];
  }, [availableStores, activeStoreId]);

  useEffect(()=>{
    // Jika receiptTemp berubah, kita bisa melakukan sesuatu di sini jika diperlukan
  },[receipt]);

  const formatTanggal = receipt?.tgl_penjualan ? new Date(receipt.tgl_penjualan).toLocaleDateString('id-ID') : formattedDate;
  const formatWaktu = receipt?.tgl_penjualan ? new Date(receipt.tgl_penjualan).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : formattedTime;

  // Mapping no_penjualan yang lebih robust (menangani response mentah atau data terbungkus)
  const noPenjualan = useMemo(() => {
    if (receipt?.no_penjualan) return receipt.no_penjualan;
    if ((receipt as any)?.data?.no_penjualan) return (receipt as any).data.no_penjualan;
    return 'DRAFT';
  }, [receipt]);

  // Debugging: Jika data dari Redux (receipt) kosong, gunakan data dari props (cart)
  const itemsToDisplay = useMemo(() => {
    const items = receipt?.items || (receipt as any)?.data?.items;
    return items && items.length > 0 ? items : cart;
  }, [receipt, cart]);

  return (
    <div ref={ref} className="font-mono text-xs p-4 w-[58mm] bg-white text-black" style={{ fontSize: '11px', lineHeight: '1.2' }}>
      {/* Header Struk */}
      <div className="text-center mb-3">
        <div className="flex flex-col items-center mb-1">
          {/* Nama Store: Dibuat sangat tebal (900) dan ukuran besar (20px) */}
          <div 
            style={{ fontWeight: 900, fontSize: '20px', textAlign: 'center' }} 
            className="uppercase leading-tight mb-1"
          >
            {currentStore?.nama_store || (isLoginData as any)?.nama_bisnis || 'TEPPAT POS'}
          </div>
          {/* Alamat: Selalu ditampilkan di bawah nama toko */}
          <div className="text-[10px] leading-tight text-center px-1 font-medium">
            {currentStore?.alamat || (isLoginData as any)?.alamat || 'Alamat belum diatur'}
          </div>
        </div>

        {/* Jika ada teks kustom header_struk (selama bukan dummy "test"), tampilkan di bawahnya */}
        {currentStore?.header_struk && currentStore.header_struk !== "test" && (
          <div className="whitespace-pre-line text-[10px] mt-1 italic border-t border-dotted border-black pt-1">
            {currentStore.header_struk}
          </div>
        )}
      </div>

      {/* Info Transaksi */}
      <div className="border-b border-dashed border-black pb-2 mb-2">
        <div className="flex justify-between">
          <span>No: {noPenjualan}</span>
{/*           <span>{kasir}</span> */}
        </div>
        <div className="flex justify-between">
          <span>Tgl: {formatTanggal}</span>
          <span>{formatWaktu}</span>
        </div>
        <div>Pelanggan: {pelanggan}</div>
      </div>

      {/* Daftar Item */}
      <div className="border-b border-dashed border-black pb-2 mb-2">
        <div className="flex font-bold mb-2 text-[10px] uppercase">
          <span className="flex-1">Detail Produk</span>
          <span className="w-20 text-right">Subtotal</span>
        </div>
        {itemsToDisplay?.map((item:CartItem, index: number) => (
          <div key={item._id || index} className="mb-2 leading-tight">
            {/* Baris 1: Nama Barang (Bisa membungkus ke bawah jika sangat panjang) */}
            <div className="whitespace-normal break-words font-medium text-black">
              {item.nama_barang}
            </div>
            {/* Baris 2: Kalkulasi Qty x Harga dan Subtotal di pojok kanan */}
            <div className="flex justify-between items-center text-[10px] mt-0.5">
              <span className="text-slate-700 italic">
                {item.jumlah} {(item as any).satuan_jual || item.satuan || ''} x {item.harga_jual?.toLocaleString("id-ID")}
              </span>
              <span className="font-bold">
                {item.sub_total?.toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Ringkasan Total */}
      <div className="space-y-1 mb-2">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>Rp {(receipt?.sub_total || subtotalCart).toLocaleString("id-ID")}</span>
        </div>
        <div className="flex justify-between">
          <span>Diskon:</span>
          <span>Rp {(receipt?.diskon || diskon).toLocaleString("id-ID")}</span>
        </div>
        <div className="flex justify-between font-bold text-base border-t border-black pt-1">
          <span>Grand Total:</span>
          <span>Rp {(receipt?.total_harga || grandTotal).toLocaleString("id-ID")}</span>
        </div>
        </div>

      {/* Detail Pembayaran */}
      <div className="border-t border-black pt-1">
        <div className="flex justify-between">
          <span>Metode Bayar:</span>
          <span className="uppercase">{receipt?.metode_pembayaran || paymentMethod}</span>
        </div>
        <div className="flex justify-between font-medium">
          <span>Bayar:</span>
          <span>Rp {(receipt?.uang_diterima || bayar).toLocaleString("id-ID")}</span>
        </div>
        <div className="flex justify-between font-bold">
          <span>Kembali:</span>
          <span>Rp {(receipt?.kembalian || kembalian).toLocaleString("id-ID")}</span>
        </div>
      </div>

      {/* Footer Struk */}
      <div className="text-center mt-4 pt-2 border-t border-dashed border-black">
        {currentStore?.footer_struk ? (
          <div className="whitespace-pre-line text-[10px]">{currentStore.footer_struk}</div>
        ) : (
          <>
            <div className="font-medium">Terima Kasih Atas Kunjungan Anda!</div>
            <div className="text-[10px] mt-1">Barang yang sudah dibeli tidak dapat ditukar.</div>
          </>
        )}
{/*         <div className="flex items-center justify-center mt-2 h-8 bg-slate-100 border border-slate-300">
          [BARCODE_SIMULATION]
        </div> */}
      </div>
    </div>
  );
});

export default ReceiptTemplate;