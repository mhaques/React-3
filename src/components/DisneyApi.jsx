import { useState, useEffect } from "react";

const ARRAY_FIELDS = [
  "films",
  "shortFilms",
  "tvShows",
  "videoGames",
  "parkAttractions",
  "allies",
  "enemies",
];

const DEFAULT_FIELDS = [
  "name",
  "imageUrl",
  ...ARRAY_FIELDS,
  "url",
];

const DisneyApi = () => {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const placeholder = "https://placehold.co/600x400/png?text=No+Image";

  // form state (dynamic fields mapped from sample or defaults)
  const [formData, setFormData] = useState(
    () => DEFAULT_FIELDS.reduce((a, k) => ((a[k] = ""), a), {})
  );

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("https://api.disneyapi.dev/character");
        if (!res.ok) throw new Error("Network error");
        const json = await res.json();
        const list = Array.isArray(json.data) ? json.data : [];
        setCharacters(list);
      } catch (err) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // If API returns objects with extra fields, add them to the form dynamically
  useEffect(() => {
    if (!characters[0]) return;
    const sample = characters[0];
    const extras = Object.keys(sample).filter((k) => k !== "_id" && !(k in formData));
    if (extras.length) {
      const add = {};
      extras.forEach((k) => {
        add[k] = Array.isArray(sample[k]) ? sample[k].join(", ") : String(sample[k] ?? "");
      });
      setFormData((p) => ({ ...p, ...add }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [characters]);

  if (loading)
    return (
      <div className="flex items-center justify-center py-20">
        <span className="text-sm text-gray-400">Loading characters…</span>
      </div>
    );

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

  const handleChange = (key, value) => {
    setFormData((p) => ({ ...p, [key]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // build character object from form
    const newChar = {};
    Object.keys(formData).forEach((k) => {
      const val = (formData[k] ?? "").trim();
      if (ARRAY_FIELDS.includes(k)) {
        newChar[k] = val.length ? val.split(",").map((s) => s.trim()).filter(Boolean) : [];
      } else {
        if (val !== "") newChar[k] = val;
      }
    });

    // compute next numeric id based on existing _id/id keys
    const numericIds = characters
      .map((ch) => Number(ch._id ?? ch.id))
      .filter((n) => Number.isFinite(n));
    const nextId = numericIds.length ? Math.max(...numericIds) + 1 : Date.now();

    newChar._id = nextId;
    // ensure name and image exist for display
    newChar.name = newChar.name || "Unknown";
    newChar.imageUrl = newChar.imageUrl || placeholder;

    setCharacters((p) => [newChar, ...p]);
    // reset form
    setFormData(DEFAULT_FIELDS.reduce((a, k) => ((a[k] = ""), a), {}));
  };

  // remove character by existing id/_id
  const handleRemove = (id) => {
    setCharacters((prev) =>
      prev.filter((ch) => String(ch._id ?? ch.id ?? "") !== String(id))
    );
  };

  // derive visible fields (keep stable order)
  const visibleFields = Object.keys(formData);

  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <header className="mb-4">
        <h1 className="text-2xl font-semibold text-slate-200">Disney Characters</h1>
        <p className="text-sm text-slate-400">Add a character (fields mapped from API).</p>
      </header>

      <form onSubmit={handleSubmit} className="mb-6 grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {visibleFields.map((key) => {
          const isArray = ARRAY_FIELDS.includes(key);
          return (
            <label key={key} className="flex flex-col text-sm text-slate-200">
              <span className="mb-1 capitalize">{key}{isArray ? " (comma separated)" : ""}</span>
              <input
                value={formData[key]}
                onChange={(e) => handleChange(key, e.target.value)}
                placeholder={isArray ? "e.g. Film A, Film B" : ""}
                className="bg-gray-800/30 border border-gray-700/40 rounded px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </label>
          );
        })}

        <div className="flex items-end">
          <button
            type="submit"
            className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white rounded text-sm"
          >
            Add to list
          </button>
        </div>
      </form>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {characters.map((c) => {
          const id = String(c._id ?? c.id ?? Math.random().toString(36).slice(2, 9));
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

                <button
                  onClick={() => handleRemove(id)}
                  className="absolute left-3 top-3 h-8 w-8 rounded-full bg-red-600/80 text-white text-xs flex items-center justify-center hover:bg-red-500"
                  aria-label={`Remove ${name}`}
                  title={`Remove ${name}`}
                >
                  ×
                </button>
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
