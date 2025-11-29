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
  Mail,
  Phone,
  Instagram
} from 'lucide-react';

const HomePage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const navigate = useNavigate();

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const benefits = [
    {
      icon: <ScanFace className="w-8 h-8 text-white" />,
      title: "זיהוי פנים",
      description: "טכנולוגיה מתקדמת לזיהוי מהיר ומדויק של המצולמים"
    },
    {
      icon: <Images className="w-8 h-8 text-white" />,
      title: "גלריות חכמות",
      description: "יצירת אלבומים אישיים לכל אורח באופן אוטומטי"
    },
    {
      icon: <Aperture className="w-8 h-8 text-white" />,
      title: "לוגו אוטומטי",
      description: "הוספת לוגו הצלם לכל תמונה לשיווק מקסימלי"
    },
    {
      icon: <Zap className="w-8 h-8 text-white" />,
      title: "מהיר וקל",
      description: "ממשק נוח ומהיר לשימוש ללא צורך בידע טכני"
    }
  ];

  const steps = [
    {
      number: "01",
      title: "העלאת תמונות",
      description: "הצלם מעלה את תמונות האירוע למערכת בקלות ובמהירות."
    },
    {
      number: "02",
      title: "עיבוד וזיהוי",
      description: "הבינה המלאכותית מזהה את הפנים וממיינת את התמונות לגלריות אישיות."
    },
    {
      number: "03",
      title: "שיתוף והפצה",
      description: "האורחים מקבלים קישור, מוצאים את עצמם בשניות ומשתפים ברשתות."
    }
  ];

  const faqs = [
    {
      question: "האם המערכת שומרת על פרטיות המצולמים?",
      answer: "בהחלט. אנו משתמשים בפרוטוקולי אבטחה מחמירים והתמונות נגישות רק למי שקיבל הרשאה או קישור מתאים."
    },
    {
      question: "כמה זמן לוקח למערכת לזהות את הפנים?",
      answer: "המערכת שלנו מהירה במיוחד! ברוב המקרים, תהליך הזיהוי והמיון מסתיים תוך דקות ספורות מרגע סיום ההעלאה."
    },
    {
      question: "האם ניתן להתאים את הלוגו שמופיע על התמונות?",
      answer: "כן, ניתן להעלות כל לוגו שתרצו ולמקם אותו באופן אוטומטי על גבי כל התמונות בגלריה."
    }
  ];

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-800" dir="rtl">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-1.0.3&auto=format&fit=crop&w=2000&q=80"
            alt="Wedding Photographer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight tracking-tight drop-shadow-lg">
            באירוע הבא כולם ידעו <br />
            <span className="text-amber-400">מי צילם אותם!</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-10 font-light max-w-2xl mx-auto">
            הפכו כל תמונה לכלי שיווקי וכל אורח לממליץ. המערכת החכמה לצלמי אירועים.
          </p>
          <button
            onClick={() => navigate('/auth', { state: { mode: 'register' } })}
            className="bg-amber-500 hover:bg-amber-600 text-white text-lg font-bold py-4 px-10 rounded-full transition-all transform hover:scale-105 shadow-xl flex items-center gap-2 mx-auto"
          >
            הירשם עכשיו
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce text-white/50">
          <ChevronDown className="w-10 h-10" />
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-stone-50 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow text-center group">
                <div className="w-16 h-16 bg-stone-900 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-amber-500 transition-colors">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-stone-900">{benefit.title}</h3>
                <p className="text-stone-600 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Benefits */}
      <section className="py-20 bg-stone-900 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="bg-stone-800/50 p-8 rounded-3xl border border-stone-700">
                <div className="flex items-center gap-4 mb-4">
                  <Camera className="w-8 h-8 text-amber-400" />
                  <h3 className="text-2xl font-bold text-amber-400">צלם (מנוע שיווקי)</h3>
                </div>
                <p className="text-gray-300 leading-relaxed text-lg">
                  המערכת הופכת כל אירוע להזדמנות פרסומית רחבת היקף שלא הייתה קיימת קודם.
                  היא ממנפת את שיתוף התמונות כדי להפוך כל אורח למפיץ של המותג,
                  כאשר כל הורדת תמונה משמשת כ"כרטיס ביקור דיגיטלי" עם לוגו הצלם.
                  המהלך מייצר בידול משמעותי מול מתחרים, מגדיל את החשיפה לקהל יעד רלוונטי ("לידים חמים"),
                  ומסייע בהרחבת מאגר הלקוחות העתידי.
                </p>
              </div>

              <div className="bg-stone-800/50 p-8 rounded-3xl border border-stone-700">
                <div className="flex items-center gap-4 mb-4">
                  <Users className="w-8 h-8 text-amber-400" />
                  <h3 className="text-2xl font-bold text-amber-400">לאורח (חווית משתמש)</h3>
                </div>
                <p className="text-gray-300 leading-relaxed text-lg">
                  פתרון מיידי לבעיית חיפוש התמונות, המעניק לאורח גלריה אישית המבוססת על זיהוי פנים
                  ומאפשרת הורדה מהירה ונוחה. אין יותר צורך לגלול בין אלפי תמונות כדי למצוא את הרגעים שלכם.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-3xl font-bold text-amber-400 mb-8">אורחים מרוצים</h3>
              {[
                {
                  name: "שירה כהן",
                  role: "אורחת בחתונה",
                  image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.0.3&auto=format&fit=crop&w=200&q=80",
                  quote: "פשוט מדהים! קיבלתי את כל התמונות שלי ישר לנייד תוך דקות. לא הייתי צריכה לחפש את עצמי בין אלפי תמונות."
                },
                {
                  name: "עומר לוי",
                  role: "מפיק אירועים",
                  image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.0.3&auto=format&fit=crop&w=200&q=80",
                  quote: "השירות הזה משדרג כל אירוע. האורחים יוצאים עם מזכרת אישית וממותגת, והצלמים מקבלים חשיפה אדירה."
                },
                {
                  name: "נועה גולן",
                  role: "כלה",
                  image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.0.3&auto=format&fit=crop&w=200&q=80",
                  quote: "האורחים שלי לא הפסיקו לדבר על זה! כולם קיבלו את התמונות שלהם והעלו לאינסטגרם עם הלוגו של הצלם."
                }
              ].map((testimonial, index) => (
                <div key={index} className="bg-stone-800 p-6 rounded-2xl relative">
                  <div className="absolute -top-4 right-6 text-5xl text-amber-500 font-serif opacity-50">"</div>
                  <p className="text-gray-300 mb-4 relative z-10 leading-relaxed text-sm">
                    {testimonial.quote}
                  </p>
                  <div className="flex items-center gap-3">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-amber-500"
                    />
                    <div>
                      <h4 className="font-bold text-white text-sm">{testimonial.name}</h4>
                      <p className="text-xs text-stone-400">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-stone-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-stone-900">איך זה עובד?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-0 right-0 h-0.5 bg-stone-200 -z-10 transform -translate-y-1/2" />

            {steps.map((step, index) => (
              <div key={index} className="text-center bg-white p-8 rounded-2xl shadow-sm relative">
                <div className="w-24 h-24 bg-stone-900 text-amber-400 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6 border-8 border-stone-50">
                  {step.number}
                </div>
                <h3 className="text-xl font-bold mb-4">{step.title}</h3>
                <p className="text-stone-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* FAQ */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-4xl font-bold text-center mb-12 text-stone-900">שאלות נפוצות</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-stone-200 rounded-xl overflow-hidden">
                <button
                  className="w-full flex items-center justify-between p-6 bg-stone-50 hover:bg-stone-100 transition-colors text-right"
                  onClick={() => toggleFaq(index)}
                >
                  <span className="font-bold text-lg text-stone-800">{faq.question}</span>
                  {openFaq === index ? <ChevronUp className="w-5 h-5 text-stone-500" /> : <ChevronDown className="w-5 h-5 text-stone-500" />}
                </button>
                {openFaq === index && (
                  <div className="p-6 bg-white text-stone-600 border-t border-stone-100">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-amber-500 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-6">מוכנים לשדרג את העסק שלכם?</h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto opacity-90">
            הצטרפו למאות צלמים שכבר נהנים מחשיפה מוגברת ולקוחות מרוצים.
          </p>
          <button
            onClick={() => navigate('/auth', { state: { mode: 'register' } })}
            className="bg-white text-amber-600 text-lg font-bold py-4 px-12 rounded-full hover:bg-stone-100 transition-colors shadow-lg"
          >
            הירשם עכשיו - בחינם
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <img src="/logo.jpg" alt="Logo" className="w-12 h-12 rounded-full object-cover" />
                <span className="text-2xl font-bold text-white">Photos</span>
              </div>
              <p className="max-w-sm">
                המערכת המתקדמת ביותר לצלמי אירועים.
                אנחנו כאן כדי לעזור לך להפוך כל אירוע להצלחה מסחררת.
              </p>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6">קישורים מהירים</h4>
              <ul className="space-y-3">
                <li><a href="/" className="hover:text-amber-400 transition-colors">אודות</a></li>
                <li><a href="/" className="hover:text-amber-400 transition-colors">מחירים</a></li>
                <li><a href="/" className="hover:text-amber-400 transition-colors">בלוג</a></li>
                <li><a href="/" className="hover:text-amber-400 transition-colors">צור קשר</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6">צור קשר</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5" />
                  <span>support@photos.com</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5" />
                  <span>050-1234567</span>
                </li>
                <li className="flex items-center gap-3">
                  <Instagram className="w-5 h-5" />
                  <span>@Click2Pic</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-stone-800 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} Click2Pic. כל הזכויות שמורות.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
