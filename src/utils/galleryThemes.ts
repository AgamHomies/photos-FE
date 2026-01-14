// Gallery theme configurations
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
}

// Fixed classic colors for text and UI elements to maintain high readability
export const CLASSIC_COLORS = {
    textPrimary: '#4A3B2C',
    textSecondary: '#8B7355',
    cardBackground: '#FFFFFF',
    cardBorder: '#E8DFD3',
};

export const GALLERY_THEMES: GalleryTheme[] = [
    {
        id: 'classic-beige',
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

// Helper function to get theme by background color
export const getThemeByColor = (backgroundColor: string): GalleryTheme => {
    const theme = GALLERY_THEMES.find(t => t.backgroundColor.toLowerCase() === (backgroundColor || '').toLowerCase());
    return theme || GALLERY_THEMES[0];
};

// Border radius mapping
export const BORDER_RADIUS_MAP = {
    sharp: '0.375rem',
    rounded: '1rem',
    pill: '1.5rem'
};
