import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Load Firebase Config
  const firebaseConfigPath = path.join(__dirname, 'firebase-applet-config.json');
  const firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf8'));
  
  // Initialize Firebase on server
  const firebaseApp = initializeApp(firebaseConfig);
  const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  let vite: any;
  if (process.env.NODE_ENV !== 'production') {
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, { index: false }));
  }

  // Handle all other requests
  app.get('*all', async (req, res, next) => {
    const url = req.originalUrl;
    const productId = req.query.product as string;
    
    // Check if the path is /san-pham/:slug
    const productSlugMatch = url.match(/\/san-pham\/([a-zA-Z0-9_-]+)/);
    const productSlug = productSlugMatch ? productSlugMatch[1] : null;

    // Check if the path is /tin-cong-nghe/:slug
    const postSlugMatch = url.match(/\/tin-cong-nghe\/([a-zA-Z0-9_-]+)/);
    const postSlug = postSlugMatch ? postSlugMatch[1] : null;

    try {
      let templatePath = '';
      if (process.env.NODE_ENV !== 'production') {
        templatePath = path.resolve(__dirname, 'index.html');
      } else {
        templatePath = path.resolve(__dirname, 'dist', 'index.html');
      }

      let template = fs.readFileSync(templatePath, 'utf-8');

      if (process.env.NODE_ENV !== 'production') {
        template = await vite.transformIndexHtml(url, template);
      }

      // Default values
      let title = "ActiveNhanh - Dịch vụ số & Tài khoản cao cấp giá rẻ";
      let description = "ActiveNhanh cung cấp các loại tài khoản cao cấp: Youtube Premium, Netflix, Canva Pro, Windows, Office... giá rẻ, uy tín, bảo hành 1 đổi 1.";
      let image = "https://picsum.photos/seed/activenhanh/1200/630";

      // If product ID or Slug exists, try to fetch its data
      if (productId || productSlug) {
        try {
          let productData: any = null;
          
          if (productId) {
            const productRef = doc(db, 'products', productId);
            const productSnap = await getDoc(productRef);
            if (productSnap.exists()) {
              productData = productSnap.data();
            }
          } else if (productSlug) {
            const productsRef = collection(db, 'products');
            const q = query(productsRef, where('slug', '==', productSlug), limit(1));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
              productData = querySnapshot.docs[0].data();
            }
          }

          if (productData) {
            title = productData.seoTitle || `${productData.name} - ActiveNhanh`;
            description = productData.seoDescription || productData.description || description;
            image = productData.image || image;
            console.log(`Setting metadata for product: ${productData.name}`);
          }
        } catch (error) {
          console.error('Error fetching product for metadata:', error);
        }
      } else if (postSlug) {
        try {
          const postsRef = collection(db, 'posts');
          const q = query(postsRef, where('slug', '==', postSlug), limit(1));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const postData = querySnapshot.docs[0].data();
            title = postData.seoTitle || `${postData.title} - Tin Công Nghệ - ActiveNhanh`;
            description = postData.seoDescription || postData.excerpt || postData.content.substring(0, 160);
            image = postData.thumbnail || image;
            console.log(`Setting metadata for post: ${postData.title}`);
          }
        } catch (error) {
          console.error('Error fetching post for metadata:', error);
        }
      } else if (url === '/tin-cong-nghe') {
        title = "Tin Công Nghệ - ActiveNhanh";
        description = "Cập nhật những thông tin công nghệ mới nhất, thủ tục và mẹo sử dụng các dịch vụ số tại ActiveNhanh.";
      }


      // Replace placeholders
      const html = template
        .replace(/__OG_TITLE__/g, title)
        .replace(/__OG_DESCRIPTION__/g, description)
        .replace(/__OG_IMAGE__/g, image);

      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (e) {
      if (process.env.NODE_ENV !== 'production') {
        vite.ssrFixStacktrace(e as Error);
      }
      console.error(e);
      res.status(500).end((e as Error).message);
    }
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
