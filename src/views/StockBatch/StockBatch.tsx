import React, { ChangeEvent, useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/stores/hooks'
import { getStockBatches } from '@/stores/StockBatchSlice';
import Button from '@/components/Base/Button'
import Lucide from '@/components/Base/Lucide'
import Table from '@/components/Base/Table'
import { Menu } from '@/components/Base/Headless'
import SearchPages from '../Components/SearchPages'
import PaginationPages from '../Components/PaginationPages'
import { exportToExcel, exportToPDF, printLayar } from '@/utils/ExportHelper'

const StockBatch = () => {
  const dispatch = useAppDispatch();
  
  // Mengambil data dari Redux Store (Pastikan Slice sudah dibuat)
  const stockBatches = useAppSelector((state) => state.StockBatch.stockBatches) || []
  const { activeStoreId } = useAppSelector((state) => state.AdminSlice);
  
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [perPages, setPerPages] = useState(10)

  useEffect(() => {
    // Aturan #3: Pastikan fetch hanya jika activeStoreId tersedia
    if (activeStoreId && typeof getStockBatches === 'function') {
        dispatch(getStockBatches())
    }
  }, [dispatch, activeStoreId])

  // Fitur Pencarian Global
  // Aturan #8: Gunakan useMemo dan defensive check (stockBatches || [])
  const filterSearch = useMemo(() => {
    return (stockBatches || []).filter((item: any) =>
      JSON.stringify(item).toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [stockBatches, searchQuery]);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }

  // Logika Paginasi
  // Aturan #8: Gunakan useMemo untuk kalkulasi pagination agar performa tetap ringan
  const { currentData, totalPages, angkaAwal, angkaAkhir } = useMemo(() => {
    const total = Math.ceil(filterSearch.length / perPages);
    const akhir = currentPage * perPages;
    const awal = akhir - perPages;
    const sliced = filterSearch.slice(awal, akhir);
    
    return { currentData: sliced, totalPages: total, angkaAwal: awal, angkaAkhir: akhir };
  }, [filterSearch, currentPage, perPages]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePerPageChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setPerPages(Number(e.target.value))
    setCurrentPage(1)
  }

  // Persiapan Data untuk Export
  const dataExport = () => {
    return filterSearch.map((item: any, index: number) => ({
      No: index + 1,
      'Batch Number': item.batchNumber || '-',
      'Nama Barang': item.nama_barang || item.id_barang || '-',
      'Tgl Masuk': new Date(item.tanggal_masuk).toLocaleDateString('id-ID'),
      'Harga Beli': item.harga_beli,
      'Jml Masuk': item.jumlah_masuk,
      'Sisa Stok': item.jumlah_sekarang,
      Status: item.jumlah_sekarang > 0 ? 'Tersedia' : 'Habis',
    }))
  }

  const handlePrint = () => printLayar(dataExport(), 'Laporan Stok per Batch')
  const handleExportExcel = () => exportToExcel(dataExport(), `StockBatch_${Date.now()}`)
  const handleExportPDF = () => exportToPDF(dataExport(), 'Laporan Stok per Batch', `StockBatch_${Date.now()}`)

  return (
    <>
      <h2 className="mt-10 text-lg font-medium intro-y">Manajemen Stok (Batch FIFO)</h2>
      <div className="grid grid-cols-12 gap-6 mt-5">
        <div className="flex flex-wrap items-center col-span-12 mt-2 intro-y sm:flex-nowrap">
          <Menu>
            <Menu.Button as={Button} className="px-2 !box">
              <span className="mr-2">Export / Print</span>
              <Lucide icon="Download" className="w-4 h-4" />
            </Menu.Button>
            <Menu.Items className="w-40">
              <Menu.Item onClick={handlePrint}>
                <Lucide icon="Printer" className="w-4 h-4 mr-2" /> Print
              </Menu.Item>
              <Menu.Item onClick={handleExportExcel}>
                <Lucide icon="FileText" className="w-4 h-4 mr-2" /> Excel
              </Menu.Item>
              <Menu.Item onClick={handleExportPDF}>
                <Lucide icon="FileText" className="w-4 h-4 mr-2" /> PDF
              </Menu.Item>
            </Menu.Items>
          </Menu>
          <div className="hidden mx-auto md:block text-slate-500">
             Showing {(stockBatches || []).length === 0 ? 0 : angkaAwal + 1} to {Math.min(angkaAkhir, filterSearch.length)} of {filterSearch.length} entries
          </div>
          <div className="w-full mt-3 sm:w-auto sm:ml-auto md:ml-0">
            <SearchPages searchQuery={searchQuery} handleSearchChange={handleSearchChange} />
          </div>
        </div>

        <div className="col-span-12 overflow-auto intro-y lg:overflow-visible">
          <Table className="border-spacing-y-[10px] border-separate -mt-2">
            <Table.Thead>
              <Table.Tr>
                <Table.Th className="border-b-0 whitespace-nowrap">No</Table.Th>
                <Table.Th className="border-b-0 whitespace-nowrap">Batch Number</Table.Th>
                <Table.Th className="border-b-0 whitespace-nowrap">Nama Barang</Table.Th>
                <Table.Th className="border-b-0 whitespace-nowrap text-center">Tgl Masuk</Table.Th>
                <Table.Th className="border-b-0 whitespace-nowrap text-right">Harga Beli</Table.Th>
                <Table.Th className="border-b-0 whitespace-nowrap text-center">Jml Masuk</Table.Th>
                <Table.Th className="border-b-0 whitespace-nowrap text-center">Sisa Stok</Table.Th>
                <Table.Th className="border-b-0 whitespace-nowrap text-center">Status</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {currentData.length > 0 ? (
                currentData.map((item: any, index: number) => (
                <Table.Tr key={item._id} className="intro-x">
                  <Table.Td className="bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b] first:rounded-l-md last:rounded-r-md">
                    {angkaAwal + index + 1}
                  </Table.Td>
                  <Table.Td className="bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b] first:rounded-l-md last:rounded-r-md">
                    <div className="font-medium whitespace-nowrap text-primary cursor-pointer hover:underline">
                        {item.batchNumber}
                    </div>
                  </Table.Td>
                  <Table.Td className="bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b] first:rounded-l-md last:rounded-r-md">
                    {item.nama_barang || item.id_barang}
                  </Table.Td>
                  <Table.Td className="text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b] first:rounded-l-md last:rounded-r-md">
                    {new Date(item.tanggal_masuk).toLocaleDateString('id-ID')}
                  </Table.Td>
                  <Table.Td className="text-right bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b] first:rounded-l-md last:rounded-r-md">
                    Rp {item.harga_beli?.toLocaleString('id-ID')}
                  </Table.Td>
                  <Table.Td className="text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b] first:rounded-l-md last:rounded-r-md">
                    {item.jumlah_masuk}
                  </Table.Td>
                  <Table.Td className="text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b] first:rounded-l-md last:rounded-r-md font-bold">
                    {item.jumlah_sekarang}
                  </Table.Td>
                  <Table.Td className="text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b] first:rounded-l-md last:rounded-r-md">
                    <div className={`flex items-center justify-center ${item.jumlah_sekarang > 0 ? 'text-success' : 'text-danger'}`}>
                        <Lucide icon={item.jumlah_sekarang > 0 ? 'CheckCircle' : 'XCircle'} className="w-4 h-4 mr-1" />
                        {item.jumlah_sekarang > 0 ? 'Tersedia' : 'Habis'}
                    </div>
                  </Table.Td>
                </Table.Tr>
                ))
              ) : (
                <Table.Tr>
                  <Table.Td colSpan={8} className="text-center py-10 bg-white dark:bg-darkmode-600 rounded-md">
                    <div className="flex flex-col items-center text-slate-500 italic">
                      <Lucide icon="Search" className="w-8 h-8 mb-2 opacity-20" />
                      {(stockBatches || []).length === 0 ? "Belum ada data batch stok." : "Batch stok tidak ditemukan."}
                    </div>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </div>

        <PaginationPages
          totalPages={totalPages}
          currentPages={currentPage}
          handlePageChange={handlePageChange}
          handlePerPageChange={handlePerPageChange}
        />
      </div>
    </>
  )
}

export default StockBatch