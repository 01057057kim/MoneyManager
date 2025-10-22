import { Loader2 } from 'lucide-react';

export const LoadingSection = () => {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400 mx-auto mb-4" />
        <p className="text-slate-400">Loading content...</p>
      </div>
    </div>
  );
};

export default LoadingSection;