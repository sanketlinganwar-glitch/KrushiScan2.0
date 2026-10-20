import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  CreditCard, 
  Truck, 
  MapPin, 
  Phone, 
  User, 
  ShieldCheck, 
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import confetti from 'canvas-confetti';

export const Checkout: React.FC = () => {
  const { t } = useLanguage();
  const { items, subtotal, deliveryCharge, totalAmount, createOrder } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(user?.name || 'गजानन पवार');
  const [village, setVillage] = useState(user?.village || 'दारव्हा');
  const [district, setDistrict] = useState(user?.district || 'यवतमाळ');
  const [pincode, setPincode] = useState('445202');
  const [phone, setPhone] = useState(user?.phone || '9876543210');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'kcc' | 'upi'>('cod');

  const [placedOrder, setPlacedOrder] = useState<any | null>(null);

  if (items.length === 0 && !placedOrder) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
          <Truck className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">टोपलीमध्ये कोणतीही वस्तू नाही</h3>
        <p className="text-xs text-slate-500">कृपया आधी कृषी केंद्रातून उत्पादने निवडा.</p>
        <Link to="/store">
          <Button variant="primary">कृषी दुकानात जा</Button>
        </Link>
      </div>
    );
  }

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const order = createOrder(
      {
        fullName,
        village,
        district,
        pincode,
        phone,
      },
      paymentMethod
    );

    setPlacedOrder(order);

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }
  };

  if (placedOrder) {
    return (
      <div className="max-w-lg mx-auto py-10 space-y-6">
        <Card variant="white" className="p-8 text-center space-y-4 border-emerald-500/30">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-green-glow">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h3 className="text-2xl font-black text-slate-900">
            मागणी यशस्वीरित्या नोंदवली गेली!
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            ऑर्डर क्रमांक: <strong className="text-emerald-800">{placedOrder.id}</strong>
          </p>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2">
            <div className="flex justify-between font-bold text-slate-800">
              <span>एकूण देय रक्कम:</span>
              <span className="text-emerald-700 font-black text-sm">
                ₹{placedOrder.totalAmount.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>पेमेंट पद्धत:</span>
              <span className="capitalize font-semibold text-slate-800">
                {placedOrder.paymentMethod === 'cod' ? 'कॅश ऑन डिलिव्हरी (COD)' : placedOrder.paymentMethod.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>डिलिव्हरी पत्ता:</span>
              <span className="font-semibold text-slate-800 text-right truncate max-w-[200px]">
                {placedOrder.shippingAddress.village}, {placedOrder.shippingAddress.district} ({placedOrder.shippingAddress.pincode})
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
            डेमो मोड सूचना: हे प्रात्यक्षिक ऑर्डर आहे. कोणतेही प्रत्यक्ष पैसे कापले गेलेले नाहीत.
          </div>

          <div className="pt-2 flex items-center justify-center gap-3">
            <Link to="/store">
              <Button variant="outline" size="sm" className="bg-white text-slate-800 border-slate-300">
                दुकान पाहा
              </Button>
            </Link>
            <Link to="/orders">
              <Button variant="primary" size="sm">
                ऑर्डर इतिहास पाहा
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/store')}
          className="p-2 rounded-xl bg-white hover:bg-[#E6F2E5] text-[#152D24] border border-[#DDE8DC] shadow-xs transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-black text-[#152D24]">ऑर्डर मागणी नोंदणी (Checkout)</h2>
          <p className="text-xs text-[#5F7065] font-medium">तुमचा पत्ता व पेमेंट पर्याय निवडा</p>
        </div>
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Delivery Address */}
        <div className="lg:col-span-7 space-y-4">
          <Card variant="white" className="p-5 border-[#DDE8DC] shadow-sm space-y-4">
            <h4 className="font-bold text-sm text-[#152D24] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#2F9E59]" />
              <span>१. शेतकरी घरपोच पत्ता (Delivery Address)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#152D24] mb-1">पूर्ण नाव</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-white border border-[#DDE8DC] rounded-xl p-2.5 text-xs sm:text-sm text-[#152D24] focus:ring-2 focus:ring-[#0B5137] shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#152D24] mb-1">मोबाईल नंबर</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white border border-[#DDE8DC] rounded-xl p-2.5 text-xs sm:text-sm text-[#152D24] focus:ring-2 focus:ring-[#0B5137] shadow-2xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#152D24] mb-1">गाव / शहर</label>
                <input
                  type="text"
                  required
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="w-full bg-white border border-[#DDE8DC] rounded-xl p-2.5 text-xs sm:text-sm text-[#152D24] focus:ring-2 focus:ring-[#0B5137] shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#152D24] mb-1">जिल्हा</label>
                <input
                  type="text"
                  required
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full bg-white border border-[#DDE8DC] rounded-xl p-2.5 text-xs sm:text-sm text-[#152D24] focus:ring-2 focus:ring-[#0B5137] shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#152D24] mb-1">पिनकोड</label>
                <input
                  type="text"
                  required
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full bg-white border border-[#DDE8DC] rounded-xl p-2.5 text-xs sm:text-sm text-[#152D24] focus:ring-2 focus:ring-[#0B5137] shadow-2xs"
                />
              </div>
            </div>
          </Card>

          {/* Payment Method */}
          <Card variant="white" className="p-5 border-[#DDE8DC] shadow-sm space-y-4">
            <h4 className="font-bold text-sm text-[#152D24] flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#2F9E59]" />
              <span>२. पेमेंट पद्धत निवडा (Payment Method)</span>
            </h4>

            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 rounded-xl bg-[#F6F8F0] border border-[#DDE8DC] cursor-pointer hover:border-[#0B5137] transition shadow-2xs">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="text-[#0B5137] focus:ring-[#0B5137]"
                />
                <div>
                  <span className="text-xs sm:text-sm font-bold text-[#152D24] block">
                    कॅश ऑन डिलिव्हरी (Cash on Delivery)
                  </span>
                  <span className="text-[11px] text-[#5F7065] font-medium">
                    माल घरी पोहोचल्यावर रोख पैसे द्या.
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl bg-[#F6F8F0] border border-[#DDE8DC] cursor-pointer hover:border-[#0B5137] transition shadow-2xs">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'kcc'}
                  onChange={() => setPaymentMethod('kcc')}
                  className="text-[#0B5137] focus:ring-[#0B5137]"
                />
                <div>
                  <span className="text-xs sm:text-sm font-bold text-[#152D24] block">
                    किसान क्रेडिट कार्ड (KCC Kisan Credit)
                  </span>
                  <span className="text-[11px] text-[#5F7065] font-medium">
                    शेतकरी कृषी कर्ज कार्ड द्वारे नोंदणी.
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl bg-[#F6F8F0] border border-[#DDE8DC] cursor-pointer hover:border-[#0B5137] transition shadow-2xs">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'upi'}
                  onChange={() => setPaymentMethod('upi')}
                  className="text-[#0B5137] focus:ring-[#0B5137]"
                />
                <div>
                  <span className="text-xs sm:text-sm font-bold text-[#152D24] block">
                    UPI / Razorpay / PhonePe / GPay
                  </span>
                  <span className="text-[11px] text-[#5F7065] font-medium">
                    सुरक्षित ऑनलाइन पेमेंट गेटवे.
                  </span>
                </div>
              </label>
            </div>
          </Card>
        </div>

        {/* Right Summary */}
        <div className="lg:col-span-5 space-y-4">
          <Card variant="white" className="p-5 border-[#DDE8DC] space-y-4">
            <h4 className="font-bold text-sm text-[#152D24] border-b border-[#DDE8DC] pb-2">
              मागणी तपशील ({items.length} उत्पादने)
            </h4>

            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1 text-xs">
              {items.map((i) => (
                <div key={i.product.id} className="flex justify-between items-center text-[#5F7065]">
                  <span className="truncate max-w-[200px] text-[#152D24] font-medium">
                    {i.product.nameLocal['mr'] || i.product.name} × {i.quantity}
                  </span>
                  <span className="font-bold text-[#152D24]">
                    ₹{i.product.price * i.quantity}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-[#DDE8DC] text-xs space-y-1.5">
              <div className="flex justify-between text-[#5F7065]">
                <span>उपएकूण:</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-[#5F7065]">
                <span>डिलिव्हरी:</span>
                <span className="text-[#2F9E59] font-bold">
                  {deliveryCharge === 0 ? 'मोफत (Free)' : `₹${deliveryCharge}`}
                </span>
              </div>
              <div className="pt-2 border-t border-[#DDE8DC] flex justify-between text-base font-black text-[#152D24]">
                <span>एकूण रक्कम:</span>
                <span className="text-[#0B5137] text-lg font-black">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full text-base font-extrabold shadow-md mt-2"
            >
              ऑर्डर निश्चित करा (Confirm Order)
            </Button>
          </Card>
        </div>
      </form>
    </div>
  );
};
