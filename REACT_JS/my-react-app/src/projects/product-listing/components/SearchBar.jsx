import { useEffect, useState } from 'react'
import { useDebounce } from '../hooks/useDebounce';

function SearchBar({ onSearchChange, setCurrentPage }) {
    const [value, setValue] = useState("");
    const dval = useDebounce(value);

    useEffect(() => {
        onSearchChange(dval);
        setCurrentPage(0);
    }, [dval, onSearchChange, setCurrentPage]);

    const handleChange = (event) => {
        setValue(event.target.value);
    }

    return (
        <div className="search-bar">
            <div>
                <input
                    type="text"
                    value={value}
                    onChange={handleChange}
                    placeholder='Search by Name/Product'
                    aria-label="Search products by name"
                />
            </div>
        </div>
    )
}

export default SearchBar