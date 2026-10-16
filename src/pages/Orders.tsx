import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Package, Truck, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export const Orders: React.FC = () => {
  const { orders } = useCart();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#0A2540] flex items-center gap-2">
            <Package className="w-6 h-6 text-[#0A2540]" />
            <span>माझ्या मागण्यांचा इतिहास (Order History)</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#5B6B7D] mt-0.5">
            तुमच्या कृषी दुकानातील सर्व ऑर्डर्स व डिलिव्हरी स्थिती
          </p>
        </div>

        <Link to="/store">
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            दुकानात जा
          </Button>
        </Link>
      </div>

      {orders.length === 0 ? (
        <Card variant="white" className="p-12 text-center space-y-3 border-[#D5DEE8]">
          <div className="w-16 h-16 rounded-full bg-[#EEF3F8] text-[#5B6B7D] flex items-center justify-center mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <h4 className="font-bold text-[#0A2540] text-base">
            अद्याप कोणतीही ऑर्डर नोंदवलेली नाही
          </h4>
          <p className="text-xs text-[#5B6B7D] max-w-xs mx-auto">
            तुम्ही कृषी केंद्रातून बियाणे, जैविक खते किंवा कीटकनाशके ऑर्डर करू शकता.
          </p>
          <div className="pt-2">
            <Link to="/store">
              <Button variant="primary" size="sm">
                कृषी साहित्य खरेदी करा
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} variant="white" className="p-5 border-[#D5DEE8] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#D5DEE8]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-[#0A2540] text-sm">
                      ऑर्डर: {order.id}
                    </span>
                    <Badge variant="success" size="sm" dot>
                      निश्चित झाली (Confirmed)
                    </Badge>
                  </div>
                  <span className="text-[11px] text-[#5B6B7D]">
                    दिनांक: {new Date(order.createdAt).toLocaleDateString('mr-IN')}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-base font-black text-[#138808]">
                    ₹{order.totalAmount.toLocaleString('en-IN')}
                  </span>
                  <span className="block text-[10px] text-[#5B6B7D] uppercase font-medium">
                    {order.paymentMethod === 'cod' ? 'कॅश ऑन डिलिव्हरी' : order.paymentMethod}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs text-[#0A2540]">
                    <div className="flex items-center gap-2">
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-10 h-10 rounded-lg object-cover border border-[#D5DEE8]"
                      />
                      <div>
                        <p className="font-bold text-[#0A2540]">
                          {item.product.nameLocal['mr'] || item.product.name}
                        </p>
                        <span className="text-[11px] text-[#5B6B7D]">
                          प्रमाण: {item.quantity} × ₹{item.product.price}
                        </span>
                      </div>
                    </div>

                    <span className="font-bold text-[#0A2540]">
                      ₹{item.product.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Address */}
              <div className="pt-2 border-t border-[#D5DEE8] flex items-center justify-between text-[11px] text-[#5B6B7D]">
                <span>
                  पत्ता: {order.shippingAddress.village}, {order.shippingAddress.district} ({order.shippingAddress.pincode})
                </span>
                <span className="text-[#138808] font-bold">
                  डिलिव्हरी: ३ ते ५ दिवसांत
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
