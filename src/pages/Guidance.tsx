import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  Bookmark, 
  BookmarkCheck, 
  Volume2, 
  VolumeX, 
  Clock, 
  Share2, 
  ExternalLink, 
  CheckCircle2, 
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { GuidanceArticle } from '../types';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { speakText, stopSpeaking } from '../lib/speech';
import { LOCAL_STORAGE_KEYS } from '../lib/supabase';

const GUIDANCE_ARTICLES: GuidanceArticle[] = [
  {
    id: 'art-1',
    category: 'pest',
    title: {
      mr: 'कपाशीवरील गुलाबी बोंडअळी: एकात्मिक व्यवस्थापन व कामगंध सापळे वापर',
      hi: 'कपास में गुलाबी सुंडी: एकीकृत प्रबंधन एवं फेरोमोन ट्रैप प्रयोग',
      en: 'Integrated Management of Pink Bollworm in Cotton Using Pheromone Traps',
    },
    summary: {
      mr: 'गुलाबी बोंडअळीचे जीवनचक्र कसे तोडावे, कामगंध सापळ्यांची योग्य संख्या आणि कृषी विद्यापीठ शिफारशीनुसार आर्थिक नुकसान पातळी (ETL) मार्गदर्शन.',
      hi: 'गुलाबी सुंडी के जीवन चक्र को रोकने के उपाय, फेरोमोन ट्रैप की संख्या और विश्वविद्यालय की सिफारिशें।',
      en: 'How to break the life cycle of pink bollworm, pheromone trap installation and ETL based spraying schedule.',
    },
    content: {
      mr: `गुलाबी बोंडअळी (Pectinophora gossypiella) ही विदर्भातील कापूस उत्पादक शेतकऱ्यांसाठी सर्वात मोठी डोकेदुखी आहे. 

१. सर्वेक्षण व कामगंध सापळे:
- पेरणीनंतर ४५ दिवसांनी प्रति एकरी ५ कामगंध सापळे (Pheromone Traps) पिकाच्या उंचीपेक्षा १ फूट वर लावावेत.
- सलग ३ दिवस प्रति सापळा ८ पेक्षा जास्त पतंग आढळल्यास किंवा १०% फुले गुळबेंद दिसल्यास आर्थिक नुकसान पातळी (ETL) ओलांडली असे समजावे.

२. जैविक नियंत्रण:
- ट्रायकोग्रामा चिलोनीस हे मित्र कीटक एकरी ६०,००० या प्रमाणात शेतात सोडावेत.
- निंबोळी अर्क ५% किंवा अझाडिराक्टिन १५०० पीपीएम ५ मिली प्रति लिटर पाण्यात मिसळून पहिली फवारणी करावी.

३. रासायनिक फवारणी (ETL ओलांडल्यावरच):
- प्रोफेनोफॉस ५०% EC (२ मिली/लिटर) किंवा इमामेक्टिन बेन्झोएट ५% SG (४ ग्रॅम/१० लिटर).
- एकाच गटातील कीटकनाशक सलग दोनदा वापरू नये.

संदर्भ: डॉ. पंजाबराव देशमुख कृषी विद्यापीठ (PDKV), अकोला.`,
      hi: `कपास में गुलाबी सुंडी का नियंत्रण समय पर करना अत्यंत आवश्यक है।
१. फेरोमोन ट्रैप: प्रति एकड़ ५ ट्रैप लगाएं।
२. नीम का तेल ५ मिली प्रति लीटर पानी में मिलाकर स्प्रे करें।
३. कीटनाशक का प्रयोग लेबल निर्देशानुसार ही करें।`,
      en: `Integrated Pest Management (IPM) is essential for controlling Pink Bollworm in cotton. Install pheromone traps at 5 per acre for monitoring. Use bio-agents and avoid excessive synthetic pyrethroids.`,
    },
    source: 'डॉ. पंजाबराव देशमुख कृषी विद्यापीठ (PDKV), अकोला',
    readingTimeMinutes: 4,
    publishedDate: '१५ ऑक्टोबर २०२४',
    imageUrl: 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?w=600&auto=format&fit=crop&q=80',
    tags: ['कापूस', 'गुलाबी बोंडअळी', 'कामगंध सापळे', 'PDKV'],
  },
  {
    id: 'art-2',
    category: 'fertilizer',
    title: {
      mr: 'सोयाबीन व कापसासाठी १९:१९:१९ व १३:००:४५ विद्राव्य खतांचे फवारणी वेळापत्रक',
      hi: 'सोयाबीन एवं कपास के लिए घुलनशील उर्वरकों (Water Soluble) का शेड्यूल',
      en: 'Foliar Spray Schedule of Water Soluble Fertilizers (19:19:19 & 13:00:45)',
    },
    summary: {
      mr: 'पिकांच्या वेगवेगळ्या वाढीच्या टप्प्यांवर विद्राव्य खतांचे योग्य प्रमाण व फवारणीची योग्य वेळ जाणून घ्या, जेणेकरून फुलोरा व बोंड भरण्याची क्षमता वाढेल.',
      hi: 'फूल आते समय और दाना भरते समय घुलनशील खादों का सही अनुपात।',
      en: 'Optimal timing and dosages for foliar application of NPK during vegetative and reproductive stages.',
    },
    content: {
      mr: `विदर्भातील भारी काळ्या जमिनीत सूक्ष्म अन्नद्रव्यांची आणि विद्राव्य खतांची योग्य फवारणी पिकाची उत्पादकता १५ ते २५ टक्क्यांनी वाढवू शकते.

१. शाकीय वाढीच्या टप्प्यावर (३० ते ३५ दिवस):
- १९:१९:१९ (NPK) ५ ग्रॅम प्रति लिटर पाणी.
- यामुळे झाडांची मुळे मजबूत होतात आणि नवीन फांद्यांची संख्या वाढते.

२. फुलोरा अवस्थेत (४५ ते ५० दिवस):
- १२:६१:०० (Mono Ammonium Phosphate) ५ ग्रॅम प्रति लिटर + बोरॉन १ ग्रॅम प्रति लिटर.
- यामुळे फुलांची गळ थांबते आणि परागीभवन उत्तम होते.

३. बोंडे व शेंगा भरण्याच्या अवस्थेत (७० ते ८५ दिवस):
- १३:००:४५ (Potassium Nitrate) किंवा ००:००:५० (SOP) ५ ग्रॅम प्रति लिटर.
- यामुळे सरकीचे वजन व कापसाचा धागा चमकदार होतो, तसेच सोयाबीनचे दाणे टपोरे भरतात.

महत्त्वाचा नियम: दुपारच्या कडक उन्हात फवारणी करू नका. सकाळी किंवा संध्याकाळी फवारणी करावी.`,
      hi: `घुलनशील खादों का सही समय पर छिड़काव करने से फसल की उपज बढ़ती है। दोपहर की कड़ी धूप में छिड़काव न करें।`,
      en: `Foliar nutrition with 19:19:19 and 00:00:50 provides immediate nourishment during drought stress and boll filling periods.`,
    },
    source: 'केंद्रीय कापूस संशोधन संस्था (CICR), नागपूर',
    readingTimeMinutes: 5,
    publishedDate: '१२ ऑक्टोबर २०२४',
    imageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985c?w=600&auto=format&fit=crop&q=80',
    tags: ['खते', 'विद्राव्य खते', '१९:१९:१९', 'CICR'],
  },
  {
    id: 'art-3',
    category: 'schemes',
    title: {
      mr: 'पंतप्रधान पीक विमा योजना (PMFBY) व नमो शेतकरी योजना: विदर्भ मार्गदर्शक',
      hi: 'प्रधानमंत्री फसल बीमा योजना (PMFBY) एवं नमो शेतकारी योजना गाइड',
      en: 'Pradhan Mantri Fasal Bima Yojana (PMFBY) & Namo Shetkari Scheme Guide',
    },
    summary: {
      mr: 'अतिवृष्टी किंवा दुष्काळात १ रुपयांत पीक विमा नोंदणी, नुकसान भरपाईचा पंचनामा आणि ७२ तासांच्या आत दावा दाखल करण्याची अधिकृत प्रक्रिया.',
      hi: 'प्राकृतिक आपदा में 72 घंटे के भीतर नुकसान की सूचना दर्ज करने की पूरी प्रक्रिया।',
      en: 'Official claim registration procedure and 72-hour intimation guidelines for crop loss under PMFBY.',
    },
    content: {
      mr: `महाराष्ट्र शासनाने शेतकऱ्यांसाठी १ रुपयात पीक विमा उपलब्ध करून दिला आहे. नैसर्गिक आपत्ती आल्यास भरपाई मिळवण्यासाठी खालील नियम अत्यंत महत्त्वाचे आहेत:

१. ७२ तासांची अंतिम मुदत (Intimation):
- अतिवृष्टी, पूर किंवा कीडरोगामुळे नुकसान झाल्यास घटनेपासून ७२ तासांच्या आत विमा कंपनीला किंवा Crop Insurance App वर तक्रार नोंदवणे बंधनकारक आहे.

२. टोल फ्री क्रमांक व कृषी सहाय्यक:
- १४४४७ या राष्ट्रीय टोल फ्री क्रमांकावर कॉल करून तक्रार नोंद क्रमांक (Docket Number) मिळवा.
- स्थानिक कृषी सहाय्यक किंवा तलाठी यांच्याकडून संयुक्त पंचनामा करून घ्या.

३. नमो शेतकरी महासन्मान निधी:
- पीएम-किसान योजनेप्रमाणेच महाराष्ट्र शासन प्रति वर्ष ₹६,००० अतिरिक्त देते (एकूण ₹१२,००० वार्षिक).
- बँक खात्याशी आधार लिंक व ई-केवायसी (e-KYC) पूर्ण असणे आवश्यक आहे.

संदर्भ: महाराष्ट्र शासन कृषी विभाग.`,
      hi: `फसल नुकसान होने पर 72 घंटे के भीतर Crop Insurance App पर फोटो अपलोड करके शिकायत दर्ज कराएं।`,
      en: `Under PMFBY, post-harvest losses and localized calamities must be reported within 72 hours via the official Crop Insurance portal or toll-free helpline 14447.`,
    },
    source: 'महाराष्ट्र शासन कृषी विभाग (MahaAgri)',
    readingTimeMinutes: 4,
    publishedDate: '१० ऑक्टोबर २०२४',
    imageUrl: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=600&auto=format&fit=crop&q=80',
    tags: ['सरकारी योजना', 'पीक विमा', 'PMFBY', 'नमो शेतकरी'],
  },
  {
    id: 'art-4',
    category: 'disease',
    title: {
      mr: 'तुरीचा मर रोग (उबळणे): ट्रायकोडर्माने प्रतिबंध व उपाय',
      hi: 'तुअर का उकठा (विल्ट) रोग: ट्राइकोडर्मा द्वारा रोकथाम',
      en: 'Fusarium Wilt of Pigeonpea: Preventive Management with Trichoderma',
    },
    summary: {
      mr: 'तुरीची झाडे हिरवी असतानाच अचानक का सुकतात? फ्युजॅरियम बुरशीचा प्रसार कसा रोखावा आणि जैविक उपाय कसा करावा.',
      hi: 'तुअर में उकठा रोग की रोकथाम के लिए जैविक उपाय और बीज उपचार।',
      en: 'Causes of sudden wilting in red gram and bio-fungicide root drenching protocols.',
    },
    content: {
      mr: `तुरीचा मर रोग हा जमिनीत राहणाऱ्या फ्युजॅरियम उडम (Fusarium udum) या बुरशीमुळे होतो.

१. प्रतिबंधात्मक उपाय:
- पेरणीपूर्वी ट्रायकोडर्मा व्हिरीडी ५ ग्रॅम प्रति किलो बियाण्यावर चोळावे.
- प्रतिकारक्षम वाण जसे की बीडीएन-७११, बीएसएमआर-७३६ चीच पेरणी करावी.

२. शेतात प्रादुर्भाव दिसल्यास:
- आजूबाजूच्या निरोगी झाडांच्या मुळाशी ट्रायकोडर्मा १० ग्रॅम प्रति लिटर पाणी किंवा कार्बेन्डाझिम ५०% WP २ ग्रॅम प्रति लिटर पाण्याचे द्रावण ओतावे.
- शेतात पाण्याचा उत्तम निचरा ठेवावा.`,
      hi: `तुअर में उकठा रोग की रोकथाम के लिए ट्राइकोडर्मा का प्रयोग करें।`,
      en: `Fusarium wilt management requires soil solarization, resistant cultivars, and biological seed treatment.`,
    },
    source: 'कृषी विज्ञान केंद्र (KVK), यवतमाळ',
    readingTimeMinutes: 3,
    publishedDate: '५ ऑक्टोबर २०२४',
    imageUrl: 'https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?w=600&auto=format&fit=crop&q=80',
    tags: ['तूर', 'मर रोग', 'ट्रायकोडर्मा', 'KVK'],
  },
];

export const Guidance: React.FC = () => {
  const { t, language } = useLanguage();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.BOOKMARKS);
    return saved ? JSON.parse(saved) : ['art-1'];
  });

  const [selectedArticle, setSelectedArticle] = useState<GuidanceArticle | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  const toggleBookmark = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setBookmarks((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSpeak = (article: GuidanceArticle) => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    const title = article.title[language] || article.title['mr'];
    const summary = article.summary[language] || article.summary['mr'];
    const textToSpeak = `${title}. ${summary}`;

    setIsSpeaking(true);
    speakText(textToSpeak, language, () => setIsSpeaking(false));
  };

  const categories = [
    { id: 'all', label: 'सर्व (All)' },
    { id: 'pest', label: 'कीड व्यवस्थापन (Pest)' },
    { id: 'fertilizer', label: 'खते व पोषण (Fertilizers)' },
    { id: 'disease', label: 'पीक रोग (Diseases)' },
    { id: 'schemes', label: 'सरकारी योजना (Schemes)' },
  ];

  const filteredArticles = GUIDANCE_ARTICLES.filter((art) => {
    const matchesCat = activeCategory === 'all' || art.category === activeCategory;
    const title = (art.title[language] || art.title['mr']).toLowerCase();
    const summary = (art.summary[language] || art.summary['mr']).toLowerCase();
    const q = searchQuery.toLowerCase();
    const matchesSearch = title.includes(q) || summary.includes(q);
    const matchesBookmark = showBookmarksOnly ? bookmarks.includes(art.id) : true;

    return matchesCat && matchesSearch && matchesBookmark;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#0A2540] flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#0A2540]" />
            <span>{t('navGuidance')} (Farmer Knowledge Center)</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#5B6B7D] mt-0.5">
            डॉ. पंजाबराव देशमुख कृषी विद्यापीठ व ICAR प्रमाणित शेती सल्ला, कीड उपाय व योजना
          </p>
        </div>

        <button
          onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition border ${
            showBookmarksOnly
              ? 'bg-[#0A2540] text-white border-[#0A2540] shadow-sm'
              : 'bg-white text-[#0A2540] border-[#D5DEE8] hover:bg-[#EEF3F8]'
          }`}
        >
          <Bookmark className="w-4 h-4 text-[#FF9933]" />
          <span>जतन केलेले लेख ({bookmarks.length})</span>
        </button>
      </div>

      {/* Search & Category Pills */}
      <div className="space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-5 h-5 text-[#5B6B7D] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="कीड, खत किंवा योजना शोधा (उदा. बोंडअळी, १९:१९:१९, पीक विमा)..."
            className="w-full bg-white border border-[#D5DEE8] text-[#0A2540] rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2540] placeholder:text-[#5B6B7D] shadow-2xs"
          />
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                setShowBookmarksOnly(false);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
                activeCategory === cat.id && !showBookmarksOnly
                  ? 'bg-[#0A2540] text-white border-[#0A2540] shadow-sm'
                  : 'bg-white text-[#5B6B7D] border-[#D5DEE8] hover:bg-[#EEF3F8] hover:text-[#0A2540]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredArticles.map((article) => {
          const isBookmarked = bookmarks.includes(article.id);
          const title = article.title[language] || article.title['mr'];
          const summary = article.summary[language] || article.summary['mr'];

          return (
            <Card
              key={article.id}
              variant="white"
              padding="none"
              className="overflow-hidden border border-[#D5DEE8] flex flex-col justify-between group hover:shadow-lg transition shadow-sm"
            >
              <div>
                {/* Image Header */}
                <div className="relative aspect-[16/9] bg-[#0B1626] overflow-hidden">
                  <img
                    src={article.imageUrl}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#0B1626]/80 text-white backdrop-blur-xs border border-white/20">
                      {article.category}
                    </span>
                  </div>

                  <button
                    onClick={(e) => toggleBookmark(article.id, e)}
                    className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/95 text-[#0A2540] flex items-center justify-center hover:bg-white transition shadow-sm"
                    title={isBookmarked ? 'जतन केले' : 'जतन करा'}
                  >
                    {isBookmarked ? (
                      <BookmarkCheck className="w-4 h-4 text-[#FF9933]" />
                    ) : (
                      <Bookmark className="w-4 h-4 text-[#5B6B7D]" />
                    )}
                  </button>

                  <div className="absolute bottom-2.5 right-2.5 bg-[#0B1626]/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-white flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3 text-[#FF9933]" />
                    <span>{article.readingTimeMinutes} मिनिटे वाचन</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#5B6B7D]">
                    <span className="font-semibold text-[#3B6EA5] truncate max-w-[200px]">
                      {article.source}
                    </span>
                    <span>{article.publishedDate}</span>
                  </div>

                  <h3 className="font-extrabold text-base text-[#0A2540] leading-snug transition">
                    {title}
                  </h3>

                  <p className="text-xs text-[#5B6B7D] line-clamp-3 leading-relaxed">
                    {summary}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 pt-2 border-t border-[#D5DEE8] flex items-center justify-between gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setSelectedArticle(article)}
                  className="text-xs"
                >
                  संपूर्ण लेख वाचा (Read Article)
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white text-slate-800 border-slate-300 hover:bg-slate-100 text-xs"
                  onClick={() => handleSpeak(article)}
                  leftIcon={<Volume2 className="w-3.5 h-3.5 text-emerald-600" />}
                >
                  ऐका
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Full Article Reader Modal */}
      {selectedArticle && (
        <Modal
          isOpen={Boolean(selectedArticle)}
          onClose={() => {
            stopSpeaking();
            setIsSpeaking(false);
            setSelectedArticle(null);
          }}
          title={selectedArticle.source}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-slate-900">
              <img
                src={selectedArticle.imageUrl}
                alt="Article"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-emerald-400 font-bold">
                {selectedArticle.publishedDate} • {selectedArticle.readingTimeMinutes} मिनिटे वाचन
              </span>

              <Button
                variant={isSpeaking ? 'danger' : 'outline'}
                size="sm"
                className="text-xs"
                onClick={() => handleSpeak(selectedArticle)}
                leftIcon={isSpeaking ? <VolumeX className="w-4 h-4 animate-bounce" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              >
                {isSpeaking ? 'आवाज थांबवा' : 'मराठीत ऐका (Voice)'}
              </Button>
            </div>

            <h3 className="text-xl font-black text-slate-900 leading-tight">
              {selectedArticle.title[language] || selectedArticle.title['mr']}
            </h3>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium leading-relaxed">
              {selectedArticle.summary[language] || selectedArticle.summary['mr']}
            </div>

            <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed space-y-3 font-sans">
              {selectedArticle.content[language] || selectedArticle.content['mr']}
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>अधिकृत स्रोत: {selectedArticle.source}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  stopSpeaking();
                  setIsSpeaking(false);
                  setSelectedArticle(null);
                }}
              >
                बंद करा
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
