import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import { userGet, userUpdateAccessMenu } from '@/stores/UserSlice';
import SideMenu from '@/main/menu/SideMenu';
import Button from '@/components/Base/Button';
import { FormSelect, FormCheck, FormLabel } from '@/components/Base/Form';
import Lucide from '@/components/Base/Lucide';
import { Menu } from '@/stores/menuSlice';
import { useParams, useNavigate } from 'react-router-dom';

const UserSetMenu = () => {
  const dispatch = useAppDispatch();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userData } = useAppSelector((state) => state.UserSlice);
  const currentUser = useAppSelector((state) => state.AdminSlice.isLogin);
  
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [tempAccessMenu, setTempAccessMenu] = useState<string[]>([]);

  useEffect(() => {
    dispatch(userGet());
  }, [dispatch]);

  useEffect(() => {
    if (currentUser && currentUser.role !== 'owner') {
      navigate('/');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    // Sinkronisasi data user terpilih ke local state hanya saat id atau data berubah
    if (id && id !== 'all' && userData.length > 0) {
      const targetUser = userData.find(u => u._id === id);
      if (targetUser) {
        setSelectedUserId(id);
        setTempAccessMenu(targetUser.access_menu || []);
      }
    } else if (!id || id === 'all') {
      setSelectedUserId("");
      setTempAccessMenu([]);
    }
  }, [id, userData]);

  const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = e.target.value;
    navigate(userId ? `/user/set_menu/${userId}` : '/user/set_menu/all');
  };

  const toggleMenu = useCallback((slug: string, isParent: boolean = false, childSlugs: string[] = []) => {
    setTempAccessMenu(prev => {
      const isRemoving = prev.includes(slug);
      
      if (isRemoving) {
        let newList = prev.filter(s => s !== slug);
        
        // Jika mematikan menu utama (Parent), otomatis matikan semua sub-menunya (Children)
        if (isParent && childSlugs.length > 0) {
          newList = newList.filter(s => !childSlugs.includes(s));
        }
        return newList;
      } else {
        // Menambah menu
        return [...prev, slug];
      }
      });
  }, []);

  const handleSave = async () => {
    if (!selectedUserId) return;
    
    try {
      await dispatch(userUpdateAccessMenu({ 
        userId: selectedUserId, 
        access_menu: tempAccessMenu 
      })).unwrap();
      alert("Hak akses berhasil diperbarui!");
    } catch (error) {
      alert("Gagal memperbarui hak akses");
    }
  };

  // Filter staf (Owner tidak perlu diatur karena memiliki semua akses)
  const staffOptions = useMemo(() => userData.filter(u => u.role !== 'owner'), [userData]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hak Akses Menu</h1>
          <p className="text-gray-600">Batasi menu yang dapat dilihat oleh Admin dan Kasir</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline-secondary" onClick={() => navigate('/user')}>Kembali</Button>
          <Button variant="primary" onClick={handleSave} disabled={!selectedUserId}>
            <Lucide icon="Save" className="w-4 h-4 mr-2" />
            <span>Simpan Perubahan</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Kiri: Pilih User */}
        <div className={`col-span-12 lg:col-span-4 ${id && id !== 'all' ? 'hidden lg:block' : ''}`}>
          <div className="box p-5">
            <FormLabel htmlFor="select-user">Pilih Pengguna (Staf)</FormLabel>
            <FormSelect id="select-user" value={selectedUserId} onChange={handleUserChange}>
              <option value="">-- Pilih User --</option>
              {staffOptions.map(user => (
                <option key={user._id} value={user._id}>
                  {user.nama} ({user.jabatan})
                </option>
              ))}
            </FormSelect>
            {id && id !== 'all' && (
              <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <p className="text-xs text-primary font-medium uppercase tracking-wider">User terpilih dari tabel</p>
                <p className="text-sm font-bold text-slate-700">{userData.find(u => u._id === id)?.nama}</p>
              </div>
            )}
          </div>
        </div>

        {/* Kanan: Daftar Menu */}
        <div className={`col-span-12 ${id && id !== 'all' ? 'lg:col-span-12' : 'lg:col-span-8'}`}>
          <div className="box p-5 space-y-4">
            {!selectedUserId ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Lucide icon="UserCheck" className="w-12 h-12 mb-2 opacity-20" />
                <p className="italic">Silakan pilih pengguna terlebih dahulu untuk mengatur hak akses</p>
              </div>
            ) : (
              <div className="space-y-6">
                {SideMenu.map((item, index) => {
                  if (typeof item === 'string') {
                    return <div key={index} className="text-xs font-bold tracking-wider uppercase text-slate-500 mt-6 first:mt-0 border-b pb-2">{item}</div>;
                  }

                  return (
                    <div key={index} className="space-y-3">
                      {/* Baris Menu Utama (Contoh: Inventaris, Transaksi) */}
                      {item.slug && !item.ignore && (
                        <div className={`flex items-center p-3 border rounded-lg ${tempAccessMenu.includes(item.slug) ? 'bg-primary/5 border-primary/20' : 'bg-slate-50/50'}`}>
                          <FormCheck.Input 
                            id={`menu-${index}`}
                            type="checkbox" 
                            checked={tempAccessMenu.includes(item.slug)} 
                            onChange={() => {
                              const children = item.subMenu?.map(s => s.slug).filter((s): s is string => !!s) || [];
                              toggleMenu(item.slug as string, true, children);
                            }}
                          />
                          <FormCheck.Label htmlFor={`menu-${index}`} className="ml-3 flex items-center font-medium cursor-pointer">
                            <Lucide icon={item.icon} className={`w-4 h-4 mr-2 ${tempAccessMenu.includes(item.slug) ? 'text-primary' : 'text-slate-400'}`} />
                            {item.title}
                          </FormCheck.Label>
                        </div>
                      )}

                      {/* Baris Sub Menu (Contoh: Barang Masuk, Penjualan POS) */}
                      {item.subMenu && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-8">
                          {item.subMenu.filter(sub => sub.slug && !sub.ignore).map((sub, subIdx) => (
                            <div 
                                key={`${index}-${subIdx}`} 
                                className={`flex items-center p-2 border border-dashed rounded-lg transition-all ${
                                  !tempAccessMenu.includes(item.slug || '')
                                    ? 'bg-slate-100 opacity-50 cursor-not-allowed select-none' 
                                    : 'hover:bg-slate-50'
                                }`}
                            >
                              <FormCheck.Input 
                                id={`sub-${index}-${subIdx}`}
                                type="checkbox" 
                                disabled={!tempAccessMenu.includes(item.slug || '')} // Sub-menu mati jika Parent mati
                                checked={tempAccessMenu.includes(sub.slug as string)} 
                                onChange={() => toggleMenu(sub.slug as string)}
                              />
                              <FormCheck.Label htmlFor={`sub-${index}-${subIdx}`} className="ml-3 flex items-center text-sm cursor-pointer">
                                <Lucide icon={sub.icon} className="w-4 h-4 mr-2 text-slate-400" />
                                {sub.title}
                              </FormCheck.Label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSetMenu;