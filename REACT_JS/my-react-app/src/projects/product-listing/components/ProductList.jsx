import React from 'react'
import ProductCard from './ProductCard'

function ProductList({ products, loading, error, onRetry, onAdd }) {

    if (loading) return <h1>Loading....</h1>

    if (error) return <div>{error}</div>

    if (!products.length) return <h1>No product found</h1>

    return <div className='product--lists'>
        {products.map(p => <ProductCard key={p.id} product={p}/>)}
    </div>
}

export default ProductList