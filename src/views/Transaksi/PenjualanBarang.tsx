import Button from '@/components/Base/Button'
import Lucide from '@/components/Base/Lucide'
import Table from '@/components/Base/Table'
import { Menu } from '@/components/Base/Headless'
import React, { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react'
import SearchPages from '../Components/SearchPages'
import PaginationPages from '../Components/PaginationPages'
import { exportToExcel, exportToPDF, printLayar } from '@/utils/ExportHelper'
import { useAppDispatch, useAppSelector } from '@/stores/hooks'
import { TransaksiBarangGet } from '@/stores/TransaksiSlice'
import { FilterParams, ITransaksiBarang } from '@/utils/types'

const PenjualanBarang = () => {
  const dispatch = useAppDispatch()
  const { transaksiBarang } = useAppSelector(state => state.TransaksiSlice)

  
  const [searchQuery, setSearchQuery] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [perPages, setPerPages] = useState(10)

  const fetchData = useCallback(() => {
    const params: FilterParams = {
      startDate: startDate || '',
      endDate: endDate || '',
    }
    dispatch(TransaksiBarangGet(params))
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
    if ((startDate && !endDate) || (!startDate && endDate)) return
    fetchData()
  }

  const handleResetFilter = () => {
    setSearchQuery('')
    setStartDate('')
    setEndDate('')
    dispatch(TransaksiBarangGet(undefined))
    setCurrentPage(1)
  }

  const filteredData = useMemo(() => {
    return transaksiBarang.filter((item) => 
      item.nama_barang.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.kode_barang.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [transaksiBarang, searchQuery])


  const totalQty = filteredData.reduce((sum, item) => sum + Number(item.jumlah || 0), 0)
  const totalSales = filteredData.reduce((sum, item) => sum + Number(item.sub_total || 0), 0)
  const totalPages = Math.ceil(filteredData.length / perPages)
  const angkaAkhir = currentPage * perPages
  const angkaAwal = angkaAkhir - perPages
  const currentData = filteredData.slice(angkaAwal, angkaAkhir)

  const dataExport = () => {
    return filteredData.map((item, index) => ({
      No: index + 1,
      'Kode Barang': item.kode_barang,
      'Nama Barang': item.nama_barang,
      'Harga Jual' : item.harga_jual,
      'Total Jumlah': item.jumlah || 0,
      'Total Penjualan': item.sub_total || 0,
    }))
  }

  const handlePrint = () => {
    printLayar(dataExport(), 'Laporan Barang Terjual')
  }

  const handleExportExcel = () => {
    exportToExcel(dataExport(), `Barang_Terjual_${Date.now()}`)
  }

  const handleExportPDF = () => {
    exportToPDF(dataExport(), 'Laporan Barang Terjual', `Barang_Terjual_${Date.now()}`)
  }

  return (
    <>
      <h2 className="mt-10 text-lg font-medium intro-y">Laporan Barang Terjual</h2>

      <div className="grid grid-cols-12 gap-6 mt-5">
        <div className="col-span-12 intro-y">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 sm:col-span-4 box p-4">
              <div className="text-slate-500 text-xs">Total Barang</div>
              <div className="text-xl font-semibold mt-1">{filteredData.length}</div>
            </div>
            <div className="col-span-12 sm:col-span-4 box p-4">
              <div className="text-slate-500 text-xs">Total Qty Terjual</div>
              <div className="text-xl font-semibold mt-1">{totalQty.toLocaleString('id-ID')}</div>
            </div>
            <div className="col-span-12 sm:col-span-4 box p-4">
              <div className="text-slate-500 text-xs">Total Sales</div>
              <div className="text-xl font-semibold mt-1">Rp {totalSales.toLocaleString('id-ID')}</div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center col-span-12 mt-2 intro-y gap-2">
          <Menu className="mr-2">
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

          <div className="mb-0 text-xs font-medium text-slate-500 mr-0 ml-auto">Filter Tanggal:</div>
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

          <div className="ml-auto">
            <SearchPages searchQuery={searchQuery} handleSearchChange={handleSearchChange} />
          </div>
        </div>

        <div className="flex flex-wrap items-center col-span-12 mt-2 intro-y sm:flex-nowrap">
          <div className="text-slate-500 text-sm mx-auto">
            Showing {currentData.length === 0 ? 0 : angkaAwal + 1} to {Math.min(angkaAkhir, filteredData.length)} of{' '}
            {filteredData.length} entries
          </div>
        </div>

        <div className="col-span-12 overflow-auto intro-y lg:overflow-visible">
          <Table className="border-spacing-y-[10px] border-separate -mt-2">
            <Table.Thead>
              <Table.Tr>
                <Table.Th className="border-b-0 whitespace-nowrap">No</Table.Th>
                <Table.Th className="border-b-0 whitespace-nowrap">No Penjualan</Table.Th>
                <Table.Th className="border-b-0 whitespace-nowrap">Nama Barang</Table.Th>
                <Table.Th className="border-b-0 whitespace-nowrap">Harga jual</Table.Th>
                <Table.Th className="border-b-0 whitespace-nowrap">Total Jumlah</Table.Th>
                <Table.Th className="border-b-0 whitespace-nowrap">Total Penjualan</Table.Th>
                <Table.Th className="border-b-0 whitespace-nowrap">tgl Transaksi</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {currentData.length === 0 ? (
                <Table.Tr>
                  <Table.Td
                    colSpan={5}
                    className="text-center bg-white border-b-0 py-10 text-slate-500 rounded-md"
                  >
                    Tidak ada data barang terjual
                  </Table.Td>
                </Table.Tr>
              ) : (
                currentData.map((item, index) => (
                  <Table.Tr key={`${item.kode_barang}-${item.nama_barang}`} className="intro-x">
                    <Table.Td className="first:rounded-l-md last:rounded-r-md bg-white border-b-0 shadow-[20px_3px_20px_#0000000b]">
                      {angkaAwal + index + 1}
                    </Table.Td>
                    <Table.Td className="first:rounded-l-md last:rounded-r-md bg-white border-b-0 shadow-[20px_3px_20px_#0000000b]">
                      {item.no_penjualan}
                    </Table.Td>
                    <Table.Td className="first:rounded-l-md last:rounded-r-md bg-white border-b-0 shadow-[20px_3px_20px_#0000000b]">
                      {item.nama_barang}
                    </Table.Td>
                    <Table.Td className="first:rounded-l-md last:rounded-r-md bg-white border-b-0 shadow-[20px_3px_20px_#0000000b]">
                      {Number(item.harga_jual || 0).toLocaleString('id-ID')}
                    </Table.Td>
                    <Table.Td className="first:rounded-l-md last:rounded-r-md bg-white border-b-0 shadow-[20px_3px_20px_#0000000b]">
                      {(item.jumlah || 0).toLocaleString('id-ID') }
                    </Table.Td>
                    <Table.Td className="first:rounded-l-md last:rounded-r-md bg-white border-b-0 shadow-[20px_3px_20px_#0000000b]">
                      Rp {(item.sub_total || 0).toLocaleString('id-ID')}
                    </Table.Td>
                    <Table.Td className="first:rounded-l-md last:rounded-r-md bg-white border-b-0 shadow-[20px_3px_20px_#0000000b]">
                      {(new Date(item.tgl_penjualan)).toLocaleString('id-ID',{day:'2-digit',month:'numeric',year:'numeric'})}
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

export default PenjualanBarang
