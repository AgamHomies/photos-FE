import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera,
  Image,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Play,
  CheckCircle2,
  CloudUpload,
  LayoutGrid,
  TrendingUp,
  Target,
  MessageCircle,
  Clock,
  Check,
  Star,
  Award,
  Crown,
  Sparkles,
  Users,
  Link,
  Smile,
  Zap
} from 'lucide-react';

import Layout from '../../components/Layout';
import { useAuth } from '../../hooks/useAuth';
import { PhoneMockupDemo } from './PhoneMockupDemo';

type UserMode = 'photographer' | 'individual';

const HomePage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mode, setMode] = useState<UserMode>('photographer');
  const navigate = useNavigate();

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const { isAuthenticated, isLoading } = useAuth();

  React.useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/admin');
    }
  }, [isAuthenticated, isLoading, navigate]);

  const isIndividual = mode === 'individual';

  // ─── Steps ───────────────────────────────────────────────────────────────

  const photographerSteps = [
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

  const individualSteps = [
    {
      icon: <CloudUpload className="w-8 h-8 text-white" />,
      title: "1. העלאת תמונות",
      description: "העלו את כל תמונות האירוע — מהמחשב או הטלפון, בקלות"
    },
    {
      icon: <Link className="w-8 h-8 text-white" />,
      title: "2. שיתוף קישור אחד",
      description: "שלחו לאורחים קישור אחד — הם מעלים סלפי ומוצאים את עצמם"
    },
    {
      icon: <Smile className="w-8 h-8 text-white" />,
      title: "3. גלריה אישית לכל אורח",
      description: "כל אחד רואה רק את הרגעים שבהם הוא מופיע"
    }
  ];

  const steps = isIndividual ? individualSteps : photographerSteps;

  // ─── Benefits ────────────────────────────────────────────────────────────

  const photographerBenefits = [
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
      description: "תשלום לפי אירוע בלבד, לפי התמחור שמופיע למטה. בלי מנוי חודשי, בלי התחייבות!"
    }
  ];

  const individualBenefits = [
    {
      icon: <Zap className="w-6 h-6 text-white" />,
      bg: "bg-cyan-500",
      title: "חוסך שעות של מיון ושליחה",
      description: "במקום לשלוח לכל אחד בנפרד — כל אורח מוצא את עצמו לבד, תוך שניות."
    },
    {
      icon: <Users className="w-6 h-6 text-white" />,
      bg: "bg-purple-500",
      title: "פשוט לכולם, גם שאינם טכנולוגיים",
      description: "ממשק ידידותי שלא דורש שום ניסיון קודם. מגדירים בדקות ומוכנים."
    },
    {
      icon: <Smile className="w-6 h-6 text-white" />,
      bg: "bg-green-500",
      title: "חוויית WOW לאורחים",
      description: "כל אחד מקבל גלריה אישית עם הרגעים שלו — משהו שהם ישתפו ויזכרו."
    },
    {
      icon: <CheckCircle2 className="w-6 h-6 text-white" />,
      bg: "bg-amber-500",
      title: "תמחור נגיש לאירוע אישי",
      description: "תשלום חד-פעמי לאירוע בלבד. בלי מנוי חודשי ובלי התחייבות."
    }
  ];

  const benefits = isIndividual ? individualBenefits : photographerBenefits;

  // ─── FAQs ─────────────────────────────────────────────────────────────────

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
      answer: "לוחצים על 'התחל עכשיו' או 'פתח חשבון', ממלאים פרטים בסיסיים, בוחרים חבילה ומתחילים להשתמש במערכת מיד."
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative pt-fluid-lg pb-fluid-xl lg:pt-fluid-2xl lg:pb-fluid-3xl overflow-hidden bg-gradient-to-b from-white to-slate-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl">

          {/* Toggle */}
          <div className="flex justify-center mb-10 lg:mb-14">
            <div className="inline-flex bg-slate-100 rounded-2xl p-1.5 gap-1 shadow-inner border border-slate-200">
              <button
                onClick={() => setMode('photographer')}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                  !isIndividual
                    ? 'bg-white text-slate-900 shadow-md border border-slate-200'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Camera className="w-4 h-4" />
                אני צלם
              </button>
              <button
                onClick={() => setMode('individual')}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${
                  isIndividual
                    ? 'bg-white text-slate-900 shadow-md border border-slate-200'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Users className="w-4 h-4" />
                אני בעל אירוע
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-8 sm:gap-12 lg:gap-16 xl:gap-20">

            {/* Text Content */}
            <div className="lg:w-1/2 text-center lg:text-right lg:-mt-12 xl:-mt-24">
              {isIndividual ? (
                <>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold text-slate-900 mb-4 sm:mb-6 leading-tight">
                    שתפו את כל תמונות האירוע —<br />
                    <span className="text-cyan-500">כל אורח ימצא את עצמו בשניות</span>
                  </h1>
                  <p className="text-base sm:text-lg lg:text-xl text-slate-600 mb-6 sm:mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed px-4 lg:px-0">
                    העלו את התמונות, שלחו קישור אחד לכל האורחים — והם ימצאו את עצמם לבד עם זיהוי פנים. בלי לשלוח לכולם בנפרד.
                  </p>
                </>
              ) : (
                <>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold text-slate-900 mb-4 sm:mb-6 leading-tight">
                    באירוע הבא, כולם ידעו <br />
                    <span className="text-cyan-500">מי צילם אותם!</span>
                  </h1>
                  <p className="text-base sm:text-lg lg:text-xl text-slate-600 mb-6 sm:mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed px-4 lg:px-0">
                    מערכת זיהוי פנים חכמה, המספקת לכל אורח גלריה אישית הממותגת בפרטי הצלם, ומעניקה לבעלי האירוע חווית שירות מתקדמת.
                  </p>
                </>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 mb-8 sm:mb-10 px-4 lg:px-0">
                <button
                  onClick={() => navigate('/auth', { state: { mode: 'register', userType: isIndividual ? 'individual' : 'photographer' } })}
                  className="bg-cyan-500 hover:bg-cyan-600 text-white text-base sm:text-lg font-bold py-3 sm:py-3.5 px-6 sm:px-8 rounded-xl transition-all shadow-lg hover:shadow-cyan-500/30 flex items-center gap-2 w-full sm:w-auto justify-center"
                >
                  התחל עכשיו
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={() => {
                    const section = document.getElementById('how-it-works-section');
                    section?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-base sm:text-lg font-bold py-3 sm:py-3.5 px-6 sm:px-8 rounded-xl transition-all shadow-sm hover:shadow-md flex items-center gap-2 w-full sm:w-auto justify-center"
                >
                  איך זה עובד?
                  <Play className="w-4 h-4 fill-current" />
                </button>
              </div>

              <div className="flex flex-wrap justify-center lg:justify-start gap-2 sm:gap-3 lg:gap-4 text-xs sm:text-sm font-bold text-slate-500 px-4 lg:px-0">
                <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg border border-amber-200">
                  <span>הזול ביותר</span>
                  <span>🏆</span>
                </div>
                <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg border border-green-100">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>זיהוי פנים מתקדם</span>
                </div>
                {isIndividual ? (
                  <>
                    <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg border border-green-100">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>ללא ניסיון נדרש</span>
                    </div>
                    <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg border border-green-100">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>הגדרה בדקות</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg border border-green-100">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>מיתוג אוטומטי</span>
                    </div>
                    <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg border border-green-100">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>ללא התחייבות</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Hero Image / Mockup */}
            <div className="lg:w-1/2 relative flex flex-col items-center justify-center">

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
                <div className="absolute left-1/2 -ml-2 -bottom-2 w-4 h-4 bg-white transform rotate-45 border-b border-r border-slate-100"></div>
              </div>

              <div className="relative z-10 bg-white p-2 rounded-[3rem] shadow-2xl transform lg:rotate-[-1deg] hover:rotate-0 transition-transform duration-500 border-4 border-slate-900 w-[240px] xs:w-[280px] sm:w-[320px] lg:w-[300px] xl:w-[340px]">
                <div className="relative rounded-[2.5rem] overflow-hidden bg-slate-900 ring-8 ring-slate-900" style={{ aspectRatio: '9/19' }}>
                  <PhoneMockupDemo />
                </div>
              </div>
            </div>

            <div className="hidden absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-cyan-200/40 to-blue-200/40 rounded-full filter blur-3xl -z-10 opacity-70"></div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works-section" className="py-fluid-xl lg:py-fluid-2xl bg-white relative">
        <div className="container mx-auto px-6 sm:px-10 lg:px-16 max-w-7xl">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 sm:mb-6 px-4">איך זה עובד? <span className="text-cyan-500">3 שלבים פשוטים</span></h2>
            <p className="text-base sm:text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto px-4">תהליך פשוט ומהיר שחוסך לך זמן ומביא תוצאות</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12 relative max-w-6xl mx-auto">
            <div className="hidden md:block absolute top-16 left-10 right-10 h-0.5 bg-gradient-to-r from-transparent via-cyan-200 to-transparent -z-10"></div>

            {steps.map((step, index) => (
              <div key={index} className="text-center group relative">
                <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 sm:mb-8 group-hover:scale-110 transition-transform duration-300 shadow-lg border border-slate-100 relative z-10">
                  <div className="bg-cyan-50 p-4 sm:p-5 lg:p-6 rounded-2xl">
                    <div className="bg-cyan-500 p-2 sm:p-2.5 lg:p-3 rounded-xl shadow-md text-white">
                      {step.icon}
                    </div>
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-slate-900">{step.title}</h3>
                <p className="text-slate-500 leading-relaxed px-2 sm:px-4 text-sm sm:text-base lg:text-lg">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits-section" className="py-fluid-xl lg:py-fluid-2xl bg-slate-50">
        <div className="container mx-auto px-6 sm:px-10 lg:px-16 max-w-7xl">
          <div className="flex flex-col lg:flex-row gap-8 sm:gap-12 lg:gap-16 items-start">
            <div className="lg:w-1/3 lg:sticky lg:top-24 w-full">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 sm:mb-6">למה לבחור בנו?</h2>
              <p className="text-lg sm:text-xl text-slate-600 mb-6 sm:mb-8 leading-relaxed">
                {isIndividual
                  ? 'הכלי הפשוט ביותר לשיתוף תמונות מאירועים — כל אורח מוצא את עצמו תוך שניות.'
                  : 'בואו להפוך כל אירוע להזדמנות לצמיחה. המערכת שלנו נותנת לכם את הכלים להצליח.'}
              </p>
              <div className="hidden lg:block">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-600">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">{isIndividual ? 'חיסכון בזמן' : 'צמיחה שנתית'}</p>
                      <p className="text-2xl font-bold text-slate-900">{isIndividual ? 'שעות+' : '+45%'}</p>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500 w-[75%]"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:w-2/3 grid gap-4 sm:gap-6 w-full">
              {benefits.map((benefit, index) => (
                <div key={index} className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
                  <div className={`${benefit.bg} p-3 sm:p-4 rounded-2xl shadow-lg text-white shrink-0`}>
                    {benefit.icon}
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 sm:mb-3">{benefit.title}</h3>
                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing-section" className="py-fluid-xl lg:py-fluid-2xl bg-white relative overflow-hidden">
        <div className="container mx-auto px-6 sm:px-10 lg:px-16 max-w-7xl">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2 rounded-full text-sm font-bold mb-4 shadow-sm">
              <span>המחיר הזול ביותר לגלריה חכמה עם זיהוי פנים</span>
              <span>🏆</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-fluid-5xl font-bold text-slate-900 mb-4 sm:mb-6">תמחור גמיש ופשוט</h2>
            <p className="text-base sm:text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto px-4">תשלום לאירוע, ללא דמי מנוי חודשיים וללא התחייבות.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-6 xl:gap-8 items-stretch max-w-7xl mx-auto">
            {/* Basic */}
            <div className="group relative bg-white border border-slate-200 rounded-[2rem] p-6 sm:p-8 lg:p-6 xl:p-8 transition-all hover:border-slate-300 hover:shadow-xl hover:shadow-slate-900/5 flex flex-col items-center text-center">
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-slate-50 rounded-2xl group-hover:bg-slate-100 transition-colors">
                <Star className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400 group-hover:text-slate-600 transition-colors" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">חבילת בסיס</h3>
              <div className="flex items-baseline justify-center gap-1 mb-2">
                <span className="text-3xl sm:text-4xl lg:text-3xl xl:text-4xl font-black text-slate-900">
                  {isIndividual ? '₪49' : '₪79'}
                </span>
                <span className="text-slate-500 font-medium text-base sm:text-lg">/ אירוע</span>
              </div>
              <p className="text-slate-500 text-sm font-medium mb-6 sm:mb-8">אירועים קטנים וימי הולדת</p>
              <div className="w-full space-y-3 sm:space-y-4 text-sm text-slate-600 mb-6 sm:mb-8 flex-1 text-right px-2 sm:px-4">
                <div className="flex items-center gap-2 sm:gap-3 w-full">
                  <div className="p-1 rounded-full bg-slate-100 text-slate-500 shrink-0"><Check className="w-3.5 h-3.5" /></div>
                  <span className="text-sm sm:text-base">עד <span className="font-bold text-slate-900">1,200</span> תמונות</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 w-full">
                  <div className="p-1 rounded-full bg-slate-100 text-slate-500 shrink-0"><Check className="w-3.5 h-3.5" /></div>
                  <span className="text-sm sm:text-base">קישור פעיל לחודש</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 w-full">
                  <div className="p-1 rounded-full bg-slate-100 text-slate-500 shrink-0"><Check className="w-3.5 h-3.5" /></div>
                  <span className="text-sm sm:text-base">זיהוי פנים חכם</span>
                </div>
                {!isIndividual && (
                  <>
                    <div className="flex items-center gap-2 sm:gap-3 w-full">
                      <div className="p-1 rounded-full bg-slate-100 text-slate-500 shrink-0"><Check className="w-3.5 h-3.5" /></div>
                      <span className="text-sm sm:text-base">מיתוג מלא</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 w-full">
                      <div className="p-1 rounded-full bg-slate-100 text-slate-500 shrink-0"><Check className="w-3.5 h-3.5" /></div>
                      <span className="text-sm sm:text-base">סטטיסטיקות מצטברות על פני האירועים</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Premium */}
            <div className="group relative bg-white border-2 border-cyan-500 rounded-[2rem] p-6 sm:p-8 lg:p-6 xl:p-8 shadow-2xl shadow-cyan-900/10 sm:transform sm:md:-translate-y-0 lg:-translate-y-4 transition-all hover:shadow-cyan-900/20 flex flex-col items-center text-center z-10 w-full">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-50 text-cyan-700 border border-cyan-200 px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-bold shadow-sm flex items-center gap-1.5 whitespace-nowrap">
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>מומלץ ביותר</span>
              </div>
              <div className="mb-4 sm:mb-6 p-4 sm:p-5 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl shadow-lg shadow-cyan-500/20 group-hover:scale-110 transition-transform duration-300">
                <Award className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">חבילת פרימיום</h3>
              <div className="flex items-baseline justify-center gap-1 mb-2">
                <span className="text-4xl sm:text-5xl lg:text-4xl xl:text-5xl font-black text-slate-900">
                  {isIndividual ? '₪79' : '₪139'}
                </span>
                <span className="text-slate-500 font-medium text-lg sm:text-xl">/ אירוע</span>
              </div>
              <p className="text-cyan-600 text-xs sm:text-sm font-medium mb-6 sm:mb-8 bg-cyan-50 px-3 py-1 rounded-full inline-block">הבחירה המשתלמת ביותר</p>
              <div className="w-full space-y-3 sm:space-y-4 text-sm text-slate-700 mb-6 sm:mb-8 flex-1 text-right px-2 sm:px-4">
                <div className="flex items-center gap-2 sm:gap-3 w-full">
                  <div className="p-1 rounded-full bg-cyan-100 text-cyan-600 shrink-0"><Check className="w-3.5 h-3.5" /></div>
                  <span className="text-sm sm:text-base font-medium">עד <span className="font-bold text-slate-900">10,000</span> תמונות</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 w-full">
                  <div className="p-1 rounded-full bg-cyan-100 text-cyan-600 shrink-0"><Check className="w-3.5 h-3.5" /></div>
                  <span className="text-sm sm:text-base">קישור פעיל לחודשיים</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 w-full">
                  <div className="p-1 rounded-full bg-cyan-100 text-cyan-600 shrink-0"><Check className="w-3.5 h-3.5" /></div>
                  <span className="text-sm sm:text-base">זיהוי פנים חכם</span>
                </div>
                {!isIndividual && (
                  <>
                    <div className="flex items-center gap-2 sm:gap-3 w-full">
                      <div className="p-1 rounded-full bg-cyan-100 text-cyan-600 shrink-0"><Check className="w-3.5 h-3.5" /></div>
                      <span className="text-sm sm:text-base">מיתוג מלא</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 w-full">
                      <div className="p-1 rounded-full bg-cyan-100 text-cyan-600 shrink-0"><Check className="w-3.5 h-3.5" /></div>
                      <span className="text-sm sm:text-base">סטטיסטיקות מצטברות על פני האירועים</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 w-full bg-cyan-50/50 p-2 rounded-lg -mr-2">
                      <div className="p-1 rounded-full bg-cyan-100 text-cyan-600 shrink-0"><Check className="w-3.5 h-3.5" /></div>
                      <span className="text-sm sm:text-base font-bold text-cyan-800">אפשרות להשארת לידים!</span>
                    </div>
                  </>
                )}
                <div className="flex items-center gap-2 sm:gap-3 w-full bg-cyan-50/50 p-2 rounded-lg -mr-2">
                  <div className="p-1 rounded-full bg-cyan-100 text-cyan-600 shrink-0"><Check className="w-3.5 h-3.5" /></div>
                  <span className="text-sm sm:text-base font-bold text-cyan-800">מתאים במיוחד לחתונות 💍</span>
                </div>
              </div>
            </div>

            {/* Gold */}
            <div className="group relative bg-white border border-slate-200 rounded-[2rem] p-6 sm:p-8 lg:p-6 xl:p-8 transition-all hover:border-amber-200 hover:shadow-xl hover:shadow-amber-900/5 flex flex-col items-center text-center sm:col-span-2 lg:col-span-1">
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-slate-50 rounded-2xl group-hover:bg-amber-50 transition-colors">
                <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400 group-hover:text-amber-500 transition-colors" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">חבילת זהב</h3>
              <div className="flex items-baseline justify-center gap-1 mb-2">
                <span className="text-3xl sm:text-4xl lg:text-3xl xl:text-4xl font-black text-slate-900">
                  {isIndividual ? '₪169' : '₪269'}
                </span>
                <span className="text-slate-500 font-medium text-base sm:text-lg">/ אירוע</span>
              </div>
              <p className="text-slate-500 text-sm font-medium mb-6 sm:mb-8">אירועי ענק ופסטיבלים</p>
              <div className="w-full space-y-3 sm:space-y-4 text-sm text-slate-600 mb-6 sm:mb-8 flex-1 text-right px-2 sm:px-4">
                <div className="flex items-center gap-2 sm:gap-3 w-full">
                  <div className="p-1 rounded-full bg-slate-100 text-slate-500 shrink-0"><Check className="w-3.5 h-3.5" /></div>
                  <span className="text-sm sm:text-base"><span className="font-bold text-slate-900">ללא הגבלת תמונות</span></span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 w-full">
                  <div className="p-1 rounded-full bg-slate-100 text-slate-500 shrink-0"><Check className="w-3.5 h-3.5" /></div>
                  <span className="text-sm sm:text-base">קישור פעיל לחודשיים</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 w-full">
                  <div className="p-1 rounded-full bg-slate-100 text-slate-500 shrink-0"><Check className="w-3.5 h-3.5" /></div>
                  <span className="text-sm sm:text-base">זיהוי פנים חכם</span>
                </div>
                {!isIndividual && (
                  <>
                    <div className="flex items-center gap-2 sm:gap-3 w-full">
                      <div className="p-1 rounded-full bg-slate-100 text-slate-500 shrink-0"><Check className="w-3.5 h-3.5" /></div>
                      <span className="text-sm sm:text-base">מיתוג מלא</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 w-full">
                      <div className="p-1 rounded-full bg-slate-100 text-slate-500 shrink-0"><Check className="w-3.5 h-3.5" /></div>
                      <span className="text-sm sm:text-base">סטטיסטיקות מצטברות על פני האירועים</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 w-full">
                      <div className="p-1 rounded-full bg-slate-100 text-slate-500 shrink-0"><Check className="w-3.5 h-3.5" /></div>
                      <span className="text-sm sm:text-base font-bold">אפשרות להשארת לידים!</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="mt-12 sm:mt-16 lg:mt-20 text-center px-4">
            <button
              onClick={() => navigate('/auth', { state: { mode: 'register', userType: isIndividual ? 'individual' : 'photographer' } })}
              className="bg-slate-900 text-white text-base sm:text-lg lg:text-xl font-bold py-4 sm:py-5 px-8 sm:px-12 rounded-2xl shadow-xl hover:shadow-2xl hover:bg-slate-800 hover:-translate-y-1 transition-all group w-full sm:w-auto"
            >
              <span className="flex items-center justify-center gap-2 sm:gap-3">
                {isIndividual
                  ? 'צרו גלריה לאירוע שלכם תוך דקות!'
                  : 'התחל עכשיו!'}
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            <p className="mt-4 text-sm sm:text-base text-slate-500">
              {isIndividual
                ? 'תשלום חד-פעמי לאירוע • ללא מנוי • ללא התחייבות'
                : 'ללא התחייבות • ללא דמי מנוי • שלם רק כשאתה צריך'}
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq-section" className="py-fluid-xl lg:py-fluid-2xl bg-slate-50">
        <div className="container mx-auto px-6 sm:px-10 lg:px-16 max-w-3xl">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 px-4">שאלות נפוצות</h2>
            <p className="text-sm sm:text-base text-slate-500 px-4">כל מה שרצית לדעת על Click2Pic</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-md">
                <button
                  className="w-full flex items-center justify-between p-4 sm:p-6 text-right hover:bg-slate-50 transition-colors"
                  onClick={() => toggleFaq(index)}
                >
                  <span className="font-bold text-base sm:text-lg text-slate-800 pr-4">{faq.question}</span>
                  {openFaq === index ? <ChevronUp className="w-5 h-5 text-cyan-500" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaq === index ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <div className="p-4 sm:p-6 pt-0 text-sm sm:text-base text-slate-600 leading-relaxed border-t border-slate-50">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-fluid-xl lg:py-fluid-2xl bg-gradient-to-br from-cyan-600 to-blue-700 text-white text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
          <div className="hidden lg:block absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white rounded-full blur-3xl"></div>
          <div className="hidden lg:block absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-6 sm:px-10 lg:px-16 relative z-10 max-w-4xl">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 leading-tight px-4">
            {isIndividual
              ? <>צרו גלריה לאירוע שלכם —<br className="hidden sm:block" /> תוך דקות!</>
              : <>מוכנים להקפיץ את העסק שלכם <br className="hidden sm:block" />קדימה?</>}
          </h2>
          <p className="text-lg sm:text-xl mb-3 sm:mb-4 text-cyan-100 font-medium px-4">
            הצטרפו היום בחינם.
          </p>
          <p className="text-base sm:text-lg mb-8 sm:mb-12 text-cyan-100/80 px-4">
            {isIndividual
              ? 'אלפי אנשים כבר שיתפו את האירועים שלהם דרך Click2Pic'
              : 'צלמים רבים כבר משתמשים במערכת וממליצים'}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 px-4">
            <button
              onClick={() => navigate('/auth', { state: { mode: 'register', userType: isIndividual ? 'individual' : 'photographer' } })}
              className="bg-white text-cyan-600 text-base sm:text-lg font-bold py-3 sm:py-4 px-8 sm:px-10 rounded-xl transition-all shadow-xl hover:shadow-2xl hover:bg-slate-50 transform hover:-translate-y-1 flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              פתח חשבון עכשיו
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => navigate('/contact')}
              className="text-white font-bold flex items-center gap-2 hover:text-cyan-100 transition-colors text-base sm:text-lg"
            >
              <MessageCircle className="w-5 h-5" />
              שאל שאלה
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mt-8 sm:mt-12 text-xs sm:text-sm font-medium text-cyan-100/90">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>התחל תוך דקות</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>ללא התחייבות</span>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default HomePage;
