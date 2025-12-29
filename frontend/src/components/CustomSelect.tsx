import { ChevronDown, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface Option {
    value: string;
    label: string;
}

interface CustomSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: (Option | string)[]; // Can be object or string array
    placeholder?: string;
    label?: string;
    className?: string;
}

export const CustomSelect = ({
    value,
    onChange,
    options,
    placeholder = "Sélectionner...",
    label,
    className = ""
}: CustomSelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Normalize options
    const normalizedOptions: Option[] = options.map(opt =>
        typeof opt === 'string' ? { value: opt, label: opt } : opt
    );

    const selectedLabel = normalizedOptions.find(opt => opt.value === value)?.label || placeholder;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-3 py-2 sm:py-2.5 bg-white border border-gray-200 rounded text-sm focus:outline-none flex items-center justify-between text-left transition-all hover:bg-gray-50 min-h-[38px] sm:min-h-[42px]"
            >
                <span className={!value ? "text-gray-400" : "text-gray-900"}>
                    {selectedLabel}
                </span>
                <ChevronDown
                    size={16}
                    className={`text-gray-400 transition-transform duration-200 flex-shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg z-50 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                    {normalizedOptions.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-gray-400 italic">Aucune option</div>
                    ) : (
                        normalizedOptions.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                                className={`
                                    w-full text-left px-3 py-2 text-sm transition-colors flex items-center justify-between
                                    ${value === option.value
                                        ? 'bg-teal-50 text-teal-700 font-medium'
                                        : 'text-gray-700 hover:bg-gray-50'
                                    }
                                `}
                            >
                                <span>{option.label}</span>
                                {value === option.value && <Check size={14} className="text-teal-600" />}
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};
