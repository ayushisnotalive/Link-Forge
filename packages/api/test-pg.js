import pg from 'pg';
const pool = new pg.Pool({ 
  connectionString: 'postgresql://neondb_owner:npg_I4rvWLqjaGU2@ep-little-bread-ae6hm5ta-pooler.c-2.us-east-2.aws.neon.tech/neondb',
  ssl: true
});
pool.query('SELECT 1').then(res => { console.log('Connected with ssl: true!'); process.exit(0); }).catch(err => { console.error('Error:', err.message); process.exit(1); });
