import { useState, useEffect } from "react";

const DisneyApi = () => {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const placeholder = "https://placehold.co/600x400/png?text=No+Image";

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("https://api.disneyapi.dev/character");
        if (!res.ok) throw new Error("Network error");
        const json = await res.json();
        setCharacters(Array.isArray(json.data) ? json.data : []);
      } catch (err) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // If error, show error message with reload button

  if (error)
    return (
      <div className="max-w-xl mx-auto p-6">
        <div className="rounded-md bg-red-50 p-4 text-red-700">
          <div className="font-medium mb-1">Error</div>
          <div className="text-sm mb-3">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-3 py-1 bg-red-600 text-white rounded text-sm"
          >
            Reload
          </button>
        </div>
      </div>
    );

  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-200">
          Disney Characters
        </h1>
        <p className="text-sm text-slate-400">
          Image, name and quick metadata.
        </p>
      </header>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {characters.map((c) => {
          const id = String(
            c._id ?? c.id ?? Math.random().toString(36).slice(2, 9)
          );
          const name = (c.name || "Unknown").toString().trim();
          const img = c.imageUrl || c.image || placeholder;
          const films = Array.isArray(c.films) ? c.films.length : 0;
          const tv = Array.isArray(c.tvShows) ? c.tvShows.length : 0;

          return (
            <article
              key={id}
              className="relative overflow-hidden rounded-xl border border-gray-700/40 bg-gray-900/30 backdrop-blur-sm shadow-lg transform-gpu transition duration-300 ease-out hover:-translate-y-2 hover:scale-105"
            >
              <div className="relative h-56 bg-gray-800/40">
                <img
                  src={img}
                  alt={name}
                  loading="lazy"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = placeholder;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <h2 className="absolute left-4 bottom-4 text-white text-lg font-semibold drop-shadow">
                  {name}
                </h2>

                <span className="absolute right-3 top-3 inline-flex items-center gap-2 rounded-full bg-gray-800/60 px-3 py-1 text-xs text-gray-100">
                  🎬 {films}
                </span>
              </div>

              <div className="p-4">
                <div className="text-sm text-gray-200">
                  <div className="truncate">
                    {c.url && (
                      <a
                        className="text-xs text-sky-400 hover:underline"
                        href={c.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        API entry
                      </a>
                    )}
                  </div>
                  <div className="mt-2 text-xs text-gray-300">TV: {tv}</div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default DisneyApi;
