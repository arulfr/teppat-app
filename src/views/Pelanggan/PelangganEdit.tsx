import Button from '@/components/Base/Button';
import { FormInput, FormLabel, FormSelect } from '@/components/Base/Form';
import { Dialog, Menu } from '@/components/Base/Headless';
import LoadingIcon from '@/components/Base/LoadingIcon';
import Lucide from '@/components/Base/Lucide';
import TomSelect from '@/components/Base/TomSelect';
import { SupplierCreate } from '@/stores/AdminSlice';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import { pelangganPost, pelangganUpdate } from '@/stores/PelangganSlice';
import { IPelanggan, Supplier } from '@/utils/types';
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import {z} from 'zod';

type SetState<T> = React.Dispatch<React.SetStateAction<T>>;
type pelangganType = {
    pelangganEditModal:boolean,
    setPelangganEditModal:SetState<boolean>,
    selectId:string
}

const inititalPelangganState : IPelanggan = {
    _id:'',
    nama_pelanggan:'',
    tipe_pelanggan:'perorangan',
    no_telp:''
}

const pelangganSchema = z.object({
    nama_pelanggan: z.string().min(1,"Nama Tidak Boleh Kosong"),
    no_telp:z.string().min(1,'nomor Telepon Tidak Boleh Kosong'),
    tipe_pelanggan:z.string().min(1,'Jenis Pelanggan Harus Dipilih'),
});

const PelangganEdit = ({pelangganEditModal,setPelangganEditModal,selectId}:pelangganType) => {
    const [pelangganState,setPelangganState] = useState<IPelanggan>(inititalPelangganState);
    const [fieldErrors,setFieldErrors] = useState<Record<string, string>>({});
    const getPelangganById = useAppSelector(state=>state.PelangganSlice.pelanggan.find(pel=>pel._id === selectId));

    useEffect(()=>{
        if(pelangganEditModal && getPelangganById){
            setPelangganState(getPelangganById);
        }
    },[pelangganEditModal,getPelangganById]);

    const dispatch = useAppDispatch();
    const loading = useAppSelector(state=>state.AdminSlice.loading);
    const submitPelangganUpdate = async()=>{
        // Cek data supplierState pake aturan SupplierSchema
        const result = pelangganSchema.safeParse(pelangganState);
        if(!result.success){
            // Ambil semua error dari Zod
            const newErrors: Record<string, string> = {};

           // 2. Loop semua masalah (issues) yang ditemukan Zod
            result.error.issues.forEach((issue) => {
                // issue.path[0] adalah nama field, misal: "nama_pelanggan"
                const fieldName = String(issue.path[0]);
                const fieldTelepon = String(issue.path[1]);
                
                // 3. Masukkan ke wadah, tapi cek dulu biar gak ketimpa (ambil error pertama aja)
                if (fieldName && !newErrors[fieldName]) {
                    newErrors[fieldName.toString()] = issue.message;
                }
            });
            // 4. Update state error
            setFieldErrors(newErrors);
            return; // Stop, jangan lanjut
        }
        
        try {
            
            setFieldErrors({}); // Bersihkan error lama

            await dispatch(pelangganUpdate(pelangganState)).unwrap();
            setPelangganEditModal(false);
            toast.success('Pelanggan Berhasil Diubah', {
                position: 'top-right',
                autoClose: 3000,
              });
              setPelangganState(inititalPelangganState);
        } catch (error) {
            let errorMsg;
            if(error instanceof Error){
                errorMsg = error.message || 'Error, Silahkan Coba Lagi'
              }
            toast.error(errorMsg, {
                position: 'top-right',
                autoClose: 3000,
              });
        }
    };

  return (
    <>
        <Dialog size='xl' open={pelangganEditModal} onClose={()=> {
            setFieldErrors({});
            setPelangganEditModal(false);
            }}
            >
            <Dialog.Panel>
                <Dialog.Title>
                    <h2 className="mr-auto text-base font-medium">
                        Edit Pelanggan
                    </h2>
                </Dialog.Title>
                <Dialog.Description className="grid grid-cols-12 gap-4 gap-y-3">
                    <div className="col-span-12 sm:col-span-12">
                        <FormLabel htmlFor="modal-form-2">
                            Nama Pelanggan
                        </FormLabel>
                        <FormInput id="modal-form-2" type="text" placeholder="Nama"
                        className={fieldErrors.nama_pelanggan ? "border-red-500" : ""}
                        value={pelangganState.nama_pelanggan} onChange={(e)=>setPelangganState({...pelangganState,nama_pelanggan:e.target.value})} required />
                        {fieldErrors.nama_pelanggan && (
                            <p className="text-red-500 text-xs mt-1">{fieldErrors.nama_pelanggan}</p>
                        )}
                    </div>
                    <div className="col-span-12 sm:col-span-12">
                        <FormLabel htmlFor="modal-form-4">
                            No Telepon
                        </FormLabel>
                        <FormInput id="modal-form-4" type="text" placeholder="Telepon"
                         className={fieldErrors.no_telp ? "border-red-500" : ""}
                        value={pelangganState.no_telp} onChange={(e)=>setPelangganState({...pelangganState,no_telp:e.target.value})} required />
                        {fieldErrors.no_telp && (
                            <p className="text-red-500 text-xs mt-1">{fieldErrors.no_telp}</p>
                        )}
                    </div>
                    <div className="col-span-12 sm:col-span-12">
                        <FormLabel htmlFor="modal-form-2">
                        Jenis Pelanggan
                        </FormLabel>
                        <TomSelect value={pelangganState.tipe_pelanggan} onChange={(e)=> {
                            setPelangganState({...pelangganState,tipe_pelanggan:e.target.value});
                            }}
                            options={{
                            placeholder: "Select Jenis Pelanggan",
                                    }}
                            className="w-full"
                            >
                            <option value={'perorangan'}>{'Perorangan'}</option>
                            <option value={'perusahaan'}>{'Perusahaan'}</option>
                        </TomSelect>
                        {fieldErrors.tipe_pelanggan && (
                            <p className="text-red-500 text-xs mt-1">{fieldErrors.tipe_pelanggan}</p>
                        )}
                    </div>
                </Dialog.Description>
                <Dialog.Footer>
                    <Button type="button" variant="outline-secondary" onClick={()=> {
                        setFieldErrors({});
                        setPelangganEditModal(false);
                        }}
                        className="w-20 mr-1"
                        >
                        Cancel
                    </Button>
                    <Button variant="primary" type="button" className="w-20"
                    disabled={loading}
                    onClick={submitPelangganUpdate}>
                        {loading? <LoadingIcon icon='spinning-circles' className='w-6 h-6 text-white' color='white' />:'Send'}
                    </Button>
                </Dialog.Footer>
            </Dialog.Panel>
        </Dialog>
    </>
  )
}

export default PelangganEdit