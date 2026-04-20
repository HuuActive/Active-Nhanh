
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function checkProducts() {
  const firebaseConfigPath = path.join(__dirname, 'firebase-applet-config.json');
  const firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf8'));
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  console.log('Checking products in Firestore...');
  const productsRef = collection(db, 'products');
  const snapshot = await getDocs(productsRef);
  
  console.log(`Found ${snapshot.size} products.`);
  snapshot.forEach(doc => {
    const data = doc.data();
    console.log(`ID: ${doc.id} | Name: ${data.name} | Slug: ${data.slug}`);
  });

  const targetSlug = 'dich-vu-capcut-pro';
  const q = query(productsRef, where('slug', '==', targetSlug));
  const qSnap = await getDocs(q);
  console.log(`Searching for slug "${targetSlug}": ${qSnap.size} found.`);
}

checkProducts().catch(console.error);
