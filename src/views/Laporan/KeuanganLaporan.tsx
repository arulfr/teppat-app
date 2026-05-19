import React, { useEffect, useState, useMemo } from 'react';
// No date-fns needed - use native
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import { IJurnalKas } from '@/utils/types';
import { exportToExcel, exportToPDF } from '@/utils/ExportHelper';
import { jurnalGet } from '@/stores/JurnalSlice';
// Chart component - import the correct chart component
// SimpleLineChart props not matching - disable chart for now
// Alternative date utils if no date-fns
// const formatDate = (date: string | Date) => new Date(date).toLocaleDateString('id-ID');

const KeuanganLaporan = () => {
  const dispatch = useAppDispatch();
  const jurnalData = useAppSelector((state) => state.JurnalSlice);
  const jurnal = jurnalData.jurnal || [];
  const [viewMode, setViewMode] = useState<'date' | 'month'>('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dispatch(jurnalGet());
  }, [dispatch]);

  useEffect(() => {
    setLoading(false);
  }, [jurnal]);

// Filter flexible
  const filteredJurnal = useMemo(() => {
    if (!jurnal.length) return [];
    let start, end;
    if (viewMode === 'month') {
      start = new Date(selectedYear, selectedMonth - 1, 1);
      end = new Date(selectedYear, selectedMonth, 0);
    } else {
      start = new Date(startDate);
      end = new Date(endDate);
    }
    end.setHours(23, 59, 59, 999);
    return jurnal.filter((item: IJurnalKas) => {
      const date = new Date(item.tanggal_transaksi);
      return date >= start && date <= end;
    }).sort((a: IJurnalKas, b: IJurnalKas) => new Date(a.tanggal_transaksi).getTime() - new Date(b.tanggal_transaksi).getTime());
  }, [jurnal, viewMode, startDate, endDate, selectedMonth, selectedYear]);

  // Aggregates
  const totals = useMemo(() => {
    let pemasukan = 0;
    let pengeluaran = 0;
    const statusGroups: Record<string, number> = {};

    filteredJurnal.forEach((item: IJurnalKas) => {
      if (['pemasukan', 'penjualan'].includes(item.status)) {
        pemasukan += Number(item.saldo_masuk) || 0;
      }
      if (['pembelian', 'pengeluaran'].includes(item.status)) {
        pengeluaran += Number(item.saldo_keluar) || 0;
      }
      statusGroups[item.status] = (statusGroups[item.status] || 0) + (item.status === 'penjualan' ? Number(item.saldo_masuk) || 0 : Number(item.saldo_keluar) || 0);
    });

    const labaRugi = pemasukan - pengeluaran;
    const saldoAkhir = filteredJurnal[filteredJurnal.length - 1]?.saldo_akhir || 0;

    return { pemasukan, pengeluaran, labaRugi, saldoAkhir, statusGroups };
  }, [filteredJurnal]);

// Chart data disabled

  // Flat export data
  const exportData = useMemo(() => 
    filteredJurnal.map((item: IJurnalKas, index: number) => ({
      No: index + 1,
      Tanggal: new Date(item.tanggal_transaksi || new Date()).toLocaleDateString('id-ID'),
      Keterangan: item.keterangan || '-',
      Masuk: (Number(item.saldo_masuk) || 0).toLocaleString('id-ID'),
      Keluar: (Number(item.saldo_keluar) || 0).toLocaleString('id-ID'),
      Saldo: (Number(item.saldo_akhir) || 0).toLocaleString('id-ID'),
      Status: item.status?.toUpperCase() || '',
    })), 
  [filteredJurnal]);

  const handleExportExcel = () => {
    exportToExcel(exportData, 'Laporan_Keuangan');
  };

  const handleExportPDF = () => {
    exportToPDF(exportData, 'Laporan Keuangan', 'Laporan_Keuangan');
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
<div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">
              Laporan Keuangan {viewMode === 'month' 
                ? new Date(selectedYear, selectedMonth - 1, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
                : `${startDate ? new Date(startDate).toLocaleDateString('id-ID') : ''} - ${endDate ? new Date(endDate).toLocaleDateString('id-ID') : ''}`
              }
            </h1>
            <div className="flex items-center gap-2">
              <select value={viewMode} onChange={(e) => setViewMode(e.target.value as 'date' | 'month')} className="px-3 py-1 border rounded-md">
                <option value="month">Bulanan</option>
                <option value="date">Custom Date</option>
              </select>
            </div>
          </div>
          <div className={`flex flex-col sm:flex-row gap-2 ${viewMode === 'month' ? 'block' : 'block'}`}>
            {viewMode === 'month' && (
              <div className="flex flex-col sm:flex-row gap-2">
                <select 
                  value={selectedMonth} 
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Array.from({length: 12}, (_, i) => (
                    <option key={i+1} value={i+1}>{new Date(0, i).toLocaleDateString('id-ID', { month: 'long' })}</option>
                  ))}
                </select>
                <select 
                  value={selectedYear} 
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Array.from({length: 6}, (_, i) => {
                    const year = new Date().getFullYear() - i;
                    return <option key={year} value={year}>{year}</option>
                  })}
                </select>
              </div>
            )}
            {viewMode === 'date' && (
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Pemasukan</h3>
          <p className="text-2xl font-bold text-green-600">Rp {totals.pemasukan.toLocaleString('id-ID')}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Pengeluaran</h3>
          <p className="text-2xl font-bold text-red-600">Rp {totals.pengeluaran.toLocaleString('id-ID')}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Laba / Rugi</h3>
          <p className={`text-2xl font-bold ${totals.labaRugi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            Rp {totals.labaRugi.toLocaleString('id-ID')}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Saldo Akhir</h3>
          <p className="text-2xl font-bold text-blue-600">Rp {totals.saldoAkhir.toLocaleString('id-ID')}</p>
        </div>
      </div>

      {/* Chart */}
 {/* Chart disabled - SimpleLineChart props mismatch. Use ReportLineChart or custom if needed */}
 {/* Chart section - props fixed or disabled */}
      {false && (
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-lg font-semibold mb-4">Perkembangan Saldo</h3>
        </div>
      )}

      {/* Export Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleExportExcel}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
          disabled={!exportData.length}
        >
          Export Excel
        </button>
        <button
          onClick={handleExportPDF}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          disabled={!exportData.length}
        >
          Export PDF
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md border overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Detail Transaksi</h3>
          <p className="text-sm text-gray-500 mt-1">{filteredJurnal.length} transaksi</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keterangan</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Masuk</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Keluar</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Saldo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredJurnal.map((item: IJurnalKas, index: number) => (
                <tr key={item._id || index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(item.tanggal_transaksi).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{item.keterangan || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 text-right">
                    Rp {(Number(item.saldo_masuk) || 0).toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 text-right">
                    Rp {(Number(item.saldo_keluar) || 0).toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                    Rp {(Number(item.saldo_akhir) || 0).toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.status === 'penjualan' || item.status === 'pemasukan' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredJurnal.length === 0 && (
          <div className="text-center py-12 text-gray-500">Tidak ada data transaksi untuk periode ini</div>
        )}
      </div>
    </div>
  );
};

export default KeuanganLaporan;

