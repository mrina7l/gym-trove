
import { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ProductGrid } from '@/components/products/ProductGrid';
import { products } from '@/data/products';
import { useSearchParams } from 'react-router-dom';

const ProductListPage = () => {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const searchQuery = searchParams.get('search');
  const sortBy = searchParams.get('sort');
  
  let filteredProducts = [...products];
  
  // Filter by category if provided
  if (categoryParam) {
    filteredProducts = filteredProducts.filter(product => 
      product.category === categoryParam
    );
  }
  
  // Filter by search query if provided
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filteredProducts = filteredProducts.filter(product => 
      product.title.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query) ||
      product.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }
  
  // Sort products if sortBy is provided
  if (sortBy) {
    switch (sortBy) {
      case 'price-low':
        filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        filteredProducts.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case 'popularity':
        // For a real app, this would sort by sales or ratings
        break;
      default:
        break;
    }
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">
          {categoryParam ? `${categoryParam} Products` : 'All Products'}
        </h1>
        
        <ProductGrid products={filteredProducts} />
      </main>
      
      <Footer />
    </div>
  );
};

export default ProductListPage;
