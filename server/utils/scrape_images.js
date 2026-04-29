const https = require('https');
const fs = require('fs');

async function searchImage(query) {
  return new Promise((resolve) => {
    https.get('https://html.duckduckgo.com/html/?q=' + encodeURIComponent(query + ' car exterior 1200'), {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const match = data.match(/src="\/\/external-content\.duckduckgo\.com\/iu\/\?u=([^&"]+)/);
        if (match) {
          resolve(decodeURIComponent(match[1]));
        } else {
          resolve(null);
        }
      });
    });
  });
}

async function run() {
  const cars = ['maruti swift', 'toyota innova crysta', 'hyundai creta', 'tata nexon ev', 'bmw 5 series', 'mahindra thar', 'honda city', 'kia seltos', 'mercedes c class', 'audi a4', 'maruti baleno', 'toyota fortuner legender', 'hyundai verna', 'mahindra scorpio n', 'mg hector plus', 'porsche cayenne', 'tata punch ev', 'range rover sport', 'honda jazz', 'kia carnival'];
  const results = [];
  for (let car of cars) {
    const url = await searchImage(car);
    results.push({ name: car.replace(/ /g, '-'), url });
    console.log(car, url);
  }
  fs.writeFileSync('found_images.json', JSON.stringify(results, null, 2));
}
run();
