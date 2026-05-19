import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import { fetchLayanan, layananPost, layananUpdate, layananDelete, clearError } from '@/stores/LayananSlice';
import { ILayanan } from '@/utils/types';
import { toast } from 'react-toastify';
import { exportToExcel, exportToPDF } from '@/utils/ExportHelper';
import { Plus, Edit, Trash, Search, Download, FileText } from 'lucide-react';

const Layanan = () => {
  const dispatch = useAppDispatch();
  const { layanan, loading, error } = useAppSelector((state) => state.LayananSlice);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLayanan, setEditingLayanan] = useState<ILayanan | null>(null);
  
  const [formData, setFormData] = useState({
    nama_layanan: '',
    harga: '',
    deskripsi: ''
  });

  useEffect(() => {
    dispatch(fetchLayanan());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleOpenModal = (item?: ILayanan) => {
    if (item) {
      setEditingLayanan(item);
      setFormData({
        nama_layanan: item.nama_layanan,
        harga: item.harga.toString(),
        deskripsi: item.deskripsi || ''
      });
    } else {
      setEditingLayanan(null);
      setFormData({ nama_layanan: '', harga: '', deskripsi: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        harga: parseInt(formData.harga.toString().replace(/[^0-9]/g, ''))
      };

      if (editingLayanan) {
        await dispatch(layananUpdate({ ...data, _id: editingLayanan._id })).unwrap();
        toast.success('Layanan berhasil diupdate');
      } else {
        await dispatch(layananPost(data)).unwrap();
        toast.success('Layanan berhasil ditambahkan');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      // Error ditangani oleh extraReducers dan useEffect di atas
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus layanan ini?')) {
      try {
        await dispatch(layananDelete(id)).unwrap();
        toast.success('Layanan berhasil dihapus');
      } catch (err) {
        // Error ditangani oleh extraReducers
      }
    }
  };

  const filteredLayanan = layanan.filter(item => 
    item.nama_layanan.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.kode_layanan || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportExcel = () => {
    const dataToExport = filteredLayanan.map((l, i) => ({
      No: i + 1,
      Kode: l.kode_layanan || '-',
      Nama: l.nama_layanan || '-', // Fallback for nama_layanan if it could be undefined
      Harga: l.harga,
      Deskripsi: l.deskripsi || '-'
    }));
    exportToExcel(dataToExport, 'Data_Layanan');
  };

  const handleExportPDF = () => {
    const dataToExport = filteredLayanan.map((l, i) => ({
      No: i + 1,
      Kode: l.kode_layanan || '-', // Ensure Kode is always a string
      Nama: l.nama_layanan || '-',
      Harga: `Rp ${l.harga.toLocaleString()}`,
      Deskripsi: l.deskripsi || '-'
    }));
    exportToPDF(dataToExport, 'Daftar Layanan', 'Data_Layanan');
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Master Data Layanan</h1>
        <div className="flex flex-wrap gap-2">
          <button onClick={handleExportExcel} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition text-sm">
            <Download size={16} /> Excel
          </button>
          <button onClick={handleExportPDF} className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition text-sm">
            <FileText size={16} /> PDF
          </button>
          <button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition text-sm font-semibold">
            <Plus size={16} /> Tambah Layanan
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-t-lg border flex items-center shadow-sm">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Cari kode atau nama layanan..."
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-b-lg shadow-sm overflow-x-auto border-x border-b">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kode</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Layanan</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Harga</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deskripsi</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading && filteredLayanan.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10">Memuat data...</td></tr>
            ) : filteredLayanan.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-gray-500">Tidak ada data layanan</td></tr>
            ) : (
              filteredLayanan.map((item, index) => (
                <tr key={item._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.kode_layanan}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.nama_layanan}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                    Rp {item.harga.toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{item.deskripsi || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
                    <button onClick={() => handleOpenModal(item)} className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(item._id!)} className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50">
                      <Trash size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">{editingLayanan ? 'Edit Layanan' : 'Tambah Layanan Baru'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Layanan</label>
                <input type="text" required className="w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition" value={formData.nama_layanan} onChange={(e) => setFormData({...formData, nama_layanan: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Harga (Rp)</label>
                <input type="number" required className="w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition" value={formData.harga} onChange={(e) => setFormData({...formData, harga: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea className="w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition" rows={3} value={formData.deskripsi} onChange={(e) => setFormData({...formData, deskripsi: e.target.value})} />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-50 transition">Batal</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition">
                  {loading ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layanan