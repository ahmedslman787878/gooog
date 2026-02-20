import React, { useState } from 'react';
import { Search, Plus, Home, Car, Truck, Factory, MapPin, Sparkles, Video, Image as ImageIcon, Menu, X, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Listing, Category } from './types';
import { geminiService } from './services/geminiService';

// --- Components ---

const Navbar = ({ onAddClick }: { onAddClick: () => void }) => (
  <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 px-6 py-3 flex justify-between items-center md:top-0 md:bottom-auto md:border-b md:border-t-0">
    <button className="flex flex-col items-center gap-1 text-slate-500 hover:text-emerald-600 transition-colors">
      <Home size={24} />
      <span className="text-[10px] font-bold">الرئيسية</span>
    </button>
    <button className="flex flex-col items-center gap-1 text-slate-500 hover:text-emerald-600 transition-colors">
      <Search size={24} />
      <span className="text-[10px] font-bold">بحث</span>
    </button>
    <button 
      onClick={onAddClick}
      className="bg-emerald-600 text-white p-4 rounded-full -mt-12 shadow-lg shadow-emerald-200 border-4 border-white md:mt-0 md:rounded-xl md:p-3"
    >
      <Plus size={28} />
    </button>
    <button className="flex flex-col items-center gap-1 text-slate-500 hover:text-emerald-600 transition-colors">
      <Truck size={24} />
      <span className="text-[10px] font-bold">أوبر</span>
    </button>
    <button className="flex flex-col items-center gap-1 text-slate-500 hover:text-emerald-600 transition-colors">
      <Menu size={24} />
      <span className="text-[10px] font-bold">المزيد</span>
    </button>
  </nav>
);

const CategoryPill = ({ category, active, onClick, icon: Icon, label }: { category: Category, active: boolean, onClick: () => void, icon: any, label: string }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-2 min-w-[80px] p-3 rounded-2xl transition-all ${
      active ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-100'
    }`}
  >
    <Icon size={20} />
    <span className="text-xs font-bold whitespace-nowrap">{label}</span>
  </button>
);

const ListingCard = ({ listing }: { listing: Listing }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 flex flex-col"
  >
    <div className="relative aspect-[4/3]">
      <img 
        src={listing.imageUrl} 
        alt={listing.title} 
        className="w-full h-full object-cover"
        referrerPolicy="no-referrer"
      />
      <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-md text-white px-2 py-1 rounded-lg text-[10px] font-bold">
        {listing.category === 'real-estate' ? 'عقار' : listing.category === 'cars' ? 'سيارة' : 'معدة'}
      </div>
    </div>
    <div className="p-3 flex flex-col gap-1">
      <h3 className="font-bold text-sm line-clamp-1">{listing.title}</h3>
      <div className="flex items-center gap-1 text-slate-400 text-[10px]">
        <MapPin size={12} />
        <span>{listing.location}</span>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-emerald-600 font-extrabold text-sm">
          {listing.price.toLocaleString()} {listing.currency}
        </span>
      </div>
    </div>
  </motion.div>
);

const CreateListingModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [step, setStep] = useState(1);
  const [image, setImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiType, setAiType] = useState<'edit' | 'video' | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAiEdit = async () => {
    if (!image) return;
    setIsProcessing(true);
    try {
      const result = await geminiService.editListingImage(image, "Make this image look more professional and vibrant for a high-end listing");
      if (result) {
        setAiResult(result);
        setAiType('edit');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVeoVideo = async () => {
    if (!image) return;
    setIsProcessing(true);
    try {
      const result = await geminiService.generateListingVideo(image, "A smooth cinematic drone shot moving around this property/vehicle");
      if (result) {
        setAiResult(result);
        setAiType('video');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4 rtl">
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        className="bg-white w-full max-w-2xl rounded-t-[32px] md:rounded-[32px] overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-extrabold">إضافة إعلان جديد</h2>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full"><X size={20} /></button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Image Upload Area */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-600">صور الإعلان</label>
            {!image ? (
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
                <ImageIcon size={40} className="text-slate-400 mb-2" />
                <span className="text-sm text-slate-500">اضغط لرفع صورة من المعرض</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
            ) : (
              <div className="relative rounded-2xl overflow-hidden group">
                {aiType === 'video' && aiResult ? (
                  <video src={aiResult} controls className="w-full aspect-video object-cover" />
                ) : (
                  <img src={aiResult || image} className="w-full aspect-video object-cover" referrerPolicy="no-referrer" />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <button onClick={() => setImage(null)} className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white"><X size={24} /></button>
                </div>
              </div>
            )}
          </div>

          {/* AI Tools */}
          {image && !isProcessing && (
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={handleAiEdit}
                className="flex items-center justify-center gap-2 p-4 bg-indigo-50 text-indigo-700 rounded-2xl font-bold text-sm border border-indigo-100"
              >
                <Sparkles size={18} />
                تحسين بالذكاء الاصطناعي
              </button>
              <button 
                onClick={handleVeoVideo}
                className="flex items-center justify-center gap-2 p-4 bg-violet-50 text-violet-700 rounded-2xl font-bold text-sm border border-violet-100"
              >
                <Video size={18} />
                تحويل لفيديو (Veo)
              </button>
            </div>
          )}

          {isProcessing && (
            <div className="p-8 flex flex-col items-center justify-center gap-4 bg-slate-50 rounded-2xl">
              <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-bold text-slate-600">جاري المعالجة بالذكاء الاصطناعي...</p>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-600">عنوان الإعلان</label>
              <input type="text" placeholder="مثال: فيلا للبيع في الرياض" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-600">السعر</label>
                <input type="number" placeholder="0.00" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-600">القسم</label>
                <select className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none appearance-none">
                  <option>عقارات</option>
                  <option>سيارات</option>
                  <option>معدات ثقيلة</option>
                  <option>مصانع</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-600">الوصف</label>
              <textarea rows={4} placeholder="اكتب تفاصيل الإعلان هنا..." className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none resize-none"></textarea>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100">
          <button className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-extrabold text-lg shadow-lg shadow-emerald-100">
            نشر الإعلان الآن
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [activeCategory, setActiveCategory] = useState<Category>('real-estate');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [marketInsights, setMarketInsights] = useState<string | null>(null);

  const categories: { id: Category, label: string, icon: any }[] = [
    { id: 'real-estate', label: 'عقارات', icon: Home },
    { id: 'cars', label: 'سيارات', icon: Car },
    { id: 'heavy-equipment', label: 'معدات', icon: Truck },
    { id: 'factories', label: 'مصانع', icon: Factory },
    { id: 'uber', label: 'أوبر', icon: Phone },
  ];

  const mockListings: Listing[] = [
    { id: '1', title: 'فيلا مودرن للبيع', price: 2500000, currency: 'ريال', category: 'real-estate', location: 'الرياض، حي النرجس', imageUrl: 'assets/images/house1.jpg', description: '', createdAt: '' },
    { id: '2', title: 'تويوتا لاندكروزر 2024', price: 340000, currency: 'ريال', category: 'cars', location: 'جدة، حي الروضة', imageUrl: 'assets/images/car1.jpg', description: '', createdAt: '' },
    { id: '3', title: 'رافعات شوكية كوماتسو', price: 85000, currency: 'ريال', category: 'heavy-equipment', location: 'الدمام، المنطقة الصناعية', imageUrl: 'assets/images/truck1.jpg', description: '', createdAt: '' },
    { id: '4', title: 'مصنع بلاستيك متكامل', price: 12000000, currency: 'ريال', category: 'factories', location: 'الجبيل', imageUrl: 'assets/images/factory1.jpg', description: '', createdAt: '' },
    { id: '5', title: 'شقة فاخرة للإيجار', price: 45000, currency: 'ريال', category: 'real-estate', location: 'الخبر', imageUrl: 'assets/images/apt1.jpg', description: '', createdAt: '' },
    { id: '6', title: 'مرسيدس G63 AMG', price: 980000, currency: 'ريال', category: 'cars', location: 'الرياض', imageUrl: 'assets/images/car2.jpg', description: '', createdAt: '' },
  ];

  const filteredListings = mockListings.filter(l => l.category === activeCategory);

  const fetchInsights = async () => {
    const query = `أعطني نظرة سريعة على سوق ${activeCategory === 'real-estate' ? 'العقارات' : activeCategory === 'cars' ? 'السيارات' : 'المعدات الثقيلة'} في السعودية اليوم`;
    const insights = await geminiService.getMarketInsights(query);
    setMarketInsights(insights);
  };

  return (
    <div className="min-h-screen pb-24 rtl">
      {/* Header */}
      <header className="bg-white px-6 pt-8 pb-4 sticky top-0 z-40 border-b border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-black text-emerald-600">سوقنا</h1>
          <div className="flex gap-3">
            <button className="p-2 bg-slate-50 rounded-xl text-slate-600"><Search size={20} /></button>
            <button className="p-2 bg-slate-50 rounded-xl text-slate-600 relative">
              <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
              <Menu size={20} />
            </button>
          </div>
        </div>

        {/* Categories Scroll */}
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {categories.map(cat => (
            <CategoryPill
              key={cat.id}
              category={cat.id}
              label={cat.label}
              icon={cat.icon}
              active={activeCategory === cat.id}
              onClick={() => setActiveCategory(cat.id)}
            />
          ))}
        </div>
      </header>

      <main className="px-4 py-6 space-y-8">
        {/* AI Insights Banner */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-[24px] p-6 text-white shadow-xl shadow-emerald-100 relative overflow-hidden"
        >
          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles size={20} className="text-emerald-200" />
              <span className="text-xs font-bold uppercase tracking-wider opacity-80">تحليلات الذكاء الاصطناعي</span>
            </div>
            <h2 className="text-xl font-extrabold">اكتشف أفضل الفرص اليوم</h2>
            <p className="text-sm opacity-90 leading-relaxed">
              {marketInsights || "احصل على نظرة شاملة للسوق والأسعار الحالية مدعومة ببيانات جوجل."}
            </p>
            <button 
              onClick={fetchInsights}
              className="mt-4 px-6 py-2 bg-white/20 backdrop-blur-md rounded-xl text-sm font-bold hover:bg-white/30 transition-colors"
            >
              تحديث البيانات
            </button>
          </div>
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
        </motion.div>

        {/* Listings Grid - 2 per row as requested */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-extrabold">أحدث الإعلانات</h3>
            <button className="text-emerald-600 text-sm font-bold">عرض الكل</button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {filteredListings.length > 0 ? (
              filteredListings.map(listing => (
                <ListingCard key={listing.id} listing={listing} />
              ))
            ) : (
              <div className="col-span-2 py-12 text-center text-slate-400">
                لا توجد إعلانات في هذا القسم حالياً
              </div>
            )}
          </div>
        </div>

        {/* Uber / Transport Section (Specific Request) */}
        {activeCategory === 'uber' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
                  <Truck size={32} />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg">خدمات النقل والتوصيل</h3>
                  <p className="text-sm text-slate-500">اطلب شاحنة أو معدة لنقل بضاعتك</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <button className="w-full p-4 bg-slate-50 rounded-xl flex justify-between items-center font-bold">
                  <span>طلب دينا نقل</span>
                  <Plus size={18} />
                </button>
                <button className="w-full p-4 bg-slate-50 rounded-xl flex justify-between items-center font-bold">
                  <span>طلب سطحة سيارات</span>
                  <Plus size={18} />
                </button>
                <button className="w-full p-4 bg-slate-50 rounded-xl flex justify-between items-center font-bold">
                  <span>تأجير معدات بالساعة</span>
                  <Plus size={18} />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Navbar onAddClick={() => setIsModalOpen(true)} />
      
      <AnimatePresence>
        {isModalOpen && (
          <CreateListingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
