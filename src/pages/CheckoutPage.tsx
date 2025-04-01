
import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { Check, CreditCard, ShoppingBag, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Address } from '@/types';

const CheckoutPage = () => {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
    cardName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  
  const shippingCost = subtotal > 100 ? 0 : 5.99;
  const taxRate = 0.08; // 8% tax
  const taxAmount = subtotal * taxRate;
  const total = subtotal + shippingCost + taxAmount;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const requiredFields = [
      'firstName', 'lastName', 'email', 'phone', 'address', 
      'city', 'state', 'postalCode', 'country', 'cardName',
      'cardNumber', 'cardExpiry', 'cardCvc'
    ];
    
    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        toast({
          title: 'Error',
          description: `Please fill in all required fields`,
          variant: 'destructive',
        });
        return;
      }
    }
    
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to place an order',
        variant: 'destructive',
      });
      navigate('/login?redirect=checkout');
      return;
    }
    
    // Process payment
    setIsProcessing(true);
    
    // Create shipping address
    const shippingAddress: Address = {
      line1: formData.address,
      city: formData.city,
      state: formData.state,
      postalCode: formData.postalCode,
      country: formData.country,
    };
    
    try {
      // Call Stripe payment endpoint here if needed
      // For now, we'll just create the order in the database
      
      const { error } = await supabase.from('orders').insert({
        userid: user.id,
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price
        })),
        total: total,
        status: 'pending',
        shippingaddress: {
          ...shippingAddress,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone
        }
      });
      
      if (error) throw error;
      
      // Update product quantities
      for (const item of items) {
        const { error: updateError } = await supabase
          .from('products')
          .update({ 
            quantity: item.product.quantity - item.quantity 
          })
          .eq('id', item.productId);
          
        if (updateError) {
          console.error('Error updating product quantity:', updateError);
        }
      }
      
      setIsProcessing(false);
      clearCart();
      
      toast({
        title: 'Order placed successfully!',
        description: 'Thank you for your purchase. Your order has been received.',
        variant: 'default',
      });
      
      navigate('/order-confirmation');
    } catch (error) {
      console.error('Error placing order:', error);
      setIsProcessing(false);
      
      toast({
        title: 'Error',
        description: 'There was a problem placing your order. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <ShoppingBag className="h-8 w-8 text-gray-500" />
            </div>
            <h2 className="text-xl font-medium mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">
              You need to add items to your cart before checking out.
            </p>
            <Button asChild>
              <Link to="/products">Browse Products</Link>
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
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="bg-white rounded-lg border p-6">
                <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium mb-1">
                      First Name *
                    </label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium mb-1">
                      Last Name *
                    </label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1">
                      Email *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium mb-1">
                      Phone *
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg border p-6">
                <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium mb-1">
                      Address *
                    </label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium mb-1">
                        City *
                      </label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="state" className="block text-sm font-medium mb-1">
                        State/Province *
                      </label>
                      <Input
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="postalCode" className="block text-sm font-medium mb-1">
                        Postal Code *
                      </label>
                      <Input
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="country" className="block text-sm font-medium mb-1">
                        Country *
                      </label>
                      <Select
                        value={formData.country}
                        onValueChange={(value) => handleSelectChange('country', value)}
                      >
                        <SelectTrigger id="country">
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="US">United States</SelectItem>
                          <SelectItem value="CA">Canada</SelectItem>
                          <SelectItem value="UK">United Kingdom</SelectItem>
                          <SelectItem value="AU">Australia</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg border p-6">
                <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="cardName" className="block text-sm font-medium mb-1">
                      Name on Card *
                    </label>
                    <Input
                      id="cardName"
                      name="cardName"
                      value={formData.cardName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="cardNumber" className="block text-sm font-medium mb-1">
                      Card Number *
                    </label>
                    <Input
                      id="cardNumber"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleChange}
                      placeholder="1234 5678 9012 3456"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="cardExpiry" className="block text-sm font-medium mb-1">
                        Expiry Date *
                      </label>
                      <Input
                        id="cardExpiry"
                        name="cardExpiry"
                        value={formData.cardExpiry}
                        onChange={handleChange}
                        placeholder="MM/YY"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="cardCvc" className="block text-sm font-medium mb-1">
                        CVC *
                      </label>
                      <Input
                        id="cardCvc"
                        name="cardCvc"
                        value={formData.cardCvc}
                        onChange={handleChange}
                        placeholder="123"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500 mt-4">
                    <CreditCard className="h-4 w-4 mr-2" />
                    <span>Your payment information is encrypted and secure.</span>
                  </div>
                </div>
              </div>
              
              <Button type="submit" className="w-full" disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Pay $${total.toFixed(2)}`
                )}
              </Button>
            </form>
          </div>
          
          <div>
            <div className="bg-white rounded-lg border p-6 sticky top-20">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.productId} className="flex items-start">
                    <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded overflow-hidden">
                      <img 
                        src={item.product.imageUrl} 
                        alt={item.product.title} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                    </div>
                    <div className="ml-4 flex-grow">
                      <h4 className="font-medium text-sm">
                        {item.product.title}
                      </h4>
                      <div className="flex justify-between mt-1 text-sm">
                        <span className="text-gray-500">Qty: {item.quantity}</span>
                        <span>
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  {shippingCost === 0 ? (
                    <span className="text-green-600">Free</span>
                  ) : (
                    <span>${shippingCost.toFixed(2)}</span>
                  )}
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (8%)</span>
                  <span>${taxAmount.toFixed(2)}</span>
                </div>
                
                {subtotal >= 100 && (
                  <div className="flex items-center text-green-600 text-sm mt-4">
                    <Check className="h-4 w-4 mr-1" />
                    <span>Free shipping applied!</span>
                  </div>
                )}
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CheckoutPage;
