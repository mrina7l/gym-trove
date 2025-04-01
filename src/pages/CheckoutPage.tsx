
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { ShoppingBag, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const CheckoutPage = () => {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  
  useEffect(() => {
    // If cart is empty, redirect to products
    if (items.length === 0) {
      navigate('/products');
    }
    
    // If not logged in, redirect to login
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'You must be logged in to checkout',
        variant: 'destructive',
      });
      navigate('/login?redirect=checkout');
    }
  }, [items, navigate, user]);
  
  const shippingCost = subtotal > 100 ? 0 : 5.99;
  const taxRate = 0.08; // 8% tax
  const taxAmount = subtotal * taxRate;
  const total = subtotal + shippingCost + taxAmount;
  
  const handleCheckout = async () => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'You must be logged in to checkout',
        variant: 'destructive',
      });
      navigate('/login?redirect=checkout');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Call our Stripe checkout edge function
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          items: items.map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
          userId: user.id,
          total: total
        },
      });
      
      if (error) {
        console.error('Error creating checkout:', error);
        throw new Error('Failed to create checkout session');
      }
      
      if (!data?.url) {
        throw new Error('No checkout URL returned');
      }
      
      // Redirect to Stripe checkout
      window.location.href = data.url;
    } catch (error) {
      console.error('Error placing order:', error);
      setIsProcessing(false);
      
      toast({
        title: 'Checkout Error',
        description: 'There was a problem creating your checkout session. Please try again.',
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
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Review Your Order</h2>
              <p className="text-gray-600 mb-6">
                You'll be redirected to our secure payment processor to complete your purchase. 
                Your payment details will be handled securely by Stripe.
              </p>
              
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.productId} className="flex items-start border-b pb-4">
                    <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded overflow-hidden">
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
                      <h4 className="font-medium">
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
              
              <Button 
                onClick={handleCheckout} 
                className="w-full" 
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Redirecting to secure checkout...
                  </>
                ) : (
                  'Proceed to Secure Checkout'
                )}
              </Button>
            </div>
          </div>
          
          <div>
            <div className="bg-white rounded-lg border p-6 sticky top-20">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
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
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              
              {subtotal >= 100 && (
                <div className="mt-4 p-3 bg-green-50 text-green-700 text-sm rounded-md">
                  Free shipping has been applied to your order!
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CheckoutPage;
