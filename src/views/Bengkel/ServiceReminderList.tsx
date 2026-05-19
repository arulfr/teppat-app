import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '@/stores/hooks';
import { RootState } from '@/stores/store';
import { fetchServiceReminders } from '@/stores/BengkelSlice';

const ServiceReminderList: React.FC = () => {
    const dispatch = useAppDispatch();
    const { serviceReminders, loading } = useSelector((state: RootState) => state.BengkelSlice);

    useEffect(() => {
        dispatch(fetchServiceReminders());
    }, [dispatch]);

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Daftar Pengingat Servis (CRM)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                    <div className="col-span-full text-center py-10 text-gray-500">Memuat data reminder...</div>
                ) : serviceReminders.length > 0 ? (
                    serviceReminders.map((rem: any) => (
                    <div key={rem._id} className="bg-white p-4 rounded-lg shadow border-l-4 border-orange-500">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-lg font-bold">{rem.id_kendaraan?.plat_nomor}</p>
                                <p className="text-sm text-gray-600">{rem.id_pelanggan?.nama_pelanggan} - {rem.id_pelanggan?.no_telp}</p>
                            </div>
                            <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded uppercase font-bold">
                                {rem.jenis_reminder.replace('_', ' ')}
                            </span>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                            <div className="bg-gray-50 p-2 rounded">
                                <p className="text-gray-500 text-xs">Estimasi Tgl</p>
                                <p className="font-medium">{new Date(rem.next_service_date_estimasi).toLocaleDateString('id-ID')}</p>
                            </div>
                            <div className="bg-gray-50 p-2 rounded">
                                <p className="text-gray-500 text-xs">Estimasi Odo</p>
                                <p className="font-medium">{rem.next_service_odo_estimasi?.toLocaleString()} KM</p>
                            </div>
                        </div>
                        <div className="mt-4 flex gap-2">
                            <button className="flex-1 bg-green-600 text-white py-2 rounded text-sm font-medium">Hubungi (WA)</button>
                            <button className="flex-1 bg-gray-200 text-gray-800 py-2 rounded text-sm font-medium">Selesai</button>
                        </div>
                    </div>
                ))
                ) : (
                    <div className="col-span-full text-center py-10 text-gray-500">Tidak ada pengingat servis saat ini.</div>
                )}
            </div>
        </div>
    );
};

export default ServiceReminderList;