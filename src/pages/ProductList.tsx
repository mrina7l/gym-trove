
import { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ProductGrid } from '@/components/products/ProductGrid';
import { Product } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, RefreshCw } from 'lucide-react';
import { mapProductRowsToProducts } from '@/integrations/supabase/dbTypes';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';

const ProductList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingProducts, setAddingProducts] = useState(false);
  const { user, isAdmin } = useAuth();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('products')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      // Use the helper function to map database rows to our Product type
      setProducts(mapProductRowsToProducts(data));
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddProducts = async () => {
    try {
      setAddingProducts(true);
      
      const { data, error } = await supabase.functions.invoke('add-products');
      
      if (error) {
        throw error;
      }
      
      toast({
        title: 'Products Added',
        description: `Successfully added ${data.products.length} products.`,
      });
      
      // Refresh the product list
      await fetchProducts();
    } catch (err) {
      console.error('Error adding products:', err);
      toast({
        title: 'Error',
        description: 'Failed to add products. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setAddingProducts(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">All Products</h1>
          
          {isAdmin && (
            <Button 
              onClick={handleAddProducts} 
              disabled={addingProducts}
              className="flex items-center gap-2"
            >
              {addingProducts ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {addingProducts ? 'Adding Products...' : 'Refresh Products'}
            </Button>
          )}
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading products...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
            <Button 
              onClick={fetchProducts} 
              variant="outline" 
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No products found.</p>
            {isAdmin && (
              <Button onClick={handleAddProducts} disabled={addingProducts}>
                {addingProducts ? 'Adding Products...' : 'Add Sample Products'}
              </Button>
            )}
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
