import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '@/stores/hooks';
import { RootState } from '@/stores/store';
import { fetchVehicles, kendaraanUpdate } from '@/stores/BengkelSlice';
import { pelangganGet } from '@/stores/PelangganSlice';
import { toast } from 'react-toastify';
import Button from '@/components/Base/Button';
import { FormInput, FormLabel, FormSelect } from '@/components/Base/Form';
import Lucide from '@/components/Base/Lucide';

const DataMotorEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { vehicles, loading } = useSelector((state: RootState) => state.BengkelSlice);
    const { pelanggan } = useSelector((state: RootState) => state.PelangganSlice);
    const { activeStoreId } = useSelector((state: RootState) => state.AdminSlice);

    const [formData, setFormData] = useState({
        plat_nomor: '',
        merk: '',
        model: '',
        tahun: '',
        id_pelanggan: '',
        odometer: 0
    });

    useEffect(() => {
        dispatch(pelangganGet());
        if (vehicles.length === 0 && activeStoreId) {
            dispatch(fetchVehicles({ id_store: activeStoreId }));
        }
    }, [dispatch, activeStoreId, vehicles.length]);

    useEffect(() => {
        const vehicle = vehicles.find(v => v._id === id);
        if (vehicle) {
            setFormData({
                plat_nomor: vehicle.plat_nomor || '',
                merk: vehicle.merk || '',
                model: vehicle.model || '',
                tahun: vehicle.tahun?.toString() || '',
                id_pelanggan: typeof vehicle.id_pelanggan === 'string' ? vehicle.id_pelanggan : (vehicle.id_pelanggan as any)?._id || '',
                odometer: vehicle.odometer || 0
            });
        }
    }, [id, vehicles]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await dispatch(kendaraanUpdate({ _id: id, ...formData } as any)).unwrap();
            toast.success("Data kendaraan berhasil diperbarui");
            navigate('/bengkel/data_motor');
        } catch (error: any) {
            toast.error(error || "Gagal memperbarui data");
        }
    };

    return (
        <div className="p-6">
            <div className="flex items-center mb-6">
                <button onClick={() => navigate(-1)} className="mr-4 p-2 hover:bg-gray-100 rounded-full">
                    <Lucide icon="ArrowLeft" className="w-6 h-6" />
                </button>
                <h2 className="text-2xl font-bold">Edit Data Kendaraan</h2>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border max-w-2xl">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <FormLabel>Plat Nomor</FormLabel>
                            <FormInput 
                                value={formData.plat_nomor} 
                                onChange={e => setFormData({...formData, plat_nomor: e.target.value.toUpperCase()})}
                                placeholder="B 1234 ABC"
                                required
                            />
                        </div>
                        <div>
                            <FormLabel>Merk Kendaraan</FormLabel>
                            <FormInput 
                                value={formData.merk} 
                                onChange={e => setFormData({...formData, merk: e.target.value})}
                                placeholder="Contoh: Honda"
                                required
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <FormLabel>Model / Tipe</FormLabel>
                            <FormInput 
                                value={formData.model} 
                                onChange={e => setFormData({...formData, model: e.target.value})}
                                placeholder="Contoh: Vario"
                            />
                        </div>
                        <div>
                            <FormLabel>Tahun</FormLabel>
                            <FormInput 
                                type="number"
                                value={formData.tahun} 
                                onChange={e => setFormData({...formData, tahun: e.target.value})}
                            />
                        </div>
                    </div>
                    <div>
                        <FormLabel>Pemilik (Pelanggan)</FormLabel>
                        <FormSelect 
                            value={formData.id_pelanggan}
                            onChange={e => setFormData({...formData, id_pelanggan: e.target.value})}
                            required
                        >
                            <option value="">Pilih Pelanggan</option>
                            {pelanggan.map((p: any) => (
                                <option key={p._id} value={p._id}>{p.nama_pelanggan} ({p.no_telp})</option>
                            ))}
                        </FormSelect>
                    </div>
                    <div className="pt-4 flex justify-end gap-2">
                        <Button type="button" variant="outline-secondary" onClick={() => navigate(-1)}>Batal</Button>
                        <Button type="submit" variant="primary" disabled={loading}>Simpan Perubahan</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DataMotorEdit;