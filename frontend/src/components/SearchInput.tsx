import { Search } from 'lucide-react';

interface SearchInputProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
}

export const SearchInput = ({ value, onChange, placeholder = "Rechercher..." }: SearchInputProps) => {
    return (
        <div className="relative w-full">
            <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
                type="text"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full pl-9 pr-3 sm:pl-10 sm:pr-4 py-2 sm:py-2.5 bg-white border border-gray-200 rounded text-sm focus:outline-none transition-all placeholder:text-gray-400"
            />
        </div>
    );
};
