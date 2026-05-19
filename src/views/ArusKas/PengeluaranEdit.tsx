import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/stores/hooks'
import { updatePengeluaran, getPengeluaran } from '@/stores/KasSlice'
import Button from '@/components/Base/Button'
import { FormInput, FormLabel } from '@/components/Base/Form'
import Lucide from '@/components/Base/Lucide'
import { toast } from 'react-toastify'

const PengeluaranEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { pengeluaran, loading } = useAppSelector((state) => state.KasSlice)

  const [formData, setFormData] = useState({
    keperluan: '',
    jumlah_pengeluaran: 0,
    keterangan: '',
    tanggal_pengeluaran: '',
  })

  useEffect(() => {
    if (pengeluaran.length === 0) {
      dispatch(getPengeluaran())
    }
  }, [dispatch, pengeluaran.length])

  useEffect(() => {
    const item = pengeluaran.find((p) => p._id === id)
    if (item) {
      setFormData({
        keperluan: item.keperluan || '',
        jumlah_pengeluaran: item.jumlah_pengeluaran || 0,
        keterangan: item.keterangan || '',
        tanggal_pengeluaran: item.tanggal_pengeluaran ? new Date(item.tanggal_pengeluaran).toISOString().split('T')[0] : '',
      })
    }
  }, [id, pengeluaran])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await dispatch(updatePengeluaran({ ...formData, _id: id } as any)).unwrap()
      toast.success('Pengeluaran berhasil diperbarui')
      navigate('/pengeluaran')
    } catch (error: any) {
      toast.error(error || 'Gagal memperbarui pengeluaran')
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-6 intro-y">
        <Button variant="outline-secondary" className="mr-4" onClick={() => navigate(-1)}>
          <Lucide icon="ArrowLeft" className="w-4 h-4" />
        </Button>
        <h2 className="text-lg font-medium">Edit Pengeluaran</h2>
      </div>

      <div className="box p-5 intro-y max-w-2xl">
        <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-4">
          <div className="col-span-12">
            <FormLabel>Keperluan Pengeluaran</FormLabel>
            <FormInput 
              required
              value={formData.keperluan}
              onChange={(e) => setFormData({...formData, keperluan: e.target.value})}
            />
          </div>
          <div className="col-span-12 sm:col-span-6">
            <FormLabel>Jumlah (Rp)</FormLabel>
            <FormInput 
              required
              type="text"
              value={new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(formData.jumlah_pengeluaran)}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "") || "0";
                setFormData({...formData, jumlah_pengeluaran: Number(val)})
              }}
            />
          </div>
          <div className="col-span-12 sm:col-span-6">
            <FormLabel>Tanggal</FormLabel>
            <FormInput 
              required
              type="date"
              value={formData.tanggal_pengeluaran}
              onChange={(e) => setFormData({...formData, tanggal_pengeluaran: e.target.value})}
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

export default PengeluaranEdit