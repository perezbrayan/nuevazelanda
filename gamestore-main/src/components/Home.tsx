import React, { useEffect, useState } from 'react';
import { ChevronRight, Star, TrendingUp, Zap, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getDailyShop, FortniteItem } from '../services/fortniteApi';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations';
import LanguageSelector from './LanguageSelector';

// Datos de ejemplo para las notificaciones
const purchaseNotifications = [
  { username: 'NinjaGamer123', item: 'Skin Legendaria - Dragon Místico', time: '2 minutos' },
  { username: 'FortWarrior', item: 'Pico Estelar', time: '5 minutos' },
  { username: 'ProPlayer2024', item: 'Baile Épico - Victory Dance', time: '8 minutos' },
  { username: 'StormHunter', item: 'Alas de Fuego', time: '10 minutos' },
  { username: 'BattleQueen', item: 'Pack Legendario - Guerrero Celestial', time: '15 minutos' },
  { username: 'LootMaster', item: 'Mochila Reactiva', time: '18 minutos' },
  { username: 'VictoryRoyal', item: 'Skin Rara - Cazador Nocturno', time: '20 minutos' },
  { username: 'BuildPro99', item: 'Gesto Épico - Saludo Victorioso', time: '25 minutos' }
];

// Función para censurar parcialmente el nombre de usuario
const censorUsername = (username: string) => {
  if (username.length <= 4) {
    return username[0] + '***';
  }
  const visibleStart = Math.ceil(username.length * 0.4); // Muestra el 40% inicial
  const censored = username.slice(0, visibleStart) + '***';
  return censored;
};

const Home = () => {
  const [featuredItems, setFeaturedItems] = useState<FortniteItem[]>([]);
  const [latestItems, setLatestItems] = useState<FortniteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();
  const [currentNotificationIndex, setCurrentNotificationIndex] = useState(0);
  const [showNotification, setShowNotification] = useState(true);

  useEffect(() => {
    const fetchFeaturedItems = async () => {
      try {
        const items = await getDailyShop();
        console.log('Total items recibidos:', items.length);

        // Filtrar todas las skins (outfits)
        const skins = items.filter((item: FortniteItem) => {
          const isOutfit = item.granted?.some(grant => 
            grant.type?.name?.toLowerCase() === 'outfit' ||
            item.mainType?.toLowerCase().includes('outfit')
          );

          // Para skins centrales necesitamos imagen de perfil
          const hasProfileIcon = Boolean(
            item.images?.icon || 
            item.granted?.[0]?.images?.icon
          );

          // Para skins laterales necesitamos cualquier imagen válida
          const hasValidImage = Boolean(
            item.images?.transparent ||
            item.granted?.[0]?.images?.transparent ||
            item.displayAssets?.[0]?.full_background ||
            item.images?.featured
          );

          if (isOutfit && (hasProfileIcon || hasValidImage)) {
            console.log('Skin encontrada:', {
              name: item.displayName,
              type: item.mainType,
              hasIcon: hasProfileIcon,
              hasValidImage: hasValidImage,
              availableImages: {
                icon: item.images?.icon,
                grantedIcon: item.granted?.[0]?.images?.icon,
                transparent: item.images?.transparent,
                grantedTransparent: item.granted?.[0]?.images?.transparent,
                displayAssets: item.displayAssets?.[0]?.full_background,
                featured: item.images?.featured
              }
            });
          }

          return isOutfit && (hasProfileIcon || hasValidImage);
        });

        console.log('Total de skins disponibles:', skins.length);

        if (skins.length === 0) {
          console.error('No hay skins disponibles');
          setLoading(false);
          return;
        }

        // Separar skins con imagen de perfil para el centro
        const centralSkins = skins.filter((skin: FortniteItem) => Boolean(skin.images?.icon));
        // Separar skins con imagen transparente para los lados
        const sideSkins = skins.filter((skin: FortniteItem) => 
          Boolean(skin.images?.transparent || skin.granted?.[0]?.images?.transparent)
        );

        console.log('Skins disponibles para el centro:', centralSkins.length);
        console.log('Skins disponibles para los lados:', sideSkins.length);

        if (centralSkins.length === 0 || sideSkins.length < 2) {
          console.error('No hay suficientes skins con las imágenes requeridas');
          setLoading(false);
          return;
        }

        // Seleccionar una skin aleatoria para el centro
        const randomCentralSkin = centralSkins[Math.floor(Math.random() * centralSkins.length)];
        console.log('Skin seleccionada para el centro:', {
          name: randomCentralSkin.displayName,
          iconUrl: randomCentralSkin.images?.icon
        });

        // Seleccionar dos skins aleatorias diferentes para los lados
        const shuffledSideSkins = sideSkins
          .filter((skin: FortniteItem) => skin.mainId !== randomCentralSkin.mainId)
          .sort(() => 0.5 - Math.random());
        const selectedSideSkins = shuffledSideSkins.slice(0, 2);

        // Colocar las skins en el orden correcto
        setFeaturedItems([
          selectedSideSkins[0],
          randomCentralSkin,
          selectedSideSkins[1]
        ].filter(Boolean));

        setLoading(false);
      } catch (error) {
        console.error('Error fetching featured items:', error);
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

  // Efecto para rotar las notificaciones
  useEffect(() => {
    const interval = setInterval(() => {
      setShowNotification(false);
      setTimeout(() => {
        setCurrentNotificationIndex((prevIndex) => 
          prevIndex === purchaseNotifications.length - 1 ? 0 : prevIndex + 1
        );
        setShowNotification(true);
      }, 500);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getBestImage = (item: FortniteItem, isMainItem: boolean = false): string | undefined => {
    if (!item) return undefined;

    console.log('Procesando imagen para:', item.displayName, {
      displayAssets: item.displayAssets,
      granted: item.granted,
      images: item.images
    });

    if (isMainItem) {
      // Para el item central, intentar obtener la imagen de perfil
      const iconImage = item.granted?.[0]?.images?.icon;
      
      if (iconImage) {
        console.log('Usando icono para skin central:', {
          name: item.displayName,
          iconUrl: iconImage
        });
        return iconImage;
      }
      
      // Si no hay icono, intentar usar la imagen de displayAssets
      const displayImage = item.displayAssets?.[0]?.full_background;
      if (displayImage) {
        return displayImage;
      }

      console.error('Error: Skin central no tiene imagen válida', {
        name: item.displayName,
        mainId: item.mainId
      });
      return undefined;
    } else {
      // Para los items laterales, intentar obtener la imagen en este orden:
      const sideImage = 
        item.granted?.[0]?.images?.transparent || // 1. Imagen transparente del granted
        item.displayAssets?.[0]?.full_background || // 2. Imagen completa de displayAssets
        item.granted?.[0]?.images?.icon; // 3. Icono del granted como último recurso
      
      if (sideImage) {
        console.log('Usando imagen para skin lateral:', {
          name: item.displayName,
          imageUrl: sideImage
        });
        return sideImage;
      }
      
      console.error('Error: Skin lateral no tiene imagen válida', {
        name: item.displayName,
        mainId: item.mainId,
        availableImages: {
          grantedTransparent: item.granted?.[0]?.images?.transparent,
          displayAssets: item.displayAssets?.[0]?.full_background,
          grantedIcon: item.granted?.[0]?.images?.icon
        }
      });
      return undefined;
    }
  };

  const t = translations[language];

  return (
    <div className="min-h-screen relative">
      {/* Fondo fijo */}
      <div className="fixed inset-0 hero-background bg-cover bg-center bg-no-repeat" style={{ zIndex: -2 }}></div>
      <div className="fixed inset-0 bg-black/70" style={{ zIndex: -1 }}></div>

      <div className="relative">
        <LanguageSelector />
        
        {/* Hero Section */}
        <section className="relative h-screen w-full flex items-center overflow-hidden">
          <div className="w-full max-w-[1440px] mx-auto px-4 relative z-10">
            <div className="flex justify-between items-center">
              {/* Contenido Hero */}
              <div className="max-w-3xl">
                <h1 
                  className="text-7xl md:text-8xl font-bold text-white mb-8 leading-tight"
                  dangerouslySetInnerHTML={{ __html: t.heroTitle }}
                />
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

              {/* Imágenes a la derecha */}
              {!loading && featuredItems.length >= 3 && (
                <div className="flex items-center justify-center gap-8 mt-12">
                  {featuredItems.map((item, index) => (
                    <div
                      key={item.mainId}
                      className={`relative transform transition-all duration-500 ${
                        index === 1 
                          ? 'w-[400px] h-[500px] z-20' 
                          : 'w-[250px] h-[300px] opacity-80'
                      } ${index === 0 ? '-rotate-6' : index === 2 ? 'rotate-6' : ''}`}
                    >
                      <div className={`relative w-full h-full rounded-2xl overflow-hidden ${
                        index !== 1 ? 'backdrop-blur-[2px]' : ''
                      }`}>
                        <img
                          src={getBestImage(item, index === 1)}
                          alt={item.displayName}
                          className={`w-full h-full ${
                            index === 1 
                              ? 'object-contain scale-150 transform-gpu' 
                              : 'object-cover'
                          }`}
                          style={index === 1 ? {
                            imageRendering: 'crisp-edges'
                          } : undefined}
                        />
                        {index === 1 && (
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Featured Fortnite Items - Renovado */}
        <section className="py-24 relative">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">{t.featuredItems}</h2>
              <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                {t.featuredDescription}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-7xl mx-auto">
              {loading ? (
                Array(4).fill(0).map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="bg-gray-700/20 h-80 rounded-2xl mb-4"></div>
                    <div className="bg-gray-700/20 h-6 w-3/4 rounded mb-2"></div>
                    <div className="bg-gray-700/20 h-4 w-1/2 rounded mb-2"></div>
                    <div className="bg-gray-700/20 h-4 w-1/4 rounded"></div>
                  </div>
                ))
              ) : (
                featuredItems.map((item) => (
                  <div key={item.mainId} className="group">
                    <div className="relative overflow-hidden rounded-2xl mb-4 bg-[#051923]/80 backdrop-blur-sm">
                      {getBestImage(item) ? (
                        <img 
                          src={getBestImage(item)}
                          alt={item.displayName}
                          className="w-full h-80 object-cover transform group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-80 bg-[#051923]/80 flex items-center justify-center p-4 text-center">
                          <span className="text-gray-300 font-semibold">{item.displayName}</span>
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
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary-400 transition-colors duration-300">
                      {item.displayName}
                    </h3>
                    <p className="text-gray-400 mb-2">{item.mainType}</p>
                    <p className="text-primary-400 font-bold text-lg">{item.price.finalPrice} V-Bucks</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Notificaciones de Compra */}
        <div className={`fixed bottom-8 left-8 z-50 transition-all duration-500 transform ${showNotification ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <div className="bg-[#051923]/90 backdrop-blur-sm rounded-xl p-4 shadow-xl border border-primary-500/20 max-w-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary-500/20 rounded-lg">
                <ShoppingCart className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <p className="text-white font-medium">
                  {censorUsername(purchaseNotifications[currentNotificationIndex].username)}
                </p>
                <p className="text-gray-400 text-sm">
                  compró {purchaseNotifications[currentNotificationIndex].item}
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  hace {purchaseNotifications[currentNotificationIndex].time}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;