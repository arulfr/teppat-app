import React, { forwardRef } from 'react';
import { WorkOrder } from '@/types/bengkel';

interface Props {
    data: WorkOrder | null;
    store: any;
}

const WorkOrderInvoiceA4 = forwardRef<HTMLDivElement, Props>(({ data, store }, ref) => {
    if (!data) return null;

    return (
        <div 
            ref={ref} 
            className="p-10 text-slate-900 font-sans bg-white print:p-0" 
            style={{ width: '210mm', minHeight: '297mm', margin: '0 auto' }}
        >
            {/* HEADER PERUSAHAAN */}
            <div className="grid grid-cols-2 pb-6 border-b-2 border-slate-800 items-start">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900">
                        {store?.nama_store || 'TEPPAT BENGKEL'}
                    </h1>
                    <div className="text-sm text-slate-600 leading-relaxed max-w-xs">
                        <p>{store?.alamat || 'Alamat Lengkap Perusahaan Belum Diatur'}</p>
                        <p className="font-bold">Telp/WA: {store?.no_telp || '-'}</p>
                    </div>
                </div>
                <div className="text-right space-y-1">
                    <h2 className="text-2xl font-bold text-slate-400 uppercase tracking-widest">Invoice / Work Order</h2>
                    <div className="inline-block px-3 py-1 bg-slate-100 font-mono text-lg font-bold border border-slate-300">
                        #{data.no_spk}
                    </div>
                    <p className="text-sm text-slate-500">Tgl: {new Date(data.tanggal_masuk).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                </div>
            </div>

            {/* INFO PELANGGAN & KENDARAAN */}
            <div className="grid grid-cols-2 gap-12 my-8">
                <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b pb-1">Informasi Pelanggan</h3>
                    <div className="grid grid-cols-[80px_1fr] text-sm gap-y-1">
                        <span className="text-slate-500">Nama</span>
                        <span className="font-semibold">: {data.id_pelanggan?.nama_pelanggan || 'Umum'}</span>
                        <span className="text-slate-500">Telepon</span>
                        <span>: {data.id_pelanggan?.no_telp || '-'}</span>
                    </div>
                </div>
                <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b pb-1">Informasi Kendaraan</h3>
                    <div className="grid grid-cols-[80px_1fr] text-sm gap-y-1">
                        <span className="text-slate-500">Plat Nomor</span>
                        <span className="font-bold">: {data.id_kendaraan?.plat_nomor}</span>
                        <span className="text-slate-500">Unit</span>
                        <span>: {data.id_kendaraan?.merk} {data.id_kendaraan?.model} ({data.id_kendaraan?.tahun || '-'})</span>
                        <span className="text-slate-500">Odometer</span>
                        <span>: {data.id_kendaraan?.odometer?.toLocaleString()} KM</span>
                    </div>
                </div>
            </div>

            {/* INFO MEKANIK / FOREMAN */}
            <div className="mb-6 p-3 bg-slate-50 border border-slate-200 rounded flex justify-between items-center">
                <div className="text-sm">
                    <span className="text-slate-500 font-medium">Mekanik Utama: </span>
                    <span className="font-bold text-slate-800 uppercase italic">
                        {(data.id_mekanik_utama as any)?.nama_mekanik || 'Belum Ditentukan'}
                    </span>
                </div>
                <div className="text-sm text-right">
                    <span className="text-slate-500 font-medium">Status Pekerjaan: </span>
                    <span className="font-bold uppercase tracking-tighter">{data.status}</span>
                </div>
            </div>

            {/* RINCIAN JASA / PART / MATERIAL */}
            <div className="mt-8">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-y-2 border-slate-800 text-xs font-bold uppercase tracking-widest bg-slate-50">
                            <th className="py-3 px-2 text-left">Deskripsi Pekerjaan & Suku Cadang</th>
                            <th className="py-3 px-2 text-center w-20">Qty</th>
                            <th className="py-3 px-2 text-right w-32">Harga</th>
                            <th className="py-3 px-2 text-right w-40">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-slate-200">
                        {/* SEKSI JASA */}
                        {data.item_layanan.map((layanan, i) => (
                            <tr key={`layanan-${i}`} className="hover:bg-slate-50/50">
                                <td className="py-3 px-2">
                                    <div className="font-bold">{layanan.nama_layanan}</div>
                                    <div className="text-xs text-slate-400 italic">Jasa Servis / Perbaikan</div>
                                </td>
                                <td className="py-3 px-2 text-center">{layanan.jumlah}</td>
                                <td className="py-3 px-2 text-right">{layanan.harga_satuan.toLocaleString()}</td>
                                <td className="py-3 px-2 text-right font-semibold">{layanan.sub_total.toLocaleString()}</td>
                            </tr>
                        ))}
                        {/* SEKSI SPAREPARTS */}
                        {data.item_sparepart.map((part, i) => (
                            <tr key={`part-${i}`} className="hover:bg-slate-50/50">
                                <td className="py-3 px-2">
                                    <div className="font-bold">{part.nama_barang}</div>
                                    <div className="text-xs text-slate-400 italic">Suku Cadang / Material</div>
                                </td>
                                <td className="py-3 px-2 text-center">{part.jumlah}</td>
                                <td className="py-3 px-2 text-right">{part.harga_jual.toLocaleString()}</td>
                                <td className="py-3 px-2 text-right font-semibold">{part.sub_total.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="border-t-2 border-slate-800">
                            <td colSpan={3} className="py-4 px-2 text-right font-bold text-slate-500 uppercase tracking-widest">Total Tagihan</td>
                            <td className="py-4 px-2 text-right text-xl font-black">
                                Rp {data.total_tagihan.toLocaleString()}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* KELUHAN & CATATAN */}
            <div className="mt-10 grid grid-cols-[1fr_250px] gap-10">
                <div className="space-y-2">
                    <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Keluhan Awal Pelanggan:</h4>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs italic text-slate-600 min-h-[60px]">
                        {data.deskripsi_keluhan || 'Tidak ada catatan keluhan khusus.'}
                    </div>
                    <p className="text-[9px] text-slate-400 leading-tight mt-4 italic">
                        * Harga diatas merupakan estimasi biaya pengerjaan dan suku cadang.<br/>
                        * Barang yang sudah dibeli tidak dapat dikembalikan tanpa perjanjian sebelumnya.
                    </p>
                </div>
                
                {/* KOLOM TANDA TANGAN */}
                <div className="grid grid-cols-2 gap-4 text-center text-xs">
                    <div className="flex flex-col justify-between h-32">
                        <p className="font-bold text-slate-400 uppercase tracking-tighter">Pelanggan</p>
                        <div className="border-t border-slate-900 mx-2 pt-1 font-bold">
                            {data.id_pelanggan?.nama_pelanggan || '...................'}
                        </div>
                    </div>
                    <div className="flex flex-col justify-between h-32">
                        <p className="font-bold text-slate-400 uppercase tracking-tighter">Hormat Kami</p>
                        <div className="border-t border-slate-900 mx-2 pt-1 font-bold underline">
                            TEPPAT BENGKEL
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default WorkOrderInvoiceA4;