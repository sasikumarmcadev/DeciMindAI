export async function POST() {
    return new Response(JSON.stringify({ error: "Not Found" }), { status: 404 });
}
