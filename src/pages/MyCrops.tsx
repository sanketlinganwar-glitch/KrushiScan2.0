import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sprout, 
  Plus, 
  Calendar, 
  MapPin, 
  Droplet, 
  Layers, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertTriangle, 
  Activity, 
  Camera, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Crop } from '../types';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog';
import { LOCAL_STORAGE_KEYS } from '../lib/supabase';

const INITIAL_CROPS: Crop[] = [
  {
    id: 'crop-cotton-1',
    userId: 'current-user',
    name: 'कापूस (Cotton)',
    localName: { mr: 'कापूस', hi: 'कपास', en: 'Cotton' },
    variety: 'BT Cotton BG-II (राशी ६५९)',
    areaAcres: 3.5,
    plotName: 'विहीर लगतचे शेत (Well Plot)',
    sowingDate: '१५ जून २०२४',
    soilType: 'black_cotton',
    irrigationType: 'drip',
    stage: 'boll_formation',
    healthStatus: 'attention',
    latestScanId: 'sample-scan-1',
    latestScanDate: '२ दिवसांपूर्वी',
    latestDiseaseName: 'गुलाबी बोंडअळी (Pink Bollworm)',
    isSample: true,
  },
  {
    id: 'crop-soybean-1',
    userId: 'current-user',
    name: 'सोयाबीन (Soybean)',
    localName: { mr: 'सोयाबीन', hi: 'सोयाबीन', en: 'Soybean' },
    variety: 'JS-335 (महाबीज प्रमाणित)',
    areaAcres: 2.0,
    plotName: 'रस्त्यालगतचे शेत (Roadside Plot)',
    sowingDate: '२० जून २०२४',
    soilType: 'black_cotton',
    irrigationType: 'rainfed',
    stage: 'harvesting',
    healthStatus: 'healthy',
    latestScanId: 'sample-scan-2',
    latestScanDate: '५ दिवसांपूर्वी',
    latestDiseaseName: 'पिवळा मोझॅक - नियंत्रणात',
    isSample: true,
  },
  {
    id: 'crop-tur-1',
    userId: 'current-user',
    name: 'तूर (Pigeonpea)',
    localName: { mr: 'तूर', hi: 'तुअर/अरहर', en: 'Pigeonpea' },
    variety: 'BDN-711 (मर रोग प्रतिकारक्षम)',
    areaAcres: 1.0,
    plotName: 'मध्यम वावर (Center Plot)',
    sowingDate: '१८ जून २०२४',
    soilType: 'loamy',
    irrigationType: 'sprinkler',
    stage: 'flowering',
    healthStatus: 'healthy',
    latestScanDate: '१० दिवसांपूर्वी',
    isSample: true,
  },
];

export const MyCrops: React.FC = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [crops, setCrops] = useState<Crop[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.CROPS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // fallback
      }
    }
    return INITIAL_CROPS;
  });

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCrop, setEditingCrop] = useState<Crop | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: 'कापूस (Cotton)',
    variety: '',
    areaAcres: 2.5,
    plotName: '',
    sowingDate: '१५ जुलै २०२४',
    soilType: 'black_cotton' as Crop['soilType'],
    irrigationType: 'drip' as Crop['irrigationType'],
    stage: 'vegetative' as Crop['stage'],
    healthStatus: 'healthy' as Crop['healthStatus'],
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.CROPS, JSON.stringify(crops));
  }, [crops]);

  const handleOpenAddModal = () => {
    setEditingCrop(null);
    setFormData({
      name: 'कापूस (Cotton)',
      variety: 'BT Cotton BG-II',
      areaAcres: 2.0,
      plotName: 'नवीन वावर (New Plot)',
      sowingDate: new Date().toLocaleDateString('mr-IN'),
      soilType: 'black_cotton',
      irrigationType: 'drip',
      stage: 'vegetative',
      healthStatus: 'healthy',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (crop: Crop) => {
    setEditingCrop(crop);
    setFormData({
      name: crop.name,
      variety: crop.variety,
      areaAcres: crop.areaAcres,
      plotName: crop.plotName,
      sowingDate: crop.sowingDate,
      soilType: crop.soilType,
      irrigationType: crop.irrigationType,
      stage: crop.stage,
      healthStatus: crop.healthStatus,
    });
    setIsModalOpen(true);
  };

  const handleSaveCrop = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCrop) {
      setCrops((prev) =>
        prev.map((c) =>
          c.id === editingCrop.id
            ? {
                ...c,
                ...formData,
                isSample: false, // user edited
              }
            : c
        )
      );
    } else {
      const newCrop: Crop = {
        id: 'crop-' + Date.now(),
        userId: user?.id || 'current-user',
        ...formData,
        localName: {
          mr: formData.name.split(' ')[0],
          hi: formData.name.split(' ')[0],
          en: formData.name,
        },
        isSample: false,
      };
      setCrops((prev) => [newCrop, ...prev]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteCrop = () => {
    if (!deleteTargetId) return;
    setCrops((prev) => prev.filter((c) => c.id !== deleteTargetId));
    setDeleteTargetId(null);
  };

  const getStagePercent = (stage: Crop['stage']) => {
    switch (stage) {
      case 'sowing': return 15;
      case 'vegetative': return 35;
      case 'flowering': return 60;
      case 'boll_formation': return 80;
      case 'harvesting': return 100;
      default: return 50;
    }
  };

  const getStageLabel = (stage: Crop['stage']) => {
    switch (stage) {
      case 'sowing': return 'पेरणी / उगवण (Sowing)';
      case 'vegetative': return 'शाकीय वाढ (Vegetative)';
      case 'flowering': return 'फुलोरा अवस्था (Flowering)';
      case 'boll_formation': return 'बोंडे / शेंगा भरणे (Boll/Pod)';
      case 'harvesting': return 'काढणी / वेचणी (Harvesting)';
      default: return stage;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#0A2540] flex items-center gap-2">
            <Sprout className="w-6 h-6 text-[#0A2540]" />
            <span>{t('myCropsTitle')}</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#5B6B7D] mt-0.5">
            तुमच्या शेतातील पिके, वाण, पेरणी दिनांक व आरोग्य स्थिती व्यवस्थापित करा
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleOpenAddModal}
          leftIcon={<Plus className="w-5 h-5" />}
          className="font-bold shadow-md"
        >
          {t('addNewCropBtn')}
        </Button>
      </div>

      {/* Summary Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white border border-[#D5DEE8] shadow-sm">
          <span className="text-xs text-[#5B6B7D] font-semibold">एकूण पिके</span>
          <p className="text-2xl font-black text-[#0A2540] mt-0.5">{crops.length}</p>
        </div>
        <div className="p-3.5 rounded-2xl bg-white border border-[#D5DEE8] shadow-sm">
          <span className="text-xs text-[#5B6B7D] font-semibold">एकूण क्षेत्रफळ</span>
          <p className="text-2xl font-black text-[#138808] mt-0.5">
            {crops.reduce((sum, c) => sum + Number(c.areaAcres), 0)} एकर
          </p>
        </div>
        <div className="p-3.5 rounded-2xl bg-white border border-[#D5DEE8] shadow-sm">
          <span className="text-xs text-[#5B6B7D] font-semibold">निरोगी पिके</span>
          <p className="text-2xl font-black text-[#138808] mt-0.5">
            {crops.filter((c) => c.healthStatus === 'healthy').length}
          </p>
        </div>
        <div className="p-3.5 rounded-2xl bg-white border border-[#D5DEE8] shadow-sm">
          <span className="text-xs text-[#5B6B7D] font-semibold">लक्ष देणे गरजेचे</span>
          <p className="text-2xl font-black text-[#C0392B] mt-0.5">
            {crops.filter((c) => c.healthStatus !== 'healthy').length}
          </p>
        </div>
      </div>

      {/* Crops Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {crops.map((crop) => (
          <Card
            key={crop.id}
            variant="white"
            padding="lg"
            className="flex flex-col justify-between border-[#D5DEE8] relative group shadow-sm"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#D5DEE8]">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Badge
                      variant={
                        crop.healthStatus === 'healthy'
                          ? 'success'
                          : crop.healthStatus === 'attention'
                          ? 'warning'
                          : 'danger'
                      }
                      size="sm"
                      dot
                    >
                      {crop.healthStatus === 'healthy'
                        ? 'निरोगी (Healthy)'
                        : crop.healthStatus === 'attention'
                        ? 'लक्ष द्या (Attention)'
                        : 'गंभीर (Critical)'}
                    </Badge>
                    {crop.isSample && (
                      <span className="text-[10px] text-[#5B6B7D] bg-[#EEF3F8] px-1.5 py-0.5 rounded font-medium border border-[#D5DEE8]">
                        नमुना (Sample)
                      </span>
                    )}
                  </div>
                  <h3 className="font-extrabold text-lg text-[#0A2540] leading-tight">
                    {crop.name}
                  </h3>
                  <p className="text-xs font-semibold text-[#5B6B7D] mt-0.5">
                    {crop.variety}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditModal(crop)}
                    className="p-1.5 text-[#5B6B7D] hover:text-[#0A2540] rounded-lg hover:bg-[#EEF3F8] transition"
                    title="माहिती संपादित करा"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTargetId(crop.id)}
                    className="p-1.5 text-[#5B6B7D] hover:text-[#C0392B] rounded-lg hover:bg-red-50 transition"
                    title="पीक हटवा"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Crop Specs */}
              <div className="grid grid-cols-2 gap-2.5 py-3 text-xs text-[#5B6B7D]">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#3B6EA5] shrink-0" />
                  <span className="truncate">{crop.plotName}</span>
                </div>
                <div className="flex items-center gap-1.5 font-bold text-[#0A2540]">
                  <span className="text-[#138808]">क्षेत्र:</span>
                  <span>{crop.areaAcres} एकर</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#3B6EA5] shrink-0" />
                  <span>पेरणी: {crop.sowingDate}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Droplet className="w-3.5 h-3.5 text-[#3B6EA5] shrink-0" />
                  <span className="capitalize">{crop.irrigationType} ओलीत</span>
                </div>
              </div>

              {/* Growth Stage Progress */}
              <div className="py-2.5 border-t border-[#D5DEE8]">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-[#5B6B7D] font-medium">वाढीचा टप्पा:</span>
                  <span className="font-bold text-[#0A2540]">
                    {getStageLabel(crop.stage)}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#EEF3F8] overflow-hidden">
                  <div
                    className="h-full bg-[#138808] rounded-full transition-all duration-500"
                    style={{ width: `${getStagePercent(crop.stage)}%` }}
                  />
                </div>
              </div>

              {/* Latest Scan Link */}
              {crop.latestDiseaseName && (
                <div className="mt-2 p-2.5 rounded-xl bg-[#C0392B]/10 border border-[#C0392B]/30 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#C0392B] font-semibold truncate">
                    <Activity className="w-4 h-4 text-[#C0392B] shrink-0" />
                    <span className="truncate">{crop.latestDiseaseName}</span>
                  </div>
                  <Link
                    to="/recovery"
                    className="text-[#C0392B] hover:underline font-bold shrink-0 text-[11px]"
                  >
                    ट्रॅकर
                  </Link>
                </div>
              )}
            </div>

            {/* Bottom Action: Scan this crop */}
            <div className="mt-4 pt-3 border-t border-[#D5DEE8] flex items-center justify-between gap-2">
              <Button
                variant="primary"
                size="sm"
                className="w-full text-xs"
                onClick={() => navigate('/scan')}
                leftIcon={<Camera className="w-3.5 h-3.5" />}
              >
                या पिकाचे नवीन स्कॅन करा
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Add / Edit Crop Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCrop ? 'पीक माहिती संपादित करा' : 'नवीन पीक नोंदवा'}
        maxWidth="md"
      >
        <form onSubmit={handleSaveCrop} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              पिकाचे नाव
            </label>
            <select
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 shadow-2xs"
            >
              <option value="कापूस (Cotton)">कापूस (Cotton)</option>
              <option value="सोयाबीन (Soybean)">सोयाबीन (Soybean)</option>
              <option value="तूर (Pigeonpea)">तूर (Pigeonpea)</option>
              <option value="हरभरा (Gram)">हरभरा (Gram)</option>
              <option value="गहू (Wheat)">गहू (Wheat)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              वाण (Variety)
            </label>
            <input
              type="text"
              required
              value={formData.variety}
              onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
              placeholder="उदा. BT Cotton BG-II / JS-335 / BDN-711"
              className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 shadow-2xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                क्षेत्रफळ (एकर)
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                required
                value={formData.areaAcres}
                onChange={(e) => setFormData({ ...formData, areaAcres: parseFloat(e.target.value) || 1 })}
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                शेत / प्लॉटचे नाव
              </label>
              <input
                type="text"
                required
                value={formData.plotName}
                onChange={(e) => setFormData({ ...formData, plotName: e.target.value })}
                placeholder="उदा. विहीर लगत"
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 shadow-2xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                जमिनीचा प्रकार
              </label>
              <select
                value={formData.soilType}
                onChange={(e) => setFormData({ ...formData, soilType: e.target.value as any })}
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 shadow-2xs"
              >
                <option value="black_cotton">काळी माती (Black Cotton)</option>
                <option value="red_soil">तांबडी माती (Red Soil)</option>
                <option value="loamy">मध्यम पोयटा (Loamy)</option>
                <option value="sandy">हलकी मुरमाड (Sandy/Gravel)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ओलीत पद्धत
              </label>
              <select
                value={formData.irrigationType}
                onChange={(e) => setFormData({ ...formData, irrigationType: e.target.value as any })}
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 shadow-2xs"
              >
                <option value="drip">ठिबक सिंचन (Drip)</option>
                <option value="sprinkler">तुषार सिंचन (Sprinkler)</option>
                <option value="rainfed">कोरडवाहू / पावसावर (Rainfed)</option>
                <option value="flood">पाट पाणी (Flood)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                सध्याचा टप्पा
              </label>
              <select
                value={formData.stage}
                onChange={(e) => setFormData({ ...formData, stage: e.target.value as any })}
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 shadow-2xs"
              >
                <option value="sowing">पेरणी / उगवण</option>
                <option value="vegetative">शाकीय वाढ</option>
                <option value="flowering">फुलोरा अवस्था</option>
                <option value="boll_formation">बोंडे / शेंगा भरणे</option>
                <option value="harvesting">काढणी / वेचणी</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                आरोग्य स्थिती
              </label>
              <select
                value={formData.healthStatus}
                onChange={(e) => setFormData({ ...formData, healthStatus: e.target.value as any })}
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 shadow-2xs"
              >
                <option value="healthy">निरोगी (Healthy)</option>
                <option value="attention">लक्ष द्या (Attention)</option>
                <option value="critical">गंभीर रोगट (Critical)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              रद्द करा
            </Button>
            <Button type="submit" variant="primary">
              {editingCrop ? 'बदल जतन करा' : 'पीक जोडा'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDeleteCrop}
        title="हे पीक हटवायचे आहे का?"
        message="हे पीक तुमच्या शेताच्या यादीतून हटवले जाईल. ही क्रिया पूर्ववत करता येणार नाही."
        confirmText="होय, हटवा"
        cancelText="रद्द करा"
      />
    </div>
  );
};
