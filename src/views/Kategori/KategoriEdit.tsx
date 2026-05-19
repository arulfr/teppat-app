import Button from '@/components/Base/Button';
import { FormInput, FormLabel } from '@/components/Base/Form'
import LoadingIcon from '@/components/Base/LoadingIcon';
import { KategoriCreate, KategoriUpdate } from '@/stores/AdminSlice';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import { Kategori } from '@/utils/types';
import React, { useEffect, useState } from 'react'
import { useNavigate,useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const KategoriEdit = () => {

  const [kategori,setKategori] = useState<Kategori>({_id:'',nama_kategori:'',kode_kategori:''});
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const loading = useAppSelector(state=>state.AdminSlice.loading);

  // get id from url
  const {id} = useParams<{id:string}>();

  const kategoriState = useAppSelector(state=>state.AdminSlice.kategori);

  useEffect(()=>{
    //set kategori
    const kategoriExist = kategoriState.find(item=> item._id === id);
    if(kategoriExist){
      setKategori({_id:kategoriExist._id,nama_kategori:kategoriExist.nama_kategori,kode_kategori:kategoriExist.kode_kategori || ''});
    
  }
    },[id,kategoriState]);

  const handleSubmit = () =>{
      try {
        dispatch(KategoriUpdate(kategori)).unwrap();
        toast.success('Kategori Berhasil diubah', {
          position: 'top-right',
          autoClose: 3000,
        });
        navigate(-1);
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message, {
            position: 'top-right',
            autoClose: 3000,
          });
      }
    }
  }

  return (
    <>
    <div className="flex items-center mt-8 intro-y">
        <h2 className="mr-auto text-lg font-medium">Form Layout</h2>
      </div>
      <div className="grid grid-cols-12 gap-6 mt-5">
        <div className="col-span-12 intro-y lg:col-span-8">
          {/* BEGIN: Form Layout */}
          <div className="p-5 intro-y box">
            <div>
              <FormLabel htmlFor="nama_kategori">Kategori</FormLabel>
              <FormInput
                id="nama_kategori"
                type="text"
                className="w-full"
                placeholder="Input text"
                value={kategori.nama_kategori}
                onChange={(e)=>{setKategori({...kategori,nama_kategori:e.target.value,kode_kategori:e.target.value.toLowerCase().replace(/\s+/g, '_')})}}
              />
            </div>
            <div className="mt-5 text-right">
              <Button
                type="button"
                variant="outline-secondary"
                className="w-24 mr-1"
                // kembali ke halaman sebelumnya
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button type="button" variant="primary" className="w-24" onClick={handleSubmit} 
              disabled={kategori.nama_kategori==='' || loading}>
                {loading? <LoadingIcon icon='spinning-circles' className='w-6 h-6 text-white' color='white' />:'Submit'}
              </Button>
            </div>
        </div>
      </div>
    </div>
    </>
  )
}

export default KategoriEdit