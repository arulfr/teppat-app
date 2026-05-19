import Button from '@/components/Base/Button';
import { FormInput, FormLabel, FormSelect } from '@/components/Base/Form';
import { Dialog, Menu } from '@/components/Base/Headless';
import LoadingIcon from '@/components/Base/LoadingIcon';
import Lucide from '@/components/Base/Lucide';
import { SupplierCreate } from '@/stores/AdminSlice';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import { Supplier } from '@/utils/types';
import React, { useState } from 'react'
import { toast } from 'react-toastify';
import {z} from 'zod';

type SetState<T> = React.Dispatch<React.SetStateAction<T>>;
type supplierType = {
    supplierAddModal:boolean,
    setSupplierAddModal:SetState<boolean>
}

const initialSupplierState : Supplier = {
    nama_supplier:'',
    kode_supplier:'',
    alamat:'',
    no_telepon:''
}

const supplierSchema = z.object({
    nama_supplier: z.string().min(1,"Nama Tidak Boleh Kosong"),
    alamat:z.string().min(1,'Alamat Tidak Boleh Kosong'),
    no_telepon:z.string().min(1,'nomor Telepon Tidak Boleh Kosong'),
});

const SupplierAdd = ({supplierAddModal,setSupplierAddModal}:supplierType) => {
    const [supplierState,setSupplierState] = useState<Supplier>(initialSupplierState);

    const [fieldErrors,setFieldErrors] = useState<Record<string, string>>({});

    const dispatch = useAppDispatch();
    const loading = useAppSelector(state=>state.AdminSlice.loading);
    const submitSupplier = async()=>{
        // Cek data supplierState pake aturan SupplierSchema
        const result = supplierSchema.safeParse(supplierState);
        if(!result.success){
            // Ambil semua error dari Zod
            const newErrors: Record<string, string> = {};

           // 2. Loop semua masalah (issues) yang ditemukan Zod
            result.error.issues.forEach((issue) => {
                // issue.path[0] adalah nama field, misal: "nama_supplier"
                const fieldName = String(issue.path[0]);
                
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

            await dispatch(SupplierCreate(supplierState)).unwrap();
            setSupplierAddModal(false);
            toast.success('Supplier Berhasil Ditambahkan', {
                position: 'top-right',
                autoClose: 3000,
              });
              setSupplierState(initialSupplierState);
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
        <Dialog size='xl' open={supplierAddModal} onClose={()=> {
            setFieldErrors({});
            setSupplierAddModal(false);
            }}
            >
            <Dialog.Panel>
                <Dialog.Title>
                    <h2 className="mr-auto text-base font-medium">
                        Add Supplier
                    </h2>
                </Dialog.Title>
                <Dialog.Description className="grid grid-cols-12 gap-4 gap-y-3">
                    <div className="col-span-12 sm:col-span-12">
                        <FormLabel htmlFor="modal-form-2">
                            Nama Supplier
                        </FormLabel>
                        <FormInput id="modal-form-2" type="text" placeholder="Nama"
                        className={fieldErrors.nama_supplier ? "border-red-500" : ""}
                        value={supplierState.nama_supplier} onChange={(e)=>setSupplierState({...supplierState,nama_supplier:e.target.value})} required />
                        {fieldErrors.nama_supplier && (
                            <p className="text-red-500 text-xs mt-1">{fieldErrors.nama_supplier}</p>
                        )}
                    </div>
                    <div className="col-span-12 sm:col-span-12">
                        <FormLabel htmlFor="modal-form-3">
                            Alamat
                        </FormLabel>
                        <FormInput id="modal-form-3" type="text" placeholder="Alamat"
                         className={fieldErrors.alamat ? "border-red-500" : ""}
                        value={supplierState.alamat} onChange={(e)=>setSupplierState({...supplierState,alamat:e.target.value})} required />
                        {fieldErrors.alamat && (
                            <p className="text-red-500 text-xs mt-1">{fieldErrors.alamat}</p>
                        )}
                    </div>
                    <div className="col-span-12 sm:col-span-12">
                        <FormLabel htmlFor="modal-form-4">
                            No Telepon
                        </FormLabel>
                        <FormInput id="modal-form-4" type="text" placeholder="Telepon"
                         className={fieldErrors.no_telepon ? "border-red-500" : ""}
                        value={supplierState.no_telepon} onChange={(e)=>setSupplierState({...supplierState,no_telepon:e.target.value})} required />
                        {fieldErrors.no_telepon && (
                            <p className="text-red-500 text-xs mt-1">{fieldErrors.no_telepon}</p>
                        )}
                    </div>
                </Dialog.Description>
                <Dialog.Footer>
                    <Button type="button" variant="outline-secondary" onClick={()=> {
                        setFieldErrors({});
                        setSupplierAddModal(false);
                        }}
                        className="w-20 mr-1"
                        >
                        Cancel
                    </Button>
                    <Button variant="primary" type="button" className="w-20"
                    disabled={loading}
                    onClick={submitSupplier}>
                        {loading? <LoadingIcon icon='spinning-circles' className='w-6 h-6 text-white' color='white' />:'Send'}
                    </Button>
                </Dialog.Footer>
            </Dialog.Panel>
        </Dialog>
    </>
  )
}

export default SupplierAdd