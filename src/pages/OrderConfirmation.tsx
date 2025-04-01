
import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { CheckCircle, Loader2 } from 'lucide-react';

const OrderConfirmation = () => {
  const { user } = useAuth();
  const { clearCart } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [orderNumber, setOrderNumber] = useState('');
  
  const sessionId = searchParams.get('session_id');
  
  useEffect(() => {
    // If user is not logged in or no session_id, redirect to home
    if (!user || !sessionId) {
      navigate('/');
      return;
    }
    
    // Simulate order confirmation and clear cart
    const confirmOrder = async () => {
      try {
        setIsLoading(true);
        // In a real app, we would verify the payment with our backend here
        // For now, we're just clearing the cart and showing success
        clearCart();
        setOrderNumber(Math.floor(Math.random() * 1000000).toString().padStart(6, '0'));
      } catch (error) {
        console.error('Error confirming order:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    confirmOrder();
  }, [user, sessionId, navigate, clearCart]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <h2 className="text-xl font-medium">Processing your order...</h2>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-lg border shadow-sm text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          
          <h1 className="text-2xl font-bold mb-2">Order Confirmed!</h1>
          
          <p className="text-gray-600 mb-6">
            Your order has been received and is being processed. Thank you for shopping with us!
          </p>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-gray-500 mb-1">Order Number</p>
            <p className="font-bold text-lg">{orderNumber}</p>
          </div>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              A confirmation email has been sent to {user?.email}. 
              You can track your order status in your account.
            </p>
            
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link to="/orders">View Orders</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link to="/">Back to Home</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default OrderConfirmation;
