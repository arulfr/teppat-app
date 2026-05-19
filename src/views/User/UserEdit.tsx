import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import { userGetId, userUpdate } from '@/stores/UserSlice';
import { IUser } from '@/utils/types';
import Button from '@/components/Base/Button';
import { useNavigate, useParams } from 'react-router-dom';

const UserEdit = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const userState = useAppSelector((state) => state.UserSlice.userData);
  const [formData, setFormData] = useState<IUser>({
    _id: '',
    nama: '',
    username: '',
    password: '',
    kode_user: '',
    jabatan: '',
    role: 'kasir',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      dispatch(userGetId(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    // Find user from state
    const user = userState.find((u: IUser) => u._id === id);
    if (user) {
      setFormData(user);
    }
  }, [userState, id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await dispatch(userUpdate(formData));
      navigate('/user/list');
    } catch (err: any) {
      setError(err.message || 'Gagal update user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Pengguna</h1>
          <p className="text-gray-600 mt-1">Ubah data user {formData.nama || ''}</p>
        </div>
        <Button variant="outline-primary" onClick={() => navigate('/user')}>
          Kembali
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-lg border p-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nama"
                value={formData.nama}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password Baru (kosongkan jika tidak diubah)
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Kosongkan jika tidak ubah"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kode User <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="kode_user"
                value={formData.kode_user}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jabatan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="jabatan"
                value={formData.jabatan}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="kasir">Kasir</option>
                <option value="admin">Admin</option>
                <option value="owner">Owner</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" variant="primary" className="flex-1" disabled={loading}>
              Update User
            </Button>
            <Button type="button" variant="outline-primary" onClick={() => navigate('/user/list')} className="flex-1">
              Batal
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserEdit;

