
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { CheckCircle } from 'lucide-react';

const OrderConfirmation = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // If user somehow reaches this page without completing checkout, redirect to home
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);
  
  const orderNumber = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  
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
            Your order has been received and is being processed. Thank you for shopping with YourProtein!
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
