import React from 'react'
import { Dialog } from '@/components/Base/Headless';
import Lucide from '@/components/Base/Lucide';
import Button from '@/components/Base/Button';
import { KategoriDelete } from '@/stores/AdminSlice';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '../../stores/hooks';


type SetState<T> = React.Dispatch<React.SetStateAction<T>>;
type deleteType = {
    deleteConfirmationModal:boolean
    setDeleteConfirmationModal:SetState<boolean>
    deleteButtonRef?:React.RefObject<HTMLButtonElement>
    submitDelete?:()=>void
}

const DeleteDialog = ({deleteConfirmationModal,setDeleteConfirmationModal,deleteButtonRef,submitDelete}:deleteType) => {
  return (
    <>
      <Dialog
        open={Boolean(deleteConfirmationModal)}
        onClose={() => {
          setDeleteConfirmationModal(false);
        }}
        initialFocus={deleteButtonRef}
      >
        <Dialog.Panel>
          <div className="p-5 text-center">
            <Lucide
              icon="XCircle"
              className="w-16 h-16 mx-auto mt-3 text-danger"
            />
            <div className="mt-5 text-3xl">Are you sure?</div>
            <div className="mt-2 text-slate-500">
              Do you really want to delete these records? <br />
              This process cannot be undone.
            </div>
          </div>
          <div className="px-5 pb-8 text-center">
            <Button
              variant="outline-secondary"
              type="button"
              onClick={() => {
                setDeleteConfirmationModal(false);
              }}
              className="w-24 mr-1"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              type="button"
              className="w-24"
              ref={deleteButtonRef}
              onClick={submitDelete}
            >
              Delete
            </Button>
          </div>
        </Dialog.Panel>
      </Dialog>
    </>
  )
}

export default DeleteDialog;