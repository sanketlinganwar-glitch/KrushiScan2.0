import React, { useState, useMemo } from 'react';
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
  Sparkles
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
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export const MandiRates: React.FC = () => {
  const { t, language } = useLanguage();

  // Filters
  const [selectedCommodity, setSelectedCommodity] = useState('कापूस (Cotton)');
  const [selectedDistrict, setSelectedDistrict] = useState('सर्व जिल्हे (All)');
  const [selectedMandiForCalc, setSelectedMandiForCalc] = useState(MOCK_MANDI_RECORDS[0]);

  // Calculator inputs
  const [quantityQuintals, setQuantityQuintals] = useState<number>(30);
  const [distanceKm, setDistanceKm] = useState<number>(35);
  const [ratePerKm, setRatePerKm] = useState<number>(25); // ₹25 per km
  const [laborPerQuintal, setLaborPerQuintal] = useState<number>(40); // ₹40/bag
  const [otherCess, setOtherCess] = useState<number>(200); // flat APMC weighment

  const filteredRecords = useMemo(() => {
    return MOCK_MANDI_RECORDS.filter((r) => {
      const matchCommodity = r.commodity.includes(selectedCommodity.split(' ')[0]);
      const matchDistrict =
        selectedDistrict === 'सर्व जिल्हे (All)' ||
        r.district.includes(selectedDistrict.split(' ')[0]);
      return matchCommodity && matchDistrict;
    });
  }, [selectedCommodity, selectedDistrict]);

  // Net Return calculation for chosen mandi
  const netReturnResult = useMemo(() => {
    return calculateNetReturn({
      quantityQuintals,
      modalPricePerQuintal: selectedMandiForCalc.modalPrice,
      distanceKm,
      ratePerKmOrFlat: ratePerKm,
      laborAndUnloadingPerQuintal: laborPerQuintal,
      apmcCessOrWeighment: otherCess,
    });
  }, [selectedMandiForCalc, quantityQuintals, distanceKm, ratePerKm, laborPerQuintal, otherCess]);

  // Find the top recommendation among available mandis for this quantity
  const bestMandiOption = useMemo(() => {
    if (filteredRecords.length === 0) return null;
    return filteredRecords.reduce((best, curr) => (curr.modalPrice > best.modalPrice ? curr : best), filteredRecords[0]);
  }, [filteredRecords]);

  // Calculate cost & return percentages for the visual stacked bar
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

        <div className="flex items-center gap-2">
          <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-50 text-[#138808] border border-[#138808]/30 font-bold">
            ● Agmarknet / APMC थेट डेटा
          </span>
        </div>
      </div>

      {/* Filter Selector Bar */}
      <Card variant="white" padding="sm" className="bg-white border-[#D5DEE8] shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Commodity Selector */}
          <div>
            <label className="block text-xs font-bold text-[#0A2540] mb-1">
              शेतमाल निवडा (Commodity)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {COMMODITIES.slice(0, 3).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCommodity(c.name)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold truncate transition border ${
                    selectedCommodity === c.name
                      ? 'bg-[#0A2540] text-white border-[#0A2540] shadow-xs'
                      : 'bg-[#EEF3F8] text-[#5B6B7D] border-[#D5DEE8] hover:bg-[#D5DEE8]/50 hover:text-[#0A2540]'
                  }`}
                >
                  {c.nameLocal[language] || c.name}
                </button>
              ))}
            </div>
          </div>

          {/* District Selector */}
          <div>
            <label className="block text-xs font-bold text-[#0A2540] mb-1">
              जिल्हा निवडा (District Filter)
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full bg-white border border-[#D5DEE8] rounded-xl p-2.5 text-xs sm:text-sm text-[#0A2540] font-semibold focus:outline-none focus:ring-2 focus:ring-[#0A2540] shadow-2xs"
            >
              {VIDARBHA_DISTRICTS.map((dist, idx) => (
                <option key={idx} value={dist}>
                  {dist}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Live APMC Price Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h4 className="text-sm font-bold text-[#0A2540] uppercase tracking-wide">
            बाजार समिती दर ({filteredRecords.length} बाजार)
          </h4>
          <span className="text-xs text-[#5B6B7D] font-medium">
            दर: प्रति क्विंटल (₹/Qtl)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecords.map((record) => {
            const isSelected = selectedMandiForCalc.id === record.id;
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
                  {/* Top Rank Badge for the single Best Market highlight */}
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
                        वाण: {record.variety}
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
                    {record.msp && (
                      <span className={`font-bold ${diffFromMSP >= 0 ? 'text-[#138808]' : 'text-[#C0392B]'}`}>
                        MSP {diffFromMSP >= 0 ? `+₹${diffFromMSP}` : `-₹${Math.abs(diffFromMSP)} (कमी)`}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-[#D5DEE8] flex items-center justify-between">
                  <span className="text-[11px] text-[#5B6B7D]">
                    {record.arrivalDate}
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
              निवडलेली बाजार समिती: <strong className="text-[#138808] font-bold">{selectedMandiForCalc.marketName}</strong> (भाव: ₹{selectedMandiForCalc.modalPrice}/क्विंटल)
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
                <span>एकूण उत्पन्न ({quantityQuintals} क्विंटल × ₹{selectedMandiForCalc.modalPrice}):</span>
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

              {/* PROPORTIONAL STACKED COST BAR (Rules 1 & 2) */}
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

              {/* Net Return Highlight (India Green for money kept) */}
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
    </div>
  );
};
