import React, { useEffect } from 'react';
import { IKonversiSatuan } from '@/utils/types';
import Button from '@/components/Base/Button';
import Lucide from '@/components/Base/Lucide';
import { FormInput, FormLabel, FormSelect } from '@/components/Base/Form';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import { getSatuan } from '@/stores/SatuanSlice';
import { formatRupiah } from '@/utils/helper';

interface KonversiSatuanInputProps {
    konversi: IKonversiSatuan[];
    setKonversi: (data: IKonversiSatuan[]) => void;
    baseHargaJual: number | string;
}

const KonversiSatuanInput: React.FC<KonversiSatuanInputProps> = ({ konversi, setKonversi, baseHargaJual }) => {
    const dispatch = useAppDispatch();
    const masterSatuan = useAppSelector((state) => state.SatuanSlice.satuan);

    useEffect(() => {
        if (masterSatuan.length === 0) {
            dispatch(getSatuan());
        }
    }, [dispatch, masterSatuan.length]);

    const handleAdd = () => {
        setKonversi([...konversi, { satuan: '', pengali: 1, harga_jual: 0, barcode: '' }]);
    };

    const handleRemove = (index: number) => {
        const newKonversi = konversi.filter((_, i) => i !== index);
        setKonversi(newKonversi);
    };

    const handleChange = (index: number, field: keyof IKonversiSatuan, value: any) => {
        const newKonversi = [...konversi];
        
        if (field === 'pengali') {
            const numericBase = typeof baseHargaJual === 'string' 
                ? parseInt(baseHargaJual.replace(/[^0-9]/g, "")) 
                : baseHargaJual;
            
            const multiplier = Number(value) || 0;
            newKonversi[index] = { 
                ...newKonversi[index], 
                pengali: multiplier,
                harga_jual: (numericBase || 0) * multiplier
            };
        } else {
            newKonversi[index] = { ...newKonversi[index], [field]: value };
        }
        setKonversi(newKonversi);
    };

    return (
        <div className="p-5 mt-5 border rounded-md border-slate-200/60 dark:border-darkmode-400">
            <div className="flex items-center pb-5 mb-5 border-b font-medium border-slate-200/60 dark:border-darkmode-400">
                <Lucide icon="ChevronDown" className="w-4 h-4 mr-2" /> Konversi Satuan (Multi Satuan)
            </div>
            <div className="mt-5">
                {konversi.map((item, index) => (
                    <div key={index} className="flex flex-col gap-4 p-4 mb-4 border rounded-md border-slate-200/60 dark:border-darkmode-400 lg:flex-row lg:items-end">
                        <div className="flex-1">
                            <FormLabel htmlFor={`satuan-${index}`}>Nama Satuan (Grosir)</FormLabel>
                            <FormSelect
                                id={`satuan-${index}`}
                                value={item.satuan}
                                onChange={(e) => handleChange(index, 'satuan', e.target.value)}
                            >
                                <option value="">Pilih Satuan</option>
                                {masterSatuan
                                    .filter((s) => s.kategori === 'grosir')
                                    .map((s) => (
                                        <option key={s._id} value={s.satuan}>
                                            {s.satuan}
                                        </option>
                                    ))}
                            </FormSelect>
                        </div>
                        <div className="w-full lg:w-32">
                            <FormLabel htmlFor={`pengali-${index}`}>Isi (Pcs)</FormLabel>
                            <FormInput
                                id={`pengali-${index}`}
                                type="number"
                                placeholder="12"
                                value={item.pengali}
                                onChange={(e) => handleChange(index, 'pengali', Number(e.target.value))}
                            />
                        </div>
                        <div className="flex-1">
                            <FormLabel htmlFor={`harga-${index}`}>Harga Jual Satuan Ini</FormLabel>
                            <FormInput
                                id={`harga-${index}`}
                                type="text"
                                placeholder="Harga khusus satuan ini"
                                value={formatRupiah(item.harga_jual?.toString() || "0")}
                                onChange={(e) => {
                                    const numericValue = parseInt(e.target.value.replace(/[^0-9]/g, "")) || 0;
                                    handleChange(index, 'harga_jual', numericValue);
                                }}
                            />
                        </div>
                        <div className="flex-1">
                            <FormLabel htmlFor={`barcode-${index}`}>Barcode Satuan Ini</FormLabel>
                            <FormInput
                                id={`barcode-${index}`}
                                type="text"
                                placeholder="Barcode di kemasan ini"
                                value={item.barcode}
                                onChange={(e) => handleChange(index, 'barcode', e.target.value)}
                            />
                        </div>
                        <Button
                            variant="danger"
                            className="w-full lg:w-auto"
                            onClick={() => handleRemove(index)}
                        >
                            <Lucide icon="Trash2" className="w-4 h-4" />
                        </Button>
                    </div>
                ))}
                <Button
                    variant="outline-primary"
                    type="button"
                    className="w-full mt-2 border-dashed"
                    onClick={handleAdd}
                >
                    <Lucide icon="Plus" className="w-4 h-4 mr-2" /> Tambah Konversi Satuan
                </Button>
            </div>
        </div>
    );
};

export default KonversiSatuanInput;