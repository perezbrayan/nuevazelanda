import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Check, Gift, LogOut } from 'lucide-react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

const CheckoutSteps = ({ currentStep, isAuthenticated }: { currentStep: number, isAuthenticated: boolean }) => {
  const steps = [
    { title: 'Resumen', description: 'Detalles del producto' },
    ...(!isAuthenticated ? [{ title: 'Usuario', description: 'Información de usuario' }] : []),
    { title: 'Datos de Pago', description: 'Información de pago' },
    { title: 'Confirmar', description: 'Confirmar y pagar' }
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

const OrderSummary = ({ item, onContinue }) => {
  const navigate = useNavigate();
  const { items: cartItems } = useCart();

  const handleBack = () => {
    if (cartItems.length > 0) {
      navigate('/fortnite-shop', { state: { keepCart: true } });
    } else {
      navigate('/fortnite-shop');
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">Detalles del Producto</h2>
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
              <span>Regalo Especial</span>
            </div>
            <p className="text-gray-600">Cantidad: 1</p>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-primary-600">{item.price.finalPrice}</span>
              <span className="text-gray-500">V-Bucks</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center pt-6 border-t border-gray-100">
        <button
          onClick={handleBack}
          className="px-6 py-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          Volver a la tienda
        </button>
        <button
          onClick={onContinue}
          className="px-8 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/20"
        >
          Continuar
        </button>
      </div>
    </div>
  );
};

const UserInformation = ({ onContinue, onBack }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Por favor ingresa tu nombre de usuario');
      return;
    }
    onContinue(username);
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">Información de Usuario</h2>
      <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-6">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
            Nombre de Usuario de Fortnite
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            placeholder="Ingresa tu usuario de Fortnite"
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
            Atrás
          </button>
          <button
            type="submit"
            className="px-8 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/20"
          >
            Continuar
          </button>
        </div>
      </form>
    </div>
  );
};

const PaymentInformation = ({ onContinue, onBack }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = React.useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Por favor selecciona una imagen válida (PNG, JPG, JPEG)');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('La imagen no debe superar los 5MB');
        return;
      }
      setSelectedFile(file);
      setError('');
      
      // Create preview URL and store in localStorage
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewUrl(result);
        localStorage.setItem('paymentProof', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Por favor sube tu comprobante de pago');
      return;
    }
    onContinue({ paymentProof: selectedFile });
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">Información de Pago</h2>
      <div className="max-w-xl mx-auto">
        <div className="bg-blue-50 p-6 rounded-xl mb-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Datos Bancarios para la Transferencia</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-blue-900">Banco</p>
              <p className="text-blue-800">Banco Internacional del Perú - Interbank</p>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-900">Número de Cuenta</p>
              <p className="text-blue-800">123-456789-012</p>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-900">Titular de la Cuenta</p>
              <p className="text-blue-800">Game Store S.A.C.</p>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-900">RUC</p>
              <p className="text-blue-800">20123456789</p>
            </div>
            <div className="pt-4">
              <p className="text-sm text-blue-700">
                <strong>Importante:</strong> Una vez realizado el pago, sube una captura o foto 
                de tu comprobante de pago y haz clic en Continuar.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comprobante de Pago
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
                {selectedFile ? 'Cambiar comprobante' : 'Subir comprobante'}
              </button>
              
              {previewUrl && (
                <div className="relative rounded-lg overflow-hidden">
                  <img 
                    src={previewUrl} 
                    alt="Vista previa del comprobante" 
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
              Atrás
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/20"
            >
              Continuar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Payment = ({ item, username, onBack }) => {
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const mounted = React.useRef(true);

  // Cleanup al desmontar
  React.useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  const handlePayment = async () => {
    if (processing) return; // Evitar múltiples clicks

    try {
      setProcessing(true);
      setError('');
      setSuccess(false);
      
      // Validar campos requeridos
      if (!item.offerId || !item.displayName || !item.price?.finalPrice || !username) {
        setError('Faltan datos requeridos para procesar la orden');
        setProcessing(false);
        return;
      }

      // Crear FormData para enviar la imagen
      const formData = new FormData();
      formData.append('offer_id', item.offerId);
      formData.append('item_name', item.displayName);
      formData.append('price', item.price.finalPrice.toString());
      formData.append('username', username);
      
      // Obtener el archivo de pago del localStorage
      const paymentProofFile = localStorage.getItem('paymentProof');
      if (paymentProofFile) {
        // Convertir la cadena base64 a un archivo
        const response = await fetch(paymentProofFile);
        const blob = await response.blob();
        formData.append('payment_receipt', blob, 'payment_receipt.jpg');
      }

      console.log('Enviando datos de orden:', {
        offer_id: item.offerId,
        item_name: item.displayName,
        price: item.price.finalPrice,
        username: username,
        hasPaymentProof: !!paymentProofFile
      });

      // Crear la orden de Fortnite
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/db/api/fortnite/orders`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Respuesta del servidor:', response.data);

      // Limpiar el comprobante de pago del localStorage
      localStorage.removeItem('paymentProof');

      // Solo actualizar el estado si el componente sigue montado
      if (mounted.current) {
        if (response.data.success) {
          setSuccess(true);
          // Mostrar el mensaje de éxito de la respuesta
          const message = response.data.data?.message || '¡Orden creada exitosamente!';
          console.log('Orden creada:', message);
          
          // Mostrar mensaje de orden en proceso y redirigir al inicio
          setSuccess(true);
          setTimeout(() => {
            if (mounted.current) {
              navigate('/', { 
                state: { 
                  message: 'Orden en proceso. Pronto recibirás tu regalo en Fortnite.',
                  type: 'success'
                }
              });
            }
          }, 2000);
        } else {
          setError('No se pudo procesar la orden. Por favor, intente nuevamente.');
        }
        // Asegurarnos de que processing se actualice
        setProcessing(false);
      }
    } catch (err) {
      console.error('Error al crear orden:', err);
      console.error('Detalles del error:', err.response?.data);
      // Solo actualizar el estado si el componente sigue montado
      if (mounted.current) {
        setError(
          err.response?.data?.error || 
          'Error al crear la orden. Por favor, intente nuevamente.'
        );
      }
      // Asegurarnos de que processing se actualice
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Confirmar Orden</h2>
      
      {/* Mostrar mensaje de éxito */}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative mb-4">
          <div className="flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin mr-2" />
            <span className="block sm:inline font-medium">Orden en proceso. Redirigiendo...</span>
          </div>
        </div>
      )}

      {/* Mostrar error si existe */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow space-y-6">
        {/* Resumen de la compra */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Resumen de la Compra</h3>
          
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
              <p className="text-sm text-gray-500">Usuario de Fortnite: {username}</p>
            </div>
            <div className="text-right">
              <p className="font-medium text-gray-900">{item.price.finalPrice} V-Bucks</p>
            </div>
          </div>

          <div className="pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-gray-900">{item.price.finalPrice} V-Bucks</span>
            </div>
            <div className="flex justify-between font-medium text-lg mt-4">
              <span className="text-gray-900">Total a Pagar</span>
              <span className="text-primary-600">{item.price.finalPrice} V-Bucks</span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6">
          <p className="text-gray-600 mb-6">
            Al hacer clic en "Confirmar Orden", confirmas que has realizado el pago y aceptas procesar esta orden.
          </p>
          
          <div className="flex justify-between items-center">
            <button
              onClick={onBack}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
              disabled={processing}
            >
              Atrás
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
                  <span>Procesando...</span>
                </>
              ) : (
                <span>Confirmar Orden</span>
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
  const [paymentInfo, setPaymentInfo] = useState(null);
  const { items } = useCart();
  const navigate = useNavigate();

  // Obtener información del usuario del localStorage
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;
  const isAuthenticated = !!user;

  useEffect(() => {
    if (!items.length) {
      navigate('/fortnite-shop');
    }

    // Si hay un usuario autenticado, establecer su nombre de usuario
    if (user) {
      setUsername(user.username);
    }
  }, [items, navigate, user]);

  const handleContinueFromSummary = () => {
    setCurrentStep(isAuthenticated ? 2 : 2);
  };

  const handleContinueFromUser = (username) => {
    setUsername(username);
    setCurrentStep(3);
  };

  const handleContinueFromPayment = (paymentInfo) => {
    setPaymentInfo(paymentInfo);
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
      {(currentStep === 3 && isAuthenticated) || (currentStep === 4 && !isAuthenticated) && (
        <Payment item={items[0]} username={username} onBack={handleBackFromConfirmation} />
      )}
    </div>
  );
};

export default Checkout;
