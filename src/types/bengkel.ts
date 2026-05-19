export interface Kendaraan {
    _id?: string;
    id_pelanggan: string;
    plat_nomor: string;
    merk: string;
    model: string;
    tahun: number;
    nomor_rangka?: string;
    nomor_mesin?: string;
    odometer: number;
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
    id_pelanggan: any; // Populated object or ID
    id_kendaraan: any; // Populated object or ID
    id_mekanik_utama?: string;
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
    id_kendaraan: string;
    id_pelanggan: string;
    jenis_reminder: 'ganti_oli' | 'servis_rutin' | 'lain_lain';
    next_service_date_estimasi?: string;
    next_service_odo_estimasi?: number;
    status: 'active' | 'completed' | 'ignored' | 'notified';
}

export interface Mekanik {
    _id?: string;
    nama_mekanik: string;
    spesialisasi: string;
    no_telepon: string;
    status?: 'active' | 'inactive';
    id_store?: string;
}

export interface Layanan {
    _id?: string;
    nama_layanan: string;
    kode_layanan: string;
    harga: number;
    deskripsi?: string;
    id_store?: string;
}
