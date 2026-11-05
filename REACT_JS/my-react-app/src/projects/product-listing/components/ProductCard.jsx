import React from 'react'

function ProductCard({product}) {
    const {price, title, rating, images} = product;
  return (
    <div className='card'>
        <div className='card-image'>
            <img src={images[0]} alt={title}/>
        </div>
        <div className='card-detils'>
            <p>{title}</p>
            <p>{price}</p>
            <p>Rating {rating}</p>
        </div>
        <div className='card-button'>
            <button>Add to Card</button>
        </div>
    </div>
  )
}

export default ProductCard