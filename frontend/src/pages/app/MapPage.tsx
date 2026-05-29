export function MapPage() {
  const lat = 17.385
  const lon = 78.4867
  const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.02}%2C${lat - 0.02}%2C${lon + 0.02}%2C${lat + 0.02}&layer=mapnik&marker=${lat}%2C${lon}`

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Parking map</h1>
      <p className="text-sm text-zinc-400">OpenStreetMap — upgrade to React Leaflet clustering next.</p>
      <div className="h-[480px] overflow-hidden rounded-2xl border border-white/10">
        <iframe title="Parking map" src={embedUrl} className="h-full w-full border-0" loading="lazy" />
      </div>
    </div>
  )
}
