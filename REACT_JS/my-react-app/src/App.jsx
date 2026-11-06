import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ProductListing from './projects/product-listing/ProductListing'
import CartPage from './projects/product-listing/pages/CartPage'
import NotFound from './projects/product-listing/pages/NotFound'
import { ProductProvider } from './projects/product-listing/context/ProductContext'
import { CartProvider } from './projects/product-listing/context/CartContext'

function App() {
  return (
    <Router>
      <CartProvider>
        <ProductProvider>
          <Routes>
            <Route path="/product" element={<ProductListing />} />
            <Route path="/product/cart" element={<CartPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ProductProvider>
      </CartProvider>
    </Router>
  )
}

export default App