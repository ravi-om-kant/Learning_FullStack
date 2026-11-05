import { useCart } from '../hooks/useCart';

function ProductCard({ product }) {
    const { add } = useCart();

    const handleAddToCart = () => {
        add({
            id: product.id,
            title: product.title,
            price: product.price,
            thumbnail: product.thumbnail,
        });
    };
    // const handleAddToCart = () => {
    //   add(product);  // Pass entire product object
    // };

    return (
        <div className='product-card card'>
            <div className="card-image">
                <img src={product.thumbnail} alt={product.title} />

            </div>
            <h3>{product.title}</h3>
            <p>${product.price}</p>
            <p>⭐ {product.rating}</p>

            <button onClick={handleAddToCart}>
                Add to Cart
            </button>
        </div>
    );
}

export default ProductCard;
