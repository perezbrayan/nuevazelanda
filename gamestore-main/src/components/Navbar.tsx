import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, Gamepad2, Home, Gift, Sparkles, Tag, Trash2, MessageSquare, Users, LogOut, Globe } from 'lucide-react';
import logo from '../assets/logo.svg';
import { useCart } from '../context/CartContext';
import { useClickOutside } from '../hooks/useClickOutside';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations';

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const NavLink = ({ to, icon, children }: NavLinkProps) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-300 ${
        isActive 
          ? 'text-primary-600 bg-primary-50/50 font-medium' 
          : 'text-gray-600 hover:text-primary-500 hover:bg-gray-50/50'
      }`}
    >
      {icon}
      <span className="text-sm">{children}</span>
    </Link>
  );
};

interface UserDropdownProps {
  isOpen: boolean;
}

const UserDropdown: React.FC<UserDropdownProps> = ({ isOpen }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
    window.location.reload();
  };

  if (!isOpen) return null;

  if (!user) {
    return (
      <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg py-2 z-50">
        <div className="px-4 py-3">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.welcome}</h3>
            <p className="text-sm text-gray-600 mb-4">{t.loginToContinue}</p>
            <Link 
              to="/login" 
              className="block w-full px-4 py-2 mb-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              {t.login}
            </Link>
            <Link 
              to="/register" 
              className="block w-full px-4 py-2 text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
            >
              {t.register}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg py-2 z-50">
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
            <User className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{user.username}</h3>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>{t.logout}</span>
        </button>
      </div>
    </div>
  );
};

interface CartItem {
  mainId: string;
  displayName: string;
  price: {
    finalPrice: number;
  };
  quantity: number;
  image: string;
}

interface LanguageDropdownProps {
  isOpen: boolean;
}

interface CartDropdownProps {
  isOpen: boolean;
  onRemoveItem: (id: string) => void;
}

const LanguageDropdown: React.FC<LanguageDropdownProps> = ({ isOpen }) => {
  const { language, setLanguage } = useLanguage();
  const t = translations[language];

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 z-50">
      {(['es', 'en', 'tw'] as const).map((lang) => (
        <button
          key={lang}
          onClick={() => setLanguage(lang)}
          className={`w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors ${
            language === lang ? 'text-primary-600 font-medium' : 'text-gray-700'
          }`}
        >
          {t.languageNames[lang]}
        </button>
      ))}
    </div>
  );
};

const CartDropdown: React.FC<CartDropdownProps> = ({ isOpen, onRemoveItem }) => {
  const { items: cartItems } = useCart();
  const { language } = useLanguage();
  const t = translations[language];
  const navigate = useNavigate();

  if (!isOpen) return null;

  const total = cartItems.reduce((sum, item) => sum + (item.price.finalPrice * item.quantity), 0);

  return (
    <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-lg py-4 z-50">
      <div className="px-4">
        <h3 className="text-lg font-medium text-gray-900">{t.cart}</h3>
      </div>

      <div className="mt-4 max-h-96 overflow-y-auto">
        {cartItems.length === 0 ? (
          <div className="px-4 py-6 text-center">
            <p className="text-gray-500">{t.emptyCart}</p>
            <p className="text-sm text-gray-400 mt-1">{t.addItems}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {cartItems.map((item) => (
              <div key={item.mainId} className="px-4 py-3 flex items-center gap-4">
                <img
                  src={item.image}
                  alt={item.displayName}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {item.displayName}
                  </h4>
                  <p className="mt-1 text-sm text-gray-500">
                    {item.price.finalPrice} {t.vbucks}
                  </p>
                </div>
                <button
                  onClick={() => onRemoveItem(item.mainId)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {cartItems.length > 0 && (
        <div className="mt-4 px-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-900">{t.total}</span>
            <span className="font-medium text-gray-900">{total} {t.vbucks}</span>
          </div>
          <button
            onClick={() => navigate('/checkout')}
            className="w-full py-2 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            {t.checkout}
          </button>
        </div>
      )}
    </div>
  );
};

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const { items: cartItems, removeItem, isOpen: isCartOpen, toggleCart, closeCart } = useCart();
  const { language, setLanguage } = useLanguage();
  const t = translations[language];
  
  const cartDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const languageDropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(cartDropdownRef, () => closeCart());
  useClickOutside(userDropdownRef, () => setIsUserOpen(false));
  useClickOutside(languageDropdownRef, () => setIsLanguageOpen(false));

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { to: "/", icon: <Home className="w-5 h-5" />, label: t.home },
    { to: "/crew", icon: <Users className="w-5 h-5" />, label: t.crew },
    { to: "/bot", icon: <MessageSquare className="w-5 h-5" />, label: t.bot },
    { to: "/fortnite-shop", icon: <Gamepad2 className="w-5 h-5" />, label: t.fortnite },
  ];

  return (
    <header className="w-full fixed top-0 z-50 bg-white/80 backdrop-blur-md shadow-md">
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Navigation Links */}
          <div className="flex items-center gap-6">
            <Link 
              to="/" 
              className="flex-shrink-0 flex items-center gap-1.5"
            >
              <img src={logo} alt="GameStore" className="h-8 w-auto" />
            </Link>

            {/* Navigation Links - Moved here */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <NavLink key={link.to} to={link.to} icon={link.icon}>
                  {link.label}
                </NavLink>
              ))}
            </div>
          </div>

          {/* Desktop Actions - Right Side */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Language Selector with Dropdown */}
            <div className="relative" ref={languageDropdownRef}>
              <button 
                className="p-2 hover:bg-gray-50/50 rounded-lg transition-all duration-300"
                onClick={() => {
                  setIsLanguageOpen(!isLanguageOpen);
                  setIsUserOpen(false);
                  closeCart();
                }}
              >
                <Globe className="w-5 h-5 text-gray-600" />
              </button>
              <LanguageDropdown isOpen={isLanguageOpen} />
            </div>
            
            {/* User Menu with Dropdown */}
            <div className="relative" ref={userDropdownRef}>
              <button 
                className="p-2 hover:bg-gray-50/50 rounded-lg transition-all duration-300"
                onClick={() => {
                  setIsUserOpen(!isUserOpen);
                  setIsLanguageOpen(false);
                  closeCart();
                }}
              >
                <User className="w-5 h-5 text-gray-600" />
              </button>
              <UserDropdown isOpen={isUserOpen} />
            </div>
            
            {/* Cart Button with Dropdown */}
            <div className="relative" ref={cartDropdownRef}>
              <button 
                className="p-2 hover:bg-gray-50/50 rounded-lg transition-all duration-300 relative"
                onClick={() => {
                  toggleCart();
                  setIsUserOpen(false);
                }}
              >
                <ShoppingCart className="w-5 h-5 text-gray-600" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
              <CartDropdown 
                isOpen={isCartOpen} 
                onRemoveItem={removeItem}
              />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 hover:bg-gray-50/50 rounded-lg transition-all duration-300"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-gray-600" />
            ) : (
              <Menu className="w-6 h-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-100">
            <div className="space-y-2">
              {navLinks.map((link) => (
                <NavLink key={link.to} to={link.to} icon={link.icon}>
                  {link.label}
                </NavLink>
              ))}
              {/* Language Selector for Mobile */}
              <div className="border-t border-gray-100 mt-4 pt-4">
                <div className="px-4 py-2 text-gray-600">
                  <h3 className="font-medium mb-2">{t.selectLanguage}</h3>
                  <div className="space-y-2">
                    {(['es', 'en', 'tw'] as const).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setLanguage(lang)}
                        className={`w-full px-4 py-2 text-left rounded-lg transition-colors ${
                          language === lang 
                            ? 'bg-primary-50 text-primary-600 font-medium' 
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        {t.languageNames[lang]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-100 mt-4 pt-4">
                <button
                  onClick={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.reload();
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>{t.logout}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;