import { FormInput } from '@/components/Base/Form'
import Lucide from '@/components/Base/Lucide'
import React, { ChangeEvent } from 'react'

interface searchProps{
    searchQuery:string,
    handleSearchChange:(e:ChangeEvent<HTMLInputElement>)=>void;
}

const SearchPages = ({searchQuery,handleSearchChange}:searchProps) => {
  return (
    <>
        <div className="w-full mt-3 sm:w-auto sm:mt-0 sm:ml-auto md:ml-2">
            <div className="relative w-56 text-slate-500">
              <FormInput
                type="text"
                className="w-56 pr-10 !box"
                placeholder="Search..."
                value={searchQuery}
                onChange={handleSearchChange}  
              />
              <Lucide
                icon="Search"
                className="absolute inset-y-0 right-0 w-4 h-4 my-auto mr-3"
              />
            </div>
          </div>
    </>
  )
}

export default SearchPages