import Button from '@/components/Base/Button'
import Lucide from '@/components/Base/Lucide'
import Table from '@/components/Base/Table'
import { Menu } from '@/components/Base/Headless'
import React, { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react'
import SearchPages from '../Components/SearchPages'
import PaginationPages from '../Components/PaginationPages'
import { exportToExcel, exportToPDF, printLayar } from '@/utils/ExportHelper'
import { useAppDispatch, useAppSelector } from '@/stores/hooks'
import { TransaksiGet } from '@/stores/TransaksiSlice'
import { FilterParams, ITransaksi } from '@/utils/types'
import { toast } from 'react-toastify'



const PenjualanLaporan = () => {
  const dispatch = useAppDispatch()
  const transaksi = useAppSelector(state => state.TransaksiSlice.transaksi)
  const [searchQuery, setSearchQuery] = useState('')
  const [metodeFilter, setMetodeFilter] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [perPages, setPerPages] = useState(10)

  const fetchData = useCallback(() => {
    const params: FilterParams | undefined = startDate && endDate ? { startDate, endDate } : undefined
    dispatch(TransaksiGet(params))
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
    dispatch(TransaksiGet({ startDate, endDate }))
    setCurrentPage(1)
  }

  const handleResetFilter = () => {
    setSearchQuery('')
    setMetodeFilter('')
    setStartDate('')
    setEndDate('')
    dispatch(TransaksiGet(undefined))
    setCurrentPage(1)
  }

  const filteredData = useMemo(() => {
    return transaksi.filter((item) => {
      const textMatch = JSON.stringify(item).toLowerCase().includes(searchQuery.toLowerCase())
      const metodeMatch = metodeFilter ? item.metode_pembayaran === metodeFilter : true

      const itemDate = new Date(item.tgl_penjualan || '')
      itemDate.setHours(0, 0, 0, 0)

      const start = startDate ? new Date(startDate) : null
      if (start) start.setHours(0, 0, 0, 0)

      const end = endDate ? new Date(endDate) : null
      if (end) end.setHours(23, 59, 59, 999)

      const dateMatch = start && end ? itemDate >= start && itemDate <= end : true

      return textMatch && metodeMatch && dateMatch
    })
  }, [transaksi, searchQuery, metodeFilter, startDate, endDate])

  const totalPenjualan = filteredData.reduce((sum, item) => sum + item.total_harga, 0)
  const totalPages = Math.ceil(filteredData.length / perPages)
  const angkaAkhir = currentPage * perPages
  const angkaAwal = angkaAkhir - perPages
  const currentData = filteredData.slice(angkaAwal, angkaAkhir)

  const dataExport = () => {
    return filteredData.map((item, index) => ({
      No: index + 1,
      'No Penjualan': item.no_penjualan || '-',
      Tanggal: new Date(item.tgl_penjualan || new Date()).toLocaleDateString('id-ID'),
      Pelanggan: item.nama_pelanggan || '-',
      Metode: item.metode_pembayaran || '-',
      Total: item.total_harga || 0,
      Status: item.status_transaksi || '-',
    }))
  }

  const handlePrint = () => {
    printLayar(dataExport(), 'Laporan Penjualan')
  }

  const handleExportExcel = () => {
    exportToExcel(dataExport(), `Laporan_Penjualan_${Date.now()}`)
  }

  const handleExportPDF = () => {
    exportToPDF(dataExport(), 'Laporan Penjualan', `Laporan_Penjualan_${Date.now()}`)
  }

  const getStatusClass = (status: string) => {
    if (status === 'selesai') return 'bg-success/10 text-success'
    if (status === 'proses') return 'bg-warning/10 text-warning'
    return 'bg-danger/10 text-danger'
  }

  return (
    <>
      <h2 className="mt-10 text-lg font-medium intro-y">Laporan Penjualan</h2>

      <div className="grid grid-cols-12 gap-6 mt-5">
        <div className="col-span-12 intro-y">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 sm:col-span-4 box p-4">
              <div className="text-slate-500 text-xs">Total Data</div>
              <div className="text-xl font-semibold mt-1">{filteredData.length}</div>
            </div>
            <div className="col-span-12 sm:col-span-4 box p-4">
              <div className="text-slate-500 text-xs">Total Penjualan</div>
              <div className="text-xl font-semibold mt-1">Rp {totalPenjualan.toLocaleString('id-ID')}</div>
            </div>
            <div className="col-span-12 sm:col-span-4 box p-4">
              <div className="text-slate-500 text-xs">Periode Aktif</div>
              <div className="text-sm font-medium mt-1">
                {startDate && endDate ? `${startDate} s/d ${endDate}` : 'Semua Periode'}
              </div>
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

          <select
            className="w-full sm:w-40 form-select box"
            value={metodeFilter}
            onChange={(e) => setMetodeFilter(e.target.value)}
          >
            <option value="">Semua Metode</option>
            <option value="Tunai">Tunai</option>
            <option value="Transfer">Transfer</option>
            <option value="Kartu">Kartu</option>
            <option value="QRIS">QRIS</option>
          </select>

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

        <div className="flex flex-wrap items-center col-span-12 mt-2 intro-y justify-center">
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
                <Table.Th className="border-b-0 whitespace-nowrap">No Penjualan</Table.Th>
                <Table.Th className="border-b-0 whitespace-nowrap">Tanggal</Table.Th>
                <Table.Th className="border-b-0 whitespace-nowrap">Pelanggan</Table.Th>
                <Table.Th className="border-b-0 whitespace-nowrap">Metode</Table.Th>
                <Table.Th className="border-b-0 whitespace-nowrap">Total</Table.Th>
                <Table.Th className="border-b-0 whitespace-nowrap">Status</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {currentData.length === 0 ? (
                <Table.Tr>
                  <Table.Td
                    colSpan={7}
                    className="text-center bg-white border-b-0 py-10 text-slate-500 rounded-md"
                  >
                    Tidak ada data penjualan
                  </Table.Td>
                </Table.Tr>
              ) : (
                currentData.map((item, index) => (
                  <Table.Tr key={item._id} className="intro-x">
                    <Table.Td className="first:rounded-l-md last:rounded-r-md bg-white border-b-0 shadow-[20px_3px_20px_#0000000b]">
                      {angkaAwal + index + 1}
                    </Table.Td>
                    <Table.Td className="first:rounded-l-md last:rounded-r-md bg-white border-b-0 shadow-[20px_3px_20px_#0000000b]">
                      {item.no_penjualan}
                    </Table.Td>
                    <Table.Td className="first:rounded-l-md last:rounded-r-md bg-white border-b-0 shadow-[20px_3px_20px_#0000000b]">
                      {new Date(item.tgl_penjualan || '').toLocaleDateString('id-ID')}
                    </Table.Td>
                    <Table.Td className="first:rounded-l-md last:rounded-r-md bg-white border-b-0 shadow-[20px_3px_20px_#0000000b]">
                      {item.nama_pelanggan || '-'}
                    </Table.Td>
                    <Table.Td className="first:rounded-l-md last:rounded-r-md bg-white border-b-0 shadow-[20px_3px_20px_#0000000b]">
                      {item.metode_pembayaran}
                    </Table.Td>
                    <Table.Td className="first:rounded-l-md last:rounded-r-md bg-white border-b-0 shadow-[20px_3px_20px_#0000000b]">
                      Rp {item.total_harga.toLocaleString('id-ID')}
                    </Table.Td>
                    <Table.Td className="first:rounded-l-md last:rounded-r-md bg-white border-b-0 shadow-[20px_3px_20px_#0000000b]">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(
                          item.status_transaksi || ''
                        )}`}
                      >
                        {item.status_transaksi}
                      </span>
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

export default PenjualanLaporan
