import React, { useContext } from 'react'
import { ProductContext } from '../context/ProductContext'

function Pagination() {
  const { currentPage, setCurrentPage, PAGE_SIZE, totalPage } = useContext(ProductContext);
  // const total = 0;
  const maxPage = Math.ceil(totalPage / PAGE_SIZE);

  const pages = Array.from({ length: maxPage }, (_, i) => i)

  return (
    <div className='product--pagination'>
      <button
        disabled={currentPage === 0}
        onClick={() => setCurrentPage(currentPage - 1)}
      >
        Previous
      </button>
      {pages.map(page => (
        <button key={page}
          onClick={() => setCurrentPage(page)}
          className={page === currentPage ? 'active--page' : ''}
        >
          {page + 1}
        </button>
      ))}
      <button
        onClick={() => setCurrentPage(currentPage + 1)}
        disabled={currentPage === maxPage - 1}
      >
        Next
      </button>
    </div>
  )
}

export default Pagination