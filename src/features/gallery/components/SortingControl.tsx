import React from 'react';
import { Sparkles, Clock, ArrowUpDown } from 'lucide-react';

interface SortingControlProps {
    currentSort: 'time' | 'matchScore';
    onSortChange: (sort: 'time' | 'matchScore') => void;
}

export const SortingControl: React.FC<SortingControlProps> = ({ currentSort, onSortChange }) => {
    const toggleSort = () => {
        onSortChange(currentSort === 'matchScore' ? 'time' : 'matchScore');
    };

    return (
        <div className="flex items-center gap-2 text-sm text-[#8B7355]">
            <ArrowUpDown className="w-4 h-4" />
            <span className="font-medium">מיון לפי:</span>
            <button
                onClick={toggleSort}
                className="flex items-center gap-1.5 px-3 py-1 bg-[#C4A882] border border-[#C4A882] rounded-full shadow-md text-white hover:bg-[#B39872] transition-colors"
            >
                {currentSort === 'matchScore' ? (
                    <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span className="font-bold text-xs">מיקוד AI</span>
                    </>
                ) : (
                    <>
                        <Clock className="w-3.5 h-3.5" />
                        <span className="font-bold text-xs">זמן</span>
                    </>
                )}
            </button>
        </div>
    );
};
