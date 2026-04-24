import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  schema?: any;
}

export default function SEO({ 
  title = 'ActiveNhanh - Nâng cấp tài khoản số Premium uy tín', 
  description = 'ActiveNhanh chuyên cung cấp các dịch vụ nâng cấp tài khoản Premium giá rẻ: Youtube, Spotify, Canva, OpenAI, Windows, Office... Bảo hành uy tín 1 đổi 1.',
  keywords = 'nâng cấp tài khoản, account premium, giá rẻ, uy tín, youtube premium, spotify premium, canva pro, chatgpt plus',
  image = 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1200&h=630&auto=format&fit=crop',
  url = 'https://www.activenhanh.pro.vn/',
  type = 'website',
  schema 
}: SEOProps) {
  const siteName = 'ActiveNhanh';
  const fullTitle = title === siteName ? title : `${title} | ${siteName}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Schema.org JSON-LD */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}

      {/* Canonical Link */}
      <link rel="canonical" href={url} />
    </Helmet>
  );
}
