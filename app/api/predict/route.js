// app/api/ml-prediction/route.js
export async function GET() {
  try {
    const res = await fetch("https://b8f249d9f5ef.ngrok-free.app/predict", { cache: "no-store" });
    if (!res.ok) throw new Error("ML server error");

    const data = await res.json();
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
