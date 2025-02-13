import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { apiConfig } from '../config/api';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations';

interface BotStatus {
  isAuthenticated: boolean;
  displayName: string | null;
  lastError: string | null;
}

const Bot: React.FC = () => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [botStatus, setBotStatus] = useState<BotStatus>({
    isAuthenticated: false,
    displayName: null,
    lastError: null
  });
  const { language } = useLanguage();
  const t = translations[language];

  const checkBotStatus = async () => {
    try {
      const response = await fetch(`${apiConfig.botURL}/bot2/api/bot-status?botId=1`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      });

      const data = await response.json();
      
      setBotStatus({
        isAuthenticated: Boolean(data.isAuthenticated),
        displayName: data.displayName || null,
        lastError: null
      });
    } catch (error) {
      console.error('Error verificando estado:', error);
      setBotStatus(prev => ({
        ...prev,
        lastError: t.botStatusError
      }));
    }
  };

  useEffect(() => {
    checkBotStatus();
    const interval = setInterval(checkBotStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error(t.enterUsername);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${apiConfig.botURL}/bot2/api/send-friend-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          username,
          botId: 1
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success(t.friendRequestSent);
        setUsername('');
      } else {
        toast.error(data.error || t.friendRequestError);
      }
    } catch (error) {
      console.error('Error enviando solicitud:', error);
      toast.error(t.friendRequestError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Hero Section con efecto parallax */}
      <div className="relative h-[40vh] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url('/fortnite-crew-bg.jpg')"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#FAFAFA] to-transparent" />
        <div className="relative h-full flex flex-col items-center justify-center">
          <div className="text-center space-y-2">
            <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-purple-600 leading-relaxed pb-1">
              {t.botTitle}
            </h1>
            <p className="text-lg text-white">
              {t.botDescription}
            </p>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Estado del Bot */}
          <div className="bg-[#ADADAD] rounded-xl p-6 mb-8 shadow-lg border-2 border-gray-400">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{t.botStatus}</h2>
            <div className="space-y-2">
              <p className="text-gray-700">
                <span className="font-bold">{t.connectionStatus}:</span>{' '}
                <span className={`${botStatus.isAuthenticated ? 'text-green-600' : 'text-red-600'}`}>
                  {botStatus.isAuthenticated ? t.connected : t.disconnected}
                </span>
              </p>
              {botStatus.displayName && (
                <p className="text-gray-700">
                  <span className="font-bold">{t.botName}:</span> {botStatus.displayName}
                </p>
              )}
              {botStatus.lastError && (
                <p className="text-red-600">
                  <span className="font-bold">{t.error}:</span> {botStatus.lastError}
                </p>
              )}
            </div>
          </div>

          {/* Pasos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-[#ADADAD] rounded-xl p-6 text-gray-800 shadow-lg border-2 border-gray-400 transform transition-all hover:scale-105">
              <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-white font-bold mb-4 text-lg border-2 border-gray-600">
                1
              </div>
              <h3 className="text-lg font-bold mb-2">{t.step1Title}</h3>
              <p className="text-gray-700 text-sm">
                {t.step1Description}
              </p>
            </div>

            <div className="bg-[#ADADAD] rounded-xl p-6 text-gray-800 shadow-lg border-2 border-gray-400 transform transition-all hover:scale-105">
              <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-white font-bold mb-4 text-lg border-2 border-gray-600">
                2
              </div>
              <h3 className="text-lg font-bold mb-2">{t.step2Title}</h3>
              <p className="text-gray-700 text-sm">
                {t.step2Description}
              </p>
            </div>

            <div className="bg-[#ADADAD] rounded-xl p-6 text-gray-800 shadow-lg border-2 border-gray-400 transform transition-all hover:scale-105">
              <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-white font-bold mb-4 text-lg border-2 border-gray-600">
                3
              </div>
              <h3 className="text-lg font-bold mb-2">{t.step3Title}</h3>
              <p className="text-gray-700 text-sm">
                {t.step3Description}
              </p>
            </div>
          </div>

          {/* Formulario */}
          <div className="bg-[#ADADAD] rounded-xl p-6 shadow-lg border-2 border-gray-400">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-lg font-bold text-gray-800 mb-2">
                  {t.fortniteUsername}
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-400 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent shadow-inner"
                  placeholder={t.usernamePlaceholder}
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 bg-gray-700 hover:bg-gray-800 text-white rounded-lg font-bold text-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg border-2 border-gray-600`}
              >
                {loading ? t.sendingRequest : t.sendFriendRequest}
              </button>
            </form>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Bot;