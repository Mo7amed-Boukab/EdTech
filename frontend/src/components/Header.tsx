interface HeaderProps {
  title: string;
  description?: string;
}

export const Header = ({ title, description }: HeaderProps) => {
  return (
    <header className="h-16 lg:h-20 bg-white border-b border-gray-200 flex items-center px-4 sm:px-6 lg:px-8 sticky top-0 z-20">
      <div className="ml-12 lg:ml-0 w-full">
        <h1 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900">
          {title}
        </h1>
        {description && (
          <p className="text-xs sm:text-sm text-gray-500 hidden sm:block mt-0.5">{description}</p>
        )}
      </div>
    </header>
  );
};
