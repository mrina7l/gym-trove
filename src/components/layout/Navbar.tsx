
import { Link } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-6 md:gap-10">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold inline-block text-brand-blue">
              YourProtein
            </span>
          </Link>
          
          <nav className="hidden md:flex gap-6">
            <Link to="/products" className="text-sm font-medium transition-colors hover:text-primary">
              Shop
            </Link>
            <Link to="/categories" className="text-sm font-medium transition-colors hover:text-primary">
              Categories
            </Link>
            <Link to="/bestsellers" className="text-sm font-medium transition-colors hover:text-primary">
              Best Sellers
            </Link>
          </nav>
        </div>
        
        <div className="hidden md:flex w-full max-w-sm items-center space-x-2 mx-4">
          <form className="flex w-full items-center space-x-2" onSubmit={(e) => e.preventDefault()}>
            <Input
              type="search"
              placeholder="Search products..."
              className="flex-1"
              name="search"
            />
            <Button type="submit" size="icon">
              <Search className="h-4 w-4" />
              <span className="sr-only">Search</span>
            </Button>
          </form>
        </div>
        
        <div className="flex items-center gap-2">
          <Link to="/cart" className="relative">
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {totalItems}
                </span>
              )}
              <span className="sr-only">Cart</span>
            </Button>
          </Link>
          
          {user ? (
            <div className="relative">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                    <span className="sr-only">Account</span>
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>My Account</SheetTitle>
                    <SheetDescription>
                      {user.email}
                    </SheetDescription>
                  </SheetHeader>
                  <div className="grid gap-4 py-4">
                    <Button asChild variant="ghost">
                      <Link to="/account">Account Settings</Link>
                    </Button>
                    <Button asChild variant="ghost">
                      <Link to="/orders">Order History</Link>
                    </Button>
                    <Button variant="outline" onClick={logout}>
                      Logout
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          ) : (
            <Button asChild variant="ghost">
              <Link to="/login">Login</Link>
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Menu</span>
          </Button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden container py-4 pb-6 border-t">
          <nav className="flex flex-col gap-4">
            <Link to="/products" className="text-sm font-medium" onClick={() => setIsMenuOpen(false)}>
              Shop
            </Link>
            <Link to="/categories" className="text-sm font-medium" onClick={() => setIsMenuOpen(false)}>
              Categories
            </Link>
            <Link to="/bestsellers" className="text-sm font-medium" onClick={() => setIsMenuOpen(false)}>
              Best Sellers
            </Link>
          </nav>
          <div className="mt-4">
            <form className="flex w-full items-center space-x-2" onSubmit={(e) => e.preventDefault()}>
              <Input
                type="search"
                placeholder="Search products..."
                className="flex-1"
                name="search"
              />
              <Button type="submit" size="icon">
                <Search className="h-4 w-4" />
                <span className="sr-only">Search</span>
              </Button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
