
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="container mx-auto py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">YourProtein</h3>
            <p className="text-gray-600 mb-4">
              Premium supplements to help you achieve your fitness goals.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-500 hover:text-brand-blue">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </a>
              <a href="#" className="text-gray-500 hover:text-brand-blue">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </a>
              <a href="#" className="text-gray-500 hover:text-brand-blue">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Shop</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/products" className="text-gray-600 hover:text-brand-blue">All Products</Link>
              </li>
              <li>
                <Link to="/categories" className="text-gray-600 hover:text-brand-blue">Categories</Link>
              </li>
              <li>
                <Link to="/bestsellers" className="text-gray-600 hover:text-brand-blue">Best Sellers</Link>
              </li>
              <li>
                <Link to="/new-arrivals" className="text-gray-600 hover:text-brand-blue">New Arrivals</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Information</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-gray-600 hover:text-brand-blue">About Us</Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-600 hover:text-brand-blue">Contact Us</Link>
              </li>
              <li>
                <Link to="/shipping" className="text-gray-600 hover:text-brand-blue">Shipping & Returns</Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-600 hover:text-brand-blue">FAQ</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Account</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/login" className="text-gray-600 hover:text-brand-blue">Login</Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-600 hover:text-brand-blue">Register</Link>
              </li>
              <li>
                <Link to="/orders" className="text-gray-600 hover:text-brand-blue">Order History</Link>
              </li>
              <li>
                <Link to="/account" className="text-gray-600 hover:text-brand-blue">My Account</Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-12 pt-8">
          <p className="text-center text-gray-600">
            &copy; {new Date().getFullYear()} YourProtein. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
