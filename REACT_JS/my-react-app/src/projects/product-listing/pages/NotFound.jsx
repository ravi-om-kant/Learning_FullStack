import { useNavigate } from 'react-router-dom';

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className='not-found-page'>
      <div className='not-found-container'>
        <h1 className='error-code'>404</h1>
        <h2 className='error-title'>Page Not Found</h2>
        <p className='error-message'>
          Sorry, the page you're looking for doesn't exist or has been moved.
        </p>
        <div className='error-actions'>
          <button
            onClick={() => navigate('/product')}
            className='back-home-btn'
          >
            ← Back to Products
          </button>
          <button
            onClick={() => navigate('/product/cart')}
            className='go-cart-btn'
          >
            🛒 Go to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
