import React from 'react'
import FormExample from './shared/components/FormExample'
import ProductListing from './projects/product-listing/ProductListing'
import { ProductProvider } from './projects/product-listing/context/ProductContext'

function App() {
  return (
    <div>
      {/* <h1>Hello, React!</h1> */}
      {/* <FormExample /> */}
      <ProductProvider>
        <ProductListing />
      </ProductProvider>
    </div>
  )
}

export default App