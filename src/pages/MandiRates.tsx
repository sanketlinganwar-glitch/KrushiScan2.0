import React, { useState, useMemo, useEffect } from 'react';
import { 
  TrendingUp, 
  Calculator, 
  MapPin, 
  ArrowRight, 
  Truck, 
  DollarSign, 
  AlertCircle, 
  CheckCircle2, 
  Calendar,
  Layers,
  ArrowUpDown,
  Sparkles,
  RefreshCw,
  Search,
  ExternalLink,
  Key,
  Info,
  Phone,
  Clock,
  X
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  COMMODITIES, 
  VIDARBHA_DISTRICTS, 
  MOCK_MANDI_RECORDS, 
  HISTORICAL_PRICE_TRENDS,
  calculateNetReturn 
} from '../lib/mandiData';
import { api } from '../lib/api';
import { MandiRecord, MandiApiResponse } from '../types';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export const MandiRates: React.FC = () => {
  const { t, language } = useLanguage();

  // Data State
  const [records, setRecords] = useState<MandiRecord[]>(MOCK_MANDI_RECORDS);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [showApiModal, setShowApiModal] = useState<boolean>(false);

  // Metadata State
  const [meta, setMeta] = useState<{
    status: 'live' | 'cached' | 'stale' | 'baseline';
    isStale: boolean;
    sourceArrivalDate?: string;
    lastFetchedAt: string;
    source: string;
    sourceUrl: string;
    apiKeyConfigured: boolean;
    disclaimer: string;
    upstreamError?: string;
  }>({
    status: 'baseline',
    isStale: false,
    sourceArrivalDate: '18 ऑक्टोबर २०२६',
    lastFetchedAt: '18 ऑक्टोबर २०२६',
    source: 'APMC Vidarbha Official Bulletin & MSP Benchmarks (Reference Data)',
    sourceUrl: 'https://agmarknet.gov.in',
    apiKeyConfigured: false,
    disclaimer: 'सदर बाजार भाव हे केंद्र सरकारच्या Agmarknet व महाराष्ट्र राज्य कृषी पणन मंडळ (MSAMB) च्या अधिकृत नोंदींवर आधारित केवळ मार्गदर्शक आहेत.'
  });

  // Filters & Search
  const [selectedCommodity, setSelectedCommodity] = useState('सर्व शेतमाल (All)');
  const [selectedDistrict, setSelectedDistrict] = useState('सर्व जिल्हे (All)');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'price-desc' | 'price-asc' | 'date-desc'>('price-desc');
  const [selectedMandiForCalc, setSelectedMandiForCalc] = useState<MandiRecord>(MOCK_MANDI_RECORDS[0]);

  // Calculator inputs
  const [quantityQuintals, setQuantityQuintals] = useState<number>(30);
  const [distanceKm, setDistanceKm] = useState<number>(35);
  const [ratePerKm, setRatePerKm] = useState<number>(25); // ₹25 per km
  const [laborPerQuintal, setLaborPerQuintal] = useState<number>(40); // ₹40/bag
  const [otherCess, setOtherCess] = useState<number>(200); // flat APMC weighment

  // Fetch from backend API with local cache resilience
  const fetchRates = async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const data: MandiApiResponse = await api.mandi.getRates();
      if (data && data.records && data.records.length > 0) {
        setRecords(data.records);
        setMeta({
          status: data.status,
          isStale: data.isStale,
          sourceArrivalDate: data.sourceArrivalDate,
          lastFetchedAt: data.lastFetchedAt,
          source: data.source,
          sourceUrl: data.sourceUrl,
          apiKeyConfigured: data.apiKeyConfigured,
          disclaimer: data.disclaimer,
          upstreamError: data.upstreamError
        });
        localStorage.setItem('krushiscan_mandi_cache', JSON.stringify(data));
      }
    } catch (err) {
      console.warn('Backend mandi fetch failed, loading cached baseline:', err);
      const cached = localStorage.getItem('krushiscan_mandi_cache');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setRecords(parsed.records);
          setMeta({
            ...parsed,
            status: 'cached',
            isStale: true
          });
        } catch {
          // Fallback to baseline in memory
        }
      } else {
        setError('थेट बाजार भाव लोड करण्यात अडचण आली. स्थानिक संदर्भ दर दर्शवत आहोत.');
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  // Update selected mandi for calculator if records change and current selection is missing
  useEffect(() => {
    if (records.length > 0 && (!selectedMandiForCalc || !records.find(r => r.id === selectedMandiForCalc.id))) {
      setSelectedMandiForCalc(records[0]);
    }
  }, [records]);

  // Filtered and Sorted Records
  const filteredRecords = useMemo(() => {
    const list = records.filter((r) => {
      // Commodity matching
      const isAllCommodity = selectedCommodity === 'सर्व शेतमाल (All)' || selectedCommodity === 'all';
      const commKeyword = selectedCommodity.split(' ')[0].toLowerCase();
      const matchCommodity = isAllCommodity || r.commodity.toLowerCase().includes(commKeyword);

      // District matching
      const isAllDistrict = selectedDistrict === 'सर्व जिल्हे (All)' || selectedDistrict === 'all';
      const distKeyword = selectedDistrict.split(' ')[0].toLowerCase();
      const matchDistrict = isAllDistrict || r.district.toLowerCase().includes(distKeyword);

      // Search query
      const q = searchQuery.trim().toLowerCase();
      const matchSearch = !q ||
        r.marketName.toLowerCase().includes(q) ||
        r.commodity.toLowerCase().includes(q) ||
        (r.variety && r.variety.toLowerCase().includes(q)) ||
        r.district.toLowerCase().includes(q);

      return matchCommodity && matchDistrict && matchSearch;
    });

    // Sorting
    return list.sort((a, b) => {
      if (sortBy === 'price-desc') {
        return b.modalPrice - a.modalPrice;
      } else if (sortBy === 'price-asc') {
        return a.modalPrice - b.modalPrice;
      } else {
        return b.arrivalDate.localeCompare(a.arrivalDate);
      }
    });
  }, [records, selectedCommodity, selectedDistrict, searchQuery, sortBy]);

  // Net Return calculation for chosen mandi
  const netReturnResult = useMemo(() => {
    const activeMandi = selectedMandiForCalc || records[0] || MOCK_MANDI_RECORDS[0];
    return calculateNetReturn({
      quantityQuintals,
      modalPricePerQuintal: activeMandi.modalPrice,
      distanceKm,
      ratePerKmOrFlat: ratePerKm,
      laborAndUnloadingPerQuintal: laborPerQuintal,
      apmcCessOrWeighment: otherCess,
    });
  }, [selectedMandiForCalc, records, quantityQuintals, distanceKm, ratePerKm, laborPerQuintal, otherCess]);

  // Find top recommendation among available mandis
  const bestMandiOption = useMemo(() => {
    if (filteredRecords.length === 0) return null;
    return filteredRecords.reduce((best, curr) => (curr.modalPrice > best.modalPrice ? curr : best), filteredRecords[0]);
  }, [filteredRecords]);

  // Proportional cost bar metrics
  const costBarMetrics = useMemo(() => {
    const gross = Math.max(1, netReturnResult.grossRevenue);
    const net = Math.max(0, netReturnResult.netReturn);
    const transport = netReturnResult.transportCost;
    const mandiFee = otherCess;
    const labor = Math.max(0, netReturnResult.laborAndOtherCosts - otherCess);

    return {
      gross,
      net,
      transport,
      mandiFee,
      labor,
      pctNet: Math.min(100, Math.max(0, (net / gross) * 100)),
      pctTransport: Math.min(100, Math.max(0, (transport / gross) * 100)),
      pctMandiFee: Math.min(100, Math.max(0, (mandiFee / gross) * 100)),
      pctLabor: Math.min(100, Math.max(0, (labor / gross) * 100)),
    };
  }, [netReturnResult, otherCess]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#0A2540] flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-[#138808]" />
            <span>{t('mandiTitle')}</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#5B6B7D] mt-0.5 font-medium">
            विदर्भातील मुख्य कृषी उत्पन्न बाजार समित्यांचे थेट दर, हमीभाव व वाहतूक खर्च वजा जाता शेतकऱ्याचा निव्वळ नफा
          </p>
        </div>

        {/* Live Data Status Indicator & Refresh Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {meta.status === 'live' ? (
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-50 text-[#138808] border border-[#138808]/30 font-bold flex items-center gap-1.5 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#138808] animate-pulse" />
              <span>● Agmarknet थेट दर (Live {meta.sourceArrivalDate ? `• ${meta.sourceArrivalDate}` : ''})</span>
            </span>
          ) : meta.status === 'cached' ? (
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-amber-50 text-[#B7791F] border border-[#B7791F]/30 font-bold flex items-center gap-1.5 shadow-2xs">
              <Clock className="w-3 h-3 text-[#B7791F]" />
              <span>⟳ कॅश डेटा (Fresh {meta.sourceArrivalDate ? `• ${meta.sourceArrivalDate}` : ''})</span>
            </span>
          ) : meta.status === 'stale' ? (
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-amber-100 text-[#B7791F] border border-[#B7791F]/40 font-bold flex items-center gap-1.5 shadow-2xs">
              <Clock className="w-3 h-3 text-[#B7791F]" />
              <span>⚠ जुना डेटा (Stale {meta.sourceArrivalDate ? `• ${meta.sourceArrivalDate}` : ''})</span>
            </span>
          ) : (
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-blue-50 text-[#0A2540] border border-[#3B6EA5]/30 font-bold flex items-center gap-1.5 shadow-2xs">
              <Info className="w-3 h-3 text-[#3B6EA5]" />
              <span>ℹ APMC संदर्भ दर (Reference Data)</span>
            </span>
          )}

          <button
            onClick={() => {
              setIsRefreshing(true);
              fetchRates(true);
            }}
            disabled={loading || isRefreshing}
            className="p-1.5 rounded-xl border border-[#D5DEE8] bg-white hover:bg-[#EEF3F8] text-[#0A2540] transition shadow-2xs flex items-center gap-1 text-xs font-semibold"
            title="दर रिफ्रेश करा (Refresh rates)"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#138808]' : ''}`} />
            <span className="hidden sm:inline">रिफ्रेश</span>
          </button>

          {!meta.apiKeyConfigured && (
            <button
              onClick={() => setShowApiModal(true)}
              className="text-[10px] px-2 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-[#B7791F] border border-[#B7791F]/30 font-bold flex items-center gap-1 transition"
            >
              <Key className="w-3 h-3" />
              <span>API की कशी मिळवायची?</span>
            </button>
          )}
        </div>
      </div>

      {/* API Key Guide Modal */}
      {showApiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-[#D5DEE8] shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowApiModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-[#5B6B7D] hover:bg-[#EEF3F8] hover:text-[#0A2540] transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 pb-3 border-b border-[#D5DEE8]">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-[#B7791F] flex items-center justify-center border border-[#B7791F]/20">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#0A2540]">
                  Agmarknet थेट API की कशी जोडायची?
                </h3>
                <p className="text-xs text-[#5B6B7D]">
                  भारत सरकारच्या अधिकृत Open Government Data पोर्टलवरून मोफत API की मिळवा
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-[#0A2540] leading-relaxed">
              <div className="p-3 rounded-2xl bg-[#EEF3F8] border border-[#D5DEE8] space-y-2">
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#0A2540] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">१</span>
                  <p>
                    <strong>data.gov.in</strong> वर जाऊन मोफत नोंदणी करा:
                    <a href="https://data.gov.in" target="_blank" rel="noopener noreferrer" className="text-[#3B6EA5] underline inline-flex items-center gap-0.5 ml-1 font-bold">
                      data.gov.in उघडा <ExternalLink className="w-3 h-3" />
                    </a>
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#0A2540] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">२</span>
                  <p><strong>My Account → API Keys</strong> विभागात जाऊन आपली युनिक API की जनरेट करा.</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#0A2540] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">३</span>
                  <p>प्रकल्पातील बॅकएंड <code>backend/.env</code> फाइलमध्ये की जोडा:<br />
                    <code className="block mt-1 p-2 rounded-lg bg-white border border-[#D5DEE8] font-mono text-[11px] text-[#138808]">
                      DATA_GOV_IN_API_KEY=your_generated_api_key_here
                    </code>
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#0A2540] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">४</span>
                  <p>बॅकएंड सर्व्हर रीस्टार्ट करा. त्यानंतर विदर्भातील सर्व बाजार समित्यांचे थेट दर दररोज आपोआप अपडेट होतील.</p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50 border border-[#138808]/20 text-[11px] text-[#138808]">
                <strong>नोंद:</strong> सध्या KrushiScan AI कडे विदर्भातील ११ जिल्ह्यांचे अधिकृत कृषी पणन मंडळ (MSAMB) व DMI संदर्भ दर लोड केलेले आहेत, त्यामुळे शेतकरी बंधूंना सर्व कॅल्क्युलेटर व तुलना त्वरित वापरता येतात.
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="primary" size="sm" onClick={() => setShowApiModal(false)}>
                समजले (Got it)
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Filter, Search, and Sort Bar */}
      <Card variant="white" padding="md" className="bg-white border-[#D5DEE8] shadow-xs space-y-3">
        {/* Commodity Selector Buttons */}
        <div>
          <label className="block text-xs font-bold text-[#0A2540] mb-1.5">
            शेतमाल निवडा (Commodity Filter)
          </label>
          <div className="flex flex-wrap gap-2">
            {COMMODITIES.map((c) => {
              const isSelected = selectedCommodity === c.name || (selectedCommodity === 'सर्व शेतमाल (All)' && c.id === 'all');
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCommodity(c.name)}
                  className={`py-1.5 px-3 rounded-xl text-xs font-bold transition border ${
                    isSelected
                      ? 'bg-[#0A2540] text-white border-[#0A2540] shadow-xs'
                      : 'bg-[#EEF3F8] text-[#5B6B7D] border-[#D5DEE8] hover:bg-[#D5DEE8]/50 hover:text-[#0A2540]'
                  }`}
                >
                  {c.nameLocal[language] || c.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search, District Filter, and Sort Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#D5DEE8]">
          {/* Search Box */}
          <div className="relative">
            <label className="block text-xs font-bold text-[#0A2540] mb-1">
              शोध (Search Market / Crop)
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-[#5B6B7D] absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="बाजार किंवा शेतमाल शोधा..."
                className="w-full bg-white border border-[#D5DEE8] rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-[#0A2540] font-semibold focus:outline-none focus:ring-2 focus:ring-[#0A2540] shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-xs text-[#5B6B7D] hover:text-[#0A2540]"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* District Dropdown */}
          <div>
            <label className="block text-xs font-bold text-[#0A2540] mb-1">
              जिल्हा निवडा (District Filter - 11 जिल्हे)
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full bg-white border border-[#D5DEE8] rounded-xl p-2 text-xs sm:text-sm text-[#0A2540] font-semibold focus:outline-none focus:ring-2 focus:ring-[#0A2540] shadow-2xs"
            >
              {VIDARBHA_DISTRICTS.map((dist, idx) => (
                <option key={idx} value={dist}>
                  {dist}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div>
            <label className="block text-xs font-bold text-[#0A2540] mb-1">
              क्रमवारी (Sort By)
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-white border border-[#D5DEE8] rounded-xl p-2 text-xs sm:text-sm text-[#0A2540] font-semibold focus:outline-none focus:ring-2 focus:ring-[#0A2540] shadow-2xs"
            >
              <option value="price-desc">सर्वोच्च भाव (Price: High to Low)</option>
              <option value="price-asc">किमान भाव (Price: Low to High)</option>
              <option value="date-desc">नवीनतम आवक तारीख (Latest Date)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* APMC Price Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h4 className="text-sm font-bold text-[#0A2540] uppercase tracking-wide">
            बाजार समिती दर ({filteredRecords.length} बाजार उपलब्ध)
          </h4>
          <span className="text-xs text-[#5B6B7D] font-medium">
            दर: प्रति क्विंटल (₹/Qtl)
          </span>
        </div>

        {loading && records.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white border border-[#D5DEE8] rounded-2xl p-4 animate-pulse space-y-3">
                <div className="h-4 bg-[#EEF3F8] rounded-md w-1/3" />
                <div className="h-6 bg-[#EEF3F8] rounded-md w-3/4" />
                <div className="h-10 bg-[#EEF3F8] rounded-md w-full" />
              </div>
            ))}
          </div>
        ) : filteredRecords.length === 0 ? (
          <Card variant="white" padding="lg" className="text-center py-12 space-y-3 border-dashed border-2 border-[#D5DEE8]">
            <AlertCircle className="w-10 h-10 text-[#5B6B7D] mx-auto" />
            <h4 className="text-base font-bold text-[#0A2540]">
              या निकषांसाठी सध्या कोणतीही नोंद आढळली नाही
            </h4>
            <p className="text-xs text-[#5B6B7D] max-w-md mx-auto">
              निवडलेला जिल्हा किंवा शेतमालासाठी या तारखेला आवक नोंद झालेली नसू शकते. कृपया जिल्हा किंवा शेतमाल फिल्टर बदलून पहा.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedCommodity('सर्व शेतमाल (All)');
                setSelectedDistrict('सर्व जिल्हे (All)');
                setSearchQuery('');
              }}
            >
              सर्व दर पहा (Reset Filters)
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRecords.map((record) => {
              const isSelected = selectedMandiForCalc?.id === record.id;
              const isBest = bestMandiOption?.id === record.id;
              const diffFromMSP = record.msp ? record.modalPrice - record.msp : 0;

              return (
                <Card
                  key={record.id}
                  variant="white"
                  padding="md"
                  interactive
                  onClick={() => setSelectedMandiForCalc(record)}
                  className={`flex flex-col justify-between transition relative ${
                    isBest
                      ? 'border-2 border-[#FF9933] shadow-md ring-2 ring-[#FF9933]/20 bg-white'
                      : isSelected
                      ? 'border-2 border-[#0A2540] shadow-sm bg-white'
                      : 'border border-[#D5DEE8] bg-white'
                  }`}
                >
                  <div>
                    {/* Top Rank Badge */}
                    {isBest && (
                      <div className="mb-2">
                        <Badge variant="saffron" size="sm">
                          ★ १ ला क्रमांक - सर्वोच्च दर (Best Market)
                        </Badge>
                      </div>
                    )}

                    <div className="flex items-start justify-between gap-2 pb-2 border-b border-[#D5DEE8]">
                      <div>
                        <span className="text-[11px] font-bold text-[#138808] bg-emerald-50 px-2 py-0.5 rounded border border-[#138808]/20">
                          {record.district}
                        </span>
                        <h4 className="font-extrabold text-base text-[#0A2540] mt-1 leading-snug">
                          {record.marketName}
                        </h4>
                        <p className="text-xs text-[#5B6B7D] font-medium">
                          {record.commodity} • {record.variety}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-xl font-black text-[#0A2540]">
                          ₹{record.modalPrice.toLocaleString('en-IN')}
                        </span>
                        <span className="block text-[10px] text-[#5B6B7D] font-medium">
                          सरासरी भाव
                        </span>
                      </div>
                    </div>

                    {/* Price Range */}
                    <div className="grid grid-cols-2 gap-2 py-2.5 text-xs">
                      <div className="bg-[#EEF3F8] p-2 rounded-xl border border-[#D5DEE8]">
                        <span className="text-[#5B6B7D] block text-[10px]">किमान भाव:</span>
                        <span className="font-bold text-[#0A2540]">₹{record.minPrice}</span>
                      </div>
                      <div className="bg-[#EEF3F8] p-2 rounded-xl border border-[#D5DEE8]">
                        <span className="text-[#5B6B7D] block text-[10px]">कमाल भाव:</span>
                        <span className="font-bold text-[#138808]">₹{record.maxPrice}</span>
                      </div>
                    </div>

                    {/* MSP Comparison & Arrivals */}
                    <div className="flex items-center justify-between text-xs text-[#5B6B7D] pt-1">
                      <span>आवक: <strong className="text-[#0A2540]">{record.arrivalsTonnes} टन</strong></span>
                      {record.msp ? (
                        <span className={`font-bold ${diffFromMSP >= 0 ? 'text-[#138808]' : 'text-[#C0392B]'}`}>
                          MSP {diffFromMSP >= 0 ? `+₹${diffFromMSP}` : `-₹${Math.abs(diffFromMSP)} (कमी)`}
                        </span>
                      ) : null}
                    </div>

                    {record.contactNumber && (
                      <div className="text-[11px] text-[#5B6B7D] pt-1 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-[#5B6B7D]" />
                        <span>बाजार समिती संपर्क: <strong>{record.contactNumber}</strong></span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#D5DEE8] flex items-center justify-between">
                    <span className="text-[11px] text-[#5B6B7D] flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{record.arrivalDate}</span>
                    </span>
                    <button
                      onClick={() => setSelectedMandiForCalc(record)}
                      className="text-xs font-bold text-[#0A2540] hover:text-[#3B6EA5] flex items-center gap-1 transition"
                    >
                      <span>निव्वळ नफा मोजा</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Net Return & Transport Cost Calculator with Stacked Cost Bar */}
      <div className="bg-white border border-[#D5DEE8] rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#D5DEE8]">
          <div className="w-10 h-10 rounded-2xl bg-[#EEF3F8] border border-[#D5DEE8] flex items-center justify-center text-[#0A2540]">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-[#0A2540]">
              {t('netReturnCalculator')}
            </h3>
            <p className="text-xs text-[#5B6B7D]">
              वाहतूक, हमाली व इतर कपात वजा जाता शेतकऱ्याच्या हातात प्रत्यक्ष किती पैसे उरतात ते मोजा
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Inputs Section */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-3 rounded-xl bg-[#EEF3F8] border border-[#D5DEE8] text-xs text-[#0A2540]">
              निवडलेली बाजार समिती: <strong className="text-[#138808] font-bold">{selectedMandiForCalc?.marketName || 'निवडा'}</strong> (भाव: ₹{selectedMandiForCalc?.modalPrice || 0}/क्विंटल)
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#0A2540] mb-1">
                  {t('enterQuantity')}
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantityQuintals}
                  onChange={(e) => setQuantityQuintals(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-white border border-[#D5DEE8] rounded-xl p-2.5 text-sm text-[#0A2540] font-bold focus:ring-2 focus:ring-[#0A2540] shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0A2540] mb-1">
                  शेतापासून अंतर (किमी):
                </label>
                <input
                  type="number"
                  min="1"
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-white border border-[#D5DEE8] rounded-xl p-2.5 text-sm text-[#0A2540] font-bold focus:ring-2 focus:ring-[#0A2540] shadow-2xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#0A2540] mb-1">
                  वाहतूक दर (₹ प्रति किमी):
                </label>
                <input
                  type="number"
                  min="5"
                  value={ratePerKm}
                  onChange={(e) => setRatePerKm(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-white border border-[#D5DEE8] rounded-xl p-2.5 text-sm text-[#0A2540] font-bold focus:ring-2 focus:ring-[#0A2540] shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0A2540] mb-1">
                  हमाली / उतराई (₹/क्विंटल):
                </label>
                <input
                  type="number"
                  min="0"
                  value={laborPerQuintal}
                  onChange={(e) => setLaborPerQuintal(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-white border border-[#D5DEE8] rounded-xl p-2.5 text-sm text-[#0A2540] font-bold focus:ring-2 focus:ring-[#0A2540] shadow-2xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0A2540] mb-1">
                इतर कपात / काटा पावती व सेस (₹):
              </label>
              <input
                type="number"
                min="0"
                value={otherCess}
                onChange={(e) => setOtherCess(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-white border border-[#D5DEE8] rounded-xl p-2.5 text-sm text-[#0A2540] font-bold focus:ring-2 focus:ring-[#0A2540] shadow-2xs"
              />
            </div>
          </div>

          {/* Results Summary Box with Cost Bar */}
          <div className="lg:col-span-6 bg-[#EEF3F8] border border-[#D5DEE8] rounded-2xl p-5 space-y-4">
            <h4 className="text-xs font-bold text-[#5B6B7D] uppercase tracking-wide">
              नफा व खर्च विश्लेषण (Financial Breakdown)
            </h4>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between text-[#0A2540]">
                <span>एकूण उत्पन्न ({quantityQuintals} क्विंटल × ₹{selectedMandiForCalc?.modalPrice || 0}):</span>
                <span className="font-extrabold text-[#0A2540]">
                  ₹{netReturnResult.grossRevenue.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Saffron Transport Cost Line */}
              <div className="flex items-center justify-between text-xs font-bold text-[#0A2540]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF9933]" />
                  <span>वाहतूक खर्च ({distanceKm} किमी × ₹{ratePerKm}):</span>
                </span>
                <span className="text-[#C0392B]">
                  -₹{netReturnResult.transportCost.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Blue Mandi Fees Line */}
              <div className="flex items-center justify-between text-xs font-bold text-[#0A2540]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#3B6EA5]" />
                  <span>बाजार समिती फी व काटा (Mandi Fees):</span>
                </span>
                <span className="text-[#C0392B]">
                  -₹{otherCess.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Red Deductions / Labor Line */}
              <div className="flex items-center justify-between text-xs font-bold text-[#0A2540]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#C0392B]" />
                  <span>हमाली व इतर कपात (Deductions):</span>
                </span>
                <span className="text-[#C0392B]">
                  -₹{Math.max(0, netReturnResult.laborAndOtherCosts - otherCess).toLocaleString('en-IN')}
                </span>
              </div>

              {/* PROPORTIONAL STACKED COST BAR */}
              <div className="pt-2 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-[#5B6B7D]">
                  <span>खर्च विभागणी आलेख (Cost Bar)</span>
                  <span className="text-[#138808]">निव्वळ वाटा: {costBarMetrics.pctNet.toFixed(1)}%</span>
                </div>

                <div className="h-4 w-full bg-[#D5DEE8] rounded-full overflow-hidden flex shadow-inner">
                  {/* Green: Money the farmer keeps */}
                  <div
                    style={{ width: `${costBarMetrics.pctNet}%` }}
                    className="h-full bg-[#138808] transition-all duration-500"
                    title={`निव्वळ नफा: ₹${netReturnResult.netReturn.toLocaleString('en-IN')} (${costBarMetrics.pctNet.toFixed(1)}%)`}
                  />
                  {/* Saffron: Transport cost */}
                  <div
                    style={{ width: `${costBarMetrics.pctTransport}%` }}
                    className="h-full bg-[#FF9933] transition-all duration-500"
                    title={`वाहतूक खर्च: ₹${netReturnResult.transportCost.toLocaleString('en-IN')} (${costBarMetrics.pctTransport.toFixed(1)}%)`}
                  />
                  {/* Blue: Mandi fees */}
                  <div
                    style={{ width: `${costBarMetrics.pctMandiFee}%` }}
                    className="h-full bg-[#3B6EA5] transition-all duration-500"
                    title={`बाजार फी: ₹${otherCess.toLocaleString('en-IN')} (${costBarMetrics.pctMandiFee.toFixed(1)}%)`}
                  />
                  {/* Red: Deductions / labor */}
                  <div
                    style={{ width: `${costBarMetrics.pctLabor}%` }}
                    className="h-full bg-[#C0392B] transition-all duration-500"
                    title={`हमाली व कपात (${costBarMetrics.pctLabor.toFixed(1)}%)`}
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1 text-[10px] font-bold">
                  <span className="flex items-center gap-1 text-[#138808]">
                    <span className="w-2 h-2 rounded-full bg-[#138808]" /> नफा: {costBarMetrics.pctNet.toFixed(0)}%
                  </span>
                  <span className="flex items-center gap-1 text-[#0A2540]">
                    <span className="w-2 h-2 rounded-full bg-[#FF9933]" /> वाहतूक: {costBarMetrics.pctTransport.toFixed(0)}%
                  </span>
                  <span className="flex items-center gap-1 text-[#3B6EA5]">
                    <span className="w-2 h-2 rounded-full bg-[#3B6EA5]" /> बाजार फी: {costBarMetrics.pctMandiFee.toFixed(0)}%
                  </span>
                  <span className="flex items-center gap-1 text-[#C0392B]">
                    <span className="w-2 h-2 rounded-full bg-[#C0392B]" /> कपात: {costBarMetrics.pctLabor.toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Net Return Highlight */}
              <div className="pt-3 border-t border-[#D5DEE8] flex items-center justify-between">
                <div>
                  <span className="text-xs text-[#5B6B7D] font-semibold block">
                    {t('estimatedNetReturn')} (हातात पडणारे पैसे):
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-[#138808] tracking-tight">
                    ₹{netReturnResult.netReturn.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-[#5B6B7D] font-medium block">
                    खर्च वजा जाता प्रत्यक्ष भाव:
                  </span>
                  <span className="text-sm sm:text-base font-bold text-[#0A2540] bg-white px-3 py-1 rounded-xl border border-[#D5DEE8] shadow-xs">
                    ₹{netReturnResult.effectivePricePerQuintal} /क्विंटल
                  </span>
                </div>
              </div>
            </div>

            {/* Smart Market Recommendation */}
            {bestMandiOption && (
              <div className="p-3.5 rounded-xl bg-white border border-[#D5DEE8] text-xs text-[#0A2540]">
                <div className="flex items-center gap-1.5 font-bold text-[#138808] mb-1">
                  <Sparkles className="w-4 h-4 text-[#138808]" />
                  <span>{t('bestMandiAdvice')}</span>
                </div>
                <p className="leading-relaxed font-medium text-[#5B6B7D]">
                  सध्याच्या भावानुसार <strong className="text-[#0A2540] font-bold">{bestMandiOption.marketName}</strong> मध्ये सर्वोच्च भाव (₹{bestMandiOption.modalPrice}) मिळत आहे. वाहतूक अंतर लक्षात घेऊन माल विक्रीस न्यावा.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Historical Price Trend Chart (Recharts) */}
      <Card variant="white" className="p-5 border-[#D5DEE8]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="font-black text-lg text-[#0A2540]">
              विदर्भातील मुख्य बाजारांचा ७ दिवसांचा कापूस दर आलेख (₹/क्विंटल)
            </h3>
            <p className="text-xs text-[#5B6B7D]">
              यवतमाळ, हिंगणघाट आणि अकोला APMC मधील भावातील चढ-उतार
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-[#138808] font-bold">
              <span className="w-3 h-3 rounded-full bg-[#138808]" /> हिंगणघाट
            </span>
            <span className="flex items-center gap-1.5 text-[#0A2540] font-bold">
              <span className="w-3 h-3 rounded-full bg-[#0A2540]" /> यवतमाळ
            </span>
            <span className="flex items-center gap-1.5 text-[#3B6EA5] font-bold">
              <span className="w-3 h-3 rounded-full bg-[#3B6EA5]" /> अकोला
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={HISTORICAL_PRICE_TRENDS}>
              <CartesianGrid strokeDasharray="3 3" stroke="#D5DEE8" />
              <XAxis dataKey="day" stroke="#5B6B7D" fontSize={12} />
              <YAxis domain={[7200, 8000]} stroke="#5B6B7D" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0A2540',
                  border: '1px solid #D5DEE8',
                  borderRadius: '12px',
                  color: '#EAF0F7',
                  fontSize: '12px',
                  fontWeight: '600',
                }}
              />
              <Line
                type="monotone"
                dataKey="hinganghat"
                name="हिंगणघाट"
                stroke="#138808"
                strokeWidth={3}
                dot={{ r: 4, fill: '#138808' }}
              />
              <Line
                type="monotone"
                dataKey="yavatmal"
                name="यवतमाळ"
                stroke="#0A2540"
                strokeWidth={3}
                dot={{ r: 4, fill: '#0A2540' }}
              />
              <Line
                type="monotone"
                dataKey="akola"
                name="अकोला"
                stroke="#3B6EA5"
                strokeWidth={2}
                dot={{ r: 3, fill: '#3B6EA5' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Official Legal Notice & Source Metadata Banner */}
      <div className="bg-[#EEF3F8] border border-[#D5DEE8] rounded-2xl p-4 text-xs text-[#5B6B7D] space-y-2">
        <div className="flex items-center gap-1.5 font-bold text-[#0A2540]">
          <AlertCircle className="w-4 h-4 text-[#FF9933]" />
          <span>अधिकृत सूचना व पारदर्शकता अस्वीकरण (Official Mandi Transparency Notice)</span>
        </div>
        <p className="leading-relaxed">
          {meta.disclaimer}
        </p>
        <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px] font-semibold text-[#0A2540] border-t border-[#D5DEE8]">
          <span>
            अधिकृत स्रोत: {' '}
            <a href={meta.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-[#3B6EA5] underline inline-flex items-center gap-1">
              {meta.source} <ExternalLink className="w-3 h-3" />
            </a>
          </span>
          {meta.sourceArrivalDate && (
            <span>
              आवक नोंद तारीख: <strong className="text-[#0A2540]">{meta.sourceArrivalDate}</strong>
            </span>
          )}
          <span>
            अंतिम संकलन वेळ: <strong className="text-[#0A2540]">{meta.lastFetchedAt}</strong>
          </span>
          <span>
            दर स्थिती: <strong className={meta.status === 'live' ? 'text-[#138808]' : meta.status === 'baseline' ? 'text-[#3B6EA5]' : 'text-[#B7791F]'}>
              {meta.status === 'live' ? 'थेट (Live Agmarknet)' : meta.status === 'baseline' ? 'अधिकृत संदर्भ (Baseline Reference)' : (meta.status === 'stale' ? 'जुना डेटा (Stale)' : 'कॅश (Cached)')}
            </strong>
          </span>
        </div>
      </div>
    </div>
  );
};
