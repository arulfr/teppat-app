import Button from '@/components/Base/Button';
import { FormInput, FormLabel, FormSelect } from '@/components/Base/Form';
import { Dialog } from '@/components/Base/Headless';
import LoadingIcon from '@/components/Base/LoadingIcon';
import TomSelect from '@/components/Base/TomSelect';
import { KategoriGet, SupplierGet } from '@/stores/AdminSlice';
import { barangUpdate } from '@/stores/BarangSlice';
import { getSatuan } from '@/stores/SatuanSlice';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import { formatRupiah } from '@/utils/helper';
import { IBarang } from '@/utils/types';
import React, { Dispatch, SetStateAction, useEffect } from 'react'
import KonversiSatuanInput from '../konversiSatuan/KonversiSatuanInput';
import { toast } from 'react-toastify';
import z from 'zod';

type barangEditType = {
    barangEditModal:boolean,
    setBarangEditModal:Dispatch<SetStateAction<boolean>>
    idBarang:string
}

    const editBarangSchema = z.object({
        barcode: z.string().min(1,'Barcode Tidak Boleh Kosong'),
        nama_barang: z.string().min(1,'Nama Barang Tidak Boleh Kosong'),
        satuan: z.string().min(1,'Satuan Tidak Boleh Kosong'),
        harga_beli: z.coerce.number().min(1,'Harga Beli Tidak Boleh Kosong'),
        harga_jual: z.coerce.number().min(1,'Harga Jual Tidak Boleh Kosong'),
        kode_kategori: z.string().min(1,'Kategori Harus Dipilih'),
        tanggal_kadaluarsa: z.string().optional().nullable(),
        konversi_satuan: z.array(z.any()).optional(),
    });

const BarangEdit = ({barangEditModal,setBarangEditModal,idBarang}:barangEditType) => {
    const dispatch = useAppDispatch();
    const [fieldErrors,setFieldErrors] = React.useState<Record<string,string>>({});
    const barangGetItem = useAppSelector(state=>state.BarangSlice.BarangList).find((item:IBarang)=>item._id === idBarang);
    const [barangState,setBarangState] = React.useState<IBarang>({
        barcode:'',
        nama_barang:'',
        satuan:'',
        harga_beli:0,
        harga_jual:0,
        kode_kategori:'',
        kode_supplier:'',
        konversi_satuan: [],
        tanggal_kadaluarsa: '',
    });
    useEffect(() => {
    // Jalankan HANYA jika modal terbuka DAN data ditemukan
    if (barangEditModal && barangGetItem) {
        setBarangState({
            barcode:barangGetItem?.barcode || '',
            nama_barang:barangGetItem?.nama_barang || '',
            satuan:barangGetItem?.satuan || '',
            harga_beli:formatRupiah(barangGetItem?.harga_beli.toString()) || 0,
            harga_jual:formatRupiah(barangGetItem?.harga_jual.toString()) || 0,
            kode_kategori:barangGetItem?.kode_kategori || '',
            kode_supplier:barangGetItem?.kode_supplier || '', // Handle jika null
            konversi_satuan: barangGetItem?.konversi_satuan || [],
            tanggal_kadaluarsa: barangGetItem?.tanggal_kadaluarsa || '',
        });
    }
}, [barangEditModal, barangGetItem]);
    const kategori = useAppSelector(state=>state.AdminSlice?.kategori);
    const supplier = useAppSelector(state=>state.AdminSlice?.supplier);
    const loading = useAppSelector(state=>state.AdminSlice?.loading);
    const masterSatuan = useAppSelector(state => state.SatuanSlice.satuan);

    // Cek apakah satuan yang dipilih adalah kategori eceran
    const selectedUnit = masterSatuan.find(s => s.satuan === barangState.satuan);
    const isEceran = selectedUnit ? (selectedUnit as any).kategori === 'ecer' : true;

    useEffect(()=>{
        if(kategori.length === 0){
            // dispatch KategoriGet jika belum ada data
           dispatch(KategoriGet()); 
        }
        if(supplier.length === 0){
            // dispatch SupplierGet jika belum ada data
           dispatch(SupplierGet());
        }
        if(masterSatuan.length === 0){
            dispatch(getSatuan());
        }
        //akhirin useEffect
        return ()=>{
            setFieldErrors({});
        };
    },[]);

    const submitHandle = async()=>{
        // Validasi data barangState pake editBarangSchema
        const validation = editBarangSchema.safeParse(barangState);
        if(!validation.success){
            const errors: Record<string,string> = {};
            validation.error.issues.forEach((issue)=>{
                const fieldName = String(issue.path[0]);
                if(fieldName && !errors[fieldName]){
                    errors[fieldName] = issue.message;
                }
            });
            setFieldErrors(errors);
            return; // Stop eksekusi jika ada error
        }
        setFieldErrors({}); // Bersihkan error lama
        try {
            await dispatch(barangUpdate({...barangState,_id:idBarang})).unwrap();
            setBarangEditModal(false);
            toast.success('Barang Berhasil Diupdate',{
                position:'top-right',
                autoClose:3000
            });
        } catch (error) {
            if(error instanceof Error){
                toast.error(error.message || 'Error Silahkan Coba Lagi',{
                    position:'top-right',
                    autoClose:3000
                });
            }
        }
    }

  return (
    <>
        <Dialog size='xl' open={barangEditModal} onClose={()=> {
            setFieldErrors({});
            setBarangEditModal(false);
            }}
            >
            <Dialog.Panel>
                <Dialog.Title>
                    <h2 className="mr-auto text-base font-medium">
                        Tambah Barang
                    </h2>
                </Dialog.Title>
                <Dialog.Description className="grid grid-cols-12 gap-4 gap-y-3">
                    <div className="col-span-12 sm:col-span-12">
                        <FormLabel htmlFor="modal-form-2">
                        Barcode
                        </FormLabel>
                        <FormInput id="modal-form-2" type="text" placeholder="Barcode"
                        className={fieldErrors.barcode ? "border-red-500" : ""}
                        value={barangState.barcode} onChange={(e)=>setBarangState(prev => ({...prev, barcode: e.target.value}))} required />
                        {fieldErrors.barcode && (
                            <p className="text-red-500 text-xs mt-1">{fieldErrors.barcode}</p>
                        )}
                    </div>
                    <div className="col-span-12 sm:col-span-6">
                        <FormLabel htmlFor="modal-form-2">
                        Nama Barang
                        </FormLabel>
                        <FormInput id="modal-form-2" type="text" placeholder="Nama"
                        className={fieldErrors.nama_barang ? "border-red-500" : ""}
                        value={barangState.nama_barang} onChange={(e)=>setBarangState(prev => ({...prev, nama_barang: e.target.value}))} required />
                        {fieldErrors.nama_barang && (
                            <p className="text-red-500 text-xs mt-1">{fieldErrors.nama_barang}</p>
                        )}
                    </div>
                    <div className="col-span-12 sm:col-span-6">
                        <FormLabel htmlFor="modal-form-2">
                        Satuan
                        </FormLabel>
                        <FormSelect 
                          id="modal-form-2" 
                          className={fieldErrors.satuan ? "border-red-500" : ""}
                          value={barangState.satuan} 
                          onChange={(e)=>setBarangState(prev => ({...prev, satuan: e.target.value}))} 
                          required 
                        >
                          <option value="">Pilih Satuan</option>
                          {masterSatuan.map((s) => (
                            <option key={s._id} value={s.satuan}>{s.satuan}</option>
                          ))}
                        </FormSelect>
                        {fieldErrors.satuan && (
                            <p className="text-red-500 text-xs mt-1">{fieldErrors.satuan}</p>
                        )}
                    </div>
                    <div className="col-span-12 sm:col-span-6">
                        <FormLabel htmlFor="modal-form-2">
                        Harga Beli
                        </FormLabel>
                        <FormInput id="modal-form-2" type="text" placeholder="Harga Beli"
                        className={fieldErrors.harga_beli ? "border-red-500" : ""}
                        value={barangState.harga_beli} onChange={(e)=>setBarangState(prev => ({...prev, harga_beli: formatRupiah(e.target.value) || ''}))} required />
                        {fieldErrors.harga_beli && (
                            <p className="text-red-500 text-xs mt-1">{fieldErrors.harga_beli}</p>
                        )}
                    </div>
                    <div className="col-span-12 sm:col-span-6">
                        <FormLabel htmlFor="modal-form-2">
                        Harga Jual
                        </FormLabel>
                        <FormInput id="modal-form-2" type="text" placeholder="Harga Jual"
                        className={fieldErrors.harga_jual ? "border-red-500" : ""}
                        value={barangState.harga_jual} onChange={(e)=>setBarangState(prev => ({...prev, harga_jual: formatRupiah(e.target.value) || ''}))} required />
                        {fieldErrors.harga_jual && (
                            <p className="text-red-500 text-xs mt-1">{fieldErrors.harga_jual}</p>
                        )}
                    </div>
                    <div className="col-span-12 sm:col-span-6">
                        <FormLabel htmlFor="modal-form-2">
                        Kategori
                        </FormLabel>
                        <TomSelect value={barangState.kode_kategori} onChange={(e)=> {
                            setBarangState(prev => ({...prev, kode_kategori: e.target.value}));
                            }}
                            options={{
                            placeholder: "Select Kategori",
                                    }}
                            className="w-full"
                            >
                            {kategori.map((kat)=>(
                                <option key={kat._id} value={kat.kode_kategori}>{kat.nama_kategori}</option>
                            ))}
                        </TomSelect>
                        {fieldErrors.kode_kategori && (
                            <p className="text-red-500 text-xs mt-1">{fieldErrors.kode_kategori}</p>
                        )}
                    </div>
                    <div className="col-span-12 sm:col-span-6">
                        <FormLabel htmlFor="modal-form-kadaluarsa">
                        Tanggal Kadaluarsa (Opsional)
                        </FormLabel>
                        <FormInput 
                            id="modal-form-kadaluarsa" 
                            type="date" 
                            value={barangState.tanggal_kadaluarsa || ''} 
                            onChange={(e) => setBarangState(prev => ({...prev, tanggal_kadaluarsa: e.target.value}))} 
                        />
                    </div>
                    <div className="col-span-12 sm:col-span-6">
                        <FormLabel htmlFor="modal-form-2">
                        Supplier
                        </FormLabel>
                        <TomSelect value={barangState.kode_supplier ?? ''} onChange={(e)=> {
                            setBarangState(prev => ({...prev, kode_supplier: e.target.value || ''}));
                            }}
                            options={{
                            placeholder: "Select Supplier",
                                    }}
                            className="w-full"
                            >
                            {supplier.map((sup)=>(
                                <option key={sup._id} value={sup.kode_supplier}>{sup.nama_supplier}</option>
                            ))}
                        </TomSelect>
                    </div>

                    {/* INPUT KONVERSI MULTI SATUAN */}
                    {isEceran && (
                        <div className="col-span-12">
                            <KonversiSatuanInput 
                                konversi={barangState.konversi_satuan || []} 
                                setKonversi={(data) => setBarangState({ ...barangState, konversi_satuan: data })} 
                                baseHargaJual={barangState.harga_jual}
                            />
                        </div>
                    )}

                </Dialog.Description>
                <Dialog.Footer>
                    <Button type="button" variant="outline-secondary" onClick={()=> {
                        setFieldErrors({});
                        setBarangEditModal(false);
                        }}
                        className="w-20 mr-1"
                        >
                        Cancel
                    </Button>
                    <Button variant="primary" type="button" className="w-20"
                    disabled={loading}
                    onClick={submitHandle}>
                        {loading? <LoadingIcon icon='spinning-circles' className='w-6 h-6 text-white' color='white' />:'Send'}
                    </Button>
                </Dialog.Footer>
            </Dialog.Panel>
        </Dialog>
    </>
  )
}

export default BarangEdit