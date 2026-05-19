import React, { forwardRef } from 'react';
import { WorkOrder } from '@/types/bengkel';

interface Props {
    data: WorkOrder | null;
    store: any;
}

const WorkOrderPrint = forwardRef<HTMLDivElement, Props>(({ data, store }, ref) => {
    if (!data) return null;

    return (
        <div ref={ref} className="p-8 text-slate-800 font-sans text-sm bg-white" style={{ width: '210mm' }}>
            {/* Header Toko */}
            <div className="text-center border-b-2 border-slate-800 pb-4 mb-6">
                <h1 className="text-2xl font-bold uppercase">{store?.nama_store || 'BENGKEL KAMI'}</h1>
                <p className="text-xs">{store?.alamat || 'Alamat tidak tersedia'}</p>
                <p className="text-xs font-semibold">Telp: {store?.no_telp || '-'}</p>
            </div>

            {/* Info SPK */}
            <div className="flex justify-between mb-6">
                <div>
                    <h2 className="text-lg font-bold">SURAT PERINTAH KERJA (SPK)</h2>
                    <p className="font-mono text-blue-600">{data.no_spk}</p>
                </div>
                <div className="text-right">
                    <p>Tanggal: {new Date(data.tanggal_masuk).toLocaleDateString('id-ID')}</p>
                    <p>Status: <span className="uppercase font-bold">{data.status}</span></p>
                </div>
            </div>

            {/* Data Kendaraan & Pelanggan */}
            <div className="grid grid-cols-2 gap-8 mb-6 border p-4 rounded-lg bg-slate-50">
                <div>
                    <h3 className="font-bold border-b mb-2 uppercase text-xs text-slate-500">Data Kendaraan</h3>
                    <table className="w-full">
                        <tr><td className="w-24">Plat Nomor</td><td>: <strong>{data.id_kendaraan?.plat_nomor}</strong></td></tr>
                        <tr><td>Unit</td><td>: {data.id_kendaraan?.merk} {data.id_kendaraan?.model}</td></tr>
                        <tr><td>Odo</td><td>: {data.id_kendaraan?.odometer?.toLocaleString()} KM</td></tr>
                    </table>
                </div>
                <div>
                    <h3 className="font-bold border-b mb-2 uppercase text-xs text-slate-500">Data Pelanggan</h3>
                    <table className="w-full">
                        <tr><td className="w-24">Nama</td><td>: {data.id_pelanggan?.nama_pelanggan}</td></tr>
                        <tr><td>No. Telp</td><td>: {data.id_pelanggan?.no_telp}</td></tr>
                    </table>
                </div>
            </div>

            {/* Deskripsi Keluhan */}
            <div className="mb-6">
                <h3 className="font-bold text-xs uppercase text-slate-500 mb-1">Keluhan / Instruksi:</h3>
                <div className="p-3 border rounded min-h-[60px] italic">
                    {data.deskripsi_keluhan || '-'}
                </div>
            </div>

            {/* Tabel Pekerjaan & Sparepart */}
            <div className="space-y-4">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-slate-800 text-white">
                            <th className="p-2 text-left border">Deskripsi Pekerjaan / Barang</th>
                            <th className="p-2 text-center border w-20">Qty</th>
                            <th className="p-2 text-right border w-32">Estimasi Biaya</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.item_layanan.map((layanan, i) => (
                            <tr key={i}>
                                <td className="p-2 border">{layanan.nama_layanan} (Jasa)</td>
                                <td className="p-2 border text-center">{layanan.jumlah}</td>
                                <td className="p-2 border text-right">{layanan.sub_total.toLocaleString()}</td>
                            </tr>
                        ))}
                        {data.item_sparepart.map((part, i) => (
                            <tr key={i}>
                                <td className="p-2 border">{part.nama_barang}</td>
                                <td className="p-2 border text-center">{part.jumlah}</td>
                                <td className="p-2 border text-right">{part.sub_total.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="font-bold bg-slate-100">
                            <td colSpan={2} className="p-2 text-right border">TOTAL ESTIMASI</td>
                            <td className="p-2 text-right border text-lg">Rp {data.total_tagihan.toLocaleString()}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Footer Tanda Tangan */}
            <div className="mt-12 grid grid-cols-3 text-center gap-4">
                <div>
                    <p className="mb-16">Hormat Kami,</p>
                    <div className="border-t border-slate-400 mx-4">Bengkel</div>
                </div>
                <div>
                    <p className="mb-16">Mekanik,</p>
                    <div className="border-t border-slate-400 mx-4">({(data.id_mekanik_utama as any)?.nama_mekanik || '..........'})</div>
                </div>
                <div>
                    <p className="mb-16">Pelanggan,</p>
                    <div className="border-t border-slate-400 mx-4">{data.id_pelanggan?.nama_pelanggan}</div>
                </div>
            </div>
            <p className="mt-8 text-[10px] text-slate-400 italic">* Estimasi biaya dapat berubah sesuai kondisi pengerjaan di lapangan.</p>
        </div>
    );
});

export default WorkOrderPrint;