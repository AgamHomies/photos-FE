import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera,
  Users,
  Zap,
  ScanFace,
  Image,
  Aperture,
  ChevronDown,
  Download,
  ChevronUp,
  ArrowRight,
  Play,
  Pause,
  CheckCircle2,
  CloudUpload,
  Share2,
  LayoutGrid,
  TrendingUp,
  Target,
  MessageCircle,
  Clock,
  ShieldCheck,
  Heart,
  MapPin,
  Calendar,
  Globe,
  Phone,
  Instagram,
  Facebook,
  Check,
  Search,
  Lock,
  Menu,
  X,
  Star,
  Award,
  Crown,
  Sparkles
} from 'lucide-react';

import Layout from '../../components/Layout';
import { useAuth } from '../../hooks/useAuth';
import { PhoneMockupDemo } from './PhoneMockupDemo';

const HomePage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const navigate = useNavigate();

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // Redirect to admin dashboard if logged in
  const { isAuthenticated, isLoading } = useAuth(); // Assuming useAuth is available via hook or we import it

  React.useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/admin');
    }
  }, [isAuthenticated, isLoading, navigate]);

  // ... (rest of imports)




  const steps = [
    {
      icon: <CloudUpload className="w-8 h-8 text-white" />,
      title: "1. העלאת תמונות",
      description: "הצלם מעלה את כל תמונות האירוע"
    },
    {
      icon: <Camera className="w-8 h-8 text-white" />,
      title: "2. סלפי מהאורחים",
      description: "האורחים מעלים סלפי דרך הלינק הייחודי שלהם"
    },
    {
      icon: <Image className="w-8 h-8 text-white" />,
      title: "3. יצירת גלריה אישית",
      description: "המערכת מוצאת ומציגה רק את התמונות שבהם הם מופיעים, בתוך עמוד ממותג של הצלם"
    }
  ];

  const benefits = [
    {
      icon: <LayoutGrid className="w-6 h-6 text-white" />,
      bg: "bg-cyan-500",
      title: "בידול וחדשנות מול מתחרים",
      description: "שירות חכם שמוסיף חווית WOW לבעלי האירוע ולאורחים – והופך אתכם לבחירה המתקדמת והמועדפת באירועים הבאים."
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-white" />,
      bg: "bg-purple-500",
      title: "חשיפה אמיתית לקהל רחב יותר",
      description: "כל אורח מקבל גישה לתמונות שבהן הוא מופיע – וכולם נחשפים לשם שלכם בדרך הכי טבעית שיש!"
    },
    {
      icon: <Target className="w-6 h-6 text-white" />,
      bg: "bg-green-500",
      title: "יצירת לידים חמים מתוך האירוע עצמו",
      description: "אנשים שאהבו את התמונות ומתכננים את האירוע הקרוב שלהם, יבחרו בכם – ובכך אתם תקבלו פניות נוספות, בלי שיווק אגרסיבי."
    },
    {
      icon: <CheckCircle2 className="w-6 h-6 text-white" />,
      bg: "bg-amber-500",
      title: "תמחור פשוט ונגיש",
      description: "אירוע ראשון עלינו! ולאחר מכן משלמים לפי התמחור שמופיע למטה, פר אירוע בלבד. בלי מנוי חודשי, בלי התחייבות!"
    }
  ];

  const faqs = [
    {
      question: "איך עובד זיהוי הפנים?",
      answer: "המערכת משתמשת בטכנולוגיית AI מתקדמת הסורקת את תווי הפנים בתמונת הסלפי ומשווה אותם לכל התמונות בגלריה בדיוק של 99.9%."
    },
    {
      question: "האם המערכת מאובטחת?",
      answer: "בהחלט. אנו משתמשים בפרוטוקולי אבטחה מחמירים (SSL/TLS) והתמונות מאוחסנות בשרתים מאובטחים. הגישה לתמונות ניתנת רק למי שקיבל הרשאה."
    },
    {
      question: "איזה סוגי אירועים נתמכים?",
      answer: "המערכת מתאימה לכל סוגי האירועים: חתונות, בר/בת מצווה, בריתות, אירועי חברה, כנסים, מסיבות ועוד."
    },
    {
      question: "האם יש הגבלת כמות תמונות?",
      answer: "לא, אין הגבלה על כמות התמונות שניתן להעלות לאירוע. המערכת בנויה להתמודד עם אלפי תמונות במהירות."
    },
    {
      question: "כמה זמן לוקח התהליך?",
      answer: "תהליך הזיהוי הוא מהיר מאוד. ברוב המקרים, לאחר שהאורח מעלה סלפי, התמונות שלו נמצאות תוך שניות בודדות."
    },
    {
      question: "איך נרשמים?",
      answer: "פשוט לוחצים על כפתור 'התחל בחינם' או 'פתח חשבון עכשיו', ממלאים פרטים בסיסיים ומתחילים להשתמש במערכת מיד."
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative pt-8 pb-12 lg:pt-24 lg:pb-32 overflow-hidden bg-gradient-to-b from-white to-slate-50">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

            {/* Text Content */}
            <div className="lg:w-1/2 text-center lg:text-right lg:-mt-24">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight">
                באירוע הבא, כולם ידעו <br />
                <span className="text-cyan-500">מי צילם אותם!</span>
              </h1>
              <p className="text-lg text-slate-600 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                מערכת זיהוי פנים חכמה, המספקת לכל אורח גלריה אישית הממותגת בפרטי הצלם, ומעניקה לבעלי האירוע חווית שירות מתקדמת.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-10">
                <button
                  onClick={() => navigate('/auth', { state: { mode: 'register' } })}
                  className="bg-cyan-500 hover:bg-cyan-600 text-white text-lg font-bold py-3 px-8 rounded-xl transition-all shadow-lg hover:shadow-cyan-500/30 flex items-center gap-2"
                >
                  התחל בחינם
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    const section = document.getElementById('how-it-works-section');
                    section?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-lg font-bold py-3 px-8 rounded-xl transition-all shadow-sm hover:shadow-md flex items-center gap-2"
                >
                  איך זה עובד?
                  <Play className="w-4 h-4 fill-current" />
                </button>
              </div>

              <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-sm font-bold text-slate-500">
                <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg border border-green-100">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>זיהוי פנים מתקדם</span>
                </div>
                <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg border border-green-100">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>מיתוג אוטומטי</span>
                </div>
                <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg border border-green-100">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>אירוע ראשון חינם</span>
                </div>
              </div>
            </div>

            {/* Hero Image / Mockup */}
            <div className="lg:w-1/2 relative flex flex-col items-center justify-center">

              {/* Emphasis Badge */}
              <div className="mb-8 relative z-20 hover:scale-105 transition-transform duration-300">
                <div className="bg-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-slate-100 px-6 py-3 rounded-2xl flex items-center gap-3 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-50/50 to-purple-50/50 opacity-50"></div>
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                  </span>
                  <div className="relative">
                    <p className="font-bold text-slate-800 text-sm leading-none mb-1">הדמייה של הגלריה לאורחים</p>
                    <p className="text-[10px] text-slate-500 font-medium">מיד לאחר שהעלתם את התמונות למערכת</p>
                  </div>
                </div>
                {/* Arrow pointing down */}
                <div className="absolute left-1/2 -ml-2 -bottom-2 w-4 h-4 bg-white transform rotate-45 border-b border-r border-slate-100"></div>
              </div>

              <div className="relative z-10 bg-white p-2 rounded-[3rem] shadow-2xl transform lg:rotate-[-1deg] hover:rotate-0 transition-transform duration-500 border-4 border-slate-900 w-[280px] sm:w-[320px]">
                <div className="relative rounded-[2.5rem] overflow-hidden bg-slate-900 ring-8 ring-slate-900" style={{ aspectRatio: '9/19' }}>
                  {/* Animated App Demo - High Fidelity Replica */}
                  <PhoneMockupDemo />
                </div>
                {/* If we had the real image, we would put it here */}
                {/* <img src="/path/to/hero-image.png" alt="App Preview" className="w-full h-full object-cover" /> */}
              </div>

              {/* Floating Badge */}

            </div>

            {/* Decorative blobs */}
            <div className="hidden absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-cyan-200/40 to-blue-200/40 rounded-full filter blur-3xl -z-10 opacity-70"></div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works-section" className="py-12 lg:py-24 bg-white relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-3xl lg:text-5xl font-bold text-slate-900 mb-6">איך זה עובד? <span className="text-cyan-500">3 שלבים פשוטים</span></h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">תהליך פשוט ומהיר שחוסך לך זמן ומביא תוצאות</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative max-w-6xl mx-auto">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-16 left-10 right-10 h-0.5 bg-gradient-to-r from-transparent via-cyan-200 to-transparent -z-10"></div>

            {steps.map((step, index) => (
              <div key={index} className="text-center group relative">
                <div className="w-32 h-32 bg-white rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300 shadow-lg border border-slate-100 relative z-10">
                  <div className="bg-cyan-50 p-6 rounded-2xl">
                    <div className="bg-cyan-500 p-3 rounded-xl shadow-md text-white">
                      {step.icon}
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-4 text-slate-900">{step.title}</h3>
                <p className="text-slate-500 leading-relaxed px-4 text-lg">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits-section" className="py-12 lg:py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-16 items-start max-w-7xl mx-auto">
            <div className="lg:w-1/3 lg:sticky lg:top-24">
              <h2 className="text-4xl font-bold text-slate-900 mb-6">למה לבחור בנו?</h2>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                בואו להפוך כל אירוע להזדמנות לצמיחה. המערכת שלנו נותנת לכם את הכלים להצליח.
              </p>
              <div className="hidden lg:block">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-600">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">צמיחה שנתית</p>
                      <p className="text-2xl font-bold text-slate-900">+45%</p>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500 w-[75%]"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:w-2/3 grid gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex flex-col sm:flex-row gap-6 items-start">
                  <div className={`${benefit.bg} p-4 rounded-2xl shadow-lg text-white shrink-0`}>
                    {benefit.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">{benefit.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing-section" className="py-12 lg:py-24 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-slate-900 mb-6">תמחור גמיש ופשוט</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">תשלום פר אירוע, ללא דמי מנוי חודשיים וללא התחייבות.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center max-w-6xl mx-auto">
            {/* Basic Package */}
            <div className="group relative h-full bg-white border border-slate-200 rounded-[2rem] p-8 transition-all hover:border-slate-300 hover:shadow-xl hover:shadow-slate-900/5 flex flex-col items-center text-center">
              <div className="mb-6 p-4 bg-slate-50 rounded-2xl group-hover:bg-slate-100 transition-colors">
                <Star className="w-8 h-8 text-slate-400 group-hover:text-slate-600 transition-colors" />
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-2">חבילת בסיס</h3>
              <div className="flex items-baseline justify-center gap-1 mb-2">
                <span className="text-4xl font-black text-slate-900">₪199</span>
                <span className="text-slate-500 font-medium text-lg">/ אירוע</span>
              </div>
              <p className="text-slate-500 text-sm font-medium mb-8">אירועים קטנים וימי הולדת</p>

              <div className="w-full space-y-4 text-sm text-slate-600 mb-8 flex-1 text-right px-4">
                <div className="flex items-center gap-3 w-full">
                  <div className="p-1 rounded-full bg-slate-100 text-slate-500 shrink-0"><Check className="w-3.5 h-3.5" /></div>
                  <span>עד <span className="font-bold text-slate-900">1,200</span> תמונות</span>
                </div>
                <div className="flex items-center gap-3 w-full">
                  <div className="p-1 rounded-full bg-slate-100 text-slate-500 shrink-0"><Check className="w-3.5 h-3.5" /></div>
                  <span>קישור פעיל לחודש</span>
                </div>
                <div className="flex items-center gap-3 w-full">
                  <div className="p-1 rounded-full bg-slate-100 text-slate-500 shrink-0"><Check className="w-3.5 h-3.5" /></div>
                  <span>זיהוי פנים חכם</span>
                </div>
              </div>


            </div>

            {/* Premium Package - Recommended */}
            <div className="group relative h-full bg-white border-2 border-cyan-500 rounded-[2rem] p-8 shadow-2xl shadow-cyan-900/10 transform md:-translate-y-4 transition-all hover:shadow-cyan-900/20 flex flex-col items-center text-center z-10 w-full">
              {/* Elegant Badge */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-50 text-cyan-700 border border-cyan-200 px-4 py-1 rounded-full text-sm font-bold shadow-sm flex items-center gap-1.5 whitespace-nowrap">
                <Sparkles className="w-3.5 h-3.5" />
                <span>מומלץ ביותר</span>
              </div>

              <div className="mb-6 p-5 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl shadow-lg shadow-cyan-500/20 group-hover:scale-110 transition-transform duration-300">
                <Award className="w-10 h-10 text-white" />
              </div>

              <h3 className="text-2xl font-bold text-slate-900 mb-2">חבילת פרימיום</h3>
              <div className="flex items-baseline justify-center gap-1 mb-2">
                <span className="text-5xl font-black text-slate-900">₪279</span>
                <span className="text-slate-500 font-medium text-xl">/ אירוע</span>
              </div>
              <p className="text-cyan-600 text-sm font-medium mb-8 bg-cyan-50 px-3 py-1 rounded-full inline-block">הבחירה המשתלמת ביותר</p>

              <div className="w-full space-y-4 text-sm text-slate-700 mb-8 flex-1 text-right px-4">
                <div className="flex items-center gap-3 w-full">
                  <div className="p-1 rounded-full bg-cyan-100 text-cyan-600 shrink-0"><Check className="w-3.5 h-3.5" /></div>
                  <span className="text-base">הכל בחבילת בסיס +</span>
                </div>
                <div className="flex items-center gap-3 w-full">
                  <div className="p-1 rounded-full bg-cyan-100 text-cyan-600 shrink-0"><Check className="w-3.5 h-3.5" /></div>
                  <span className="text-base font-medium">עד <span className="font-bold text-slate-900">10,000</span> תמונות</span>
                </div>
                <div className="flex items-center gap-3 w-full">
                  <div className="p-1 rounded-full bg-cyan-100 text-cyan-600 shrink-0"><Check className="w-3.5 h-3.5" /></div>
                  <span className="text-base">קישור פעיל לחודשיים</span>
                </div>
                <div className="flex items-center gap-3 w-full bg-cyan-50/50 p-2 rounded-lg -mr-2">
                  <div className="p-1 rounded-full bg-cyan-100 text-cyan-600 shrink-0"><Check className="w-3.5 h-3.5" /></div>
                  <span className="text-base font-bold text-cyan-800">מתאים במיוחד לחתונות 💍</span>
                </div>
              </div>


            </div>

            {/* Gold Package */}
            <div className="group relative h-full bg-white border border-slate-200 rounded-[2rem] p-8 transition-all hover:border-amber-200 hover:shadow-xl hover:shadow-amber-900/5 flex flex-col items-center text-center">
              <div className="mb-6 p-4 bg-slate-50 rounded-2xl group-hover:bg-amber-50 transition-colors">
                <Crown className="w-8 h-8 text-slate-400 group-hover:text-amber-500 transition-colors" />
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-2">חבילת זהב</h3>
              <div className="flex items-baseline justify-center gap-1 mb-2">
                <span className="text-4xl font-black text-slate-900">₪499</span>
                <span className="text-slate-500 font-medium text-lg">/ אירוע</span>
              </div>
              <p className="text-slate-500 text-sm font-medium mb-8">אירועי ענק ופסטיבלים</p>

              <div className="w-full space-y-4 text-sm text-slate-600 mb-8 flex-1 text-right px-4">
                <div className="flex items-center gap-3 w-full">
                  <div className="p-1 rounded-full bg-slate-100 text-slate-500 shrink-0"><Check className="w-3.5 h-3.5" /></div>
                  <span>עד <span className="font-bold text-slate-900">20,000</span> תמונות</span>
                </div>
                <div className="flex items-center gap-3 w-full">
                  <div className="p-1 rounded-full bg-slate-100 text-slate-500 shrink-0"><Check className="w-3.5 h-3.5" /></div>
                  <span>קישור פעיל לחודשיים</span>
                </div>
                <div className="flex items-center gap-3 w-full">
                  <div className="p-1 rounded-full bg-slate-100 text-slate-500 shrink-0"><Check className="w-3.5 h-3.5" /></div>
                  <span>זיהוי פנים חכם</span>
                </div>
              </div>


            </div>
          </div>

          <div className="mt-16 text-center">
            <button
              onClick={() => navigate('/auth', { state: { mode: 'register' } })}
              className="bg-slate-900 text-white text-xl font-bold py-5 px-12 rounded-2xl shadow-xl hover:shadow-2xl hover:bg-slate-800 hover:-translate-y-1 transition-all group"
            >
              <span className="flex items-center gap-3">
                התחל עכשיו וקבל אירוע ראשון בחינם!!
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            <p className="mt-4 text-slate-500">ללא התחייבות • ללא דמי מנוי • שלם רק כשאתה צריך</p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq-section" className="py-12 lg:py-24 bg-slate-50">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">שאלות נפוצות</h2>
            <p className="text-slate-500">כל מה שרצית לדעת על Click2Pic</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-md">
                <button
                  className="w-full flex items-center justify-between p-6 text-right hover:bg-slate-50 transition-colors"
                  onClick={() => toggleFaq(index)}
                >
                  <span className="font-bold text-lg text-slate-800">{faq.question}</span>
                  {openFaq === index ? <ChevronUp className="w-5 h-5 text-cyan-500" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaq === index ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <div className="p-6 pt-0 text-slate-600 leading-relaxed border-t border-slate-50">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 lg:py-24 bg-gradient-to-br from-cyan-600 to-blue-700 text-white text-center relative overflow-hidden">
        {/* Background Patterns */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
          <div className="hidden lg:block absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white rounded-full blur-3xl"></div>
          <div className="hidden lg:block absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">מוכנים להקפיץ את העסק שלכם <br /> קדימה?</h2>
          <p className="text-xl mb-4 text-cyan-100 font-medium">
            הצטרפו היום בחינם.
          </p>
          <p className="text-lg mb-12 text-cyan-100/80">
            צלמים רבים כבר משתמשים במערכת וממליצים
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button
              onClick={() => navigate('/auth', { state: { mode: 'register' } })}
              className="bg-white text-cyan-600 text-lg font-bold py-4 px-10 rounded-xl transition-all shadow-xl hover:shadow-2xl hover:bg-slate-50 transform hover:-translate-y-1 flex items-center gap-2"
            >
              פתח חשבון עכשיו
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => navigate('/contact')}
              className="text-white font-bold flex items-center gap-2 hover:text-cyan-100 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              שאל שאלה
            </button>
          </div>

          <div className="flex justify-center gap-8 mt-12 text-sm font-medium text-cyan-100/90">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>התחל תוך דקות</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>אירוע ראשון חינם</span>
            </div>
          </div>
        </div>
      </section>
    </Layout >
  );
};

export default HomePage;
