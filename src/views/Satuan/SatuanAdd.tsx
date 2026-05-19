import Button from '@/components/Base/Button';
import { FormInput, FormLabel, FormSelect } from '@/components/Base/Form'
import LoadingIcon from '@/components/Base/LoadingIcon';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import { satuanAdd, updateSatuan, getSatuan } from '@/stores/SatuanSlice';
import { ISatuan } from '@/utils/types';
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const SatuanAdd = () => {
  const { id } = useParams();
  const [satuanState, setSatuanState] = useState<ISatuan>({
    satuan: '',
    kode_satuan: '',
    kategori: 'ecer'
  });
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const satuan = useAppSelector(state => state.SatuanSlice.satuan);
  const loading = useAppSelector(state=>state.SatuanSlice.loading);

  useEffect(() => {
    if (id) {
      if (satuan.length === 0) {
        dispatch(getSatuan());
      } else {
        const editData = satuan.find((item: ISatuan) => item._id === id);
        if (editData) {
          setSatuanState({
            satuan: editData.satuan,
            kode_satuan: editData.kode_satuan || '',
            kategori: editData.kategori || 'ecer'
          });
        }
      }
    }
  }, [id, satuan, dispatch]);

  const handleSubmit = async () => {
    try {
      if (id) {
        await dispatch(updateSatuan({ id, data: satuanState })).unwrap();
        toast.success('Satuan Berhasil Diperbarui');
      } else {
        await dispatch(satuanAdd(satuanState)).unwrap();
        toast.success('Satuan Berhasil Ditambahkan');
      }
      navigate(-1);
    } catch (error) {
        toast.error(error as string || "Terjadi kesalahan", {
          position: 'top-right',
          autoClose: 3000,
        });
    }
  }

  return (
    <>
    <div className="flex items-center mt-8 intro-y">
        <h2 className="mr-auto text-lg font-medium">{id ? 'Edit Satuan' : 'Tambah Satuan'}</h2>
      </div>
      <div className="grid grid-cols-12 gap-6 mt-5">
        <div className="col-span-12 intro-y lg:col-span-8">
          {/* BEGIN: Form Layout */}
          <div className="p-5 intro-y box">
            <div>
              <FormLabel htmlFor="satuan">Satuan</FormLabel>
              <FormInput
                id="satuan"
                type="text"
                className="w-full"
                placeholder="Input text"
                value={satuanState.satuan}
                onChange={(e)=>{setSatuanState({...satuanState,satuan:e.target.value,kode_satuan:e.target.value.toLowerCase().replace(/\s+/g, '_')})}}
              />
            </div>
            <div className="mt-3">
              <FormLabel htmlFor="kategori">Kategori Satuan</FormLabel>
              <FormSelect
                id="kategori"
                value={satuanState.kategori}
                onChange={(e) => setSatuanState({ ...satuanState, kategori: e.target.value as 'ecer' | 'grosir' })}
              >
                <option value="ecer">Eceran (Satuan Terkecil / Bisa Dikonversi)</option>
                <option value="grosir">Grosir (Satuan Besar / Tidak Perlu Konversi)</option>
              </FormSelect>
              <div className="mt-2 text-xs text-slate-500">
                *Pilih <strong>Grosir</strong> jika Anda menjual barang ini hanya dalam satuan besar (seperti Dus) tanpa memecahnya.
              </div>
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
              disabled={satuanState.satuan  ==='' || loading}>
                {loading ? <LoadingIcon icon='spinning-circles' className='w-6 h-6 text-white' color='white' /> : (id ? 'Update' : 'Submit')}
              </Button>
            </div>
        </div>
      </div>
    </div>
    </>
  )
}

export default SatuanAdd;