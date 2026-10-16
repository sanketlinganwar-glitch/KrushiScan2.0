import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppNotification } from '../types';
import { LOCAL_STORAGE_KEYS } from '../lib/supabase';

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => void;
}

const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    type: 'weather',
    title: {
      mr: 'हवामान इशारा: पावसाची शक्यता',
      hi: 'मौसम अलर्ट: बारिश की संभावना',
      en: 'Weather Alert: Rain Expected',
    },
    message: {
      mr: 'यवतमाळ व अमरावती जिल्ह्यात पुढील २४ तासांत पावसाची शक्यता आहे. कीटकनाशक फवारणी पुढे ढकला.',
      hi: 'यवतमाल और अमरावती में 24 घंटों में बारिश संभव है। कीटनाशक छिड़काव रोकें।',
      en: 'Rainfall expected in Yavatmal & Amravati within 24h. Postpone foliar sprays.',
    },
    timestamp: '२ तास आधी (2h ago)',
    isRead: false,
    severity: 'warning',
    actionUrl: '/guidance',
  },
  {
    id: 'notif-2',
    type: 'disease',
    title: {
      mr: 'कीड इशारा: गुलाबी बोंडअळी सर्वेक्षण',
      hi: 'कीट चेतावनी: गुलाबी सुंडी',
      en: 'Pest Advisory: Pink Bollworm Alert',
    },
    message: {
      mr: 'विदर्भात कापूस बोंड भरण्याच्या अवस्थेत आहे. कामगंध सापळ्यांची रोज सकाळी तपासणी करा.',
      hi: 'विदर्भ में कपास में फेरोमोन ट्रैप की नियमित जांच करें।',
      en: 'Cotton is in boll development stage. Inspect pheromone traps daily.',
    },
    timestamp: '५ तास आधी (5h ago)',
    isRead: false,
    severity: 'alert',
    actionUrl: '/scan',
  },
  {
    id: 'notif-3',
    type: 'price',
    title: {
      mr: 'मंडी भाव अपडेट: हिंगणघाट कापूस दर वाढले',
      hi: 'मंडी भाव अपडेट: हिंगणघाट कपास भाव',
      en: 'Mandi Price Alert: Hinganghat Cotton Surge',
    },
    message: {
      mr: 'हिंगणघाट बाजारात लांब धाग्याच्या कापसाला ₹७,९२० प्रति क्विंटल सर्वोच्च दर मिळाला.',
      hi: 'हिंगणघाट मंडी में कपास ₹7,920 प्रति क्विंटल बिका।',
      en: 'Hinganghat APMC recorded ₹7,920/Quintal for long staple cotton.',
    },
    timestamp: 'काल (Yesterday)',
    isRead: true,
    severity: 'info',
    actionUrl: '/mandi',
  },
  {
    id: 'notif-4',
    type: 'scheme',
    title: {
      mr: 'नमो शेतकरी महासन्मान निधी',
      hi: 'नमो शेतकारी महासम्मान निधि',
      en: 'Namo Shetkari Mahasanman Nidhi',
    },
    message: {
      mr: 'पात्र शेतकऱ्यांच्या बँक खात्यात ₹२,००० चा नवीन हप्ता जमा झाला आहे. स्थिती तपासा.',
      hi: 'पात्र किसानों के खातों में ₹2,000 की नई किस्त जमा की गई है।',
      en: 'New ₹2,000 installment disbursed. Check your Aadhaar seeding status.',
    },
    timestamp: '२ दिवसांपूर्वी (2d ago)',
    isRead: true,
    severity: 'info',
    actionUrl: '/guidance',
  },
];

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.NOTIFICATIONS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_NOTIFICATIONS;
      }
    }
    return DEFAULT_NOTIFICATIONS;
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const addNotification = (item: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotif: AppNotification = {
      ...item,
      id: 'notif-' + Date.now(),
      timestamp: 'आत्ताच (Just now)',
      isRead: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        addNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
