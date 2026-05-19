import Button from '@/components/Base/Button';
import { FormInput, FormLabel, FormSelect } from '@/components/Base/Form';
import { Dialog } from '@/components/Base/Headless';
import LoadingIcon from '@/components/Base/LoadingIcon';
import Lucide from '@/components/Base/Lucide';
import TomSelect from '@/components/Base/TomSelect';
import { KategoriGet, SupplierGet } from '@/stores/AdminSlice';
import { BarangPost } from '@/stores/BarangSlice';
import { getSatuan } from '@/stores/SatuanSlice';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import { formatRupiah } from '@/utils/helper';
import { IBarang } from '@/utils/types';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import KonversiSatuanInput from '../konversiSatuan/KonversiSatuanInput';
import {z} from 'zod';

type SetState<T> = React.Dispatch<React.SetStateAction<T>>;
interface IbarangAdd{
    barangAddModal:boolean,
    setBarangAddModal:SetState<boolean>
}

const initialBarangState : IBarang = {
            barcode:'',
            nama_barang:'',
            keterangan:'',
            satuan:'',
            harga_beli: '' as any,
            harga_jual: '' as any,
            stok:0,
            kode_kategori:'',
            kode_supplier:'',
            konversi_satuan: [],
            tanggal_kadaluarsa: ''
}

const BarangAdd = ({barangAddModal,setBarangAddModal}:IbarangAdd) => {
    const [barangState,setBarangState] = useState<IBarang>(initialBarangState);
    const [isSearching, setIsSearching] = useState(false);
    const loading = useAppSelector(state=>state.AdminSlice.loading);
    const dispatch = useAppDispatch();
    const kategori = useAppSelector(state=>state.AdminSlice.kategori);
    const supplier = useAppSelector(state=>state.AdminSlice.supplier);
    const masterSatuan = useAppSelector(state => state.SatuanSlice.satuan);

    // Cek apakah satuan yang dipilih adalah kategori eceran
    const selectedUnit = masterSatuan.find(s => s.satuan === barangState.satuan);
    const isEceran = selectedUnit ? (selectedUnit as any).kategori === 'ecer' : true;

    const handleCheckBankData = async (barcode: string) => {
        if (!barcode || barcode.length < 3) return;
        setIsSearching(true);
        try {
            // Menuju ke port 5001 (Bank Data Backend)
            const response = await axios.get(`http://localhost:5001/api/v1/master-barang/${barcode}`);
            const data = response.data;
            
            setBarangState(prev => ({
                ...prev,
                nama_barang: data.nama_barang,
                satuan: data.satuan,
                kode_kategori: data.kode_kategori
            }));
            toast.info("Produk ditemukan di Bank Data!");
        } catch (error) {
            // Jika tidak ditemukan (404), biarkan user input manual
        } finally {
            setIsSearching(false);
        }
    };

    useEffect(()=>{
        // Fetch Kategori jika belum ada
        if(kategori.length === 0){
            // dispatch action fetch kategori
            dispatch(KategoriGet());
        }
        // Fetch Supplier jika belum ada
        if(supplier.length === 0){
            // dispatch action fetch supplier
            dispatch(SupplierGet());
        }
        // Fetch Satuan jika belum ada
        if(masterSatuan.length === 0){
            dispatch(getSatuan());
        }
    },[]);
    
    const [fieldErrors,setFieldErrors] = useState<Record<string, string>>({});
    
    const barangSchema = z.object({
        nama_barang: z.string().min(1,"Nama Barang Tidak Boleh Kosong"),
        satuan: z.string().min(1,"Satuan Tidak Boleh Kosong"),
        harga_beli: z.string().min(1,"Harga Beli Tidak Boleh Kosong"),
        harga_jual: z.string().min(1,"Harga Jual Tidak Boleh Kosong"),
        stok: z.coerce.number().min(0, "Stok tidak boleh negatif"),
        kode_kategori: z.string().min(1,"Kategori Harus Dipilih"),
        kode_supplier: z.string().min(1,"Supplier Harus Dipilih"),
        tanggal_kadaluarsa: z.string().optional().nullable(),
        konversi_satuan: z.array(z.any()).optional(),
    });

    const submitHandle = async() =>{
        const validation = barangSchema.safeParse(barangState);
            if (!validation.success) {
                const errors: Record<string, string> = {};
                validation.error.issues.forEach((issue) => {
                    errors[issue.path[0] as string] = issue.message;
                });
                setFieldErrors(errors);
                return;
            }
            setFieldErrors({});
        try {
            await dispatch(BarangPost(barangState)).unwrap();
            toast.success('Barang berhasil ditambahkan');
            setBarangAddModal(false);
            setBarangState(initialBarangState);
        } catch (error) {
            if (error instanceof Error) {
                toast.error(`Error: ${error.message}`);
            }
        }
    }


  return (
    <>
        <Dialog size='xl' open={barangAddModal} onClose={()=> {
            setFieldErrors({});
            setBarangAddModal(false);
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
                        <div className="flex gap-2 mt-1">
                            <div className="flex items-center justify-center w-10 h-10 border border-slate-200 bg-slate-50 rounded-md flex-shrink-0 p-2">
                                <Lucide icon="Barcode" className="w-4 h-4 text-slate-500" />
                            </div>
                            <FormInput 
                              id="modal-form-2" 
                              type="text" 
                              placeholder="Scan / Ketik Barcode..." 
                              className={fieldErrors.barcode ? "border-red-500" : ""}
                              value={barangState.barcode} 
                              onChange={(e)=>setBarangState(prev => ({...prev, barcode: e.target.value}))}
                              onBlur={(e) => handleCheckBankData(e.target.value)}
                              required 
                            />
                            {isSearching && (
                                <div className="flex items-center ml-1">
                                    <LoadingIcon icon="tail-spin" className="w-5 h-5" />
                                </div>
                            )}
                        </div>
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
                    <div className="col-span-12 sm:col-span-12">
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
                    <div className="col-span-12 sm:col-span-12">
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
                        <FormLabel htmlFor="modal-form-stok">
                        Stok Awal (Opsional)
                        </FormLabel>
                        <FormInput id="modal-form-stok" type="number" placeholder="0"
                        className={fieldErrors.stok ? "border-red-500" : ""}
                        value={barangState.stok} onChange={(e)=>setBarangState(prev => ({...prev, stok: Number(e.target.value)}))} />
                        {fieldErrors.stok && (
                            <p className="text-red-500 text-xs mt-1">{fieldErrors.stok}</p>
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
                            <option value="">Pilih Kategori</option>
                            {kategori.map((kat)=>(
                                <option key={kat._id} value={kat.kode_kategori}>{kat.nama_kategori}</option>
                            ))}
                        </TomSelect>
                        {fieldErrors.kode_kategori && (
                            <p className="text-red-500 text-xs mt-1">{fieldErrors.kode_kategori}</p>
                        )}
                    </div>
                    <div className="col-span-12 sm:col-span-6">
                        <FormLabel htmlFor="modal-form-2">
                        Supplier
                        </FormLabel>
                        <TomSelect 
                            value={barangState.kode_supplier ?? ''} 
                            onChange={(e)=> {
                            setBarangState(prev => ({...prev, kode_supplier: e.target.value || ''}));
                            }}
                            options={{
                            placeholder: "Select Supplier",
                                    }}
                            className={`w-full ${fieldErrors.kode_supplier ? "border-red-500" : ""}`}
                            >
                            <option value="">Pilih Supplier</option>
                            {supplier.map((sup)=>(
                                <option key={sup._id} value={sup.kode_supplier}>{sup.nama_supplier}</option>
                            ))}
                        </TomSelect>
                        {fieldErrors.kode_supplier && (
                            <p className="text-red-500 text-xs mt-1">{fieldErrors.kode_supplier}</p>
                        )}
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
                        setBarangAddModal(false);
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

export default BarangAdd