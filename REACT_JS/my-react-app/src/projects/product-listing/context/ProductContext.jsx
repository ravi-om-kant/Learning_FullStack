import { createContext, useState } from "react";


export const ProductContext = createContext();

export function ProductProvider({children}){
    const [searchTerm, setSearchTerm] = useState("");
    const [selectCategory, setSelectCategory] = useState("");
    const [sortBy, setSortBy] = useState("");
    const [currentPage, setCurrentPage] = useState(0);

    const value = {
        searchTerm, setSearchTerm,
        selectCategory, setSelectCategory,
        sortBy, setSortBy,
        currentPage, setCurrentPage
    };

    return (
        <ProductContext.Provider value={value}>
            {children}
        </ProductContext.Provider>
    )
};