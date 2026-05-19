import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '@/stores/hooks';
import { RootState } from '@/stores/store';
import { fetchServiceHistory, fetchVehicles } from '@/stores/BengkelSlice';
import Lucide from '@/components/Base/Lucide';

const RiwayatServis = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { serviceHistory, vehicles, loading } = useSelector((state: RootState) => state.BengkelSlice);
    
    const vehicle = vehicles.find(v => v._id === id);

    useEffect(() => {
        if (id) {
            dispatch(fetchServiceHistory(id));
            if (vehicles.length === 0) dispatch(fetchVehicles());
        }
    }, [id, dispatch]);

    return (
        <div className="p-6">
            <div className="flex items-center mb-6">
                <button onClick={() => navigate(-1)} className="mr-4 p-2 hover:bg-gray-100 rounded-full">
                    <Lucide icon="ArrowLeft" className="w-6 h-6" />
                </button>
                <div>
                    <h2 className="text-2xl font-bold">Riwayat Servis</h2>
                    <p className="text-gray-500">
                        {vehicle ? `${vehicle.plat_nomor} - ${vehicle.merk} ${vehicle.model}` : 'Memuat data kendaraan...'}
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-10 text-gray-500">Memuat riwayat...</div>
                ) : serviceHistory.length > 0 ? (
                    serviceHistory.map((wo: any) => (
                        <div key={wo._id} className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{wo.no_spk}</span>
                                    <h3 className="text-lg font-bold text-gray-800">{new Date(wo.tanggal_masuk).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</h3>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${wo.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                    {wo.status}
                                </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500 font-medium mb-1">Pekerjaan / Jasa:</p>
                                    <ul className="list-disc list-inside text-gray-700">
                                        {wo.item_layanan.map((l: any, i: number) => (
                                            <li key={i}>{l.nama_layanan}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <p className="text-gray-500 font-medium mb-1">Sparepart:</p>
                                    <p className="text-gray-700">
                                        {wo.item_sparepart.length > 0 
                                            ? wo.item_sparepart.map((s: any) => s.nama_barang).join(', ') 
                                            : '-'}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t flex justify-between items-center">
                                <div className="text-sm">
                                    <span className="text-gray-500">Mekanik: </span>
                                    <span className="font-semibold text-gray-700">{(wo.id_mekanik_utama as any)?.nama_mekanik || '-'}</span>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-400">Total Biaya</p>
                                    <p className="text-lg font-bold text-gray-900">Rp {wo.total_tagihan?.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-white border rounded-xl p-10 text-center text-gray-500 italic">
                        Belum ada riwayat servis untuk kendaraan ini.
                    </div>
                )}
            </div>
        </div>
    );
};

export default RiwayatServis;