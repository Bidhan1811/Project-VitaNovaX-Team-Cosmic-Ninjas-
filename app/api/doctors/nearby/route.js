// app/api/hospitals/route.js
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const lat = Number(searchParams.get("lat"));
  const lon = Number(searchParams.get("lon"));
  const radius = Number(searchParams.get("radius")) || 5000; // meters

  if (!lat || !lon) return new Response(JSON.stringify({ error: "Missing lat/lon" }), { status: 400 });

  const url = `https://nominatim.openstreetmap.org/search?format=json&amenity=hospital&limit=20&lat=${lat}&lon=${lon}&radius=${radius}`;

  const res = await fetch(url, { headers: { "User-Agent": "PulseSense/1.0" } });
  const data = await res.json();

  return Response.json({ hospitals: data });
}
