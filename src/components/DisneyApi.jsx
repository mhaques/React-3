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

const DEFAULT_FIELDS = ["name", "imageUrl", ...ARRAY_FIELDS, "url"];
const API_BASE = "https://api.disneyapi.dev/character";

const DisneyApi = () => {
  // Existing state
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState(
    () => DEFAULT_FIELDS.reduce((a, k) => ((a[k] = ""), a), {})
  );

  // New state for controls
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50); // Changed from 12 to 50
  const [sortMethod, setSortMethod] = useState("id");
  const [selectedFilm, setSelectedFilm] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const placeholder = "https://placehold.co/600x400/png?text=No+Image";

  // Fetch with pagination
  useEffect(() => {
    const fetchCharacters = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          pageSize: pageSize.toString(),
        });
        if (searchTerm) params.append("name", searchTerm);

        const res = await fetch(`${API_BASE}?${params}`);
        if (!res.ok) throw new Error("Network error");
        const json = await res.json();
        setCharacters(Array.isArray(json.data) ? json.data : []);
      } catch (err) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchCharacters();
  }, [page, pageSize, searchTerm]);

  // Get unique film list for dropdown
  const uniqueFilms = [
    "all",
    ...new Set(characters.flatMap((c) => (Array.isArray(c.films) ? c.films : []))),
  ].filter(Boolean);

  // Sort and filter characters
  const displayedCharacters = [...characters]
    .filter((c) => {
      if (selectedFilm === "all") return true;
      return Array.isArray(c.films) && c.films.includes(selectedFilm);
    })
    .sort((a, b) => {
      if (sortMethod === "name") {
        return (a.name || "").localeCompare(b.name || "");
      }
      return (Number(a._id) || 0) - (Number(b._id) || 0);
    });

  // Handlers
  const handleSort = (method) => {
    setSortMethod(method);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
  };

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newChar = {};

    // Convert form data to character object
    Object.keys(formData).forEach((k) => {
      const val = (formData[k] ?? "").trim();
      if (ARRAY_FIELDS.includes(k)) {
        newChar[k] = val.length
          ? val.split(",").map((s) => s.trim()).filter(Boolean)
          : [];
      } else {
        if (val !== "") newChar[k] = val;
      }
    });

    // Add required fields
    newChar._id = Math.max(...characters.map((c) => Number(c._id) || 0), 0) + 1;
    newChar.name = newChar.name || "Unknown";
    newChar.imageUrl = newChar.imageUrl || placeholder;

    // Add to list and reset form
    setCharacters((prev) => [newChar, ...prev]);
    setFormData(DEFAULT_FIELDS.reduce((a, k) => ({ ...a, [k]: "" }), {}));
  };

  // Add this with the other handlers (after handleSubmit)
  const handleRemove = (id) => {
    setCharacters(prev => prev.filter(character => 
      String(character._id ?? character.id) !== String(id)
    ));
  };

  // Also add this for the form fields
  const visibleFields = Object.keys(formData);

  // UI Components
  const Controls = () => (
    <div className="mb-8 space-y-4">
      {/* Main controls container - removed blue colors */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center bg-zinc-900/50 p-4 rounded-lg border border-zinc-700/50 backdrop-blur-sm">
        <form onSubmit={handleSearch} className="w-full md:flex-1">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search characters..."
              className="w-full px-3 py-2 text-[16px] min-h-[44px] bg-zinc-800 rounded-md border border-zinc-600 text-zinc-200 placeholder-zinc-400"
            />
            <button
              type="submit"
              className="px-4 py-3 min-h-[44px] text-[16px] bg-zinc-700 text-zinc-100 rounded-md"
            >
              Search
            </button>
          </div>
        </form>

        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={sortMethod}
            onChange={(e) => handleSort(e.target.value)}
            className="px-3 py-2 bg-zinc-800 rounded-md border border-zinc-600 text-zinc-200 hover:border-zinc-500 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-colors"
          >
            <option value="id">Sort by ID</option>
            <option value="name">Sort by Name</option>
          </select>

          <select
            value={selectedFilm}
            onChange={(e) => setSelectedFilm(e.target.value)}
            className="px-3 py-2 bg-zinc-800 rounded-md border border-zinc-600 text-zinc-200 hover:border-zinc-500 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-colors"
          >
            {uniqueFilms.map((film) => (
              <option key={film} value={film}>
                {film === "all" ? "All Films" : film}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Pagination controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-zinc-900/50 p-4 rounded-lg border border-zinc-700/50 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="px-3 py-2 text-[16px] min-h-[44px] bg-zinc-800 rounded-md border border-zinc-600 text-zinc-200"
          >
            {[12, 24, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size} per page
              </option>
            ))}
          </select>

          <span className="text-zinc-400 text-center sm:text-left">
            Page {page}
          </span>
        </div>

        {/* Fix pagination buttons to prevent zoom */}
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex-1 sm:flex-none px-4 py-2 text-[16px] min-h-[44px] bg-zinc-800 text-zinc-200 rounded-md border border-zinc-600 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => setPage((p) => p + 1)}
            className="flex-1 sm:flex-none px-4 py-2 text-[16px] min-h-[44px] bg-zinc-800 text-zinc-200 rounded-md border border-zinc-600"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );

  // Update the main return structure
  return (
    <div className="min-h-screen bg-[#242424] overflow-y-auto">
      <div className="min-h-full flex flex-col">
        <section className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-slate-100">Disney Characters</h1>
            <p className="mt-2 text-slate-400">
              Browse, filter and search the Disney character database
            </p>
          </header>

          <Controls />

          <div className="space-y-8 mb-8"> {/* Added bottom margin */}
            <form onSubmit={handleSubmit} className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {visibleFields.map((key) => {
                const isArray = ARRAY_FIELDS.includes(key);
                return (
                  <label key={key} className="flex flex-col text-[16px] text-slate-200">
                    <span className="mb-1 capitalize">
                      {key}
                      {isArray ? " (comma separated)" : ""}
                    </span>
                    <input
                      value={formData[key]}
                      onChange={(e) => handleChange(key, e.target.value)}
                      placeholder={isArray ? "e.g. Film A, Film B" : ""}
                      className="bg-gray-800/30 border border-gray-700/40 rounded px-3 py-2 text-[16px] min-h-[44px] text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </label>
                );
              })}

              <div className="flex items-end">
                <button 
                  type="submit" 
                  className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-700 text-white rounded text-[16px] min-h-[44px]"
                >
                  Add to list
                </button>
              </div>
            </form>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-slate-400">Loading characters...</div>
              </div>
            ) : error ? (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-red-400">
                {error}
              </div>
            ) : (
              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {displayedCharacters.map((c) => {
                  const id = String(c._id ?? c.id ?? Math.random().toString(36).slice(2, 9));
                  const name = (c.name || "Unknown").toString().trim();
                  const img = c.imageUrl || c.image || placeholder;
                  const films = Array.isArray(c.films) ? c.films.length : 0;
                  const tv = Array.isArray(c.tvShows) ? c.tvShows.length : 0;

                  return (
                    <article
                      key={id}
                      className="group relative overflow-hidden rounded-xl border border-zinc-700/50 bg-zinc-900/50 backdrop-blur-sm shadow-xl transition duration-300 ease-out hover:-translate-y-1 hover:shadow-zinc-500/10"
                    >
                      {/* Fixed height container with consistent aspect ratio */}
                      <div className="relative w-full pb-[75%]"> {/* 4:3 aspect ratio container */}
                        <div className="absolute inset-0 bg-zinc-800">
                          <img
                            src={img}
                            alt={name}
                            loading="lazy"
                            className="absolute inset-0 w-full h-full object-cover object-center"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = placeholder;
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60" />

                          <button
                            onClick={() => handleRemove(id)}
                            className="absolute left-3 top-3 h-8 w-8 rounded-full bg-red-500/90 text-white flex items-center justify-center touch-manipulation
                              [@media(hover:none)]:opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 
                              transition-opacity active:bg-red-600"
                            aria-label={`Remove ${name}`}
                          >
                            ×
                          </button>

                          <div className="absolute inset-x-3 bottom-3 text-white">
                            <h2 className="text-lg font-semibold leading-tight truncate">{name}</h2>
                            <div className="mt-1 flex items-center gap-2 text-xs text-zinc-200">
                              <span>🎬 {films} films</span>
                              {tv > 0 && <span>📺 {tv} shows</span>}
                            </div>
                          </div>
                        </div>
                      </div>

                      {c.url && (
                        <a
                          href={c.url}
                          target="_blank"
                          rel="noreferrer"
                          className="block p-3 text-xs text-zinc-400 hover:text-zinc-300 transition-colors"
                        >
                          View API Entry →
                        </a>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default DisneyApi;
