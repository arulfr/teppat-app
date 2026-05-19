import Button from '@/components/Base/Button'
import Lucide from '@/components/Base/Lucide'
import Table from '@/components/Base/Table'
import { Menu } from '@/components/Base/Headless'
import React, { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react'
import SearchPages from '../Components/SearchPages'
import PaginationPages from '../Components/PaginationPages'
import { exportToExcel, exportToPDF, printLayar } from '@/utils/ExportHelper'
import { useAppDispatch, useAppSelector } from '@/stores/hooks'
import { kartuStokget } from '@/stores/KartuStokSlice'
import { FilterParams, kartuStok } from '@/utils/types'
import { toast } from 'react-toastify'



const StokLaporan = () => {
  const dispatch = useAppDispatch()
  const kartuStok = useAppSelector(state => state.KartuStokSlice.kartu_stok) as unknown as kartuStok[]
  const [searchQuery, setSearchQuery] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [perPages, setPerPages] = useState(10)

  const fetchData = useCallback(() => {
    const params: FilterParams | undefined = startDate && endDate ? { startDate, endDate } : undefined
    dispatch(kartuStokget(params))
    setCurrentPage(1)
  }, [dispatch, startDate, endDate])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }

  const handlePerPageChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setPerPages(Number(e.target.value))
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleTerapkanFilterTanggal = () => {
    if ((startDate && !endDate) || (!startDate && endDate)) {
      toast.warning('Pilih tanggal awal dan akhir', { position: 'top-right', autoClose: 3000 })
      return
    }
    fetchData()
  }

  const handleResetFilter = () => {
    setSearchQuery('')
    setStartDate('')
    setEndDate('')
    dispatch(kartuStokget(undefined))
    setCurrentPage(1)
  }

  const filteredData = useMemo(() => {
    return kartuStok.filter((item) => 
      item.nama_barang.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.keterangan.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [kartuStok, searchQuery])

  const totalMasuk = filteredData.reduce((sum, item) => sum + (item.jumlah_stok_masuk || 0), 0)
  const totalKeluar = filteredData.reduce((sum, item) => sum + (item.jumlah_stok_keluar || 0), 0)
  const totalStokAkhir = filteredData.reduce((sum, item) => sum + (item.stok_akhir || 0), 0)
  const totalPages = Math.ceil(filteredData.length / perPages)
  const angkaAkhir = currentPage * perPages
  const angkaAwal = angkaAkhir - perPages
  const currentData = filteredData.slice(angkaAwal, angkaAkhir)

  const dataExport = () => {
    return filteredData.map((item, index: number) => ({
      No: index + 1,
      'Nama Barang': item.nama_barang,
      'Stok Masuk': item.jumlah_stok_masuk || 0,
      'Stok Keluar': item.jumlah_stok_keluar || 0,
      'Stok Akhir': item.stok_akhir || 0,
      'Tanggal': new Date(item.tanggal_transaksi).toLocaleDateString('id-ID'),
      'Keterangan': item.keterangan,
    }))
  }

  const handlePrint = () => {
    printLayar(dataExport(), 'Laporan Kartu Stok')
  }

  const handleExportExcel = () => {
    exportToExcel(dataExport(), `Laporan_Stok_${Date.now()}`)
  }

  const handleExportPDF = () => {
    exportToPDF(dataExport(), 'Laporan Kartu Stok', `Laporan_Stok_${Date.now()}`)
  }

  return (
    <>
      <h2 className="mt-10 text-lg font-medium intro-y">Laporan Kartu Stok</h2>

      <div className="grid grid-cols-12 gap-6 mt-5">
        <div className="col-span-12 intro-y">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 sm:col-span-4 box p-4">
              <div className="text-slate-500 text-xs">Total Transaksi</div>
              <div className="text-xl font-semibold mt-1">{filteredData.length}</div>
            </div>
            <div className="col-span-12 sm:col-span-4 box p-4">
              <div className="text-slate-500 text-xs">Total Masuk</div>
              <div className="text-xl font-semibold mt-1">{totalMasuk.toLocaleString('id-ID')}</div>
            </div>
            <div className="col-span-12 sm:col-span-4 box p-4">
              <div className="text-slate-500 text-xs">Total Stok Akhir</div>
              <div className="text-xl font-semibold mt-1">{totalStokAkhir.toLocaleString('id-ID')}</div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center col-span-12 mt-2 intro-y gap-2">
          <Menu className="mr-auto">
            <Menu.Button as={Button} className="px-2 w-40 !box">
              Download
              <span className="flex items-center justify-center w-5 h-5">
                <Lucide icon="Download" className="w-4 h-4" />
              </span>
            </Menu.Button>
            <Menu.Items className="w-44 ml-6">
              <Menu.Item onClick={handlePrint}>
                <Lucide icon="Printer" className="w-4 h-4 mr-2" /> Print
              </Menu.Item>
              <Menu.Item onClick={handleExportExcel}>
                <Lucide icon="FileText" className="w-4 h-4 mr-2" /> Export Excel
              </Menu.Item>
              <Menu.Item onClick={handleExportPDF}>
                <Lucide icon="FileText" className="w-4 h-4 mr-2" /> Export PDF
              </Menu.Item>
            </Menu.Items>
          </Menu>

          <div className="flex items-center box px-3 py-2 border-slate-200 bg-white shadow-sm rounded-md intro-y">
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
              <button
                onClick={handleTerapkanFilterTanggal}
                className="transition-colors text-slate-500 hover:text-success"
                title="Terapkan Filter"
              >
                <Lucide icon="Filter" className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetFilter}
                className="transition-colors text-slate-500 hover:text-danger"
                title="Reset Filter"
              >
                <Lucide icon="X" className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="ml-0">
            <SearchPages searchQuery={searchQuery} handleSearchChange={handleSearchChange} />
          </div>
        </div>

        <div className="flex flex-wrap items-center col-span-12 mt-2 intro-y">
          <div className="text-slate-500 text-sm">
            Showing {currentData.length === 0 ? 0 : angkaAwal + 1} to {Math.min(angkaAkhir, filteredData.length)} of{' '}
            {filteredData.length} entries
          </div>
        </div>

        <div className="col-span-12 overflow-auto intro-y lg:overflow-visible">
          <Table className="border-spacing-y-[10px] border-separate -mt-2">
            <Table.Thead>
              <Table.Tr>
                <Table.Th className="border-b-0 whitespace-nowrap">No</Table.Th>
                <Table.Th className="border-b-0 whitespace-nowrap">Nama Barang</Table.Th>
                <Table.Th className="border-b-0 whitespace-nowrap">Stok Masuk</Table.Th>
                <Table.Th className="border-b-0 whitespace-nowrap">Stok Keluar</Table.Th>
                <Table.Th className="border-b-0 whitespace-nowrap">Stok Akhir</Table.Th>
                <Table.Th className="border-b-0 whitespace-nowrap">Tanggal</Table.Th>
                <Table.Th className="border-b-0 whitespace-nowrap">Keterangan</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {currentData.length === 0 ? (
                <Table.Tr>
                  <Table.Td
                    colSpan={7}
                    className="text-center bg-white border-b-0 py-10 text-slate-500 rounded-md"
                  >
                    Tidak ada data kartu stok
                  </Table.Td>
                </Table.Tr>
              ) : (
                currentData.map((item, index: number) => (
                  <Table.Tr key={item._id || index} className="intro-x">
                    <Table.Td className="first:rounded-l-md last:rounded-r-md bg-white border-b-0 shadow-[20px_3px_20px_#0000000b]">
                      {angkaAwal + index + 1}
                    </Table.Td>
                    <Table.Td className="first:rounded-l-md last:rounded-r-md bg-white border-b-0 shadow-[20px_3px_20px_#0000000b]">
                      {item.nama_barang}
                    </Table.Td>
                    <Table.Td className="first:rounded-l-md last:rounded-r-md bg-white border-b-0 shadow-[20px_3px_20px_#0000000b]">
                      {item.jumlah_stok_masuk?.toLocaleString('id-ID') || 0}
                    </Table.Td>
                    <Table.Td className="first:rounded-l-md last:rounded-r-md bg-white border-b-0 shadow-[20px_3px_20px_#0000000b]">
                      {item.jumlah_stok_keluar?.toLocaleString('id-ID') || 0}
                    </Table.Td>
                    <Table.Td className="first:rounded-l-md last:rounded-r-md bg-white border-b-0 shadow-[20px_3px_20px_#0000000b]">
                      {item.stok_akhir?.toLocaleString('id-ID') || 0}
                    </Table.Td>
                    <Table.Td className="first:rounded-l-md last:rounded-r-md bg-white border-b-0 shadow-[20px_3px_20px_#0000000b]">
                      {new Date(item.tanggal_transaksi).toLocaleDateString('id-ID')}
                    </Table.Td>
                    <Table.Td className="first:rounded-l-md last:rounded-r-md bg-white border-b-0 shadow-[20px_3px_20px_#0000000b]">
                      {item.keterangan}
                    </Table.Td>
                  </Table.Tr>
                ))
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

export default StokLaporan

