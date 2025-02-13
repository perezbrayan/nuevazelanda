import React, { useEffect, useState } from 'react';
import { ChevronRight, Star, TrendingUp, Zap, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getDailyShop, FortniteItem } from '../services/fortniteApi';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations';
import LanguageSelector from './LanguageSelector';

const Home = () => {
  const [featuredItems, setFeaturedItems] = useState<FortniteItem[]>([]);
  const [latestItems, setLatestItems] = useState<FortniteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

  useEffect(() => {
    const fetchFeaturedItems = async () => {
      try {
        const shopItems = await getDailyShop();
        const filteredItems = shopItems
          .filter(item => {
            const lowerDisplayType = item.displayType?.toLowerCase() || '';
            const lowerMainId = item.mainId?.toLowerCase() || '';
            const lowerDisplayName = item.displayName?.toLowerCase() || '';
            const lowerDescription = item.displayDescription?.toLowerCase() || '';
            
            const musicKeywords = ['track', 'música', 'music', 'jam', 'beat', 'remix', 'sonido', 'sound'];
            return !musicKeywords.some(keyword => 
              lowerDisplayType.includes(keyword) || 
              lowerMainId.includes(keyword) || 
              lowerDisplayName.includes(keyword) || 
              lowerDescription.includes(keyword)
            );
          })
          .slice(0, 4);
        
        setFeaturedItems(filteredItems);
      } catch (error) {
        console.error('Error fetching Fortnite items:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchLatestItems = async () => {
      try {
        const shopItems = await getDailyShop();
        setLatestItems(shopItems);
      } catch (error) {
        console.error('Error fetching Fortnite items:', error);
      }
    };

    fetchFeaturedItems();
    fetchLatestItems();
  }, []);

  const getBestImage = (item: FortniteItem) => {
    if (item.displayAssets?.[0]?.url) {
      return item.displayAssets[0].url;
    }
    return item.displayAssets?.[0]?.background || '';
  };

  const t = translations[language];

  return (
    <div className="min-h-screen bg-black">
      <LanguageSelector />
      
      {/* Hero Section - Modernizado */}
      <section className="relative h-screen w-full flex items-center overflow-hidden hero-background">
        <div className="absolute inset-0 hero-overlay"></div>
        <div className="w-full max-w-[1440px] mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-7xl md:text-8xl font-bold text-white mb-8 leading-tight">
              {t.heroTitle}
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-12 leading-relaxed">
              {t.heroSubtitle}<br/>
              {t.heroDescription}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/fortnite-shop"
                className="px-12 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105"
              >
                <ShoppingCart className="w-5 h-5" />
                {t.exploreStore}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Fortnite Items - Renovado */}
      <section className="py-24 relative bg-gradient-to-b from-gray-100 via-[#D9DBDF] to-[#D9DBDF]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">{t.featuredItems}</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              {t.featuredDescription}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {loading ? (
              Array(4).fill(0).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-200 h-80 rounded-2xl mb-4"></div>
                  <div className="bg-gray-200 h-6 w-3/4 rounded mb-2"></div>
                  <div className="bg-gray-200 h-4 w-1/2 rounded mb-2"></div>
                  <div className="bg-gray-200 h-4 w-1/4 rounded"></div>
                </div>
              ))
            ) : (
              featuredItems.map((item) => (
                <div key={item.mainId} className="group">
                  <div className="relative overflow-hidden rounded-2xl mb-4 bg-gray-50">
                    {getBestImage(item) ? (
                      <img 
                        src={getBestImage(item)}
                        alt={item.displayName}
                        className="w-full h-80 object-cover transform group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-80 bg-gray-100 flex items-center justify-center p-4 text-center">
                        <span className="text-gray-800 font-semibold">{item.displayName}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="absolute bottom-4 left-4 right-4">
                        <Link 
                          to="/fortnite-shop" 
                          className="w-full px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                        >
                          <ShoppingCart className="w-5 h-5" />
                          {t.viewInStore}
                        </Link>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary-600 transition-colors duration-300">
                    {item.displayName}
                  </h3>
                  <p className="text-gray-600 mb-2">{item.mainType}</p>
                  <p className="text-primary-600 font-bold text-lg">{item.price.finalPrice} V-Bucks</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;