import React, { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import { jurnalGet } from '@/stores/JurnalSlice';
import { TransaksiGet } from '@/stores/TransaksiSlice';
import { getPembelian } from '@/stores/PembelianSlice';
import { getBarangList } from '@/stores/BarangSlice';
import { IJurnalKas, ITransaksi, IPembelian, IBarang } from '@/utils/types';
import Button from '@/components/Base/Button';
import { FormSelect } from '@/components/Base/Form';
import Lucide from '@/components/Base/Lucide';
import { useNavigate } from 'react-router-dom';
import PaketSelect from '@/views/upgrade/PaketSelect';
import { setActiveStoreId } from '@/stores/AdminSlice';

const Dashboard = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const jurnalData = useAppSelector((state) => state.JurnalSlice);
  const transaksiData = useAppSelector((state) => state.TransaksiSlice);
  const pembelianData = useAppSelector((state) => state.PembelianSlice);
  const barangData = useAppSelector((state) => state.BarangSlice);
  const { isLogin, activeStoreId } = useAppSelector((state) => state.AdminSlice);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Normalisasi data dari Redux state untuk memastikan filter() tidak crash
  // Kita mengecek properti .data jika backend masih mengirim pembungkus, 
  // atau langsung menggunakan payload jika sudah dinormalkan.
  const jurnal = Array.isArray(jurnalData.jurnal) ? jurnalData.jurnal : (jurnalData.jurnal as any)?.data || [];
  const transaksi = Array.isArray(transaksiData.transaksi) ? transaksiData.transaksi : (transaksiData.transaksi as any)?.data || [];
  const pembelian = Array.isArray(pembelianData.pembelianList) ? pembelianData.pembelianList : (pembelianData.pembelianList as any)?.data || [];
  const barang = Array.isArray(barangData.BarangList) ? barangData.BarangList : (barangData.BarangList as any)?.data || [];

  const availableStores = isLogin?.available_stores || [];
  const tipeBisnis = isLogin?.tipe_bisnis;

  useEffect(() => {
    dispatch(jurnalGet());
    dispatch(TransaksiGet());
    dispatch(getPembelian());
    dispatch(getBarangList());
  }, [dispatch, activeStoreId]);

  // KPIs
  // Menggunakan Jurnal sebagai sumber data keuangan agar lebih sinkron dengan arus kas real
  const totalPenjualan = jurnal
    .filter((j: IJurnalKas) => ['penjualan', 'service'].includes(j.status))
    .reduce((sum: number, j: IJurnalKas) => sum + (j.saldo_masuk || 0), 0);

  const totalPembelian = jurnal
    .filter((j: IJurnalKas) => j.status === 'pembelian')
    .reduce((sum: number, j: IJurnalKas) => sum + (j.saldo_keluar || 0), 0);

  const saldoAkhir = jurnal[0]?.saldo_akhir || 0; // Jurnal diurutkan descending (_id: -1) di backend
  const labaBersih = totalPenjualan - totalPembelian;
  const jumlahTransaksi = jurnal.filter((j: IJurnalKas) => ['penjualan', 'service'].includes(j.status)).length;

  // Dinamis: Hitung barang yang stoknya di bawah 10 (sebagai limit minimum)
  const lowStockCount = barang.filter((item: IBarang) => (Number(item.stok) || 0) < 10).length;

  // Fitur Best Seller: Agregasi produk yang paling banyak terjual
  const bestSellers = useMemo(() => {
    const itemMap: Record<string, { name: string; total: number }> = {};

    transaksi.forEach((t: ITransaksi) => {
      if (t.status_transaksi !== 'void') {
        t.items?.forEach((item) => {
          const key = item.kode_barang;
          if (!itemMap[key]) {
            itemMap[key] = { name: item.nama_barang, total: 0 };
          }
          itemMap[key].total += Number(item.jumlah) || 0;
        });
      }
    });

    return Object.values(itemMap).sort((a, b) => b.total - a.total).slice(0, 5);
  }, [transaksi]);

  // Peringatan Stok: Hitung barang yang benar-benar habis (nol)
  const zeroStockCount = barang.filter((item: IBarang) => (Number(item.stok) || 0) <= 0).length;

  // Hitung Sisa Hari Langganan
  const daysRemaining = useMemo(() => {
    const expiryData: any = isLogin?.subscription_expiry;
    if (!expiryData) {
      console.warn("Debug Subscription: Expiry data is missing in state.");
      return null;
    }

    // Handle format Mongoose Date, String ISO, atau object MongoDB $date
    let dateValue = expiryData;
    if (expiryData && typeof expiryData === 'object' && expiryData.$date) {
      dateValue = expiryData.$date;
    }

    const expiry = new Date(dateValue);

    if (isNaN(expiry.getTime())) {
      console.error("Debug Subscription: Invalid Date Format", expiryData);
      return null;
    }

    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    console.log("Debug Subscription: Days Remaining ->", diffDays);
    return diffDays;
  }, [isLogin?.subscription_expiry]);

  // Chart data (recent 7 days)
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);

    const sales = jurnal.filter((j: IJurnalKas) => {
      const jDate = new Date(j.tanggal_transaksi);
      jDate.setHours(0, 0, 0, 0);
      return jDate.getTime() === d.getTime() && ['penjualan', 'service'].includes(j.status);
    }).reduce((sum: number, j: IJurnalKas) => sum + (j.saldo_masuk || 0), 0);

    return { label: d.toLocaleDateString('id-ID', { weekday: 'short' }), value: sales };
  }).reverse();

  // Recent 5 transactions
  const recentTransaksi = [
    ...transaksi,
    ...pembelian
  ].sort((a, b) => {
    const dateA = new Date((a as any).tgl_penjualan || (a as any).tanggal_pembelian || 0);
    const dateB = new Date((b as any).tgl_penjualan || (b as any).tanggal_pembelian || 0);
    return dateB.getTime() - dateA.getTime();
  }).slice(0, 5);

  const isLoading = false;

  // Helper untuk Badge Langganan
  const getSubscriptionBadge = () => {
    const plan = isLogin?.subscription_plan || 'free';
    const status = isLogin?.subscription_status || 'trial';

    const colors: Record<string, string> = {
      trial: 'bg-pending/20 text-pending border-pending/20',
      active: 'bg-success/20 text-success border-success/20',
      enterprise: 'bg-success/20 text-success border-success/20', // Tambahkan mapping untuk enterprise
      expired: 'bg-danger/20 text-danger border-danger/20',
      canceled: 'bg-slate-200 text-slate-500 border-slate-300'
    };

    const statusColor = colors[status] || 'bg-slate-100 text-slate-600 border-slate-200';

    return (
      <div className="flex items-center px-4 py-2 border rounded-lg box intro-y bg-white/50 backdrop-blur-sm">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary mr-3">
          <Lucide icon="Zap" className="w-4 h-4" />
        </div>
        <div className="mr-4">
          <div className="text-[10px] text-slate-500 uppercase font-bold leading-none">Paket</div>
          <div className="text-sm font-bold text-slate-700 capitalize leading-tight">{plan}</div>
        </div>
        <div className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full border ${statusColor}`}>
          {status}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Overview kasir & keuangan bulan ini</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {isLogin?.role === 'owner' && getSubscriptionBadge()}
          {isLogin?.role === 'owner' && (
            <Button variant="outline-primary" onClick={() => setShowUpgradeModal(true)} className="flex items-center gap-2">
              <Lucide icon="Zap" className="w-4 h-4" /> Upgrade Paket
            </Button>
          )}
          {availableStores.length > 0 && (
            <FormSelect
              value={activeStoreId || ""}
              onChange={(e) => dispatch(setActiveStoreId(e.target.value))}
              className="w-48"
            >
              <option value="" disabled>Pilih Cabang</option>
              {availableStores.map((store) => (
                <option key={store._id} value={store._id}>{store.nama_store}</option>
              ))}
            </FormSelect>
          )}
          <Button variant="primary" onClick={() => navigate('/transaksi/pos')}>
            Buat Transaksi
          </Button>
          {tipeBisnis === 'bengkel' && (
            <Button variant="warning" onClick={() => navigate('/bengkel/spk/baru')}>
              Buat SPK
            </Button>
          )}
        </div>
      </header>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Banner Peringatan Langganan (Muncul jika <= 4 hari atau sudah habis) */}
          {daysRemaining !== null && daysRemaining <= 4 && (
            <div className={`w-full px-5 py-3 rounded-lg flex items-center mb-6 intro-y shadow-sm border ${
              daysRemaining <= 0 
                ? "bg-danger/10 border-danger/20 text-danger" 
                : "bg-pending/10 border-pending/20 text-pending"
            }`}>
              <Lucide icon={daysRemaining <= 0 ? "AlertOctagon" : "Clock"} className="w-5 h-5 mr-4 flex-shrink-0" />
              <div className="flex-1 text-sm font-medium">
                <span className="font-bold uppercase tracking-tight">Perhatian:</span> Masa langganan {isLogin?.subscription_status === 'trial' ? 'Trial' : ''} Anda {daysRemaining > 0 ? `akan berakhir dalam ${daysRemaining} hari lagi` : 'telah berakhir'}. Harap segera hubungi admin atau lakukan perpanjangan paket agar operasional kasir tidak terganggu.
              </div>
              <Button 
                variant={daysRemaining <= 0 ? "danger" : "warning"} 
                size="sm" 
                className="ml-4 whitespace-nowrap"
                onClick={() => setShowUpgradeModal(true)}
              >
                {daysRemaining <= 0 ? "Aktifkan Sekarang" : "Upgrade Sekarang"}
              </Button>
            </div>
          )}

          {/* Peringatan Stok Nol */}
          {zeroStockCount > 0 && (
            <div className="flex items-center px-5 py-4 border rounded-lg box intro-y bg-danger/10 border-danger/20 text-danger mb-6">
              <Lucide icon="AlertTriangle" className="w-6 h-6 mr-4 flex-shrink-0" />
              <div className="mr-auto">
                <div className="font-bold text-lg leading-none uppercase tracking-wide">Peringatan: Stok Habis</div>
                <div className="mt-1 text-sm opacity-90">
                  Terdapat <span className="font-bold">{zeroStockCount} item</span> barang yang stoknya kosong (0). Segera lakukan pengadaan stok baru untuk menjaga kelancaran transaksi.
                </div>
              </div>
              <Button 
                variant="danger" 
                size="sm" 
                className="ml-4 whitespace-nowrap shadow-md"
                onClick={() => navigate('/laporan/stok_laporan')}
              >
                Periksa Daftar Barang
              </Button>
            </div>
          )}

          {/* KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div 
              className="bg-white px-6 py-8 rounded-2xl shadow-xl border hover:shadow-2xl transition-all h-[140px] flex items-center cursor-pointer"
              onClick={() => navigate('/transaksi/penjualan')}
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3 .921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-500 mb-1">Total Penjualan</p>
                  <p className="text-2xl font-bold text-green-600 leading-tight whitespace-nowrap">Rp {totalPenjualan.toLocaleString('id-ID')}</p>
                </div>
              </div>
            </div>

            <div 
              className="bg-white px-6 py-8 rounded-2xl shadow-xl border hover:shadow-2xl transition-all h-[140px] flex items-center cursor-pointer"
              onClick={() => navigate('/inventaris/barang_masuk')}
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg flex-shrink-0">
                  <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h10.5a1.5 1.5 0 01.913.584l.72 1.44a1.5 1.5 0 01.582.913H9a1 1 0 000 2h6.5a2 2 0 002-2V5a1 1 0 00-1-1H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-500 mb-1">Total Pembelian</p>
                  <p className="text-2xl font-bold text-orange-600 leading-tight whitespace-nowrap">Rp {totalPembelian.toLocaleString('id-ID')}</p>
                </div>
              </div>
            </div>

            <div 
              className="bg-white px-6 py-8 rounded-2xl shadow-xl border hover:shadow-2xl transition-all h-[140px] flex items-center cursor-pointer"
              onClick={() => navigate('/laporan/keuangan')}
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-100 rounded-lg flex-shrink-0">
                  <svg className="w-6 h-6 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-500 mb-1">Laba Bersih</p>
                  <p className={`text-2xl font-bold ${labaBersih >= 0 ? 'text-emerald-600' : 'text-red-600'} leading-tight whitespace-nowrap`}>Rp {labaBersih.toLocaleString('id-ID')}</p>
                </div>
              </div>
            </div>

            <div 
              className="bg-white px-6 py-8 rounded-2xl shadow-xl border hover:shadow-2xl transition-all h-[140px] flex items-center cursor-pointer"
              onClick={() => navigate('/jurnal/list')}
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 6.657 6 7v3.103c0 .344.574.915 1.324 1.25.49.226.986.388 1.5.469V13a1 1 0 102 0v-.638c.514-.081 1.01-.243 1.5-.47.75-.335 1.324-.906 1.324-1.25V7c0-.343-.602-.766-1.324-1.023A4.535 4.535 0 0011 5.092V5z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-500 mb-1">Saldo Kas</p>
                  <p className="text-2xl font-bold text-blue-600 leading-tight whitespace-nowrap">Rp {saldoAkhir.toLocaleString('id-ID')}</p>
                </div>
              </div>
            </div>

            <div 
              className="bg-white px-6 py-8 rounded-2xl shadow-xl border hover:shadow-2xl transition-all h-[140px] flex items-center cursor-pointer"
              onClick={() => navigate('/transaksi/penjualan')}
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                  <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-500 mb-1">Transaksi</p>
                  <p className="text-2xl font-bold text-purple-600 leading-tight whitespace-nowrap">{jumlahTransaksi}</p>
                </div>
              </div>
            </div>

            <div 
              className="bg-white px-6 py-8 rounded-2xl shadow-xl border hover:shadow-2xl transition-all h-[140px] flex items-center cursor-pointer"
              onClick={() => navigate('/laporan/stok_laporan')}
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg flex-shrink-0">
                  <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 14a4 4 0 100-8 4 4 0 000 8z" />
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-500 mb-1">Low Stock</p>
                  <p className="text-2xl font-bold text-red-600 leading-tight whitespace-nowrap">{lowStockCount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts & Recent */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-lg border p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Tren Penjualan (7 Hari)</h3>
                <div className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded">
                  Total: Rp {chartData.reduce((s, c) => s + c.value, 0).toLocaleString('id-ID')}
                </div>
              </div>
              <div className="h-64 flex items-end justify-between gap-3 px-2">
                {chartData.map((day, idx) => {
                  const maxVal = Math.max(...chartData.map(d => d.value), 1);
                  const barHeight = (day.value / maxVal) * 100;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-3 group relative">
                      <div className="absolute bottom-full mb-2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-lg">
                        Rp {day.value.toLocaleString('id-ID')}
                      </div>
                      <div className="w-full bg-slate-50 rounded-t-lg h-48 flex flex-col justify-end overflow-hidden border border-dashed border-slate-200">
                        <div 
                          style={{ height: `${barHeight}%` }}
                          className={`w-full transition-all duration-700 ease-out rounded-t-sm ${barHeight > 0 ? 'bg-gradient-to-t from-primary/80 to-primary' : 'bg-transparent'}`}
                        ></div>
                      </div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{day.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Lucide icon="Trophy" className="w-5 h-5 text-warning" /> Produk Terlaris
                </h3>
              </div>
              <div className="space-y-4">
                {bestSellers.length > 0 ? (
                  bestSellers.map((item, i) => (
                    <div key={i} className="flex items-center justify-between border-b border-slate-50 pb-2 last:border-0 transition-all hover:pl-1">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-700 truncate w-32 xl:w-40" title={item.name}>{item.name}</span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Terjual {item.total} unit</span>
                      </div>
                      <div className={`text-xs font-bold px-2 py-1 rounded-lg ${i === 0 ? 'bg-warning/20 text-warning border border-warning/10' : 'bg-slate-100 text-slate-500'}`}>
                        #{i + 1}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-48 flex items-center justify-center text-slate-400 text-sm italic">Belum ada data penjualan</div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Quick Actions</h3>
              </div>
              <div className="space-y-2">
                <Button variant="success" className="w-full flex items-center justify-center gap-2" onClick={() => navigate('/transaksi/pos')}>
                  <Lucide icon="ShoppingCart" className="w-4 h-4" /> Penjualan Baru
                </Button>
                <Button variant="pending" className="w-full flex items-center justify-center gap-2" onClick={() => navigate('/inventaris/barang_masuk_input')}>
                  <Lucide icon="Package" className="w-4 h-4" /> Barang Masuk
                </Button>
                <Button variant="primary" className="w-full flex items-center justify-center gap-2" onClick={() => navigate('/laporan/penjualan')}>
                  <Lucide icon="FileText" className="w-4 h-4" /> Lihat Laporan
                </Button>
                <Button variant="dark" className="w-full flex items-center justify-center gap-2" onClick={() => navigate('/inventaris/kartu_stok')}>
                  <Lucide icon="ClipboardList" className="w-4 h-4" /> Kartu Stok
                </Button>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
            <div className="p-6 border-b bg-gray-50">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Transaksi Terbaru</h3>
                <Button variant="outline-primary" size="sm" onClick={() => navigate('/jurnal/list')}>
                  Lihat Semua
                </Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-white">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentTransaksi.map((item, index) => {
                    const isTransaksi = 'tgl_penjualan' in item;
                    const dateString = isTransaksi ? (item as ITransaksi).tgl_penjualan : (item as IPembelian).tanggal_pembelian;
                    
                    const handleRowClick = () => {
                      if (isTransaksi) {
                        navigate(`/transaksi/detail_penjualan/${(item as ITransaksi).no_penjualan}`);
                      } else {
                        navigate(`/inventaris/detail_barang_masuk/${(item as IPembelian).no_pembelian}`);
                      }
                    };

                    return (
                    <tr 
                      key={index} 
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={handleRowClick}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {new Date(dateString || '').toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                        {isTransaksi ? 'Penjualan' : 'Pembelian'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                        Rp {Number(item.total_harga || 0).toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Selesai
                        </span>
                      </td>
                      </tr>
                    );
                  })}
                  {recentTransaksi.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                        Belum ada transaksi
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Modal Paket Select */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-6xl my-auto">
            <button
              onClick={() => setShowUpgradeModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 z-[110] p-2 bg-white rounded-full shadow-md transition-colors"
            >
              <Lucide icon="X" className="w-6 h-6" />
            </button>
            <PaketSelect onClose={() => setShowUpgradeModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;