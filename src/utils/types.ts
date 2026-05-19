import { CartItem } from "@/views/Transaksi/Pos";
import React from "react";

export interface Kategori{
    _id?:string;
    nama_kategori: string;
    kode_kategori?: string;
}

export interface ISatuan{
    _id?: string;
    satuan: string;
    kode_satuan?: string;
    kategori: 'ecer' | 'grosir';
}

export interface IKonversiSatuan {
    satuan: string;
    pengali: number;
    harga_jual?: number;
    barcode?: string;
}

export interface Supplier {
    _id?: string;
    kode_supplier?: string; 
    nama_supplier: string; 
    alamat: string; 
    no_telepon: string;
}

export interface Ilogin{
    _id?:string;
    id_user?:string;
    token?:string;
    refreshToken?:string;
    username:string;
    kode_user:string;
    id_store?:string | null;
    role?:string | null;
    access_menu?: string[];
    tipe_bisnis?: string | null;
    subscription_plan?: 'free' | 'standard' | 'premium' | 'enterprise';
    subscription_status?: 'active' | 'expired' | 'trial' | 'canceled';
    subscription_expiry?: string | Date | null;
    available_stores?: IStore[];
}

export interface IBarang{
    _id?:string;
    kode_barang?:string;
    barcode?:string;
    nama_barang:string;
    keterangan?:string;
    satuan:string;
    harga_beli:number | string;
    harga_jual:number | string;
    stok?:number;
    kode_kategori:string;
    kode_supplier?:string;
    konversi_satuan?: IKonversiSatuan[];
    id_store?: string;
    tanggal_kadaluarsa?: string;
    isMaterial?: boolean; // Untuk kebutuhan bengkel: apakah ini material?
    isNonStock?: boolean; // Untuk kebutuhan bengkel: apakah ini jasa/non-fisik?
    flatRateInsentif?: number; // Untuk kebutuhan bengkel: insentif flat rate
}

export interface IPembelian{
    _id?:string;
    no_pembelian?:string;
    tanggal_pembelian?:string | Date;
    total_harga:string;
    keterangan?:string;
    kode_supplier:string;
    items: IPembelianItem[];
    metode_pembayaran?: string;
    tanggal_jatuh_tempo?: string | Date;
}

export interface IPembelianItem{
    id_pembelian:string;
    //no_pembelian_item:string;
    nama_barang:string;
    kode_barang:string;
    harga_beli:number | string;
    satuan?: string;
    pengali?: number;
    jumlah:number | string;
    subtotal:number | string;
    tanggal_kadaluarsa?: string;
}

export interface IPembelianBarang{
    id_pembelian: string;
    kode_barang: string;
    nama_barang: string;
    harga_beli: number;
    jumlah: number;
    satuan_pembelian: string;
    pengali?: number;
    subtotal: number;
    tanggal_pembelian:string;
    tanggal_kadaluarsa?: string;
}

export interface PembelianPayload {
  no_transaksi:string,
  tgl_transaksi: string;
  total_harga:number;
  kode_supplier?: string;
  keterangan?: string;
  // Perhatikan ini: Struktur items sesuai permintaan Backend, BUKAN CartItem UI
  listBarang: {
    kode_barang: string;
    harga_beli: number;
    jumlah: number;
    satuan?: string;
    pengali?: number;
    tanggal_kadaluarsa?: string;
  }[];
}

export interface kartuStok { 
    _id:string,
    id_data:string,
    id_barang:string,
    nama_barang:string,
    jumlah_stok_masuk:number,
    jumlah_stok_keluar:number,
    stok_akhir:number,
    tanggal_transaksi:string,
    keterangan:string,
    kode_user?:string,
}

export interface IPelanggan {
    _id?:string;
    nama_pelanggan: string;
    tipe_pelanggan: 'perorangan' | 'perusahaan';
    no_telp: string;
}

export interface ITransaksi{
    _id?:string;
    total_harga:number;
    uang_diterima:number;
    kembalian:number;
    keterangan:string;
    diskon:number;
    metode_pembayaran:string;
    items?:CartItem[];
    no_penjualan?:string;
    tgl_penjualan?:string;
    status_transaksi?:string;
    sub_total?:number;
    nama_pelanggan?:string;
    id_store?: string;
    id_work_order?: string;
    id_kendaraan?: string;
    id_pelanggan?: string; // Tambahkan properti ini
    tanggal_jatuh_tempo?: string | Date; // Tambahkan properti ini
}

export interface FilterParams {
    startDate: string;
    endDate: string;
    id_store?: string;
}

export interface IJurnalKasPembelianItemRef {
    _id?:string
    id_pembelian?: string;
    kode_barang: string;
    nama_barang?: string;
    harga_beli?: number;
    jumlah: number;
    subtotal?: number;
}

export interface IJurnalKasPenjualanItemRef {
    id?:string;
    id_penjualan?: string;
    kode_barang: string;
    nama_barang?: string;
    harga_jual?: number;
    jumlah: number;
    sub_total?: number;
}

export interface IJurnalKasPembelianRef {
    _id: string;
    no_pembelian: string;
    keterangan: string;
    tanggal_pembelian?: string | Date;
    total_harga?: number;
    status?: string;
    items?: IJurnalKasPembelianItemRef[];
}

export interface IJurnalKasPenjualanRef {
    _id: string;
    no_penjualan: string;
    keterangan: string;
    tgl_penjualan?: string | Date;
    total_harga?: number;
    status_transaksi?: string;
    items?: IJurnalKasPenjualanItemRef[];
}

export interface IJurnalKas{
    _id?:string;
    id_data:string;
    id_barang?:string | null;
    saldo_masuk:number;
    saldo_keluar:number;
    saldo_akhir:number;
    keterangan:string;
    status:'pembelian' | 'penjualan' | 'service' | 'pengeluaran' | 'pemasukan' | 'void_pembelian';
    kode_user:string;
    tanggal_transaksi: string | Date;
    data_pembelian?: IJurnalKasPembelianRef | null;
    data_penjualan?: IJurnalKasPenjualanRef | null;
}

export interface ITransaksiBarang{
    no_penjualan: string;
    tgl_penjualan: string;
    kode_barang: string;
    nama_barang: string;
    harga_jual: number;
    jumlah: number;
    sub_total: number;
}

export interface IUser{
    _id:string,
    nama:string,
    username:string,
    password:string,
    kode_user:string,
    jabatan:string,
    id_store?:string;
    id_stores?: string[]; // Array ID toko untuk akses staf
    id_owner?: string;   // ID Owner untuk relasi staf
    access_menu?: string[];
    tipe_bisnis?: 'grosir' | 'apotek' | 'bengkel' | 'umum' | string | null;
    role:'admin'|'kasir'|'owner'
}

export interface IStore{
    _id?:string;
    nama_store:string;
    alamat:string;
    no_telp?:string;
    logo?:string;
    deskripsi?:string;
    id_owner:string;
    header_struk?:string;
    footer_struk?:string;
}


export interface IStockBatch {
    _id: string;
    batchNumber: string;
    id_barang: string;
    id_pembelian: string;
    jumlah_masuk: number;
    jumlah_sekarang: number;
    harga_beli: number;
    tanggal_masuk: string | Date;
    tanggal_kadaluarsa: string | Date;
    id_store: string;
}


export interface ILayanan{
    _id?:string;
    kode_layanan?:string;
    nama_layanan:string;
    harga:number | string;
    deskripsi?:string;
    id_store?: string;
}


export interface IPemasukan{
    _id?:string;
    sumber: string;
    jumlah_pemasukan: number;
    keterangan?: string;
    tanggal_pemasukan?: string | Date;
    kode_user?: string;
    id_store?: string;
}

export interface IPengeluaran{
    _id?:string;
    keperluan: string;
    jumlah_pengeluaran: number;
    keterangan?: string;
    tanggal_pengeluaran?: string | Date;
    kode_user?: string;
    id_store?: string;
}


export interface IBillingOrder {
  _id: string;
  id_owner: string;
  paket_tujuan: 'standard' | 'premium' | 'enterprise';
  durasi: 'monthly' | 'yearly';
  total_harga: number;
  status: 'pending' | 'completed' | 'cancelled';
  bukti_pembayaran?: string;
  tanggal_request: string;
  tanggal_konfirmasi?: string;
  createdAt: string;
  updatedAt: string;
}


// ================================ type baru untuk kebutuhan bengkel ================================
export interface Kendaraan {
    _id?: string;
    id_pelanggan: string | IPelanggan; // Bisa ID atau objek Pelanggan yang dipopulasi
    plat_nomor: string;
    merk: string;
    model: string;
    tahun: number;
    nomor_rangka?: string;
    nomor_mesin?: string;
    odometer?: number;
    id_store: string;
}

export interface WorkOrderItemLayanan {
    id_layanan: string;
    nama_layanan: string;
    harga_satuan: number;
    jumlah: number;
    sub_total: number;
    id_mekanik_bertanggung_jawab?: string;
}

export interface WorkOrderItemSparepart {
    id_barang: string;
    kode_barang: string;
    nama_barang: string;
    harga_jual: number;
    jumlah: number;
    sub_total: number;
}

export type WorkOrderStatus = 'pending' | 'on_progress' | 'done' | 'paid' | 'canceled';

export interface WorkOrder {
    _id?: string;
    no_spk: string;
    tanggal_masuk: string;
    tanggal_selesai_estimasi?: string;
    id_pelanggan: string | IPelanggan; // Bisa ID atau objek Pelanggan yang dipopulasi
    id_kendaraan: string | Kendaraan; // Bisa ID atau objek Kendaraan yang dipopulasi
    id_mekanik_utama?: string; // ID Mekanik
    deskripsi_keluhan?: string;
    item_layanan: WorkOrderItemLayanan[];
    item_sparepart: WorkOrderItemSparepart[];
    total_biaya_jasa: number;
    total_biaya_sparepart: number;
    total_tagihan: number;
    status: WorkOrderStatus;
    id_store: string;
}

export interface ServiceReminder {
    _id?: string;
    id_kendaraan: string | Kendaraan;
    id_pelanggan: string | IPelanggan;
    jenis_reminder: 'ganti_oli' | 'servis_rutin' | 'lain_lain';
    next_service_date_estimasi?: string;
    next_service_odo_estimasi?: number;
    status: 'active' | 'completed' | 'ignored' | 'notified';
    id_store: string;
}

// ================================ end of type untuk kebutuhan bengkel ================================

export type SetState<T> = React.Dispatch<React.SetStateAction<T>>;
