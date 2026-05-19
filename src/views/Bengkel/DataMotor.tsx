import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '@/stores/hooks';
import { RootState } from '@/stores/store';
import { fetchVehicles } from '@/stores/BengkelSlice';
import { useNavigate } from 'react-router-dom';
import { Kendaraan } from '@/types/bengkel';
import Lucide from '@/components/Base/Lucide';

const DataMotor = () => {
  const dispatch = useAppDispatch();
  const { vehicles, loading } = useSelector((state: RootState) => state.BengkelSlice);
  const { activeStoreId } = useSelector((state: RootState) => state.AdminSlice);
  const [searchTerm, setSearchTerm] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchVehiclesData = () => {
      if (!activeStoreId) {
        // Jika tidak ada toko aktif, jangan lakukan apa-apa
        return;
      }

      const params: { plat_nomor?: string; id_store: string } = {
        id_store: activeStoreId
      };

      if (searchTerm.length > 0) { // Jika ada search term, tambahkan filter plat_nomor
        params.plat_nomor = searchTerm.toUpperCase().trim();
      }
      
      // Dispatch fetchVehicles dengan parameter yang sudah disiapkan
      dispatch(fetchVehicles(params)); 
    };

    const delayDebounceFn = setTimeout(() => {
      fetchVehiclesData();
    }, 500); // Debounce untuk menghindari terlalu banyak panggilan API saat mengetik

    return () => clearTimeout(delayDebounceFn); // Cleanup debounce timer
  }, [searchTerm, activeStoreId, dispatch]); // Dependencies: searchTerm, activeStoreId, dispatch

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const navigate = useNavigate();
  const totalPages = Math.ceil(vehicles.length / itemsPerPage);
  const paginatedVehicles = vehicles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // console.log("Rendering DataMotor with vehicles:", vehicles, "and loading:", loading);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Data Kendaraan</h2>
          <p className="text-sm text-gray-500">Manajemen database kendaraan pelanggan</p>
        </div>
        <button onClick={() => navigate('/bengkel/data_motor/add')} className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm font-semibold">
          <Lucide icon="Plus" className="w-4 h-4 mr-2" /> Tambah Kendaraan
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Cari Plat Nomor (contoh: B 1234 ABC)..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plat Nomor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit / Model</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pemilik</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Odometer</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">Memuat data...</td></tr>
            ) : paginatedVehicles.length > 0 ? (
              paginatedVehicles.map((v: Kendaraan) => (
                <tr key={v._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap"><span className="px-2 py-1 bg-gray-100 border border-gray-300 rounded font-mono font-bold text-gray-800">{v.plat_nomor}</span></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{v.merk} {v.model} <span className="text-gray-400">({v.tahun || '-'})</span></td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{(v.id_pelanggan as any)?.nama_pelanggan || 'Umum'}</div>
                    <div className="text-xs text-gray-500">{(v.id_pelanggan as any)?.no_telp || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{v.odometer?.toLocaleString()} KM</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-4">
                      <button onClick={() => navigate(`/bengkel/data_motor/edit/${v._id}`)} className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                        <Lucide icon="Pencil" className="w-4 h-4 mr-1.5" /> Edit
                      </button>
                      <button onClick={() => navigate(`/bengkel/riwayat_servis/${v._id}`)} className="flex items-center text-slate-500 hover:text-slate-700 transition-colors">
                        <Lucide icon="History" className="w-4 h-4 mr-1.5" /> Riwayat
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-500 italic">Data kendaraan tidak ditemukan</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {vehicles.length > itemsPerPage && (
        <div className="flex justify-between items-center mt-4 bg-white p-4 rounded-lg border shadow-sm">
          <div className="text-sm text-gray-600">
            Menampilkan {((currentPage - 1) * itemsPerPage) + 1} sampai {Math.min(currentPage * itemsPerPage, vehicles.length)} dari {vehicles.length} kendaraan
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
    </div>
  );
};

export default DataMotor