
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { getProductById, products } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { ProductGrid } from '@/components/products/ProductGrid';
import { Minus, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const product = getProductById(id!);
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  
  // Find related products (same category)
  const relatedProducts = product
    ? products
        .filter(
          (p) => p.category === product.category && p.id !== product.id
        )
        .slice(0, 4)
    : [];
  
  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
            <p className="mb-6">The product you're looking for doesn't exist or has been removed.</p>
            <Button asChild>
              <Link to="/products">Back to Products</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  const handleQuantityChange = (value: number) => {
    if (value < 1) return;
    if (value > product.quantity) return;
    setQuantity(value);
  };
  
  const handleAddToCart = () => {
    addItem(product, quantity);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link to="/products" className="text-primary hover:underline">
            ← Back to Products
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Badge>{product.category}</Badge>
              {product.quantity === 0 ? (
                <Badge variant="destructive">Out of Stock</Badge>
              ) : (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  In Stock
                </Badge>
              )}
            </div>
            
            <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
            
            <div className="text-2xl font-bold mb-4">${product.price.toFixed(2)}</div>
            
            <p className="text-gray-700 mb-6">{product.description}</p>
            
            <div className="border-t border-b py-4 mb-6">
              <div className="mb-4">
                <div className="text-sm text-gray-500 mb-1">Quantity</div>
                <div className="flex items-center">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity === 1 || product.quantity === 0}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="mx-4 font-medium w-8 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity === product.quantity || product.quantity === 0}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="text-sm text-gray-500 mb-1">
                {product.quantity > 0 
                  ? `${product.quantity} items available` 
                  : 'Currently out of stock'}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                className="flex-1"
                onClick={handleAddToCart}
                disabled={product.quantity === 0}
              >
                {product.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
              </Button>
              <Button variant="outline" className="flex-1">
                Add to Wishlist
              </Button>
            </div>
            
            <div className="mt-6">
              <h3 className="font-medium mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Related Products</h2>
            <ProductGrid products={relatedProducts} />
          </section>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default ProductDetailPage;
