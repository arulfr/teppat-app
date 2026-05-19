import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '@/stores/hooks';
import { RootState } from '@/stores/store';
import { fetchMekaniks, mekanikPost, mekanikUpdate, mekanikDelete } from '@/stores/BengkelSlice';
import { Mekanik as MekanikType } from '@/types/bengkel';

const Mekanik = () => {
  const dispatch = useAppDispatch();
  const { mekanik, loading } = useSelector((state: RootState) => state.BengkelSlice);
  
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState<MekanikType>({
    nama_mekanik: '',
    spesialisasi: '',
    no_telepon: '',
    status: 'active'
  });

  useEffect(() => {
    dispatch(fetchMekaniks());
  }, [dispatch]);

  const handleOpenModal = (m?: MekanikType) => {
    if (m) {
      setIsEdit(true);
      setCurrentId(m._id!);
      setFormData(m);
    } else {
      setIsEdit(false);
      setCurrentId(null);
      setFormData({
        nama_mekanik: '',
        spesialisasi: '',
        no_telepon: '',
        status: 'active'
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEdit && currentId) {
        await dispatch(mekanikUpdate({ ...formData, _id: currentId })).unwrap();
      } else {
        await dispatch(mekanikPost(formData)).unwrap();
      }
      setShowModal(false);
    } catch (error: any) {
      alert("Gagal menyimpan data: " + error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus mekanik ini?')) {
      try {
        await dispatch(mekanikDelete(id)).unwrap();
      } catch (error: any) {
        alert("Gagal menghapus: " + error);
      }
    }
  };

  const filteredMekanik = mekanik.filter(m => 
    m.nama_mekanik.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.spesialisasi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredMekanik.length / itemsPerPage);
  const paginatedMekanik = filteredMekanik.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Daftar Mekanik</h2>
          <p className="text-sm text-gray-500">Manajemen tim mekanik bengkel</p>
        </div>
        <button 
          onClick={() => handleOpenModal()} 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-sm transition"
        >
          + Tambah Mekanik
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Cari nama atau spesialisasi..."
          className="w-full md:w-1/3 px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Mekanik</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Spesialisasi</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No. Telepon</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">Memuat data...</td></tr>
            ) : paginatedMekanik.length > 0 ? (
              paginatedMekanik.map((m) => (
                <tr key={m._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{m.nama_mekanik}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{m.spesialisasi}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{m.no_telepon}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${m.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {m.status?.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleOpenModal(m)} className="text-blue-600 hover:text-blue-900 mr-4">Edit</button>
                    <button onClick={() => handleDelete(m._id!)} className="text-red-600 hover:text-red-900">Hapus</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-500 italic">Data mekanik tidak ditemukan</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredMekanik.length > itemsPerPage && (
        <div className="flex justify-between items-center mt-4 bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-sm text-gray-600">
            Menampilkan {((currentPage - 1) * itemsPerPage) + 1} sampai {Math.min(currentPage * itemsPerPage, filteredMekanik.length)} dari {filteredMekanik.length} mekanik
          </div>
          <div className="flex gap-2">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
            >
              Prev
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 border rounded ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'}`}
              >
                {i + 1}
              </button>
            ))}
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b">
              <h3 className="text-lg font-bold">{isEdit ? 'Edit Data Mekanik' : 'Tambah Mekanik Baru'}</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                <input type="text" required className="mt-1 block w-full border rounded-md p-2" value={formData.nama_mekanik} onChange={(e) => setFormData({...formData, nama_mekanik: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Spesialisasi</label>
                <input type="text" placeholder="Contoh: Mesin, Kelistrikan" className="mt-1 block w-full border rounded-md p-2" value={formData.spesialisasi} onChange={(e) => setFormData({...formData, spesialisasi: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">No. Telepon</label>
                <input type="text" required className="mt-1 block w-full border rounded-md p-2" value={formData.no_telepon} onChange={(e) => setFormData({...formData, no_telepon: e.target.value})} />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800">Batal</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mekanik