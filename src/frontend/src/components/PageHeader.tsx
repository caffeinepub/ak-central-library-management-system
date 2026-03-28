import { ArrowLeft } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: React.ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  onBack,
  right,
}: PageHeaderProps) {
  return (
    <header className="lib-header no-print px-4 py-3 flex items-center gap-3 min-h-[56px]">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="p-1 -ml-1 rounded-full hover:bg-white/10 transition-colors"
        >
          <ArrowLeft size={22} className="text-white" />
        </button>
      )}
      <div className="flex-1 min-w-0">
        <h1 className="font-display font-bold text-white text-base leading-tight truncate">
          {title}
        </h1>
        {subtitle && <p className="text-white/70 text-xs">{subtitle}</p>}
      </div>
      {right && <div className="flex-shrink-0">{right}</div>}
    </header>
  );
}
