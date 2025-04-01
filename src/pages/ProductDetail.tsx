import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { Product } from '@/types';
import { ChevronLeft, ShoppingCart, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addItem } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) {
          throw error;
        }
        
        if (!data) {
          setError('Product not found');
          return;
        }
        
        setProduct({
          id: data.id,
          title: data.title,
          description: data.description,
          price: data.price,
          imageUrl: data.imageurl,
          category: data.category,
          tags: data.tags,
          quantity: data.quantity,
          createdAt: data.createdat
        });
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setQuantity(Number(e.target.value));
  };

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading product details...</span>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h2 className="text-xl font-medium mb-2">Product Not Found</h2>
            <p className="text-gray-500 mb-6">
              {error || "The product you're looking for doesn't exist."}
            </p>
            <Button asChild>
              <Link to="/products">Back to Products</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <Link to="/products" className="inline-flex items-center mb-4 hover:text-primary transition-colors">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Products
        </Link>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="relative aspect-square overflow-hidden rounded-lg">
            <img
              src={product.imageUrl}
              alt={product.title}
              className="h-full w-full object-cover"
            />
          </div>
          
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
            <p className="text-gray-500 mb-4">{product.description}</p>
            
            <div className="flex items-center justify-between mb-4">
              <span className="font-bold text-2xl">${product.price.toFixed(2)}</span>
              <div className="text-gray-500">
                {product.quantity} in stock
              </div>
            </div>
            
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex items-center space-x-2">
                <label htmlFor="quantity" className="text-sm font-medium">Quantity:</label>
                <select
                  id="quantity"
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="block w-24 py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                >
                  {Array.from({ length: Math.min(10, product.quantity) }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
              
              <Button onClick={handleAddToCart} disabled={product.quantity === 0}>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
            </div>
            
            <div>
              <h4 className="text-lg font-medium mb-2">Category:</h4>
              <p>{product.category}</p>
            </div>
            
            {product.tags.length > 0 && (
              <div className="mt-4">
                <h4 className="text-lg font-medium mb-2">Tags:</h4>
                <div className="flex space-x-2">
                  {product.tags.map((tag) => (
                    <span key={tag} className="px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-sm">{tag}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProductDetail;
