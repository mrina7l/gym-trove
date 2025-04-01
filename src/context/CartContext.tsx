
import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product } from '@/types';
import { toast } from '@/components/ui/use-toast';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    // Load cart from localStorage on mount
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      setItems(JSON.parse(storedCart));
    }
  }, []);

  useEffect(() => {
    // Save cart to localStorage whenever it changes
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addItem = (product: Product, quantity: number) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.productId === product.id);
      
      if (existingItem) {
        // If product is already in cart, update quantity
        const newQuantity = existingItem.quantity + quantity;
        
        // Check if there's enough stock
        if (newQuantity > product.quantity) {
          toast({
            title: 'Not enough stock',
            description: `Only ${product.quantity} items available`,
            variant: 'destructive',
          });
          return prevItems;
        }
        
        const updatedItems = prevItems.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: newQuantity }
            : item
        );
        
        toast({
          title: 'Cart updated',
          description: `${product.title} quantity updated to ${newQuantity}`,
        });
        
        return updatedItems;
      } else {
        // If product is not in cart, add it
        if (quantity > product.quantity) {
          toast({
            title: 'Not enough stock',
            description: `Only ${product.quantity} items available`,
            variant: 'destructive',
          });
          return prevItems;
        }
        
        toast({
          title: 'Item added',
          description: `${product.title} added to your cart`,
        });
        
        return [...prevItems, { productId: product.id, quantity, product }];
      }
    });
  };

  const removeItem = (productId: string) => {
    setItems((prevItems) => {
      const updatedItems = prevItems.filter((item) => item.productId !== productId);
      toast({
        title: 'Item removed',
        description: 'The item has been removed from your cart',
      });
      return updatedItems;
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setItems((prevItems) => {
      const item = prevItems.find((item) => item.productId === productId);
      
      if (!item) return prevItems;
      
      // Check if there's enough stock
      if (quantity > item.product.quantity) {
        toast({
          title: 'Not enough stock',
          description: `Only ${item.product.quantity} items available`,
          variant: 'destructive',
        });
        return prevItems;
      }
      
      if (quantity <= 0) {
        return prevItems.filter((item) => item.productId !== productId);
      }
      
      return prevItems.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      );
    });
  };

  const clearCart = () => {
    setItems([]);
    toast({
      title: 'Cart cleared',
      description: 'All items have been removed from your cart',
    });
  };

  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  
  const subtotal = items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
