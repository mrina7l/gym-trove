
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Package } from 'lucide-react';
import { Order } from '@/types';

// Mock data for orders
const mockOrders: Order[] = [
  {
    id: '1001',
    userId: '1',
    items: [
      {
        productId: '1',
        quantity: 2,
        product: {
          id: '1',
          title: 'Premium Whey Protein Isolate',
          description: 'Our highest quality whey protein with 27g of protein per serving.',
          price: 59.99,
          imageUrl: 'https://images.unsplash.com/photo-1579722820310-211f4d88a5a9?q=80&w=2940&auto=format&fit=crop',
          category: 'Protein',
          tags: ['whey', 'isolate', 'muscle building'],
          quantity: 50,
          createdAt: new Date().toISOString(),
        }
      },
      {
        productId: '3',
        quantity: 1,
        product: {
          id: '3',
          title: 'Pre-Workout Energy Boost',
          description: 'Powerful pre-workout formula.',
          price: 39.99,
          imageUrl: 'https://images.unsplash.com/photo-1546483875-ad9014c88eba?q=80&w=2858&auto=format&fit=crop',
          category: 'Pre-Workout',
          tags: ['energy', 'focus', 'pump'],
          quantity: 60,
          createdAt: new Date().toISOString(),
        }
      }
    ],
    total: 159.97,
    status: 'delivered',
    shippingAddress: {
      line1: '123 Main St',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'US',
    },
    paymentIntentId: 'pi_12345',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), // 10 days ago
  },
  {
    id: '1002',
    userId: '1',
    items: [
      {
        productId: '6',
        quantity: 1,
        product: {
          id: '6',
          title: 'Creatine Monohydrate',
          description: 'Pure creatine monohydrate for strength gains.',
          price: 24.99,
          imageUrl: 'https://images.unsplash.com/photo-1627467959547-215397e330e6?q=80&w=2864&auto=format&fit=crop',
          category: 'Performance',
          tags: ['strength', 'power', 'muscle'],
          quantity: 75,
          createdAt: new Date().toISOString(),
        }
      }
    ],
    total: 24.99,
    status: 'shipped',
    shippingAddress: {
      line1: '123 Main St',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'US',
    },
    paymentIntentId: 'pi_23456',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
  },
  {
    id: '1003',
    userId: '1',
    items: [
      {
        productId: '2',
        quantity: 1,
        product: {
          id: '2',
          title: 'Mass Gainer - Chocolate',
          description: 'High-calorie formula with 1250 calories per serving.',
          price: 64.99,
          imageUrl: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?q=80&w=2787&auto=format&fit=crop',
          category: 'Gainers',
          tags: ['mass gainer', 'bulking', 'weight gain'],
          quantity: 35,
          createdAt: new Date().toISOString(),
        }
      },
      {
        productId: '8',
        quantity: 1,
        product: {
          id: '8',
          title: 'Vitamin D3 + K2',
          description: 'Synergistic combination of Vitamin D3 and K2.',
          price: 17.99,
          imageUrl: 'https://images.unsplash.com/photo-1584308074548-ad52816deb9d?q=80&w=2830&auto=format&fit=crop',
          category: 'Vitamins',
          tags: ['vitamin d', 'vitamin k', 'bone health'],
          quantity: 90,
          createdAt: new Date().toISOString(),
        }
      }
    ],
    total: 82.98,
    status: 'processing',
    shippingAddress: {
      line1: '123 Main St',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'US',
    },
    paymentIntentId: 'pi_34567',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
  }
];

const OrderHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  
  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      navigate('/login?redirect=orders');
      return;
    }
    
    // In a real app, fetch orders from API
    setOrders(mockOrders);
  }, [user, navigate]);
  
  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Processing</Badge>;
      case 'shipped':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Shipped</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Delivered</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Order History</h1>
        
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <Package className="h-8 w-8 text-gray-500" />
            </div>
            <h2 className="text-xl font-medium mb-2">No orders found</h2>
            <p className="text-gray-500 mb-6">
              You haven't placed any orders yet.
            </p>
            <Button asChild>
              <Link to="/products">Start Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                    <TableCell>{order.items.reduce((acc, item) => acc + item.quantity, 0)} item(s)</TableCell>
                    <TableCell>${order.total.toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link to={`/orders/${order.id}`}>View Details</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default OrderHistory;
