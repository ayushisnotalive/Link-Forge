import pg from 'pg';
const pool = new pg.Pool({ connectionString: 'postgresql://postgres:postgres@localhost:5432/linkforge' });
const res = await pool.query('SELECT id FROM short_links LIMIT 1');
if (res.rows.length > 0) {
  const linkId = res.rows[0].id;
  console.log("Found link ID:", linkId);
  const track = await fetch('http://localhost:8080/api/v1/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Internal-Secret': 'internal_secret' },
    body: JSON.stringify({ shortLinkId: linkId, ipAddress: '127.0.0.1', userAgent: 'test', deviceType: 'Desktop' })
  });
  console.log("Track status:", track.status);
} else {
  console.log("No links found");
}
process.exit(0);
