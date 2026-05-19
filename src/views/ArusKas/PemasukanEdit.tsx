import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/stores/hooks'
import { updatePemasukan, getPemasukan } from '@/stores/KasSlice'
import Button from '@/components/Base/Button'
import { FormInput, FormLabel } from '@/components/Base/Form'
import Lucide from '@/components/Base/Lucide'
import { toast } from 'react-toastify'

const PemasukanEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { pemasukan, loading } = useAppSelector((state) => state.KasSlice)

  const [formData, setFormData] = useState({
    sumber: '',
    jumlah_pemasukan: 0,
    keterangan: '',
    tanggal_pemasukan: '',
  })

  useEffect(() => {
    if (pemasukan.length === 0) {
      dispatch(getPemasukan())
    }
  }, [dispatch, pemasukan.length])

  useEffect(() => {
    const item = pemasukan.find((p) => p._id === id)
    if (item) {
      setFormData({
        sumber: item.sumber || '',
        jumlah_pemasukan: item.jumlah_pemasukan || 0,
        keterangan: item.keterangan || '',
        tanggal_pemasukan: item.tanggal_pemasukan ? new Date(item.tanggal_pemasukan).toISOString().split('T')[0] : '',
      })
    }
  }, [id, pemasukan])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await dispatch(updatePemasukan({ ...formData, _id: id } as any)).unwrap()
      toast.success('Pemasukan berhasil diperbarui')
      navigate('/pemasukan')
    } catch (error: any) {
      toast.error(error || 'Gagal memperbarui pemasukan')
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-6 intro-y">
        <Button variant="outline-secondary" className="mr-4" onClick={() => navigate(-1)}>
          <Lucide icon="ArrowLeft" className="w-4 h-4" />
        </Button>
        <h2 className="text-lg font-medium">Edit Pemasukan</h2>
      </div>

      <div className="box p-5 intro-y max-w-2xl">
        <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-4">
          <div className="col-span-12">
            <FormLabel>Sumber Pemasukan</FormLabel>
            <FormInput 
              required
              value={formData.sumber}
              onChange={(e) => setFormData({...formData, sumber: e.target.value})}
            />
          </div>
          <div className="col-span-12 sm:col-span-6">
            <FormLabel>Jumlah (Rp)</FormLabel>
            <FormInput 
              required
              type="text"
              value={new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(formData.jumlah_pemasukan)}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "") || "0";
                setFormData({...formData, jumlah_pemasukan: Number(val)})
              }}
            />
          </div>
          <div className="col-span-12 sm:col-span-6">
            <FormLabel>Tanggal</FormLabel>
            <FormInput 
              required
              type="date"
              value={formData.tanggal_pemasukan}
              onChange={(e) => setFormData({...formData, tanggal_pemasukan: e.target.value})}
            />
          </div>
          <div className="col-span-12">
            <FormLabel>Keterangan</FormLabel>
            <FormInput 
              value={formData.keterangan}
              onChange={(e) => setFormData({...formData, keterangan: e.target.value})}
            />
          </div>
          <div className="col-span-12 flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline-secondary" onClick={() => navigate(-1)}>Batal</Button>
            <Button type="submit" variant="primary" disabled={loading}>Simpan Perubahan</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PemasukanEdit