const fs = require('fs');
const https = require('https');
const path = require('path');

const targetDir = path.join('C:', 'Users', 'singh', 'Downloads', 'driveeasy-carrental', 'carrental', 'client', 'public', 'cars');

const images = [
  { name: 'maruti-swift', url: 'https://upload.wikimedia.org/wikipedia/commons/c/cf/2022_Maruti_Suzuki_Swift_GL_%28New_Zealand%29_front_view.jpg' },
  { name: 'toyota-innova-crysta', url: 'https://upload.wikimedia.org/wikipedia/commons/a/a3/2019_Toyota_Kijang_Innova_2.0_G_front_view.jpg' },
  { name: 'hyundai-creta', url: 'https://upload.wikimedia.org/wikipedia/commons/9/90/Hyundai_Creta_SU2_1.5_MPI_Premium_Ivory_White_%281%29.jpg' },
  { name: 'tata-nexon-ev', url: 'https://upload.wikimedia.org/wikipedia/commons/c/cf/Tata_Nexon_EV_Dark_Edition_1.jpg' },
  { name: 'bmw-5-series', url: 'https://upload.wikimedia.org/wikipedia/commons/2/23/BMW_G30_IMG_0167.jpg' },
  { name: 'mahindra-thar', url: 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Mahindra_Thar_2021.jpg' },
  { name: 'honda-city', url: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/2020_Honda_City_1.5_V_GN2_%2820210214%29.jpg' },
  { name: 'kia-seltos', url: 'https://upload.wikimedia.org/wikipedia/commons/7/77/Kia_Seltos_SP2_PE_1.5_MPI_Smart_White_%281%29.jpg' },
  { name: 'mercedes-c-class', url: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Mercedes-Benz_W206_IMG_6692.jpg' },
  { name: 'audi-a4', url: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Audi_A4_B9_Facelift_IMG_3515.jpg' },
  { name: 'maruti-baleno', url: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/2022_Suzuki_Baleno_GL_front.jpg' },
  { name: 'toyota-fortuner-legender', url: 'https://upload.wikimedia.org/wikipedia/commons/1/1c/2021_Toyota_Fortuner_2.4_VRZ_front_view_%28Indonesia%29.jpg' },
  { name: 'hyundai-verna', url: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Hyundai_Accent_1.6_GLS_2019.jpg' },
  { name: 'mahindra-scorpio-n', url: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/2022_Mahindra_Scorpio-N_Z8L_front_view.jpg' },
  { name: 'mg-hector-plus', url: 'https://upload.wikimedia.org/wikipedia/commons/8/87/2021_MG_Hector_Plus_Sharp_%28front%29.jpg' },
  { name: 'porsche-cayenne', url: 'https://upload.wikimedia.org/wikipedia/commons/8/88/Porsche_Cayenne_S_E-Hybrid_%2892A%2C_Facelift%29_%E2%80%93_Frontansicht%2C_18._Oktober_2015%2C_M%C3%BCnster.jpg' },
  { name: 'tata-punch-ev', url: 'https://upload.wikimedia.org/wikipedia/commons/6/6d/2021_Tata_Punch_Accomplish_front_view.jpg' },
  { name: 'range-rover-sport', url: 'https://upload.wikimedia.org/wikipedia/commons/7/75/Land_Rover_Range_Rover_Sport_%28L461%29_IMG_6802.jpg' },
  { name: 'honda-jazz', url: 'https://upload.wikimedia.org/wikipedia/commons/2/23/2020_Honda_Jazz_Crosstar_EX_1.5_Front.jpg' },
  { name: 'kia-carnival', url: 'https://upload.wikimedia.org/wikipedia/commons/a/a4/Kia_Carnival_KA4_PE_1.5_T-GDI_HEV_Signature_White_%281%29.jpg' },
];

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

async function downloadImage(url, name) {
  const filePath = path.join(targetDir, `${name}.jpg`);
  const file = fs.createWriteStream(filePath);
  
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36' } }, (response) => {
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
