import { createContext, useReducer, useEffect } from 'react';
import { cartReducer } from './cartReducer';

export const CartContext = createContext();

const CART_KEY = 'product-listing:cart:v1';

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, [], (initial) => {
    try {
      const stored = window.localStorage.getItem(CART_KEY);
      return stored ? JSON.parse(stored) : initial;
    } catch {
      return initial;
    }
  });

  // Sync to localStorage when cart changes
  useEffect(() => {
    window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const value = {
    items: cart,
    totalCount,
    totalPrice,
    add: (product) => dispatch({ type: 'ADD', payload: product }),
    increment: (id) => dispatch({ type: 'INCREMENT', payload: id }),
    decrement: (id) => dispatch({ type: 'DECREMENT', payload: id }),
    remove: (id) => dispatch({ type: 'REMOVE', payload: id }),
    clear: () => dispatch({ type: 'CLEAR' }),
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}
