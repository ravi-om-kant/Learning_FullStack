import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';

function Cart() {
  const navigate = useNavigate();
  const { totalCount } = useCart();

  return (
    <button onClick={() => navigate('/product/cart')} className='cart-btn'>
      🛒 Cart ({totalCount})
    </button>
  );
}

export default Cart