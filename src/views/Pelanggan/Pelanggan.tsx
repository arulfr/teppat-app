import Button from '@/components/Base/Button'
import Lucide from '@/components/Base/Lucide'
import React, { ChangeEvent, useEffect, useState } from 'react'
import SearchPages from '../Components/SearchPages'
import Table from '@/components/Base/Table'
import { Menu } from '@/components/Base/Headless'
import { useAppDispatch, useAppSelector } from '@/stores/hooks'
import { pelangganDelete, pelangganGet } from '@/stores/PelangganSlice'
import PaginationPages from '../Components/PaginationPages'
import DeleteDialog from '../Components/DeleteDialog'
import PelangganAdd from './PelangganAdd'
import PelangganEdit from './PelangganEdit'
import { toast } from 'react-toastify'


const Pelanggan = () => {

        const dispatch = useAppDispatch();
        const pelanggan = useAppSelector(state=>state.PelangganSlice.pelanggan);
        const [selectId,setSelectId] = useState('');
        const [buttonAddModal,setButtonAddModal] = useState(false);
        const [pelangganEditModal,setPelangganEditModal] = useState(false);
        const [deleteConfirmationModal,setDeleteConfirmationModal] = useState(false);
        const [searchQuery,setSearchQuery] = useState('');
    
        const submitDelete = async()=>{
            try {
              await dispatch(pelangganDelete(selectId)).unwrap();
              
              toast.success('Delete Berhasil',{
                position:'top-right',
                autoClose:3000
              });
              setDeleteConfirmationModal(false);
            } catch (error) {
              let msgError;
              if(error instanceof Error){
                msgError = error.message || 'Error Silahkan Coba Lagi';
              }
              toast.error(msgError,{
                position:'top-right',
                autoClose:3000
              })
            }
        }
    
        useEffect(()=>{
          dispatch(pelangganGet());
        },[]);
    
    
        //======== search =========
    
        const filterSearch = pelanggan.filter((item)=>
            JSON.stringify(item).toLowerCase().includes(searchQuery.toLowerCase())
        );
    
        const handleSearchChange = (e:ChangeEvent<HTMLInputElement>)=>{
          setSearchQuery(e.target.value);
          setCurrentPage(1);
        }
      // ==================================
    
        //entries perpage & pagination
        const [currentPage,setCurrentPage] = useState(1);
        const [perPages,setPerPages] = useState(10);
    
        const totalPages = Math.ceil(filterSearch.length/perPages);
        const angkaAkhir = currentPage * perPages;
        const angkaAwal = angkaAkhir - perPages;
        const currentPelanggan = filterSearch.slice(angkaAwal,angkaAkhir);
    
        //======== pagination ========
        const handlePageChange = (page:number)=>{
          setCurrentPage(page);
        }
    
        const handlePerPageChange = (e:ChangeEvent<HTMLSelectElement>)=>{
          setPerPages(Number(e.target.value));
          setCurrentPage(1);
        }

  return (
    <>
      <h2 className="mt-10 text-lg font-medium intro-y">Data List Layout</h2>
      <div className="grid grid-cols-12 gap-6 mt-5">
        <div className="flex flex-wrap items-center col-span-12 mt-2 intro-y sm:flex-nowrap">
          <Button variant="primary" className="mr-2 shadow-md" onClick={()=>{setButtonAddModal(!buttonAddModal)}}>
            <Lucide icon="Plus" className="w-4 h-4 mr-2" /> Add Pelanggan
          </Button>
          <div className="hidden mx-auto md:block text-slate-500">
              Showing {angkaAwal + 1} to {Math.min(angkaAkhir, currentPelanggan.length)} of {currentPelanggan.length} entries
          </div>
        {/*  Begin : Search */}
          <SearchPages searchQuery={searchQuery} handleSearchChange={handleSearchChange} />
        {/* end */}
        </div>
        {/* BEGIN: Data List */}
        <div className="col-span-12 overflow-auto intro-y lg:overflow-visible">
          <Table className="border-spacing-y-[10px] border-separate -mt-2">
            <Table.Thead>
              <Table.Tr>
                <Table.Th className="border-b-0 whitespace-nowrap">
                  No
                </Table.Th>
                <Table.Th className="border-b-0 whitespace-nowrap">
                  Nama Pelanggan
                </Table.Th>
                <Table.Th className="border-b-0 whitespace-nowrap">
                  No Telepon
                </Table.Th>
                <Table.Th className="border-b-0 whitespace-nowrap">
                  Jenis Pelanggan
                </Table.Th>
                <Table.Th className="text-center border-b-0 whitespace-nowrap">
                  ACTIONS
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
            {currentPelanggan.map((item,index)=>{
              return(
               <Table.Tr key={item._id || index} className="intro-x">
                  <Table.Td className="first:rounded-l-md last:rounded-r-md w-40 bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]">
                    {angkaAwal +index + 1}
                  </Table.Td>
                  <Table.Td className="first:rounded-l-md last:rounded-r-md bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]">
                    {item.nama_pelanggan}
                  </Table.Td>
                  <Table.Td className="first:rounded-l-md last:rounded-r-md bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]">
                    {item.no_telp}
                  </Table.Td>
                  <Table.Td className="first:rounded-l-md last:rounded-r-md bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]">
                    {item.tipe_pelanggan}
                  </Table.Td>
                  <Table.Td className="first:rounded-l-md last:rounded-r-md w-40 bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]">
                    <div className="flex items-center justify-center">
                      <Menu>
                          <Menu.Button as={Button} variant="ghost" className={"p-2"}>
                              <Lucide icon="MoreVertical" className="w-6 h-6" />
                          </Menu.Button>
                          <Menu.Items className="w-48">
                              <Menu.Item onClick={(e:MouseEvent)=>{
                                e.preventDefault();
                                setPelangganEditModal(true)
                                setSelectId(item._id || '');
                                }}>
                                  <Lucide icon="FilePenLine" className="w-4 h-4 mr-2" /> EDIT
                              </Menu.Item>
                              <Menu.Item onClick={(e:MouseEvent)=>{
                                    e.preventDefault();
                                    setDeleteConfirmationModal(true);
                                    setSelectId(item._id || '');
                                  }} >
                                  <Lucide icon="Trash" className="w-4 h-4 mr-2" />{" "}
                                    DELETE
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
        
      {/* BEGIN: Pagination */}
      <PaginationPages totalPages={totalPages} currentPages={currentPage} handlePageChange={handlePageChange} handlePerPageChange={handlePerPageChange} />
      {/* END: Pagination */}



      {/* BEGIN: Delete Confirmation Modal */}
      <DeleteDialog deleteConfirmationModal={deleteConfirmationModal} setDeleteConfirmationModal={setDeleteConfirmationModal} submitDelete={submitDelete} />
      {/* END: Delete Confirmation Modal */}
      {/* pelanggan Add */}
      <PelangganAdd pelangganAddModal={buttonAddModal} setPelangganAddModal={setButtonAddModal} />
      {/* End Supplier Add*/}
      <PelangganEdit pelangganEditModal={pelangganEditModal} setPelangganEditModal={setPelangganEditModal} selectId={selectId} />
      </div>
    </>
  )
}

export default Pelanggan