import React, { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import Button from '@/components/Base/Button';
import Lucide from '@/components/Base/Lucide';
import Table from '@/components/Base/Table';
import { Menu } from '@/components/Base/Headless';
import SearchPages from '../Components/SearchPages';
import { exportToExcel, exportToPDF, printLayar } from '@/utils/ExportHelper';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import { TransaksiBarangGet } from '@/stores/TransaksiSlice';
import { FilterParams } from '@/utils/types';
import { toast } from 'react-toastify';

const LaporanBarangLaku = () => {
  const dispatch = useAppDispatch();
  const { transaksiBarang } = useAppSelector(state => state.TransaksiSlice);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [limit, setLimit] = useState(10); // Menampilkan Top/Bottom N

  const fetchData = useCallback(() => {
    const params: FilterParams = {
      startDate: startDate || '',
      endDate: endDate || '',
    };
    dispatch(TransaksiBarangGet(params));
  }, [dispatch, startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTerapkanFilterTanggal = () => {
    if ((startDate && !endDate) || (!startDate && endDate)) {
      toast.warning('Pilih tanggal awal dan akhir', { position: 'top-right', autoClose: 3000 });
      return;
    }
    fetchData();
  };

  const handleResetFilter = () => {
    setSearchQuery('');
    setStartDate('');
    setEndDate('');
    dispatch(TransaksiBarangGet(undefined));
  };

  // Agregasi Data: Mengelompokkan transaksi per barang
  const aggregatedData = useMemo(() => {
    const map = new Map<string, { kode_barang: string; nama_barang: string; total_qty: number; total_sales: number }>();

    transaksiBarang.forEach((item) => {
      const existing = map.get(item.kode_barang);
      if (existing) {
        existing.total_qty += item.jumlah || 0;
        existing.total_sales += item.sub_total || 0;
      } else {
        map.set(item.kode_barang, {
          kode_barang: item.kode_barang,
          nama_barang: item.nama_barang,
          total_qty: item.jumlah || 0,
          total_sales: item.sub_total || 0,
        });
      }
    });

    const list = Array.from(map.values());

    // Filter berdasarkan pencarian
    return list.filter(
      (item) =>
        item.nama_barang.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.kode_barang.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [transaksiBarang, searchQuery]);

  // Pisahkan Top (Paling Laku) dan Bottom (Kurang Laku)
  const dataPalingLaku = useMemo(() => [...aggregatedData].sort((a, b) => b.total_qty - a.total_qty).slice(0, limit), [aggregatedData, limit]);
  const dataKurangLaku = useMemo(() => [...aggregatedData].sort((a, b) => a.total_qty - b.total_qty).slice(0, limit), [aggregatedData, limit]);

  const dataExport = (source: any[]) => {
    return source.map((item, index) => ({
      No: index + 1,
      'Kode Barang': item.kode_barang,
      'Nama Barang': item.nama_barang,
      'Total Terjual (Qty)': item.total_qty,
      'Total Penjualan (Rp)': item.total_sales,
    }));
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 intro-y">
        <h2 className="text-lg font-medium">Analisa Penjualan Barang</h2>
        <div className="flex items-center gap-2">
          <SearchPages searchQuery={searchQuery} handleSearchChange={(e) => setSearchQuery(e.target.value)} />
          <select 
            className="form-select box w-32" 
            value={limit} 
            onChange={(e) => setLimit(Number(e.target.value))}
          >
            <option value={5}>Top 5</option>
            <option value={10}>Top 10</option>
            <option value={20}>Top 20</option>
            <option value={50}>Top 50</option>
          </select>
        </div>
      </div>

      {/* Filter Section */}
      <div className="flex flex-wrap items-center mt-5 intro-y gap-3">
        <div className="flex items-center box px-3 py-2 border-slate-200 bg-white shadow-sm rounded-md">
          <Lucide icon="Calendar" className="w-4 h-4 mr-2 text-slate-500" />
          <input
            type="date"
            className="w-28 bg-transparent border-none outline-none p-0 text-sm text-slate-700 focus:ring-0"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <span className="mx-2 text-slate-400">-</span>
          <input
            type="date"
            className="w-28 bg-transparent border-none outline-none p-0 text-sm text-slate-700 focus:ring-0"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <div className="flex items-center gap-3 pl-3 ml-2 border-l border-slate-200">
            <button onClick={handleTerapkanFilterTanggal} className="text-slate-500 hover:text-success">
              <Lucide icon="Filter" className="w-4 h-4" />
            </button>
            <button onClick={handleResetFilter} className="text-slate-500 hover:text-danger">
              <Lucide icon="X" className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 mt-8">
        {/* Tabel Barang Paling Laku */}
        <div className="col-span-12 lg:col-span-6 intro-y">
          <div className="flex items-center h-10 mb-2">
            <h3 className="text-lg font-medium text-success flex items-center">
              <Lucide icon="TrendingUp" className="w-5 h-5 mr-2" /> Barang Paling Laku (Top {limit})
            </h3>
            <Button 
              variant="outline-secondary" 
              size="sm" 
              className="ml-auto"
              onClick={() => exportToExcel(dataExport(dataPalingLaku), `Top_Barang_${Date.now()}`)}
            >
              Excel
            </Button>
          </div>
          <div className="overflow-x-auto box p-4">
            <Table className="border-separate border-spacing-y-[10px] -mt-2">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th className="border-b-0 whitespace-nowrap">Nama Barang</Table.Th>
                  <Table.Th className="border-b-0 whitespace-nowrap text-center">Qty</Table.Th>
                  <Table.Th className="border-b-0 whitespace-nowrap text-right">Total Nilai</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {dataPalingLaku.map((item, idx) => (
                  <Table.Tr key={item.kode_barang} className="intro-x">
                    <Table.Td className="bg-white border-b-0 shadow-[20px_3px_20px_#0000000b]">
                      <div className="font-medium">{item.nama_barang}</div>
                      <div className="text-slate-500 text-xs mt-0.5">{item.kode_barang}</div>
                    </Table.Td>
                    <Table.Td className="text-center bg-white border-b-0 shadow-[20px_3px_20px_#0000000b] font-bold text-success">
                      {item.total_qty.toLocaleString('id-ID')}
                    </Table.Td>
                    <Table.Td className="text-right bg-white border-b-0 shadow-[20px_3px_20px_#0000000b]">
                      Rp {item.total_sales.toLocaleString('id-ID')}
                    </Table.Td>
                  </Table.Tr>
                ))}
                {dataPalingLaku.length === 0 && (
                  <Table.Tr><Table.Td colSpan={3} className="text-center py-10 text-slate-500">Data tidak ditemukan</Table.Td></Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </div>
        </div>

        {/* Tabel Barang Kurang Laku */}
        <div className="col-span-12 lg:col-span-6 intro-y">
          <div className="flex items-center h-10 mb-2">
            <h3 className="text-lg font-medium text-danger flex items-center">
              <Lucide icon="TrendingDown" className="w-5 h-5 mr-2" /> Barang Kurang Laku (Bottom {limit})
            </h3>
            <Button 
              variant="outline-secondary" 
              size="sm" 
              className="ml-auto"
              onClick={() => exportToExcel(dataExport(dataKurangLaku), `Bottom_Barang_${Date.now()}`)}
            >
              Excel
            </Button>
          </div>
          <div className="overflow-x-auto box p-4">
            <Table className="border-separate border-spacing-y-[10px] -mt-2">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th className="border-b-0 whitespace-nowrap">Nama Barang</Table.Th>
                  <Table.Th className="border-b-0 whitespace-nowrap text-center">Qty</Table.Th>
                  <Table.Th className="border-b-0 whitespace-nowrap text-right">Total Nilai</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {dataKurangLaku.map((item, idx) => (
                  <Table.Tr key={item.kode_barang} className="intro-x">
                    <Table.Td className="bg-white border-b-0 shadow-[20px_3px_20px_#0000000b]">
                      <div className="font-medium">{item.nama_barang}</div>
                      <div className="text-slate-500 text-xs mt-0.5">{item.kode_barang}</div>
                    </Table.Td>
                    <Table.Td className="text-center bg-white border-b-0 shadow-[20px_3px_20px_#0000000b] font-bold text-danger">
                      {item.total_qty.toLocaleString('id-ID')}
                    </Table.Td>
                    <Table.Td className="text-right bg-white border-b-0 shadow-[20px_3px_20px_#0000000b]">
                      Rp {item.total_sales.toLocaleString('id-ID')}
                    </Table.Td>
                  </Table.Tr>
                ))}
                {dataKurangLaku.length === 0 && (
                  <Table.Tr><Table.Td colSpan={3} className="text-center py-10 text-slate-500">Data tidak ditemukan</Table.Td></Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaporanBarangLaku