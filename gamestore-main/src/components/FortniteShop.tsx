import React, { useEffect, useState } from 'react';
import { getDailyShop } from '../services/fortniteApi';
import { Filter, ChevronDown, ChevronUp, Loader2, ShoppingCart, X, Gamepad, Sword, Trophy } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations';
import { robloxService, RobloxProduct } from '../services/robloxService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

interface ShopItem {
  mainId: string;
  offerId: string;
  displayName: string;
  displayDescription: string;
  price: {
    regularPrice: number;
    finalPrice: number;
    floorPrice: number;
  };
  rarity: {
    id: string;
    name: string;
  };
  displayAssets: {
    full_background: string;
    background: string;
  }[];
  categories: string[];
}

const FortniteShop: React.FC = () => {
  const { addItem, getItemQuantity, hasItems } = useCart();
  const [items, setItems] = useState<ShopItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState<string>('');
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const location = useLocation();
  const { language } = useLanguage();
  const t = translations[language];

  // Estados para los filtros
  const [rarityFilters, setRarityFilters] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 2000 });
  
  // Estados para los acordeones
  const [isRarityOpen, setIsRarityOpen] = useState(false);
  const [isPriceFilterOpen, setIsPriceFilterOpen] = useState(false);

  const [selectedGame, setSelectedGame] = useState<'fortnite' | 'roblox'>('fortnite');
  const [robloxProducts, setRobloxProducts] = useState<RobloxProduct[]>([]);
  const [loadingRoblox, setLoadingRoblox] = useState(false);
  const [robloxError, setRobloxError] = useState<string | null>(null);
  const [isStepsOpen, setIsStepsOpen] = useState(false);

  useEffect(() => {
    // Si estamos regresando del checkout y tenemos keepCart en true, no hacemos nada
    const state = location.state as { keepCart?: boolean };
    if (state?.keepCart) {
      return;
    }
    fetchItems();
  }, [location]);

  useEffect(() => {
    setFilteredItems(applyAllFilters(items));
  }, [items, rarityFilters, priceRange]);

  useEffect(() => {
    if (selectedGame === 'roblox') {
      loadRobloxProducts();
    }
  }, [selectedGame]);

  const fetchItems = async () => {
    try {
      const data = await getDailyShop();
      setItems(data);
      setFilteredItems(data);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errorLoadingItems);
      setLoading(false);
    }
  };

  const loadRobloxProducts = async () => {
    setLoadingRoblox(true);
    setRobloxError(null);
    try {
      const data = await robloxService.getProducts();
      setRobloxProducts(data);
    } catch (err) {
      setRobloxError(err instanceof Error ? err.message : t.errorLoadingItems);
    } finally {
      setLoadingRoblox(false);
    }
  };

  const handleRarityFilter = (rarity: string) => {
    setRarityFilters(prev => {
      const normalized = rarity.toLowerCase();
      return prev.includes(normalized)
        ? prev.filter(r => r !== normalized)
        : [...prev, normalized];
    });
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPriceRange(prev => ({
      ...prev,
      [name]: parseInt(value) || 0
    }));
  };

  const applyAllFilters = (items: ShopItem[]) => {
    let filtered = [...items];

    if (rarityFilters.length > 0) {
      filtered = filtered.filter(item =>
        item.rarity?.name && rarityFilters.includes(item.rarity.name.toLowerCase())
      );
    }

    if (priceRange.min !== 0 || priceRange.max !== 2000) {
      filtered = filtered.filter(
        item =>
          item.price?.finalPrice >= priceRange.min &&
          item.price?.finalPrice <= priceRange.max
      );
    }

    return filtered;
  };

  // Obtener rarezas únicas
  const uniqueRarities = Array.from(new Set(
    items.map(item => item.rarity?.name).filter(Boolean)
  ));

  // Función para manejar la adición de items al carrito
  const handleAddToCart = (item: ShopItem) => {
    const result = addItem({
      mainId: item.mainId,
      offerId: item.offerId,
      displayName: item.displayName,
      displayDescription: item.displayDescription,
      price: item.price,
      rarity: item.rarity,
      displayAssets: item.displayAssets,
      categories: item.categories,
      image: item.displayAssets[0]?.full_background || item.displayAssets[0]?.background,
      quantity: 1
    });

    if (result.success) {
      setLastAddedItem(item.displayName);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 2000);
    } else {
      setErrorMessage(result.message || t.addToCartError);
      setShowErrorMessage(true);
      setTimeout(() => setShowErrorMessage(false), 3000);
    }
  };

  // Función para manejar la adición de items de Roblox al carrito
  const handleAddRobloxToCart = (product: RobloxProduct) => {
    const result = addItem({
      mainId: product.id.toString(),
      offerId: product.id.toString(),
      displayName: product.title,
      displayDescription: product.description,
      price: {
        regularPrice: product.price,
        finalPrice: product.price,
        floorPrice: product.price
      },
      rarity: {
        id: product.type,
        name: product.type
      },
      displayAssets: [{
        full_background: product.image_url ? `${API_URL}${product.image_url}` : '',
        background: product.image_url ? `${API_URL}${product.image_url}` : ''
      }],
      categories: [product.type],
      image: product.image_url ? `${API_URL}${product.image_url}` : '',
      quantity: 1
    });

    if (result.success) {
      setLastAddedItem(product.title);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 2000);
    } else {
      setErrorMessage(result.message || t.addToCartError);
      setShowErrorMessage(true);
      setTimeout(() => setShowErrorMessage(false), 3000);
    }
  };

  const handleFilterOpen = (filter: 'rarity' | 'price') => {
    if (filter === 'rarity') {
      setIsRarityOpen(!isRarityOpen);
      setIsPriceFilterOpen(false);
    } else {
      setIsPriceFilterOpen(!isPriceFilterOpen);
      setIsRarityOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] pt-24 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">{t.loadingShop}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] pt-24 flex items-center justify-center">
        <div className="text-center p-8 bg-red-50 rounded-xl max-w-md mx-auto">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            {t.retry}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-28">
      <div className="container mx-auto px-4">
        {/* Layout principal con flex-col en móvil */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
          {/* Sidebar con Game Selector y Pasos */}
          <div className="w-full lg:w-64 lg:shrink-0">
            {/* Game Selector */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden sticky top-24 mb-4">
              <div className="px-4 sm:px-6 py-4 sm:py-5 flex items-center gap-2 sm:gap-3 border-b border-gray-100">
                <Gamepad className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
                <span className="text-sm sm:text-base font-medium text-gray-900">Juegos</span>
              </div>
              <div className="p-2">
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                  <button
                    onClick={() => setSelectedGame('fortnite')}
                    className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-all ${
                      selectedGame === 'fortnite'
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`p-1 rounded ${selectedGame === 'fortnite' ? 'bg-primary-700' : 'bg-gray-100'}`}>
                      <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <span className="text-sm sm:text-base font-medium">Fortnite</span>
                  </button>
                  <button
                    onClick={() => setSelectedGame('roblox')}
                    className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-all ${
                      selectedGame === 'roblox'
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`p-1 rounded ${selectedGame === 'roblox' ? 'bg-primary-700' : 'bg-gray-100'}`}>
                      <Sword className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <span className="text-sm sm:text-base font-medium">Roblox</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Pasos a seguir - Colapsable en móvil */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-4 lg:mb-0">
            <button
                onClick={() => setIsStepsOpen(!isStepsOpen)}
                className="w-full px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between border-b border-gray-100 lg:cursor-default"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
                  <span className="text-sm sm:text-base font-medium text-gray-900">Pasos a seguir</span>
                </div>
                <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform lg:hidden ${isStepsOpen ? 'rotate-180' : ''}`} />
              </button>
              <div className={`transition-all duration-300 ${isStepsOpen ? 'max-h-[500px]' : 'max-h-0 lg:max-h-[500px]'} overflow-hidden`}>
                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs sm:text-base font-medium">
                      1
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Asegúrate de estar en nuestra lista de amigos por al menos 48hs.
                    </p>
                  </div>
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs sm:text-base font-medium">
                      2
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Elige la skin que deseas de la rotación diaria de la Tienda. Paga en tu moneda local con nuestros métodos seguros.
                    </p>
                  </div>
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs sm:text-base font-medium">
                      3
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Recibe inmediatamente las skins en tu cuenta enviadas por nuestros bots.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contenido Principal */}
          <div className="flex-1">
            {selectedGame === 'fortnite' ? (
              <div>
                {/* Filtros - Grid responsivo */}
                <div className="mb-6 sm:mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Filtro de Rareza */}
                  <div className={`bg-white rounded-xl shadow-md ${!isRarityOpen && 'h-[60px] sm:h-[72px]'}`}>
                    <button
                      onClick={() => handleFilterOpen('rarity')}
                      className="w-full h-[60px] sm:h-[72px] px-4 sm:px-6 flex items-center justify-between text-gray-900 hover:bg-gray-50 transition-colors rounded-xl"
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
                        <span className="text-sm sm:text-base font-medium">{t.rarity}</span>
              </div>
              {isRarityOpen ? (
                        <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                        <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>
            
            {isRarityOpen && (
                      <div className="p-3 sm:p-6 border-t border-gray-100">
                        <div className="flex flex-wrap gap-2">
                  {uniqueRarities.map((rarity) => (
                    <button
                      key={rarity}
                      onClick={() => handleRarityFilter(rarity)}
                              className={`flex items-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-all text-xs sm:text-sm ${
                        rarityFilters.includes(rarity.toLowerCase())
                          ? 'bg-primary-600 text-white'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <div
                                className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary-600 ${
                          rarityFilters.includes(rarity.toLowerCase()) ? 'bg-white' : ''
                        }`}
                      />
                      {rarity}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Filtro de Precio */}
                  <div className={`bg-white rounded-xl shadow-md ${!isPriceFilterOpen && 'h-[60px] sm:h-[72px]'}`}>
            <button
                      onClick={() => handleFilterOpen('price')}
                      className="w-full h-[60px] sm:h-[72px] px-4 sm:px-6 flex items-center justify-between text-gray-900 hover:bg-gray-50 transition-colors rounded-xl"
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
                        <span className="text-sm sm:text-base font-medium">{t.filterByPrice}</span>
              </div>
              {isPriceFilterOpen ? (
                        <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                        <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>
            
            {isPriceFilterOpen && (
                      <div className="p-3 sm:p-6 border-t border-gray-100">
                        <div className="space-y-4 sm:space-y-6">
                          <div className="flex justify-between text-xs sm:text-sm text-gray-600">
                            <span>{priceRange.min} {t.vbucks}</span>
                            <span>{priceRange.max} {t.vbucks}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="2000"
                    value={priceRange.max}
                    onChange={handlePriceChange}
                    name="max"
                            className="w-full h-1.5 sm:h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

                {/* Grid de Items - Responsivo */}
                <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-4 lg:gap-6">
            {filteredItems.map((item) => (
              <div 
                key={item.mainId}
                      className="group bg-white rounded-lg sm:rounded-xl shadow-sm sm:shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                      <div className="aspect-[4/3] w-full overflow-hidden bg-gray-200">
                  {item.displayAssets && item.displayAssets[0] && (
                    <img
                      src={item.displayAssets[0].full_background || item.displayAssets[0].background}
                      alt={item.displayName}
                            className="h-full w-full object-cover object-center"
                    />
                  )}
                </div>
                      <div className="p-2 sm:p-3 lg:p-6">
                  <div>
                          <h3 className="text-xs sm:text-sm lg:text-lg font-medium text-gray-900 line-clamp-1 sm:line-clamp-2">
                      {item.displayName}
                    </h3>
                          <p className="mt-0.5 sm:mt-1 lg:mt-2 text-[10px] sm:text-xs lg:text-sm text-gray-500">{item.rarity.name}</p>
                  </div>
                        <div className="mt-2 sm:mt-3 lg:mt-4 flex items-center justify-between">
                          <p className="text-xs sm:text-sm lg:text-lg font-medium text-primary-600">
                            {item.price.finalPrice} {t.vbucks}
                    </p>
                    <button
                      onClick={() => handleAddToCart(item)}
                            className={`p-1 sm:p-1.5 lg:p-2 rounded-full transition-colors relative ${
                        hasItems && getItemQuantity(item.mainId) === 0
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-primary-600 hover:bg-primary-50'
                      }`}
                      title={hasItems && getItemQuantity(item.mainId) === 0 
                              ? t.cantSendMultipleGifts
                              : t.addToCart}
                      disabled={hasItems && getItemQuantity(item.mainId) === 0}
                    >
                            <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                      {getItemQuantity(item.mainId) > 0 && (
                              <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-[8px] sm:text-[10px] lg:text-xs w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 rounded-full flex items-center justify-center">
                          {getItemQuantity(item.mainId)}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

                {/* Notificaciones */}
                {showNotification && (
                  <div className="fixed bottom-4 right-4 bg-primary-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5" />
                      <span>{lastAddedItem} {t.addedToCart}</span>
                    </div>
                  </div>
                )}

                {showErrorMessage && (
                  <div className="fixed bottom-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
                    <div className="flex items-center gap-2">
                      <X className="w-5 h-5" />
                      <span>{errorMessage}</span>
                    </div>
                  </div>
                )}

          {filteredItems.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-600">
                      {t.noItemsFound}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                {loadingRoblox ? (
                  <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
                  </div>
                ) : robloxError ? (
                  <div className="text-center py-12">
                    <p className="text-red-600">{robloxError}</p>
                    <button 
                      onClick={loadRobloxProducts}
                      className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      {t.retry}
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-4 lg:gap-6">
                      {robloxProducts.map((product) => (
                        <div 
                          key={product.id}
                          className="group bg-white rounded-lg sm:rounded-xl shadow-sm sm:shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                        >
                          <div className="aspect-[4/3] w-full overflow-hidden bg-gray-200">
                            {product.image_url && (
                              <img
                                src={`${API_URL}${product.image_url}`}
                                alt={product.title}
                                className="h-full w-full object-cover object-center"
                              />
                            )}
                          </div>
                          <div className="p-2 sm:p-3 lg:p-6">
                            <div>
                              <h3 className="text-xs sm:text-sm lg:text-lg font-medium text-gray-900 line-clamp-1 sm:line-clamp-2">
                                {product.title}
                              </h3>
                              <p className="mt-0.5 sm:mt-1 lg:mt-2 text-[10px] sm:text-xs lg:text-sm text-gray-500">{product.description}</p>
                              {product.amount && (
                                <p className="mt-0.5 sm:mt-1 lg:mt-2 text-[10px] sm:text-xs lg:text-sm text-gray-500">
                                  Cantidad: {product.amount}
                                </p>
                              )}
                            </div>
                            <div className="mt-2 sm:mt-3 lg:mt-4 flex items-center justify-between">
                              <p className="text-xs sm:text-sm lg:text-lg font-medium text-primary-600">
                                ${product.price}
                              </p>
                              <button
                                onClick={() => handleAddRobloxToCart(product)}
                                className="p-1 sm:p-1.5 lg:p-2 rounded-full text-primary-600 hover:bg-primary-50 transition-colors"
                                title={t.addToCart}
                              >
                                <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {robloxProducts.length === 0 && (
                      <div className="text-center py-12">
                        <p className="text-gray-600">
                          No hay productos disponibles
              </p>
            </div>
          )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FortniteShop;