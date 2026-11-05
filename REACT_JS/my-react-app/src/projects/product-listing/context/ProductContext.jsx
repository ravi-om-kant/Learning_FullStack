import { createContext, useState } from "react";


export const ProductContext = createContext();

export function ProductProvider({children}){
    const [searchTerm, setSearchTerm] = useState("");
    const [selectCategory, setSelectCategory] = useState("");
    const [sortBy, setSortBy] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPage, setTotalPage] = useState(0);
    const PAGE_SIZE = 10;
    

    const value = {
        searchTerm, setSearchTerm,
        selectCategory, setSelectCategory,
        sortBy, setSortBy,
        currentPage, setCurrentPage,
        totalPage, setTotalPage,
        PAGE_SIZE
    };

    return (
        <ProductContext.Provider value={value}>
            {children}
        </ProductContext.Provider>
    )
};