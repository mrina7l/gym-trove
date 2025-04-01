
import { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ProductGrid } from '@/components/products/ProductGrid';
import { Product } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const ProductList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('products')
          .select('*');
        
        if (error) {
          throw error;
        }
        
        const formattedProducts = data.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description,
          price: item.price,
          imageUrl: item.imageurl,
          category: item.category,
          tags: item.tags,
          quantity: item.quantity,
          createdAt: item.createdat
        }));
        
        setProducts(formattedProducts);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">All Products</h1>
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading products...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <ProductGrid products={products} />
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default ProductList;
