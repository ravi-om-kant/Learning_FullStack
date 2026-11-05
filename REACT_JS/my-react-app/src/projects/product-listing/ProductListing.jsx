import React, { useContext, useEffect, useMemo, useState } from 'react'
import ProductList from './components/ProductList';
import "./product.css"
import Cart from './components/Cart';
import Filters from './components/Filters';
import Pagination from './components/Pagination';
import { ProductContext } from './context/ProductContext';
import { getProducts } from './services/productService';
import { useCart } from './hooks/useCart';

function ProductListing() {
    // const { data, error, loading } = getProducts();
    const { searchTerm, setSearchTerm, selectCategory, sortBy, currentPage, PAGE_SIZE, setTotalPage, setCurrentPage } = useContext(ProductContext);
    const { totalCount } = useCart();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError(null);
        console.log(searchTerm, selectCategory, "searchTerm", "selectCategory");
        getProducts({
            searchTerm,
            category: selectCategory,
            sortBy,
            skip: (currentPage) * PAGE_SIZE,
            limit: PAGE_SIZE
        }, controller.signal)
            .then(d => {
                setData(d);
                setTotalPage(d?.total)
                console.log(d?.total);
            })
            .catch(err => {
                if (err.name !== 'AbortError') setError(err.message);
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });

        return () => {
            controller.abort();
        }

    }, [searchTerm, selectCategory, sortBy, currentPage]);


    // const [searchTerm, setSearchTerm] = useState("");
    // const productList = data?.products ?? [];
    const productList = useMemo(() => {
        const products = data?.products ?? [];

        // return products.filter(product => 
        //     product?.title.toLowerCase().includes(searchTerm.toLocaleLowerCase())
        // )
        return products;
    }, [data]);
    console.log(data, error, loading);
    return (

        <div className='product--main'>
            <div className='product--header'>
                <h2 style={{ margin: 0 }}>Shoping Hero</h2>
                <div>
                    <span>🛒 {totalCount}</span>
                    <Cart />
                </div>
            </div>
            <Filters />
            {/* searchTerm={searchTerm} onSearchChange={setSearchTerm}/> */}
            <ProductList products={productList} error={error} loading={loading} />
            <Pagination />
        </div>
    )
}

export default ProductListing;



/*

import React, { useContext, useEffect, useMemo, useState } from 'react'
import ProductList from './components/ProductList';
import "./product.css"
import Cart from './components/Cart';
import Filters from './components/Filters';
import Pagination from './components/Pagination';
import { ProductContext } from './context/ProductContext';
import { getProducts } from './services/productService';

function ProductListing() {
    const {searchTerm, setSearchTerm, selectCategory} = useContext(ProductContext);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError(null);
        getProducts({ searchTerm, category: selectCategory }, controller.signal)
            .then(setData)
            .catch(err => {
                if (err.name !== 'AbortError') setError(err.message);
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });
        return () => controller.abort();
    }, [searchTerm, selectCategory]);
    // const [searchTerm, setSearchTerm] = useState("");
    // const productList = data?.products ?? [];
    const productList = useMemo(() => {
        const products = data?.products ?? [];
        // return products.filter(product => 
        //     product?.title.toLowerCase().includes(searchTerm.toLocaleLowerCase())
        // )
        return products;
    },[data]);
    console.log(data, error, loading);
    return (
        
        <div className='product--main'>
            <div className='product--header'>
                <h2 style={{margin: 0}}>Shoping Hero</h2>
                <Cart />
            </div>
            <Filters searchTerm={searchTerm} onSearchChange={setSearchTerm}/>
            <ProductList products={productList} error={error} loading={loading} />
            <Pagination />
        </div>
    )
}

export default ProductListing

*/