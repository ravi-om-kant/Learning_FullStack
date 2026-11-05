import React, { useEffect, useState } from 'react'
import { useDebounce } from '../hooks/useDebounce';

function SearchBar({searchTerm,onSearchChange}) {
    const [value, setValue] = useState("");
    const dval = useDebounce(value);
    
    useEffect(() => {
        onSearchChange(dval);
    },[dval, onSearchChange]);
    
    console.log(dval);
    const handleChange = (event) => {
        setValue(event.target.value);
    }

    
  return (
    <div>
        <input value={value} onChange={handleChange} placeholder='Search by Name/Product'/>
    </div>
  )
}

export default SearchBar