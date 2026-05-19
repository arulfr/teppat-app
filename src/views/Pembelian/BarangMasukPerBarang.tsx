import Button from '@/components/Base/Button';
import { FormInput, FormSelect } from '@/components/Base/Form';
import { Menu } from '@/components/Base/Headless';
import Lucide from '@/components/Base/Lucide';
import Pagination from '@/components/Base/Pagination';
import Table from '@/components/Base/Table';
import { Plus } from 'lucide-react';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import { pembelianPerBarang } from '@/stores/PembelianSlice';
import { IPembelianBarang, FilterParams } from '@/utils/types';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { exportToExcel, exportToPDF, printLayar } from '@/utils/ExportHelper';
import { sum } from 'lodash';

const BarangMasukPerBarang = () => {
  const dispatch = useAppDispatch();
  const pembelianPerbarangList: IPembelianBarang[] = useAppSelector((state) => state.PembelianSlice.pembelianPerbarang);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Pagination
  const [perPages, setPerPages] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  const currentPage = Number(searchParams.get('page')) || 1;
  
  const filteredData = useMemo(() => 
    pembelianPerbarangList.filter((item: IPembelianBarang) => 
      JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase())
    ), [pembelianPerbarangList, searchTerm]
  );

  const lastIndex = perPages * currentPage;
  const firstIndex = lastIndex - perPages;
  const slicePage = filteredData.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(filteredData.length / perPages);

  const pageShow = 3;
  const midPages = Math.floor(pageShow / 2);
  let startNum = currentPage - midPages;
  let endNum = currentPage + midPages;
  if (startNum < 1) {
    startNum = 1;
    endNum = Math.min(pageShow, totalPages);
  }
  if (endNum > totalPages) {
    endNum = totalPages;
    startNum = Math.max(totalPages - pageShow + 1, 1);
  }
  const pages: number[] = [];
  for (let i = startNum; i <= endNum; i++) {
    pages.push(i);
  }

  const handlePageChange = useCallback((pageNum: number) => {
    setSearchParams({ page: pageNum.toString() });
  }, [setSearchParams]);

  const handlePerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPerPages(Number(e.target.value));
    setSearchParams({ page: '1' });
  };

  // Date filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    dispatch(pembelianPerBarang());
  }, [dispatch]);

  const handleTerapkanFilter = () => {
    if (!startDate || !endDate) {
      toast.warning("Pilih tanggal awal dan akhir.", { position: "top-right", autoClose: 3000 });
      return;
    }
    const params: FilterParams = { startDate, endDate };
    dispatch(pembelianPerBarang(params));
  };

  const handleResetFilter = () => {
    setStartDate('');
    setEndDate('');
    dispatch(pembelianPerBarang());
  };

  // Export data
  const dataExport = useMemo(() => 
    filteredData.map((item, index) => ({
      "No": index + 1,
      "No Pembelian": item.id_pembelian,
      "Nama Barang": item.nama_barang,
      "Jumlah": item.jumlah,
      "Harga Beli": item.harga_beli,
      "Sub Total": item.subtotal
    })), [filteredData]
  );

  const totalQty = filteredData.reduce((sum,item)=>sum + (item.jumlah || 0),0);
  const totalBeli = filteredData.reduce((sum,item)=>sum+(item.subtotal||0),0);


  const handlePrint = () => {
    printLayar(dataExport, "Laporan Barang Masuk Per Barang");
  };

  const handleExportExcel = () => {
    exportToExcel(dataExport, `Barang_Masuk_Per_Barang_${Date.now()}`);
  };

  const handleExportPDF = () => {
    exportToPDF(dataExport, "Laporan Barang Masuk Per Barang", `Barang_Masuk_Per_Barang_${Date.now()}`);
  };

  return (
    <>
      <h2 className="mt-10 text-lg font-medium intro-y">Barang Masuk Per Barang</h2>
      <div className="grid grid-cols-12 gap-6 mt-5">

        <div className="col-span-12 intro-y">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 sm:col-span-4 box p-4">
              <div className="text-slate-500 text-xs">Total Jenis Barang</div>
              <div className="text-xl font-semibold mt-1">{filteredData.length}</div>
            </div>
            <div className="col-span-12 sm:col-span-4 box p-4">
              <div className="text-slate-500 text-xs">Total Qty Pembelian</div>
              <div className="text-xl font-semibold mt-1">{totalQty.toLocaleString('id-ID')}</div>
            </div>
            <div className="col-span-12 sm:col-span-4 box p-4">
              <div className="text-slate-500 text-xs">Total Transaksi Pembelian</div>
              <div className="text-xl font-semibold mt-1">Rp {totalBeli.toLocaleString('id-ID')}</div>
            </div>
          </div>
        </div>


        <div className="flex flex-wrap items-center col-span-12 mt-2 intro-y sm:flex-nowrap">
          <Button 
            variant="primary" 
            className="mr-2 shadow-md" 
            onClick={() => navigate('/inventaris/barang_masuk_input')}
          >
            <Plus className="w-4 h-4 ml-2" /> Tambah Barang
          </Button>
          <Menu>
            <Menu.Button as={Button} className="px-2 !box">
              <span className="flex items-center justify-center w-5 h-5">
                <Lucide icon="Download" className="w-4 h-4" />
              </span>
            </Menu.Button>
            <Menu.Items className="w-40">
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

          <div className="hidden mx-auto md:block text-slate-500"></div>

          {/* Filter Tanggal */}
          <label className="mb-1 text-xs font-medium text-slate-500 mr-2">Filter Tanggal</label>
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
                onClick={handleTerapkanFilter} 
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

          <div className="w-full mt-3 sm:w-auto sm:mt-0 sm:ml-auto md:ml-2">
            <div className="relative w-56 text-slate-500">
              <FormInput
                type="text"
                className="w-56 pr-10 !box"
                placeholder="Search barang..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Lucide icon="Search" className="absolute inset-y-0 right-0 w-4 h-4 my-auto mr-3" />
            </div>
          </div>
        </div>

        {/* Data List */}
        <div className="col-span-12 overflow-auto intro-y lg:overflow-visible">
          <Table className="border-spacing-y-[10px] border-separate -mt-2">
            <Table.Thead>
              <Table.Tr>
                <Table.Th className="border-b-0 whitespace-nowrap">No.</Table.Th>
                <Table.Th className="border-b-0 whitespace-nowrap">No Pembelian</Table.Th>
                <Table.Th className="border-b-0 whitespace-nowrap">Nama Barang</Table.Th>
                <Table.Th className="border-b-0 whitespace-nowrap text-center">Jumlah</Table.Th>
                <Table.Th className="border-b-0 whitespace-nowrap text-right">Harga Beli</Table.Th>
                <Table.Th className="border-b-0 whitespace-nowrap text-right">Sub Total</Table.Th>
                <Table.Th className="border-b-0 whitespace-nowrap text-right">Tanggal Transaksi</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {slicePage.map((item, index) => (
                <Table.Tr key={item.id_pembelian + item.kode_barang} className="intro-x">
                  <Table.Td className="box rounded-l-none rounded-r-none border-x-0 text-center shadow-[5px_3px_5px_#00000005] first:rounded-l-[0.6rem] first:border-l last:rounded-r-[0.6rem] last:border-r dark:bg-darkmode-600">
                    {firstIndex + index + 1}
                  </Table.Td>
                  <Table.Td className="box rounded-l-none rounded-r-none border-x-0 shadow-[5px_3px_5px_#00000005] first:rounded-l-[0.6rem] first:border-l last:rounded-r-[0.6rem] last:border-r dark:bg-darkmode-600">
                    <div 
                      className="font-medium whitespace-nowrap text-primary cursor-pointer underline" 
                      onClick={() => navigate(`/inventaris/detail_barang_masuk/${item.id_pembelian}`)}
                    >
                      {item.id_pembelian}
                    </div>
                  </Table.Td>
                  <Table.Td className="box rounded-l-none rounded-r-none border-x-0 shadow-[5px_3px_5px_#00000005] first:rounded-l-[0.6rem] first:border-l last:rounded-r-[0.6rem] last:border-r dark:bg-darkmode-600">
                    <div className="text-slate-500 whitespace-nowrap">{item.nama_barang}</div>
                  </Table.Td>
                  <Table.Td className="box rounded-l-none rounded-r-none border-x-0 text-center shadow-[5px_3px_5px_#00000005] first:rounded-l-[0.6rem] first:border-l last:rounded-r-[0.6rem] last:border-r dark:bg-darkmode-600">
                    <div className="font-medium">{item.jumlah} {item.satuan_pembelian}</div>
                  </Table.Td>
                  <Table.Td className="box rounded-l-none rounded-r-none border-x-0 text-right shadow-[5px_3px_5px_#00000005] first:rounded-l-[0.6rem] first:border-l last:rounded-r-[0.6rem] last:border-r dark:bg-darkmode-600">
                    <div className="font-medium whitespace-nowrap">
                      Rp. {Intl.NumberFormat('id-ID').format(Number(item.harga_beli))}
                    </div>
                  </Table.Td>
                  <Table.Td className="box rounded-l-none rounded-r-none border-x-0 text-right shadow-[5px_3px_5px_#00000005] first:rounded-l-[0.6rem] first:border-l last:rounded-r-[0.6rem] last:border-r dark:bg-darkmode-600">
                    <div className="font-medium whitespace-nowrap">
                      Rp. {Intl.NumberFormat('id-ID').format(Number(item.subtotal))}
                    </div>
                  </Table.Td>
                  <Table.Td className="box rounded-l-none rounded-r-none border-x-0 text-center shadow-[5px_3px_5px_#00000005] first:rounded-l-[0.6rem] first:border-l last:rounded-r-[0.6rem] last:border-r dark:bg-darkmode-600">
                    <div className="font-medium">{new Date(item.tanggal_pembelian).toLocaleString('id-ID',{day:'2-digit',month:'numeric',year:'numeric'})}</div>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex flex-wrap items-center col-span-12 intro-y sm:flex-row sm:flex-nowrap">
          <Pagination className="w-full sm:w-auto sm:mr-auto">
            <Pagination.Link >
              <Lucide icon="ChevronsLeft" className="w-4 h-4" onClick={() => handlePageChange(1)} />
            </Pagination.Link>
            <Pagination.Link>
              <Lucide icon="ChevronLeft" className="w-4 h-4" onClick={() => handlePageChange(currentPage > 1 ? currentPage - 1 : 1)} />
            </Pagination.Link>
            {pages.map((page) => (
              <Pagination.Link key={page} active={currentPage === page}>
                <span onClick={() => handlePageChange(page)}>{page}</span>
              </Pagination.Link>
            ))}
            <Pagination.Link>
              <Lucide icon="ChevronRight" className="w-4 h-4"  onClick={() => handlePageChange(currentPage < totalPages ? currentPage + 1 : totalPages)} />
            </Pagination.Link>
            <Pagination.Link>
              <Lucide icon="ChevronsRight" className="w-4 h-4" onClick={() => handlePageChange(totalPages)} />
            </Pagination.Link>
          </Pagination>
          <FormSelect className="w-20 mt-3 !box sm:mt-0" onChange={handlePerPageChange} value={perPages.toString()}>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="35">35</option>
            <option value="50">50</option>
          </FormSelect>
        </div>
      </div>
    </>
  );
};

export default BarangMasukPerBarang;

