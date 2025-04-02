
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const AdminPage = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [productData, setProductData] = useState({
    title: '',
    description: '',
    price: '',
    quantity: '',
    category: 'Protein',
    imageUrl: '',
    tags: []
  });
  
  useEffect(() => {
    // Check if user is authenticated
    if (!user) {
      console.log('No user, redirecting to login');
      navigate('/login');
      return;
    }
    
    // Log the admin status for debugging
    console.log('Admin page: isAdmin =', isAdmin, 'email =', user.email);
    
    // Check if user is an admin
    if (!isAdmin) {
      console.log('User not admin, redirecting to home');
      toast({
        title: "Access Denied",
        description: "You need admin privileges to access this page",
        variant: "destructive",
      });
      navigate('/');
      return;
    }
    
    setIsLoading(false);
  }, [user, isAdmin, navigate]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProductData({
      ...productData,
      [name]: name === 'price' || name === 'quantity' ? parseFloat(value) || '' : value
    });
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setProductData({
      ...productData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!productData.title || !productData.description || !productData.price || !productData.quantity) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Insert product into database
      const { data, error } = await supabase
        .from('products')
        .insert({
          title: productData.title,
          description: productData.description,
          price: parseFloat(productData.price as string),
          quantity: parseInt(productData.quantity as string),
          category: productData.category,
          imageurl: productData.imageUrl || '/placeholder.svg',
          tags: productData.tags.length > 0 ? productData.tags : ['new']
        })
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: 'Product Created',
        description: `${productData.title} has been added to the store`,
      });
      
      // Reset form
      setProductData({
        title: '',
        description: '',
        price: '',
        quantity: '',
        category: 'Protein',
        imageUrl: '',
        tags: []
      });
      
    } catch (error) {
      console.error('Error creating product:', error);
      toast({
        title: 'Error',
        description: 'Failed to create product. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Add New Product</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium mb-1">
                    Product Title *
                  </label>
                  <Input
                    id="title"
                    name="title"
                    value={productData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium mb-1">
                    Description *
                  </label>
                  <Textarea
                    id="description"
                    name="description"
                    value={productData.description}
                    onChange={handleInputChange}
                    rows={4}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium mb-1">
                      Price (USD) *
                    </label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={productData.price}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="quantity" className="block text-sm font-medium mb-1">
                      Quantity in Stock *
                    </label>
                    <Input
                      id="quantity"
                      name="quantity"
                      type="number"
                      min="0"
                      value={productData.quantity}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium mb-1">
                      Category *
                    </label>
                    <Select
                      value={productData.category}
                      onValueChange={(value) => handleSelectChange('category', value)}
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Protein">Protein</SelectItem>
                        <SelectItem value="Amino Acids">Amino Acids</SelectItem>
                        <SelectItem value="Pre-Workout">Pre-Workout</SelectItem>
                        <SelectItem value="Vitamins">Vitamins</SelectItem>
                        <SelectItem value="Accessories">Accessories</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label htmlFor="imageUrl" className="block text-sm font-medium mb-1">
                      Image URL
                    </label>
                    <Input
                      id="imageUrl"
                      name="imageUrl"
                      value={productData.imageUrl}
                      onChange={handleInputChange}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Product...
                    </>
                  ) : (
                    'Add Product'
                  )}
                </Button>
              </form>
            </div>
          </div>
          
          <div>
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Admin Tools</h2>
              
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  onClick={() => navigate('/admin/orders')}
                >
                  Manage Orders
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  onClick={() => navigate('/admin/products')}
                >
                  Manage Products
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  onClick={() => navigate('/admin/users')}
                >
                  Manage Users
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminPage;
