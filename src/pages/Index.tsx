
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Product } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { mapProductRowsToProducts } from '@/integrations/supabase/dbTypes';
import { Loader2 } from 'lucide-react';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // Fetch all products
        const { data, error } = await supabase
          .from('products')
          .select('*');
        
        if (error) {
          throw error;
        }
        
        const allProducts = mapProductRowsToProducts(data);
        
        // Get featured products (first 4)
        setFeaturedProducts(allProducts.slice(0, 4));
        
        // Get new arrivals (sort by creation date and take first 4)
        const sorted = [...allProducts].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setNewArrivals(sorted.slice(0, 4));
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const renderProductCard = (product: Product) => (
    <div key={product.id} className="product-card">
      <Link to={`/products/${product.id}`}>
        <div className="aspect-square overflow-hidden">
          <img
            src={product.imageUrl}
            alt={product.title}
            className="h-full w-full object-cover transition-transform hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }}
          />
        </div>
        <div className="p-4">
          <h3 className="font-medium line-clamp-1">{product.title}</h3>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
            {product.description}
          </p>
          <div className="flex justify-between items-center mt-2">
            <span className="font-bold">${product.price.toFixed(2)}</span>
            {product.quantity === 0 ? (
              <span className="badge-out-of-stock">Out of Stock</span>
            ) : (
              <span className="badge-in-stock">In Stock</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero section */}
        <section className="relative">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
            <div className="container mx-auto px-4 py-16 md:py-24">
              <div className="max-w-xl">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  Fuel Your Fitness Journey
                </h1>
                <p className="text-lg md:text-xl mb-8">
                  Premium supplements and gym accessories for optimal performance and results.
                </p>
                <Button asChild size="lg" className="bg-brand-yellow text-black hover:bg-brand-yellow/90">
                  <Link to="/products">Shop Now</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        {/* Featured products */}
        <section className="container mx-auto px-4 py-12">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Featured Products</h2>
            <Button asChild variant="ghost">
              <Link to="/products">View All</Link>
            </Button>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading products...</span>
            </div>
          ) : featuredProducts.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No featured products available.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.map(renderProductCard)}
            </div>
          )}
        </section>
        
        {/* Categories */}
        <section className="bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-8 text-center">Shop by Category</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow-sm p-6 text-center hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-lg mb-2">Protein</h3>
                <p className="text-gray-500 text-sm mb-4">
                  Whey, plant-based, and protein blends
                </p>
                <Button asChild variant="outline">
                  <Link to="/products?category=Protein">Shop Now</Link>
                </Button>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6 text-center hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-lg mb-2">Pre-Workout</h3>
                <p className="text-gray-500 text-sm mb-4">
                  Energy, focus, and performance boosters
                </p>
                <Button asChild variant="outline">
                  <Link to="/products?category=Pre-Workout">Shop Now</Link>
                </Button>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6 text-center hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-lg mb-2">Amino Acids</h3>
                <p className="text-gray-500 text-sm mb-4">
                  BCAAs, EAAs, and recovery formulas
                </p>
                <Button asChild variant="outline">
                  <Link to="/products?category=Amino Acids">Shop Now</Link>
                </Button>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6 text-center hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-lg mb-2">Accessories</h3>
                <p className="text-gray-500 text-sm mb-4">
                  Shakers, gloves, belts, and more
                </p>
                <Button asChild variant="outline">
                  <Link to="/products?category=Accessories">Shop Now</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        {/* New arrivals */}
        <section className="container mx-auto px-4 py-12">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">New Arrivals</h2>
            <Button asChild variant="ghost">
              <Link to="/products?sort=newest">View All</Link>
            </Button>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading products...</span>
            </div>
          ) : newArrivals.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No new arrivals available.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {newArrivals.map(renderProductCard)}
            </div>
          )}
        </section>
        
        {/* Testimonials */}
        <section className="bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-8 text-center">What Our Customers Say</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                  <div>
                    <h4 className="font-medium">John D.</h4>
                    <p className="text-sm text-gray-500">Fitness Enthusiast</p>
                  </div>
                </div>
                <p className="text-gray-600">
                  "The premium whey protein has been a game-changer for my post-workout recovery. 
                  I've seen significant gains since I started using it."
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                  <div>
                    <h4 className="font-medium">Sarah M.</h4>
                    <p className="text-sm text-gray-500">Personal Trainer</p>
                  </div>
                </div>
                <p className="text-gray-600">
                  "I recommend YourProtein to all my clients. The quality is unmatched and 
                  their pre-workout gives the perfect energy boost for intense training sessions."
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                  <div>
                    <h4 className="font-medium">Alex T.</h4>
                    <p className="text-sm text-gray-500">Bodybuilder</p>
                  </div>
                </div>
                <p className="text-gray-600">
                  "I've tried many supplements over the years, but YourProtein's mass gainer 
                  helped me break through plateaus and reach my bulking goals faster."
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default HomePage;
