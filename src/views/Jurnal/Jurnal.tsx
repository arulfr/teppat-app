import Button from '@/components/Base/Button'
import Lucide from '@/components/Base/Lucide'
import React, { ChangeEvent, useEffect, useState } from 'react'
import SearchPages from '../Components/SearchPages'
import Table from '@/components/Base/Table'
import { Menu } from '@/components/Base/Headless'
import { useAppDispatch, useAppSelector } from '@/stores/hooks'
import { toast } from 'react-toastify'
import { jurnalGet } from '@/stores/JurnalSlice'
import { useNavigate } from 'react-router-dom'
import PaginationPages from '../Components/PaginationPages'
import { exportToExcel, exportToPDF, printLayar } from '@/utils/ExportHelper'

const Jurnal = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const jurnal = useAppSelector((state) => state.JurnalSlice.jurnal)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    dispatch(jurnalGet())
  }, [])

  const filterSearch = jurnal.filter((item) => {
    const textMatch = JSON.stringify(item).toLowerCase().includes(searchQuery.toLowerCase())
    const statusMatch = statusFilter ? item.status === statusFilter : true

    const itemDate = new Date(item.tanggal_transaksi)
    itemDate.setHours(0, 0, 0, 0)

    const start = startDate ? new Date(startDate) : null
    if (start) start.setHours(0, 0, 0, 0)

    const end = endDate ? new Date(endDate) : null
    if (end) end.setHours(23, 59, 59, 999)

    const dateMatch = start && end ? itemDate >= start && itemDate <= end : true

    return textMatch && statusMatch && dateMatch
  })

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }

  const handleStatusFilterChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value)
    setCurrentPage(1)
  }

  const handleTerapkanFilterTanggal = () => {
    if ((startDate && !endDate) || (!startDate && endDate)) {
      toast.warning('Pilih tanggal awal dan akhir.', {
        position: 'top-right',
        autoClose: 3000,
      })
      return
    }
    setCurrentPage(1)
  }

  const handleResetFilterTanggal = () => {
    setStartDate('')
    setEndDate('')
    setCurrentPage(1)
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pembelian':
        return 'bg-primary/10 text-primary'
      case 'penjualan':
        return 'bg-success/10 text-success'
      case 'pengeluaran':
        return 'bg-danger/10 text-danger'
      case 'void_pembelian':
        return 'bg-warning/10 text-warning'
      case 'service':
        return 'bg-slate-200 text-slate-700'
      default:
        return 'bg-slate-100 text-slate-600'
    }
  }

  const [currentPage, setCurrentPage] = useState(1)
  const [perPages, setPerPages] = useState(10)

  const totalPages = Math.ceil(filterSearch.length / perPages)
  const angkaAkhir = currentPage * perPages
  const angkaAwal = angkaAkhir - perPages
  const currentPelanggan = filterSearch.slice(angkaAwal, angkaAkhir)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePerPageChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setPerPages(Number(e.target.value))
    setCurrentPage(1)
  }

  const dataExport = () => {
    return filterSearch.map((item, index) => ({
      No: index + 1,
      Keterangan: item.data_pembelian?.keterangan || item.data_penjualan?.keterangan || item.keterangan || '-',
      'Saldo Masuk': new Intl.NumberFormat('id-ID').format(item.saldo_masuk || 0),
      'Saldo Keluar': new Intl.NumberFormat('id-ID').format(item.saldo_keluar || 0),
      'Saldo Akhir': new Intl.NumberFormat('id-ID').format(item.saldo_akhir || 0),
      'User': (item as any).username ? `${(item as any).username} (${item.kode_user})` : item.kode_user,
      Status: item.status,
      'Tanggal Transaksi': new Date(item.tanggal_transaksi).toLocaleDateString('id-ID'),
    }))
  }

  const handlePrint = () => {
    printLayar(dataExport(), 'Laporan Jurnal Kas')
  }

  const handleExportExcel = () => {
    exportToExcel(dataExport(), `Jurnal_kas_${Date.now()}`)
  }

  const handleExportPDF = () => {
    exportToPDF(dataExport(), 'Laporan Jurnal Kas', `Jurnal_kas_${Date.now()}`)
  }

  return (
    <>
      <h2 className="mt-10 text-lg font-medium intro-y">List Jurnal Kas</h2>
      <div className="grid grid-cols-12 gap-6 mt-5">
        <div className="flex flex-wrap items-center col-span-12 mt-2 intro-y gap-2 sm:flex-nowrap">
          <Menu>
            <Menu.Button as={Button} className="px-2 w-40 !box">
              Download
              <span className="flex items-center justify-center w-5 h-5">
                <Lucide icon="Download" className="w-4 h-4" />
              </span>
            </Menu.Button>
            <Menu.Items className="w-40 ml-10">
              <Menu.Item onClick={handlePrint}>
                <Lucide icon="Printer" className="w-4 h-4 mr-2" /> Print
              </Menu.Item>
              <Menu.Item onClick={handleExportExcel}>
                <Lucide icon="FileText" className="w-4 h-4 mr-2" /> Export to Excel
              </Menu.Item>
              <Menu.Item onClick={handleExportPDF}>
                <Lucide icon="FileText" className="w-4 h-4 mr-2" /> Export to PDF
              </Menu.Item>
            </Menu.Items>
          </Menu>

          <div className="mr-2 ml-auto">
            <select
              className="w-full sm:w-44 form-select box"
              value={statusFilter}
              onChange={handleStatusFilterChange}
            >
              <option value="">Semua Status</option>
              <option value="pembelian">Pembelian</option>
              <option value="penjualan">Penjualan</option>
              <option value="pengeluaran">Pengeluaran</option>
              <option value="void_pembelian">Void Pembelian</option>
              <option value="service">Service</option>
            </select>
          </div>

          <div className="mb-0 text-xs font-medium text-slate-500 mr-0 ml-auto">Filter Tanggal:</div>
          <div className="flex items-center box px-3 py-2 border-slate-200 bg-white shadow-sm rounded-md intro-y mr-2">
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
                onClick={handleResetFilterTanggal}
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
          <div className="hidden mx-auto md:block text-slate-500">
            Showing {currentPelanggan.length === 0 ? 0 : angkaAwal + 1} to {Math.min(angkaAkhir, filterSearch.length)} of{' '}
            {filterSearch.length} entries
          </div>
        </div>

        <div className="col-span-12 overflow-auto intro-y lg:overflow-visible">
          <Table className="border-spacing-y-[10px] border-separate -mt-2">
            <Table.Thead>
              <Table.Tr>
                <Table.Th className="border-b-0 whitespace-nowrap">No</Table.Th>
                <Table.Th className="border-b-0 whitespace-nowrap">Deskripsi</Table.Th>
                <Table.Th className="border-b-0 whitespace-nowrap text-right">Saldo Masuk</Table.Th>
                <Table.Th className="border-b-0 whitespace-nowrap text-right">Saldo Keluar</Table.Th>
                <Table.Th className="border-b-0 whitespace-nowrap text-right">Saldo Akhir</Table.Th>
                <Table.Th className="border-b-0 whitespace-nowrap">User</Table.Th>
                <Table.Th className="border-b-0 whitespace-nowrap">Status</Table.Th>
                <Table.Th className="border-b-0 whitespace-nowrap">Tgl Transaksi</Table.Th>
                <Table.Th className="text-center border-b-0 whitespace-nowrap">ACTIONS</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {currentPelanggan.map((item, index) => {
                return (
                  <Table.Tr key={item._id || index} className="intro-x">
                    <Table.Td className="first:rounded-l-md last:rounded-r-md bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]">
                      {angkaAwal + index + 1}
                    </Table.Td>
                    <Table.Td className="first:rounded-l-md last:rounded-r-md bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]">
                      <div>{item.data_pembelian?.keterangan || item.data_penjualan?.keterangan || item.keterangan || '-'}</div>
                      <div className="mt-1 text-xs text-slate-500">
                        {item.data_pembelian?.no_pembelian
                          ? `No Pembelian: ${item.data_pembelian.no_pembelian}`
                          : item.data_penjualan?.no_penjualan
                          ? `No Penjualan: ${item.data_penjualan.no_penjualan}`
                          : ''}
                      </div>
                    </Table.Td>
                    <Table.Td className="first:rounded-l-md last:rounded-r-md bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b] text-right">
                      {new Intl.NumberFormat('id-ID').format(item.saldo_masuk || 0)}
                    </Table.Td>
                    <Table.Td className="first:rounded-l-md last:rounded-r-md bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b] text-right">
                      {new Intl.NumberFormat('id-ID').format(item.saldo_keluar || 0)}
                    </Table.Td>
                    <Table.Td className="first:rounded-l-md last:rounded-r-md bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b] text-right">
                      {new Intl.NumberFormat('id-ID').format(item.saldo_akhir || 0)}
                    </Table.Td>
                    <Table.Td className="first:rounded-l-md last:rounded-r-md bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]">
                      <div className="whitespace-nowrap">
                        <div className="font-medium">{(item as any).username || '-'}</div>
                        <div className="text-xs text-slate-500">{item.kode_user}</div>
                      </div>
                    </Table.Td>
                    <Table.Td className="first:rounded-l-md last:rounded-r-md bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(item.status)}`}>
                        {item.status}
                      </span>
                    </Table.Td>
                    <Table.Td className="first:rounded-l-md last:rounded-r-md bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]">
                      {new Date(item.tanggal_transaksi).toLocaleDateString('id-ID')}
                    </Table.Td>
                    <Table.Td className="first:rounded-l-md last:rounded-r-md w-40 bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]">
                      <div className="flex items-center justify-center">
                        <Menu>
                          <Menu.Button as={Button} variant="ghost" className={'p-2'}>
                            <Lucide icon="MoreVertical" className="w-6 h-6" />
                          </Menu.Button>
                          <Menu.Items className="w-48">
                            <Menu.Item
                              onClick={(e: MouseEvent) => {
                                e.preventDefault()
                                navigate(`/jurnal/detail/${item._id}`)
                              }}
                            >
                              <Lucide icon="FilePenLine" className="w-4 h-4 mr-2" /> DETAIL
                            </Menu.Item>
                          </Menu.Items>
                        </Menu>
                      </div>
                    </Table.Td>
                  </Table.Tr>
                )
              })}
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

export default Jurnal
