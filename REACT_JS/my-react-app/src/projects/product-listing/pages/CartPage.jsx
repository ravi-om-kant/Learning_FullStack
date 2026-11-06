import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';

function CartPage() {
  const navigate = useNavigate();
  const { items, totalPrice, increment, decrement, remove, clear } = useCart();

  return (
    <div className='cart-page'>
      <div className='cart-page-header'>
        <button onClick={() => navigate('/product')} className='back-btn'>
          ← Back to Shopping
        </button>
        <h1>Shopping Cart</h1>
      </div>

      {items.length === 0 ? (
        <div className='empty-cart-page'>
          <p>Your cart is empty</p>
          <button onClick={() => navigate('/')} className='continue-btn'>
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className='cart-page-container'>
          {/* Cart Items */}
          <div className='cart-items-section'>
            <h2>Items ({items.length})</h2>
            <div className='cart-items-list'>
              {items.map(item => (
                <div key={item.id} className='cart-item-row'>
                  <img src={item.thumbnail} alt={item.title} />
                  <div className='item-info'>
                    <h3>{item.title}</h3>
                    <p className='price'>${item.price}</p>
                  </div>
                  <div className='quantity-controls'>
                    <button onClick={() => decrement(item.id)}>−</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => increment(item.id)}>+</button>
                  </div>
                  <div className='item-total'>
                    <p>${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                  <button onClick={() => remove(item.id)} className='remove-btn'>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Cart Summary */}
          <div className='cart-summary'>
            <h2>Order Summary</h2>
            <div className='summary-row'>
              <span>Subtotal:</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <div className='summary-row'>
              <span>Shipping:</span>
              <span>FREE</span>
            </div>
            <div className='summary-row total'>
              <span>Total:</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <button className='checkout-btn'>Proceed to Checkout</button>
            <button onClick={() => navigate('/product')} className='continue-shopping-btn'>
              Continue Shopping
            </button>
            <button onClick={clear} className='clear-cart-btn'>
              Clear Cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartPage;
