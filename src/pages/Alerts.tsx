import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bell, 
  CloudRain, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  CheckCheck, 
  Trash2, 
  ExternalLink,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotifications } from '../contexts/NotificationContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export const Alerts: React.FC = () => {
  const { t, language } = useLanguage();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  const [activeTab, setActiveTab] = useState<'all' | 'weather' | 'disease' | 'price'>('all');

  const filteredNotifs = notifications.filter((n) => {
    if (activeTab === 'all') return true;
    return n.type === activeTab;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'weather':
        return <CloudRain className="w-5 h-5 text-[#2F9E59]" />;
      case 'disease':
        return <AlertTriangle className="w-5 h-5 text-[#C83E3E]" />;
      case 'price':
        return <TrendingUp className="w-5 h-5 text-[#21864A]" />;
      default:
        return <Bell className="w-5 h-5 text-[#E9A23B]" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#152D24] flex items-center gap-2">
            <Bell className="w-6 h-6 text-[#0B5137]" />
            <span>{t('navAlerts')} (Alerts & Notifications)</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#5F7065] mt-0.5">
            हवामानाचे इशारे, किडींचे उद्रेक, बाजार भाव बदल व शेती मार्गदर्शक सूचना
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            leftIcon={<CheckCheck className="w-4 h-4 text-[#2F9E59]" />}
          >
            सर्व वाचले म्हणून खूण करा ({unreadCount})
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'all', label: 'सर्व सूचना (All)' },
          { id: 'weather', label: 'हवामान इशारे (Weather)' },
          { id: 'disease', label: 'कीड व रोग अलर्ट (Pest/Disease)' },
          { id: 'price', label: 'बाजार भाव (Mandi Prices)' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
              activeTab === tab.id
                ? 'bg-[#0B5137] text-white border-[#0B5137] shadow-sm'
                : 'bg-white text-[#5F7065] border-[#DDE8DC] hover:bg-[#E6F2E5] hover:text-[#0B5137]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {filteredNotifs.length === 0 ? (
        <Card variant="white" className="p-12 text-center space-y-3 border-[#DDE8DC]">
          <div className="w-16 h-16 rounded-full bg-[#F6F8F0] text-[#5F7065] flex items-center justify-center mx-auto">
            <Bell className="w-8 h-8" />
          </div>
          <h4 className="font-bold text-[#152D24] text-base">
            सध्या कोणताही नवीन इशारा नाही
          </h4>
          <p className="text-xs text-[#5F7065] max-w-xs mx-auto">
            तुमच्या शेतासाठी व परिसरासाठी सर्व हवामान व कीड स्थिती सामान्य आहे.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredNotifs.map((item) => (
            <Card
              key={item.id}
              variant="white"
              padding="md"
              className={`border-l-4 transition border-[#DDE8DC] ${
                !item.isRead ? 'bg-[#E6F2E5]/40 border-l-[#E9A23B]' : 'border-l-[#DDE8DC]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-[#F6F8F0] shrink-0 mt-0.5 border border-[#DDE8DC]">
                    {getIcon(item.type)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-[#152D24]">
                        {item.title[language] || item.title['mr']}
                      </h4>
                      {!item.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#E9A23B] shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-[#5F7065] leading-relaxed font-medium">
                      {item.message[language] || item.message['mr']}
                    </p>
                    <span className="text-[10px] text-[#5F7065] block pt-1">
                      {item.timestamp}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {item.actionUrl && (
                    <Link to={item.actionUrl}>
                      <Button variant="outline" size="sm" className="bg-white text-[#152D24] border-[#DDE8DC] hover:bg-[#E6F2E5] text-xs">
                        तपासा
                      </Button>
                    </Link>
                  )}
                  {!item.isRead && (
                    <button
                      onClick={() => markAsRead(item.id)}
                      className="p-1.5 text-[#5F7065] hover:text-[#2F9E59] rounded-lg"
                      title="वाचले म्हणून खूण करा"
                    >
                      <CheckCheck className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(item.id)}
                    className="p-1.5 text-[#5F7065] hover:text-[#C83E3E] rounded-lg"
                    title="हटवा"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
