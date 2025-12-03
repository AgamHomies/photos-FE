import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera,
  Users,
  Zap,
  ScanFace,
  Images,
  Aperture,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Play,
  CheckCircle2,
  CloudUpload,
  Share2,
  LayoutGrid,
  TrendingUp,
  Target,
  MessageCircle,
  Clock,
  ShieldCheck
} from 'lucide-react';
import Layout from '../../components/Layout';

const HomePage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const navigate = useNavigate();

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

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
      icon: <Images className="w-8 h-8 text-white" />,
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
      description: "אירוע ראשון עלינו! אחר כך — רק 250 ₪ לאירוע. בלי התחייבויות ובלי אותיות קטנות."
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
      <section className="relative pt-12 pb-20 lg:pt-24 lg:pb-32 overflow-hidden bg-gradient-to-b from-white to-slate-50">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

            {/* Text Content */}
            <div className="lg:w-1/2 text-center lg:text-right">
              <h1 className="text-4xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
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
            <div className="lg:w-1/2 relative">
              <div className="relative z-10 bg-white p-6 rounded-[2.5rem] shadow-2xl transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500 border border-slate-100">
                <div className="relative rounded-2xl overflow-hidden bg-slate-100 aspect-[4/3]">
                  {/* Placeholder for the phone mockup image from the user's screenshot */}
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
                    <div className="text-center">
                      <div className="flex justify-center gap-4 mb-4">
                        <div className="w-16 h-32 bg-slate-800 rounded-2xl border-4 border-slate-900 shadow-xl"></div>
                        <div className="w-20 h-40 bg-slate-800 rounded-2xl border-4 border-slate-900 shadow-2xl transform -translate-y-4 z-10"></div>
                        <div className="w-16 h-32 bg-slate-800 rounded-2xl border-4 border-slate-900 shadow-xl"></div>
                      </div>
                      <p className="text-slate-400 font-medium">תצוגה מקדימה של האפליקציה</p>
                    </div>
                  </div>
                  {/* If we had the real image, we would put it here */}
                  {/* <img src="/path/to/hero-image.png" alt="App Preview" className="w-full h-full object-cover" /> */}
                </div>

                {/* Floating Badge */}
                <div className="absolute -top-6 -right-6 bg-white p-4 rounded-2xl shadow-xl animate-bounce border border-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-full">
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">זיהוי מוצלח</p>
                      <p className="font-bold text-slate-800">100% דיוק</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative blobs */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-cyan-200/40 to-blue-200/40 rounded-full filter blur-3xl -z-10 opacity-70"></div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works-section" className="py-24 bg-white relative">
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
      <section id="benefits-section" className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-16 items-start max-w-7xl mx-auto">
            <div className="lg:w-1/3 sticky top-24">
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

      {/* FAQ Section */}
      <section id="faq-section" className="py-24 bg-white">
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
      <section className="py-24 bg-gradient-to-br from-cyan-600 to-blue-700 text-white text-center relative overflow-hidden">
        {/* Background Patterns */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white rounded-full blur-3xl"></div>
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
    </Layout>
  );
};

export default HomePage;
