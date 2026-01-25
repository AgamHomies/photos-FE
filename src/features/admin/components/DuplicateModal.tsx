import React from 'react';
import { AlertTriangle, Check, X, ArrowRight, Image as ImageIcon } from 'lucide-react';

interface DuplicateResult {
    filename: string;
    isDuplicate: boolean;
    existingPhotoId?: number;
    existingThumbnailUrl?: string;
}

interface DuplicateModalProps {
    isOpen: boolean;
    duplicates: DuplicateResult[];
    totalFiles: number;
    onCancel: () => void;
    onOptionSelected: (option: 'skip' | 'replace' | 'both') => void;
}

const DuplicateModal: React.FC<DuplicateModalProps> = ({
    isOpen,
    duplicates,
    totalFiles,
    onCancel,
    onOptionSelected
}) => {
    if (!isOpen) return null;

    const duplicateCount = duplicates.length;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in" dir="rtl">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-in">
                <div className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
                            <AlertTriangle className="w-6 h-6 text-amber-500" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">נמצאו תמונות כפולות ({duplicateCount})</h3>
                            <p className="text-slate-500 text-sm mt-1">מתוך {totalFiles} תמונות שבחרת, {duplicateCount} כבר קיימות באירוע.</p>
                        </div>
                    </div>

                    <div className="space-y-3 mb-8 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                        {duplicates.slice(0, 5).map((dup, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                {dup.existingThumbnailUrl ? (
                                    <img src={dup.existingThumbnailUrl} alt="" className="w-12 h-12 rounded-lg object-cover shadow-sm" />
                                ) : (
                                    <div className="w-12 h-12 rounded-lg bg-slate-200 flex items-center justify-center">
                                        <ImageIcon className="w-6 h-6 text-slate-400" />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-700 truncate">{dup.filename}</p>
                                    <p className="text-xs text-slate-400">כבר קיים בגלריה</p>
                                </div>
                            </div>
                        ))}
                        {duplicateCount > 5 && (
                            <p className="text-center text-xs text-slate-400 py-2">ועוד {duplicateCount - 5} תמונות נוספות...</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        <button
                            onClick={() => onOptionSelected('skip')}
                            className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-200 hover:border-cyan-500 hover:bg-cyan-50 transition-all group text-right"
                        >
                            <div>
                                <p className="font-bold text-slate-900 group-hover:text-cyan-700">דלג על כפולות</p>
                                <p className="text-xs text-slate-500">העלה רק {totalFiles - duplicateCount} תמונות חדשות</p>
                            </div>
                            <Check className="w-5 h-5 text-slate-400 group-hover:text-cyan-500" />
                        </button>

                        <button
                            onClick={() => onOptionSelected('replace')}
                            className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50 transition-all group text-right"
                        >
                            <div>
                                <p className="font-bold text-slate-900 group-hover:text-amber-700">החלף קיימות</p>
                                <p className="text-xs text-slate-500">מחק את הישנות והעלה את הגרסאות החדשות</p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-amber-500 rotate-180" />
                        </button>

                        <button
                            onClick={() => onOptionSelected('both')}
                            className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-all group text-right"
                        >
                            <div>
                                <p className="font-bold text-slate-900 group-hover:text-slate-800">העלה הכל (שמור את שניהם)</p>
                                <p className="text-xs text-slate-500">צור עותקים נוספים לכל התמונות הכפולות</p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
                        </button>
                    </div>
                </div>

                <div className="p-4 bg-slate-50 flex justify-end">
                    <button
                        onClick={onCancel}
                        className="px-6 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
                    >
                        ביטול
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DuplicateModal;
