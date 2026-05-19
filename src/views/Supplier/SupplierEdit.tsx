import Button from '@/components/Base/Button';
import { FormInput, FormLabel } from '@/components/Base/Form';
import { Dialog } from '@/components/Base/Headless';
import LoadingIcon from '@/components/Base/LoadingIcon';
import { SupplierGetId,SupplierEditData } from '@/stores/AdminSlice';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import { SetState, Supplier } from '@/utils/types';
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';

interface SupplierEditProps{
    supplierEditModal:boolean,
    setSupplierEditModal:SetState<boolean>,
    selectId:string
}

const SupplierEdit = ({supplierEditModal,setSupplierEditModal,selectId}:SupplierEditProps) => {

    const loading = useAppSelector(state=>state.AdminSlice.loading);

    const dispatch = useAppDispatch();

    const [supplierEditState,setSupplierEditState] = useState<Supplier>({
        nama_supplier:'',
        alamat:'',
        no_telepon:''
    });

    const submitEditSupplier = async() =>{
        try {
            await dispatch(SupplierEditData(supplierEditState)).unwrap();
            toast.success('Supplier Berhasil Diupdate',{
                position: 'top-right',
                autoClose: 3000,
            });
            setSupplierEditModal(false)
        } catch (error) {
            let msgError;
            if(error instanceof Error){
                msgError = error.message;
            }
            toast.error(msgError,{
                position:'top-right',
                autoClose:3000
            });
        }
    };

    const stateSupplier = useAppSelector(state=>state.AdminSlice.supplierId);

    useEffect(()=>{
        if(selectId && supplierEditModal){
            dispatch(SupplierGetId(selectId));
        }
    },[selectId,supplierEditModal,dispatch]);

    useEffect(()=>{
        if(stateSupplier && supplierEditModal){
            setSupplierEditState(stateSupplier);
        }
    },[stateSupplier,supplierEditModal])




  return (
            <Dialog size='xl' open={supplierEditModal} onClose={()=> {
                setSupplierEditModal(false);
                }}
                >
                <Dialog.Panel>
                    <Dialog.Title>
                        <h2 className="mr-auto text-base font-medium">
                            Edit Data Supplier
                        </h2>
                    </Dialog.Title>
                    <Dialog.Description className="grid grid-cols-12 gap-4 gap-y-3">
                        <div className="col-span-12 sm:col-span-12">
                            <FormLabel htmlFor="modal-form-2">
                                Nama Supplier
                            </FormLabel>
                            <FormInput id="modal-form-2" type="text" placeholder="Nama"
                            value={supplierEditState.nama_supplier} onChange={(e)=>setSupplierEditState({...supplierEditState,nama_supplier:e.target.value})} />
                        </div>
                        <div className="col-span-12 sm:col-span-12">
                            <FormLabel htmlFor="modal-form-3">
                                Alamat
                            </FormLabel>
                            <FormInput id="modal-form-3" type="text" placeholder="Alamat"
                            value={supplierEditState.alamat} onChange={(e)=>setSupplierEditState({...supplierEditState,alamat:e.target.value})} />
                        </div>
                        <div className="col-span-12 sm:col-span-12">
                            <FormLabel htmlFor="modal-form-4">
                                No Telepon
                            </FormLabel>
                            <FormInput id="modal-form-4" type="text" placeholder="Telepon"
                            value={supplierEditState.no_telepon} onChange={(e)=>setSupplierEditState({...supplierEditState,no_telepon:e.target.value})} />
                        </div>
                    </Dialog.Description>
                    <Dialog.Footer>
                        <Button type="button" variant="outline-secondary" onClick={()=> {
                            setSupplierEditModal(false);
                            }}
                            className="w-20 mr-1"
                            >
                            Cancel
                        </Button>
                        <Button variant="primary" type="button" className="w-20" disabled={loading} onClick={submitEditSupplier}>
                            {loading? <LoadingIcon icon='spinning-circles' className='w-6 h-6 text-white' color='white' />:'Send'}
                        </Button>
                    </Dialog.Footer>
                </Dialog.Panel>
            </Dialog>
  )
}

export default SupplierEdit