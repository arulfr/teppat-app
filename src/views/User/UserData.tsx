import React, { useEffect, useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import { userGet, userDelete } from '@/stores/UserSlice';
import { IUser } from '@/utils/types';
import Button from '@/components/Base/Button';
import { useNavigate } from 'react-router-dom';

const UserData = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const userData = useAppSelector((state) => state.UserSlice.userData);
  const currentUser = useAppSelector((state) => state.AdminSlice.isLogin);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dispatch(userGet());
  }, [dispatch]);

  useEffect(() => {
    if (userData.length >= 0) {
      setLoading(false);
    }
  }, [userData]);

  const filteredUsers = useMemo(() => {
    return (userData || []).filter((user: IUser) =>
      (user.nama || '').toLowerCase().includes(search.toLowerCase()) ||
      (user.username || '').toLowerCase().includes(search.toLowerCase()) ||
      (user.kode_user || '').toLowerCase().includes(search.toLowerCase())
    );
  }, [userData, search]);

  const handleDelete = async (id: string) => {
    if (confirm('Hapus user ini?')) {
      await dispatch(userDelete(id));
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Data Pengguna</h1>
          <p className="text-gray-600">Kelola pengguna sistem</p>
        </div>
        <div className="flex items-center gap-2">
          {currentUser?.role === 'owner' && (
            <Button variant="outline-primary" onClick={() => navigate('/user/set_menu/all')}>
              Pengaturan Hak Akses
            </Button>
          )}
          <Button variant="primary" onClick={() => navigate('/user/tambah')}>
            Tambah User
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <input
          type="text"
          placeholder="Cari nama, username, atau kode user..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-lg border overflow-hidden">
        <div className="p-6 border-b bg-gray-50">
          <h3 className="text-lg font-semibold">Daftar Pengguna</h3>
          <p className="text-sm text-gray-500 mt-1">{filteredUsers.length} pengguna</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kode User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jabatan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user: IUser) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.nama}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.username}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                    {user.kode_user}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.jabatan}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                      user.role === 'kasir' ? 'bg-blue-100 text-blue-800' : 
                      'bg-green-100 text-green-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    {currentUser?.role === 'owner' && user.role !== 'owner' && (
                      <Button variant="outline-secondary" size="sm" className="px-3 py-1" onClick={() => navigate(`/user/set_menu/${user._id}`)}>Hak Akses</Button>
                    )}
                    <Button variant="secondary" size="sm" className="px-3 py-1" onClick={() => navigate(`/user/edit/${user._id}`)}>Edit</Button>
                    <Button 
                      variant="danger" 
                      size="sm" 
                      className="px-3 py-1"
                      onClick={() => handleDelete(user._id!)}
                    >
                      Hapus
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Tidak ada pengguna {search && 'yang cocok dengan pencarian'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserData;
