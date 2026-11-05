import { useReducer } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { cartReducer } from "../context/cartReducer";

export const CART_KEY = 'product-listing:cart:v1';
// export const useCart = () => {
//     const [item, setItems] = useLocalStorage(CART_KEY);
//     const [cart, dispatch] = useReducer(cartReducer, item);

//     const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
//     const totalPrice = cart.reduce((sum, item) => sum + (item.price & item.quantity), 0);

//     return {
//         items: cart,
//         totalCount,
//         totalPrice,
//         add: (product) => dispatch({ type: 'ADD', payload: product }),
//         increment: (id) => dispatch({ type: 'INCREMENT', payload: id }),
//         decrement: (id) => dispatch({ type: 'DECREMENT', payload: id }),
//         remove: (id) => dispatch({ type: 'REMOVE', payload: id }),
//         clear: () => dispatch({ type: 'CLEAR' }),
//     }

// }

export function useCart() {
    const [items, setItems] = useLocalStorage(CART_KEY, []);
    const [cart, dispatch] = useReducer(cartReducer, items);

    // Sync to localStorage when cart changes
    // (useEffect would go here in the actual implementation)

    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return {
        items: cart,
        totalCount,
        totalPrice,
        add: (product) => dispatch({ type: 'ADD', payload: product }),
        increment: (id) => dispatch({ type: 'INCREMENT', payload: id }),
        decrement: (id) => dispatch({ type: 'DECREMENT', payload: id }),
        remove: (id) => dispatch({ type: 'REMOVE', payload: id }),
        clear: () => dispatch({ type: 'CLEAR' }),
    };
}