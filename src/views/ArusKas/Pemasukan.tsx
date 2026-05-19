import React, { ChangeEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/stores/hooks'
import { getPemasukan, deletePemasukan } from '@/stores/KasSlice'
import Button from '@/components/Base/Button'
import Lucide from '@/components/Base/Lucide'
import Table from '@/components/Base/Table'
import { Menu } from '@/components/Base/Headless'
import SearchPages from '../Components/SearchPages'
import PaginationPages from '../Components/PaginationPages'
import { toast } from 'react-toastify'
import { exportToExcel, exportToPDF, printLayar } from '@/utils/ExportHelper'

const Pemasukan = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { pemasukan, loading } = useAppSelector((state) => state.KasSlice)
  const { activeStoreId } = useAppSelector((state) => state.AdminSlice)

  const [searchQuery, setSearchQuery] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [perPages, setPerPages] = useState(10)

  useEffect(() => {
    if (activeStoreId) {
      dispatch(getPemasukan())
    }
  }, [activeStoreId, dispatch])

  const filteredData = pemasukan.filter((item) => {
    const textMatch = JSON.stringify(item).toLowerCase().includes(searchQuery.toLowerCase())
    
    const itemDate = new Date(item.tanggal_pemasukan || '')
    itemDate.setHours(0, 0, 0, 0)

    const start = startDate ? new Date(startDate) : null
    if (start) start.setHours(0, 0, 0, 0)

    const end = endDate ? new Date(endDate) : null
    if (end) end.setHours(23, 59, 59, 999)

    const dateMatch = start && end ? itemDate >= start && itemDate <= end : true

    return textMatch && dateMatch
  })

  const totalPages = Math.ceil(filteredData.length / perPages)
  const angkaAkhir = currentPage * perPages
  const angkaAwal = angkaAkhir - perPages
  const currentItems = filteredData.slice(angkaAwal, angkaAkhir)

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }

  const handleTerapkanFilterTanggal = () => {
    if ((startDate && !endDate) || (!startDate && endDate)) {
      toast.warning('Pilih tanggal awal dan akhir.')
      return
    }
    setCurrentPage(1)
  }

  const handleResetFilterTanggal = () => {
    setStartDate('')
    setEndDate('')
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => setCurrentPage(page)
  const handlePerPageChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setPerPages(Number(e.target.value))
    setCurrentPage(1)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      dispatch(deletePemasukan(id)).then(() => {
        toast.success('Data pemasukan berhasil dihapus')
      })
    }
  }

  const dataExport = () => {
    return filteredData.map((item, index) => ({
      No: index + 1,
      Sumber: item.sumber,
      Jumlah: item.jumlah_pemasukan,
      Keterangan: item.keterangan || '-',
      User: item.kode_user || '-',
      Tanggal: new Date(item.tanggal_pemasukan || '').toLocaleDateString('id-ID'),
    }))
  }

  return (
    <>
      <div className="flex items-center mt-8 intro-y">
        <h2 className="mr-auto text-lg font-medium">List Pemasukan Kas</h2>
        <Button variant="primary" className="shadow-md mr-2" onClick={() => navigate('/pemasukan/tambah')}>
            <Lucide icon="Plus" className="w-4 h-4 mr-2" /> Tambah Pemasukan
        </Button>
      </div>
      
      <div className="grid grid-cols-12 gap-6 mt-5">
        <div className="flex flex-wrap items-center col-span-12 mt-2 intro-y gap-2 sm:flex-nowrap">
          <Menu>
            <Menu.Button as={Button} className="px-2 w-40 !box">
              Download
              <span className="flex items-center justify-center w-5 h-5 ml-auto">
                <Lucide icon="Download" className="w-4 h-4" />
              </span>
            </Menu.Button>
            <Menu.Items className="w-40">
              <Menu.Item onClick={() => printLayar(dataExport(), 'Laporan Pemasukan')}>
                <Lucide icon="Printer" className="w-4 h-4 mr-2" /> Print
              </Menu.Item>
              <Menu.Item onClick={() => exportToExcel(dataExport(), `Pemasukan_${Date.now()}`)}>
                <Lucide icon="FileText" className="w-4 h-4 mr-2" /> Export to Excel
              </Menu.Item>
              <Menu.Item onClick={() => exportToPDF(dataExport(), 'Laporan Pemasukan', `Pemasukan_${Date.now()}`)}>
                <Lucide icon="FileText" className="w-4 h-4 mr-2" /> Export to PDF
              </Menu.Item>
            </Menu.Items>
          </Menu>

          <div className="flex items-center box px-3 py-2 border-slate-200 bg-white shadow-sm rounded-md intro-y ml-auto mr-2">
            <Lucide icon="Calendar" className="w-4 h-4 mr-2 text-slate-500" />
            <input type="date" className="w-28 bg-transparent border-none outline-none p-0 text-sm text-slate-700 focus:ring-0" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <span className="mx-2 text-slate-400">-</span>
            <input type="date" className="w-28 bg-transparent border-none outline-none p-0 text-sm text-slate-700 focus:ring-0" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            <div className="flex items-center gap-3 pl-3 ml-2 border-l border-slate-200">
              <button onClick={handleTerapkanFilterTanggal} className="text-slate-500 hover:text-success"><Lucide icon="Filter" className="w-4 h-4" /></button>
              <button onClick={handleResetFilterTanggal} className="text-slate-500 hover:text-danger"><Lucide icon="X" className="w-4 h-4" /></button>
            </div>
          </div>
          <SearchPages searchQuery={searchQuery} handleSearchChange={handleSearchChange} />
        </div>

        <div className="col-span-12 overflow-auto intro-y lg:overflow-visible">
          <Table className="border-spacing-y-[10px] border-separate -mt-2">
            <Table.Thead>
              <Table.Tr>
                <Table.Th className="border-b-0 whitespace-nowrap">No</Table.Th>
                <Table.Th className="border-b-0 whitespace-nowrap">Sumber</Table.Th>
                <Table.Th className="border-b-0 whitespace-nowrap text-right">Jumlah</Table.Th>
                <Table.Th className="border-b-0 whitespace-nowrap">Keterangan</Table.Th>
                <Table.Th className="border-b-0 whitespace-nowrap">User</Table.Th>
                <Table.Th className="border-b-0 whitespace-nowrap">Tanggal</Table.Th>
                <Table.Th className="text-center border-b-0 whitespace-nowrap">AKSI</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {loading ? (
                <Table.Tr><Table.Td colSpan={7} className="text-center">Loading...</Table.Td></Table.Tr>
              ) : currentItems.map((item, index) => (
                <Table.Tr key={item._id} className="intro-x">
                  <Table.Td className="bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b] first:rounded-l-md last:rounded-r-md">{angkaAwal + index + 1}</Table.Td>
                  <Table.Td className="bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"><div className="font-medium whitespace-nowrap">{item.sumber}</div></Table.Td>
                  <Table.Td className="bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b] text-right">Rp {item.jumlah_pemasukan.toLocaleString('id-ID')}</Table.Td>
                  <Table.Td className="bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]">{item.keterangan || '-'}</Table.Td>
                  <Table.Td className="bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]">{item.kode_user}</Table.Td>
                  <Table.Td className="bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]">{new Date(item.tanggal_pemasukan || '').toLocaleDateString('id-ID')}</Table.Td>
                  <Table.Td className="bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b] text-center first:rounded-l-md last:rounded-r-md">
                    <div className="flex justify-center items-center">
                      <button className="flex items-center mr-3 text-primary" onClick={() => navigate(`/pemasukan/edit/${item._id}`)}><Lucide icon="CheckSquare" className="w-4 h-4 mr-1" /> Edit</button>
                      <button className="flex items-center text-danger" onClick={() => handleDelete(item._id!)}><Lucide icon="Trash2" className="w-4 h-4 mr-1" /> Delete</button>
                    </div>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </div>
        <PaginationPages totalPages={totalPages} currentPages={currentPage} handlePageChange={handlePageChange} handlePerPageChange={handlePerPageChange} />
      </div>
    </>
  )
}

export default Pemasukan