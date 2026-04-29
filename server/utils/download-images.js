const fs = require('fs');
const https = require('https');
const path = require('path');

const targetDir = path.join('C:', 'Users', 'singh', 'Downloads', 'driveeasy-carrental', 'carrental', 'client', 'public', 'cars');

const images = [
  { name: 'maruti-swift', url: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=1200&q=80' },
  { name: 'toyota-innova-crysta', url: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=1200&q=80' },
  { name: 'hyundai-creta', url: 'https://images.unsplash.com/photo-1541443131876-44b03de101c5?w=1200&q=80' },
  { name: 'tata-nexon-ev', url: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=1200&q=80' },
  { name: 'bmw-5-series', url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1200&q=80' },
  { name: 'mahindra-thar', url: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=1200&q=80' },
  { name: 'honda-city', url: 'https://images.unsplash.com/photo-1617469767053-d3b523a0b982?w=1200&q=80' },
  { name: 'kia-seltos', url: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1200&q=80' },
  { name: 'mercedes-c-class', url: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1200&q=80' },
  { name: 'audi-a4', url: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=1200&q=80' },
  { name: 'maruti-baleno', url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=80' },
  { name: 'toyota-fortuner-legender', url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1200&q=80' },
  { name: 'hyundai-verna', url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1200&q=80' },
  { name: 'mahindra-scorpio-n', url: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=1200&q=80' },
  { name: 'mg-hector-plus', url: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1200&q=80' },
  { name: 'porsche-cayenne', url: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=1200&q=80' },
  { name: 'tata-punch-ev', url: 'https://images.unsplash.com/photo-1571127236794-81c0bbfe1ce3?w=1200&q=80' },
  { name: 'range-rover-sport', url: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=1200&q=80' },
  { name: 'honda-jazz', url: 'https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=1200&q=80' },
  { name: 'kia-carnival', url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1200&q=80' },
];

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

async function downloadImage(url, name) {
  const filePath = path.join(targetDir, `${name}.jpg`);
  const file = fs.createWriteStream(filePath);
  
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${name}: ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`✅ Downloaded: ${name}.jpg`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {});
      reject(err);
    });
  });
}

async function run() {
  console.log('🚀 Starting downloads...');
  for (const img of images) {
    try {
      await downloadImage(img.url, img.name);
    } catch (err) {
      console.error(`❌ Error downloading ${img.name}:`, err.message);
    }
  }
  console.log('🎉 All downloads finished!');
}

run();
