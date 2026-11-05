import React, { useContext, useEffect, useState } from 'react'
import SearchBar from './SearchBar'
import { ProductContext } from '../context/ProductContext';
import { getCategoryList } from '../services/productService';

// function Filters({searchTerm, onSearchChange}) {
function Filters() {
    const { selectCategory, setSelectCategory, searchTerm, setSearchTerm, sortBy, setSortBy } = useContext(ProductContext);

    const [category, setCategory] = useState([]);

    useEffect(() => {
        // getCategoryList()
        //     .then(setCategory)
        //     .catch(err => alert(err.message));
        const controller = new AbortController();
        getCategoryList(controller.signal)
        .then(setCategory)
        .catch(err => {
            if(err.name !== "AbortError") alert(err.message);
        })
        
        return () => {
            controller.abort();
        }
    }, []);

    const handleChange = (event) => {
        setSelectCategory(event.target.value)
    }

    const handleSortChange = (event) => {
        setSortBy(event.target.value)
    }

    return (
        <div className='product--filter'>
            <SearchBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
            />
            <div className='product--dropdown'>
                <div className='product--category dropdowm'>
                    <select value={selectCategory} onChange={handleChange}>
                        <option value={""}>Category</option>
                        {category && category.map(c => <option key={c} value={c}>{`${c.charAt(0).toUpperCase() + c.slice(1, c.length)}`}</option>)}
                        {/* <option value="fruits">Fruites</option>
                        <option value={"vegitables"}>Vegitables</option>
                        <option value={"snaks"}>Snaks</option>
                        <option value={"kitchen"}>Kitchen</option> */}
                    </select>
                </div>
                <div className='product--sort dropdowm'>
                    <select value={sortBy} onChange={handleSortChange}>
                        <option value="">Sort</option>
                        <option value="price-asc">Price: Low to High</option>
                        <option value="price-desc">Price: High to Low</option>
                        <option value="rating-desc">Rating: High to Low</option>
                    </select>
                </div>
            </div>
        </div>
    )
}

export default Filters