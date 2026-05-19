import { FormSelect } from '@/components/Base/Form';
import Lucide from '@/components/Base/Lucide';
import Pagination from '@/components/Base/Pagination';
import React, { ChangeEvent } from 'react'

interface PaginationProps{
    totalPages:number;
    currentPages:number,
    handlePageChange:(page:number)=>void,
    handlePerPageChange:(e:ChangeEvent<HTMLSelectElement>)=>void
}

const PaginationPages = ({totalPages,currentPages,handlePageChange,handlePerPageChange}:PaginationProps) => {

    const getPagination = (totalPages:number,currentPages:number,numberPages:number = 3) : number[] =>{
        const half = Math.floor(numberPages/2);
        let start = currentPages-half;
        let end = currentPages + half;
        if(start<1){
            start = 1;
            end = Math.min(numberPages,totalPages);
        }
        if(end > totalPages){
            start = Math.max(totalPages-numberPages+1,1);
            end = totalPages;
        }

        const pages:number[]=[];

        for (let i= start;  i <= end; i++) {
            pages.push(i);
        }
        return pages;

    }

    const pageShow =  getPagination(totalPages,currentPages);



  return (
    <>
    <div className="flex flex-wrap items-center col-span-12 intro-y sm:flex-row sm:flex-nowrap">
        <Pagination className="w-full sm:w-auto sm:mr-auto">
          <Pagination.Link>
            <Lucide icon="ChevronsLeft" className="w-4 h-4" onClick={()=>handlePageChange(1)} />
          </Pagination.Link>
          <Pagination.Link>
            <Lucide icon="ChevronLeft" className="w-4 h-4" onClick={()=>handlePageChange(Math.max(currentPages-1,1))} />
          </Pagination.Link>
          {/* {pages} */}
            {pageShow.map((pageNumber) => (
              <span 
                key={pageNumber}
                  onClick={(e) => {
                    handlePageChange(pageNumber);
                  }}
                >
              <Pagination.Link active={currentPages === pageNumber} >
                  {pageNumber}
              </Pagination.Link>
              </span>
            ))}
          <Pagination.Link>
            <Lucide icon="ChevronRight" className="w-4 h-4" onClick={()=>handlePageChange(Math.min(currentPages+1,totalPages))} />
          </Pagination.Link>
          <Pagination.Link>
            <Lucide icon="ChevronsRight" className="w-4 h-4" onClick={()=>handlePageChange(totalPages)} />
          </Pagination.Link>
        </Pagination>
        <FormSelect className="w-20 mt-3 !box sm:mt-0" onChange={handlePerPageChange}>
          <option>10</option>
          <option>25</option>
          <option>35</option>
          <option>50</option>
        </FormSelect>
      </div>
    </>
  )
}

export default PaginationPages