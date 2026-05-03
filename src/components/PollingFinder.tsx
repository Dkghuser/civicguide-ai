import { useState } from "react";
import { motion } from "motion/react";
import { MapPin, ExternalLink, Loader2 } from "lucide-react";

export function PollingFinder() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const findStations = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const query = encodeURIComponent(`polling station near ${latitude},${longitude}`);
        window.open(`https://www.google.com/maps/search/${query}`, '_blank');
        setLoading(false);
      },
      (err) => {
        setError("Unable to retrieve your location. Please check your settings.");
        setLoading(false);
      }
    );
  };

  return (
    <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
          <MapPin size={20} />
        </div>
        <div>
          <h4 className="font-semibold text-zinc-900">Find Polling Station</h4>
          <p className="text-xs text-zinc-500">Find your nearest designated voting location</p>
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-500 mb-3 bg-red-50 p-2 rounded-lg">{error}</p>
      )}

      <button
        onClick={findStations}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white border border-zinc-200 text-zinc-700 rounded-xl hover:bg-zinc-50 hover:border-zinc-300 transition-all font-medium text-sm disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="animate-spin" size={18} />
        ) : (
          <>
            <span>Locate Nearest Station</span>
            <ExternalLink size={14} />
          </>
        )}
      </button>
    </div>
  );
}
