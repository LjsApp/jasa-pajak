const fetch = require('node-fetch');

async function check() {
  const apis = [
    { name: 'Gempa', url: 'https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json' },
    { name: 'Cuaca', url: 'https://api.open-meteo.com/v1/forecast?latitude=-6.2088&longitude=106.8456&current_weather=true' },
    { name: 'Kurs', url: 'https://api.exchangerate-api.com/v4/latest/USD' },
    { name: 'Emas', url: 'https://logam-mulia-api.vercel.app/prices/hargaemas-com' },
    { name: 'Yahoo IHSG', url: 'https://query1.finance.yahoo.com/v8/finance/chart/^JKSE' }
  ];

  for (let api of apis) {
    try {
      const res = await fetch(api.url);
      console.log(`[${api.name}] Status: ${res.status}`);
    } catch (e) {
      console.log(`[${api.name}] Error: ${e.message}`);
    }
  }
}
check();
