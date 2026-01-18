// Gallery Layout Types
export type GalleryLayoutType =
    | 'split'
    | 'hero'
    | 'portrait'
    | 'glass'
    | 'minimal'
    | 'magazine'
    | 'full-screen'
    | 'side-by-side'
    | 'stack'
    | 'ai';

export interface GalleryLayout {
    id: GalleryLayoutType;
    name: string;
    description: string;
}

export const GALLERY_LAYOUTS: GalleryLayout[] = [
    {
        id: 'ai',
        name: 'בחירת ה-AI ✨',
        description: 'המערכת תבחר אוטומטית את המבנה הכי מחמיא לתמונה שתעלה.'
    },
    {
        id: 'split',
        name: 'קלאסי (Split)',
        description: 'מתאים לכל סוגי התמונות. חלוקה נקייה וסימטרית.'
    },
    {
        id: 'hero',
        name: 'דרמטי (Hero)',
        description: 'הכי טוב לתמונות רוחב (Landscape) נוף או אווירה.'
    },
    {
        id: 'portrait',
        name: 'אלגנטי (Portrait)',
        description: 'מומלץ לתמונות אורך (Portrait) של אדם או זוג.'
    },
    {
        id: 'glass',
        name: 'שקוף (Glass)',
        description: 'מתאים לתמונות עם רקע עמוס יחסית, יוצר מיקוד בטקסט.'
    },
    {
        id: 'minimal',
        name: 'מינימליסטי (Minimal)',
        description: 'מתאים לתמונות "פרופיל" נקיות וממורכזות.'
    },
    {
        id: 'magazine',
        name: 'מגזין (Magazine)',
        description: 'מתאים לתמונות אומנותיות עם שטחי צבע מוגדרים.'
    },
    {
        id: 'full-screen',
        name: 'מסך מלא (Full Screen)',
        description: 'הכי מרשים לתמונות "וואו" באיכות גבוהה שמשמשות כרקע.'
    },
    {
        id: 'side-by-side',
        name: 'מודרני (Side by Side)',
        description: 'מתאים לתמונות רוחב, יוצר מראה אינטראקטיבי ומתקדם.'
    },
    {
        id: 'stack',
        name: 'טיפוגרפי (Stack)',
        description: 'מתאים לתמונות אורך, הטקסט עולה על התמונה למראה יוקרתי.'
    }
];

export interface GalleryTheme {
    id: string;
    name: string;
    backgroundColor: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    textPrimary: string;
    textSecondary: string;
    cardBackground: string;
    cardBorder: string;
    headerBackground: string;
    buttonStyle: 'modern' | 'elegant' | 'bold' | 'minimal';
    fontFamily: string;
    borderRadius: 'sharp' | 'rounded' | 'pill';
    layout?: GalleryLayoutType; // Keep for backward compatibility if needed, but we'll use standalone layout field
}

// Fixed classic colors for text and UI elements to maintain high readability
export const CLASSIC_COLORS = {
    textPrimary: '#4A3B2C',
    textSecondary: '#8B7355',
    cardBackground: '#FFFFFF',
    cardBorder: '#E8DFD3',
};

export const COLOR_PALETTES: GalleryTheme[] = [
    {
        id: 'ai-auto',
        name: 'בחירת ה-AI ✨',
        backgroundColor: '#F8FAFC',
        primaryColor: '#0891B2',
        secondaryColor: '#64748B',
        accentColor: '#0891B2',
        textPrimary: '#0F172A',
        textSecondary: '#64748B',
        cardBackground: '#FFFFFF',
        cardBorder: '#E2E8F0',
        headerBackground: '#FFFFFF',
        buttonStyle: 'modern',
        fontFamily: 'Inter, sans-serif',
        borderRadius: 'rounded'
    },
    {
        id: 'classic-white',
        name: 'בז׳ קלאסי',
        backgroundColor: '#FDFBF7',
        primaryColor: '#4A3B2C',
        secondaryColor: '#8B7355',
        accentColor: '#C4A882',
        headerBackground: '#EEE9E1',
        ...CLASSIC_COLORS,
        buttonStyle: 'elegant',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        borderRadius: 'rounded'
    },
    {
        id: 'soft-pink',
        name: 'ורוד פסטל',
        backgroundColor: '#FFF5F8',
        primaryColor: '#4A3B2C',
        secondaryColor: '#8B7355',
        accentColor: '#E6A8B8',
        headerBackground: '#FFEBF0',
        ...CLASSIC_COLORS,
        buttonStyle: 'elegant',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        borderRadius: 'rounded'
    },
    {
        id: 'lavender-mist',
        name: 'לבנדר עדין',
        backgroundColor: '#F8F5FF',
        primaryColor: '#4A3B2C',
        secondaryColor: '#8B7355',
        accentColor: '#B8A8E6',
        headerBackground: '#F0EBFF',
        ...CLASSIC_COLORS,
        buttonStyle: 'elegant',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        borderRadius: 'rounded'
    },
    {
        id: 'sky-blue',
        name: 'תכלת שמיים',
        backgroundColor: '#F5FAFF',
        primaryColor: '#4A3B2C',
        secondaryColor: '#8B7355',
        accentColor: '#A8C6E6',
        headerBackground: '#EBF5FF',
        ...CLASSIC_COLORS,
        buttonStyle: 'elegant',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        borderRadius: 'rounded'
    },
    {
        id: 'mint-fresh',
        name: 'ירוק מנטה',
        backgroundColor: '#F5FFF8',
        primaryColor: '#4A3B2C',
        secondaryColor: '#8B7355',
        accentColor: '#A8E6B8',
        headerBackground: '#EBF9F0',
        ...CLASSIC_COLORS,
        buttonStyle: 'elegant',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        borderRadius: 'rounded'
    },
    {
        id: 'cream-gold',
        name: 'קרם זהוב',
        backgroundColor: '#FFFDF5',
        primaryColor: '#4A3B2C',
        secondaryColor: '#8B7355',
        accentColor: '#E6C6A8',
        headerBackground: '#FFF9E6',
        ...CLASSIC_COLORS,
        buttonStyle: 'elegant',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        borderRadius: 'rounded'
    },
    {
        id: 'peach-fuzz',
        name: 'אפרסק רך',
        backgroundColor: '#FFF9F5',
        primaryColor: '#4A3B2C',
        secondaryColor: '#8B7355',
        accentColor: '#E6B8A8',
        headerBackground: '#FFF0E6',
        ...CLASSIC_COLORS,
        buttonStyle: 'elegant',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        borderRadius: 'rounded'
    }
];

// Keep for compatibility during transition
export const GALLERY_THEMES = COLOR_PALETTES;

// Helper function to get theme by background color
export const getThemeByColor = (backgroundColor: string): GalleryTheme => {
    const theme = COLOR_PALETTES.find(t => t.backgroundColor.toLowerCase() === (backgroundColor || '').toLowerCase());
    return theme || COLOR_PALETTES[0];
};

// Helper function to calculate color distance (simple Euclidean distance in RGB)
const getColorDistance = (hex1: string, hex2: string): number => {
    const r1 = parseInt(hex1.substring(1, 3), 16);
    const g1 = parseInt(hex1.substring(3, 5), 16);
    const b1 = parseInt(hex1.substring(5, 7), 16);

    const r2 = parseInt(hex2.substring(1, 3), 16);
    const g2 = parseInt(hex2.substring(3, 5), 16);
    const b2 = parseInt(hex2.substring(5, 7), 16);

    return Math.sqrt(
        Math.pow(r1 - r2, 2) +
        Math.pow(g1 - g2, 2) +
        Math.pow(b1 - b2, 2)
    );
};

// Finds the closest color palette based on an input color
export const findClosestPalette = (targetHex: string): GalleryTheme => {
    let closestPalette = COLOR_PALETTES[0];
    let minDistance = Infinity;

    COLOR_PALETTES.forEach(palette => {
        // We compare against accentColor as it represents the "vibe" better than the off-white background
        const distance = getColorDistance(targetHex, palette.accentColor);
        if (distance < minDistance) {
            minDistance = distance;
            closestPalette = palette;
        }
    });

    return closestPalette;
};

// Border radius mapping
export const BORDER_RADIUS_MAP = {
    sharp: '0.375rem',
    rounded: '1rem',
    pill: '1.5rem'
};
