import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Check, Gift, LogOut } from 'lucide-react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations';

interface CheckoutItem {
  mainId: string;
  offerId: string;
  displayName: string;
  price: {
    finalPrice: number;
  };
  image: string;
}

interface OrderSummaryProps {
  item: CheckoutItem;
  onContinue: () => void;
}

interface UserInformationProps {
  onContinue: (username: string) => void;
  onBack: () => void;
}

interface PaymentInformationProps {
  onContinue: (info: { paymentProof: File }) => void;
  onBack: () => void;
}

interface PaymentProps {
  item: CheckoutItem;
  username: string;
  onBack: () => void;
}

const CheckoutSteps = ({ currentStep, isAuthenticated }: { currentStep: number, isAuthenticated: boolean }) => {
  const { language } = useLanguage();
  const t = translations[language];
  
  const steps = [
    { title: t.orderSummary, description: t.productDetails },
    ...(!isAuthenticated ? [{ title: t.userInformation, description: t.enterFortniteUsername }] : []),
    { title: t.paymentInformation, description: t.bankDetails },
    { title: t.confirmOrder, description: t.orderConfirmed }
  ];

  return (
    <div className="flex justify-between">
      {steps.map((step, index) => {
        const isActive = index + 1 === currentStep;
        const isCompleted = index + 1 < currentStep;

        return (
          <div key={step.title} className="flex-1">
            <div className="relative flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : isCompleted
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-6 h-6" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <div className="mt-2 text-center">
                <div className="text-sm font-medium text-gray-900">{step.title}</div>
                <div className="text-xs text-gray-500">{step.description}</div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`absolute top-5 left-1/2 w-full h-0.5 ${
                    currentStep > index + 1 ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const OrderSummary = ({ item, onContinue }: OrderSummaryProps) => {
  const navigate = useNavigate();
  const { items: cartItems } = useCart();
  const { language } = useLanguage();
  const t = translations[language];

  const handleBack = () => {
    if (cartItems.length > 0) {
      navigate('/fortnite-shop', { state: { keepCart: true } });
    } else {
      navigate('/fortnite-shop');
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">{t.productDetails}</h2>
      <div className="flex gap-8 mb-8">
        <div className="w-1/3">
          <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100">
            <img
              src={item.image}
              alt={item.displayName}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">{item.displayName}</h3>
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2 text-gray-600">
              <Gift className="w-5 h-5 text-primary-500" />
              <span>{t.specialGift}</span>
            </div>
            <p className="text-gray-600">{t.quantity}: 1</p>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-primary-600">{item.price.finalPrice}</span>
              <span className="text-gray-500">{t.vbucks}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center pt-6 border-t border-gray-100">
        <button
          onClick={handleBack}
          className="px-6 py-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          {t.backToStore}
        </button>
        <button
          onClick={onContinue}
          className="px-8 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/20"
        >
          {t.continue}
        </button>
      </div>
    </div>
  );
};

const UserInformation = ({ onContinue, onBack }: UserInformationProps) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const { language } = useLanguage();
  const t = translations[language];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError(t.enterUsername);
      return;
    }
    onContinue(username);
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">{t.userInformation}</h2>
      <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-6">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
            {t.fortniteUsername}
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            placeholder={t.enterFortniteUsername}
          />
          {error && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <span className="inline-block w-1 h-1 rounded-full bg-red-600" />
              {error}
            </p>
          )}
        </div>
        <div className="flex justify-between items-center pt-6">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            {t.back}
          </button>
          <button
            type="submit"
            className="px-8 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/20"
          >
            {t.continue}
          </button>
        </div>
      </form>
    </div>
  );
};

const PaymentInformation = ({ onContinue, onBack }: PaymentInformationProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { language } = useLanguage();
  const t = translations[language];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError(t.invalidImage);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError(t.imageSizeLimit);
        return;
      }
      setSelectedFile(file);
      setError('');
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewUrl(result);
        localStorage.setItem('paymentProof', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError(t.uploadRequired);
      return;
    }
    onContinue({ paymentProof: selectedFile });
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">{t.paymentInformation}</h2>
      <div className="max-w-xl mx-auto">
        <div className="bg-blue-50 p-6 rounded-xl mb-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">{t.bankDetails}</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-blue-900">{t.bank}</p>
              <p className="text-blue-800">Banco Internacional del Perú - Interbank</p>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-900">{t.accountNumber}</p>
              <p className="text-blue-800">123-456789-012</p>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-900">{t.accountHolder}</p>
              <p className="text-blue-800">Game Store S.A.C.</p>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-900">RUC</p>
              <p className="text-blue-800">20123456789</p>
            </div>
            <div className="pt-4">
              <p className="text-sm text-blue-700">
                <strong>{t.uploadRequired}</strong>
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.paymentProof}
            </label>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileSelect}
            />
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleClickUpload}
                className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:text-primary-600 hover:border-primary-600 transition-colors flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                {selectedFile ? t.changeProof : t.uploadProof}
              </button>
              
              {previewUrl && (
                <div className="relative rounded-lg overflow-hidden">
                  <img 
                    src={previewUrl} 
                    alt={t.paymentProof} 
                    className="w-full h-auto"
                  />
                </div>
              )}
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <span className="inline-block w-1 h-1 rounded-full bg-red-600" />
                {error}
              </p>
            )}
          </div>

          <div className="flex justify-between items-center pt-6">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              {t.back}
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/20"
            >
              {t.continue}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Payment = ({ item, username, onBack }: PaymentProps) => {
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { language } = useLanguage();
  const t = translations[language];
  const mounted = React.useRef(true);

  React.useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  const handlePayment = async () => {
    if (processing) return;

    try {
      setProcessing(true);
      setError('');
      setSuccess(false);
      
      if (!item.offerId || !item.displayName || !item.price?.finalPrice || !username) {
        setError(t.requiredFields);
        setProcessing(false);
        return;
      }

      const formData = new FormData();
      formData.append('offer_id', item.offerId);
      formData.append('item_name', item.displayName);
      formData.append('price', item.price.finalPrice.toString());
      formData.append('username', username);
      
      const paymentProofFile = localStorage.getItem('paymentProof');
      if (paymentProofFile) {
        const response = await fetch(paymentProofFile);
        const blob = await response.blob();
        formData.append('payment_receipt', blob, 'payment_receipt.jpg');
      }

      const response = await axios.post(`${import.meta.env.VITE_API_URL}/db/api/fortnite/orders`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      localStorage.removeItem('paymentProof');

      if (mounted.current) {
        if (response.data.success) {
          setSuccess(true);
          setProcessing(false);
          
          setTimeout(() => {
            if (mounted.current) {
              navigate('/', { 
                state: { 
                  message: t.orderProcessing,
                  type: 'success'
                }
              });
            }
          }, 3000);
        } else {
          setError(t.orderError);
          setProcessing(false);
        }
      }
    } catch (error: unknown) {
      console.error('Error al crear orden:', error);
      if (error instanceof Error) {
        console.error('Detalles del error:', (error as any).response?.data);
        if (mounted.current) {
          setError(
            ((error as any).response?.data?.error as string) || 
            t.orderError
          );
          setProcessing(false);
        }
      }
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{t.confirmOrder}</h2>
      
      {success && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{t.orderSuccess}</h3>
              <div className="bg-gray-50 p-4 rounded-xl mb-4">
                <div className="text-left space-y-2">
                  <p className="text-gray-600"><span className="font-medium">{t.fortniteUsername}:</span> {username}</p>
                  <p className="text-gray-600"><span className="font-medium">{t.item}:</span> {item.displayName}</p>
                  <p className="text-gray-600"><span className="font-medium">{t.price}:</span> {item.price.finalPrice} {t.vbucks}</p>
                  <p className="text-gray-600"><span className="font-medium">{t.status}:</span> <span className="text-primary-600">{t.processing}</span></p>
                </div>
              </div>
              <p className="text-gray-600 mb-2">{t.orderProcessing}</p>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mt-4">
                <div className="w-1/3 h-full bg-primary-600 animate-[progress_3s_ease-in-out_infinite]"></div>
              </div>
              <p className="text-gray-500 text-sm mt-4">{t.redirecting}</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-4">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">{t.orderSummary}</h3>
          
          <div className="flex gap-4 items-start border-b border-gray-100 pb-4">
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-50">
              <img 
                src={item.image} 
                alt={item.displayName} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{item.displayName}</h4>
              <p className="text-sm text-gray-500">{t.fortniteUsername}: {username}</p>
            </div>
            <div className="text-right">
              <p className="font-medium text-gray-900">{item.price.finalPrice} {t.vbucks}</p>
            </div>
          </div>

          <div className="pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{t.total}</span>
              <span className="text-gray-900">{item.price.finalPrice} {t.vbucks}</span>
            </div>
            <div className="flex justify-between font-medium text-lg mt-4">
              <span className="text-gray-900">{t.total}</span>
              <span className="text-primary-600">{item.price.finalPrice} {t.vbucks}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6">
          <p className="text-gray-600 mb-6">
            {t.confirmOrder}
          </p>
          
          <div className="flex justify-between items-center">
            <button
              onClick={onBack}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
              disabled={processing}
            >
              {t.back}
            </button>
            
            <button
              onClick={handlePayment}
              disabled={processing}
              className={`px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 ${
                processing ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {processing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{t.processing}</span>
                </>
              ) : (
                <span>{t.confirmOrder}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Checkout = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [username, setUsername] = useState('');
  const [paymentInfo, setPaymentInfo] = useState<{ paymentProof: File } | null>(null);
  const { items } = useCart();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];

  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;
  const isAuthenticated = !!user;

  useEffect(() => {
    if (!items.length) {
      navigate('/fortnite-shop');
    }

    if (user) {
      setUsername(user.username);
    }
  }, [items, navigate, user]);

  const handleContinueFromSummary = () => {
    setCurrentStep(isAuthenticated ? 2 : 2);
  };

  const handleContinueFromUser = (newUsername: string) => {
    setUsername(newUsername);
    setCurrentStep(3);
  };

  const handleContinueFromPayment = (info: { paymentProof: File }) => {
    setPaymentInfo(info);
    setCurrentStep(isAuthenticated ? 3 : 4);
  };

  const handleBackFromUser = () => {
    setCurrentStep(1);
  };

  const handleBackFromPayment = () => {
    setCurrentStep(isAuthenticated ? 1 : 2);
  };

  const handleBackFromConfirmation = () => {
    setCurrentStep(isAuthenticated ? 2 : 3);
  };

  if (!items.length) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 mt-24">
      <CheckoutSteps currentStep={currentStep} isAuthenticated={isAuthenticated} />
      {currentStep === 1 && (
        <OrderSummary item={items[0]} onContinue={handleContinueFromSummary} />
      )}
      {currentStep === 2 && !isAuthenticated && (
        <UserInformation onContinue={handleContinueFromUser} onBack={handleBackFromUser} />
      )}
      {(currentStep === 2 && isAuthenticated) && (
        <PaymentInformation onContinue={handleContinueFromPayment} onBack={handleBackFromUser} />
      )}
      {(currentStep === 3 && !isAuthenticated) && (
        <PaymentInformation onContinue={handleContinueFromPayment} onBack={handleBackFromPayment} />
      )}
      {((currentStep === 3 && isAuthenticated) || (currentStep === 4 && !isAuthenticated)) && (
        <Payment item={items[0]} username={username} onBack={handleBackFromConfirmation} />
      )}
    </div>
  );
};

export default Checkout;
