
import { useState } from 'react';
import { X, Minus, Plus } from 'lucide-react';
import { CartItem as CartItemType } from '@/types';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();
  const [quantity, setQuantity] = useState(item.quantity);
  
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    if (newQuantity > item.product.quantity) return;
    
    setQuantity(newQuantity);
    updateQuantity(item.productId, newQuantity);
  };

  return (
    <div className="flex items-center py-4 border-b">
      <div className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded overflow-hidden">
        <img 
          src={item.product.imageUrl} 
          alt={item.product.title} 
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="ml-4 flex-grow">
        <Link to={`/products/${item.productId}`}>
          <h3 className="font-medium hover:text-primary transition-colors">
            {item.product.title}
          </h3>
        </Link>
        <p className="text-sm text-gray-500 mt-1">
          {item.product.category}
        </p>
        <div className="mt-2 flex items-center text-sm">
          <span className="font-medium">${item.product.price.toFixed(2)}</span>
          {item.quantity > 1 && (
            <span className="text-gray-500 ml-2">
              (${(item.product.price * item.quantity).toFixed(2)} total)
            </span>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button 
          variant="outline" 
          size="icon" 
          className="h-8 w-8"
          onClick={() => handleQuantityChange(quantity - 1)}
          disabled={quantity <= 1}
        >
          <Minus className="h-3 w-3" />
          <span className="sr-only">Decrease quantity</span>
        </Button>
        
        <span className="w-8 text-center">{quantity}</span>
        
        <Button 
          variant="outline" 
          size="icon" 
          className="h-8 w-8"
          onClick={() => handleQuantityChange(quantity + 1)}
          disabled={quantity >= item.product.quantity}
        >
          <Plus className="h-3 w-3" />
          <span className="sr-only">Increase quantity</span>
        </Button>
      </div>
      
      <Button 
        variant="ghost" 
        size="icon" 
        className="ml-4"
        onClick={() => removeItem(item.productId)}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Remove</span>
      </Button>
    </div>
  );
}
