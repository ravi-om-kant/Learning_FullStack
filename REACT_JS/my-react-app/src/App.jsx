import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import FormExample from './shared/components/FormExample'
import ProductListing from './projects/product-listing/ProductListing'
import CartPage from './projects/product-listing/pages/CartPage'
import { ProductProvider } from './projects/product-listing/context/ProductContext'
import { CartProvider } from './projects/product-listing/context/CartContext'

function App() {
  return (
    <Router>
      <CartProvider>
        <ProductProvider>
          <Routes>
            <Route path="/" element={<ProductListing />} />
            <Route path="/cart" element={<CartPage />} />
          </Routes>
        </ProductProvider>
      </CartProvider>
    </Router>
  )
}

export default App