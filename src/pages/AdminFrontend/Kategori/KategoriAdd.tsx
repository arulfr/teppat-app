import Button from '@/components/Base/Button';
import { FormInput, FormLabel } from '@/components/Base/Form'
import LoadingIcon from '@/components/Base/LoadingIcon';
import { KategoriCreate } from '@/stores/AdminSlice';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';

const KategoriAdd = () => {

  const [kategori,setKategori] = useState({nama_kategori:'',kode_kategori:''});
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const loading = useAppSelector(state=>state.AdminSlice.loading);

  useEffect(()=>{
    const kode = kategori.nama_kategori.toLowerCase().replace(/\s+/g, '_');
    setKategori({...kategori,kode_kategori:kode});
  },[kategori.nama_kategori]);

  const handleSubmit = () =>{
      try {
        dispatch(KategoriCreate(kategori));
      } catch (error) {
        if (error instanceof Error) {
          console.error("Error adding kategori:", error.message);
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
                onChange={(e)=>{setKategori({...kategori,nama_kategori:e.target.value})}}
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

export default KategoriAdd;