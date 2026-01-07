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
        <div className="flex items-center gap-3 text-sm text-[#8B7355]">
            <div className="flex items-center gap-1.5 opacity-80">
                <ArrowUpDown className="w-4 h-4" />
                <span className="font-medium">מיון לפי:</span>
            </div>

            <div className="flex bg-[#EFE5D9] p-1 rounded-full shadow-inner">
                <button
                    onClick={() => onSortChange('matchScore')}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full transition-all duration-300 ${currentSort === 'matchScore'
                            ? 'bg-[#C4A882] text-white shadow-md font-bold'
                            : 'text-[#8B7355] hover:bg-[#E6DCCF] font-medium'
                        }`}
                >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span className="text-xs">מיקוד AI</span>
                </button>

                <button
                    onClick={() => onSortChange('time')}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full transition-all duration-300 ${currentSort === 'time'
                            ? 'bg-[#C4A882] text-white shadow-md font-bold'
                            : 'text-[#8B7355] hover:bg-[#E6DCCF] font-medium'
                        }`}
                >
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-xs">זמן</span>
                </button>
            </div>
        </div>
    );
};
