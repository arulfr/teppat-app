import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Lucide from '@/components/Base/Lucide';
import Button from '@/components/Base/Button';
import FormInput from '@/components/Base/Form/FormInput';
import Table from '@/components/Base/Table';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import { getSatuan, deleteSatuan } from '@/stores/SatuanSlice';
import DeleteDialog from './../Components/DeleteDialog';
import { toast } from 'react-toastify';


const SatuanData = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const satuan = useAppSelector(state => state.SatuanSlice.satuan);

    const [selectId, setSelectId] = useState('');
    const [deleteConfirmationModal, setDeleteConfirmationModal] = useState(false);

    const submitDelete = async () => {
        try {
            await dispatch(deleteSatuan(selectId)).unwrap();
            toast.success('Satuan Berhasil Dihapus', {
                position: 'top-right',
                autoClose: 3000,
            });
            setDeleteConfirmationModal(false);
        } catch (error) {
            let errorMsg = 'Error, Silahkan Coba Lagi';
            if (error instanceof Error) {
                errorMsg = error.message;
            }
            toast.error(errorMsg, {
                position: 'top-right',
                autoClose: 3000,
            });
        }
    };

    useEffect(() => {
        dispatch(getSatuan());
    }, []);

    return (
    <>
      <h2 className="mt-10 text-lg font-medium intro-y">Data List Layout</h2>
      <div className="grid grid-cols-12 gap-6 mt-5">
        <div className="flex flex-wrap items-center col-span-12 mt-2 intro-y sm:flex-nowrap">
          <Button variant="primary" className="mr-2 shadow-md" onClick={()=>{navigate('/satuan/satuan_add')}}>
            <Lucide icon="Plus" className="w-4 h-4 mr-2" /> Add Satuan
          </Button>
          <div className="hidden mx-auto md:block text-slate-500">
              {/* Showing {indexFirst + 1} to {Math.min(indexLast, filteredUser.length)} of {filteredUser.length} entries */}
          </div>
          <div className="w-full mt-3 sm:w-auto sm:mt-0 sm:ml-auto md:ml-0">
            <div className="relative w-56 text-slate-500">
              <FormInput
                type="text"
                className="w-56 pr-10 !box"
                placeholder="Search..."
                // value={searchQuery}
                // onChange={handleSearchChange}  
              />
              <Lucide
                icon="Search"
                className="absolute inset-y-0 right-0 w-4 h-4 my-auto mr-3"
              />
            </div>
          </div>
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
                  Nama Satuan
                </Table.Th>
                <Table.Th className="border-b-0 whitespace-nowrap">
                  Kategori Satuan
                </Table.Th>
                <Table.Th className="text-center border-b-0 whitespace-nowrap">
                  ACTIONS
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
            {satuan.map((item,index)=>{
              return(
               <Table.Tr key={item._id} className="intro-x">
                  <Table.Td className="first:rounded-l-md last:rounded-r-md w-40 bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]">
                    {index + 1}
                  </Table.Td>
                  <Table.Td className="first:rounded-l-md last:rounded-r-md bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]">
                    {item.satuan}
                  </Table.Td>
                  <Table.Td className="first:rounded-l-md last:rounded-r-md bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]">
                    {item.kategori === 'ecer' ? 'Eceran (Satuan Terkecil / Bisa Dikonversi)' : 'Grosir (Satuan Besar / Tidak Perlu Konversi)'}
                  </Table.Td>
                  <Table.Td className="first:rounded-l-md last:rounded-r-md w-56 bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b] py-0 relative before:block before:w-px before:h-8 before:bg-slate-200 before:absolute before:left-0 before:inset-y-0 before:my-auto before:dark:bg-darkmode-400">
                    <div className="flex items-center justify-center">
                        <a className="flex items-center mr-3 cursor-pointer"  onClick={()=>navigate(`/satuan/satuan_edit/${item?._id}`)} >
                          <Lucide icon="CheckSquare" className="w-4 h-4 mr-1" />
                          Edit
                        </a>
                        <a
                          className="flex items-center text-danger cursor-pointer"
                          onClick={(event) => {
                            event.preventDefault();
                            setSelectId(item._id ?? '');
                            setDeleteConfirmationModal(true);
                          }}
                        >
                          <Lucide icon="Trash2" className="w-4 h-4 mr-1"/> Delete
                        </a>
                      </div>
                  </Table.Td>
                </Table.Tr>
              )
            })}
            </Table.Tbody>
          </Table>
        </div>
        
        {/* END: Data List */}
        {/* BEGIN: Pagination */}

      {/* BEGIN: Delete Confirmation Modal */}
      <DeleteDialog deleteConfirmationModal={deleteConfirmationModal} setDeleteConfirmationModal={setDeleteConfirmationModal} submitDelete={submitDelete} />
      {/* END: Delete Confirmation Modal */}
      </div>
    </>
    );
};


export default SatuanData;