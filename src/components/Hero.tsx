import { ArrowRight, MessageCircle, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';

export default function Hero() {
  const fullText = "GIẢI PHÁP TỐI ƯU TRẢI NGHIỆM SỐ";
  const [displayText, setDisplayText] = useState("");

  const brandLogos = [
    { name: 'Netflix', url: 'https://img.icons8.com/color/512/netflix.png', top: '15%', left: '10%', size: 'h-12 w-12', delay: 0 },
    { name: 'Spotify', url: 'https://img.icons8.com/color/512/spotify--v1.png', top: '25%', right: '15%', size: 'h-14 w-14', delay: 0.5 },
    { name: 'YouTube', url: 'https://img.icons8.com/color/512/youtube-play.png', bottom: '20%', left: '15%', size: 'h-16 w-16', delay: 1 },
    { name: 'Windows', url: 'https://img.icons8.com/color/512/windows-10.png', top: '10%', right: '25%', size: 'h-10 w-10', delay: 1.5 },
    { name: 'Canva', url: 'https://img.icons8.com/color/512/canva.png', bottom: '15%', right: '10%', size: 'h-20 w-20', delay: 2 },
    { name: 'ChatGPT', url: 'https://img.icons8.com/fluency/512/chatgpt.png', top: '40%', left: '5%', size: 'h-14 w-14', delay: 2.5 },
    { name: 'Steam', url: 'https://img.icons8.com/color/512/steam.png', bottom: '40%', right: '5%', size: 'h-12 w-12', delay: 3 },
    { name: 'Discord', url: 'https://img.icons8.com/fluency/512/discord-logo.png', top: '60%', left: '10%', size: 'h-10 w-10', delay: 3.5 },
    { name: 'Duolingo', url: 'https://img.icons8.com/fluency/512/duolingo-logo.png', bottom: '10%', left: '30%', size: 'h-14 w-14', delay: 4 },
  ];

  useEffect(() => {
    let index = 0;
    let timeoutId: NodeJS.Timeout;

    const type = () => {
      if (index <= fullText.length) {
        setDisplayText(fullText.slice(0, index));
        index++;
        timeoutId = setTimeout(type, 100);
      } else {
        // Wait 5 seconds then reset
        timeoutId = setTimeout(() => {
          index = 0;
          type();
        }, 5000);
      }
    };

    type();
    return () => clearTimeout(timeoutId);
  }, []);

  const scrollToProducts = () => {
    const element = document.getElementById('products');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-white py-16 lg:py-24">
      {/* Brand Logos Decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        {brandLogos.map((logo, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ 
              opacity: [0.1, 0.4, 0.1],
              scale: [0.9, 1.1, 0.9],
              y: [0, -20, 0]
            }}
            transition={{ 
              duration: 5 + Math.random() * 5, 
              repeat: Infinity, 
              delay: logo.delay,
              ease: "easeInOut"
            }}
            style={{
              position: 'absolute',
              top: logo.top,
              left: logo.left,
              right: logo.right,
              bottom: logo.bottom,
            }}
            className={`${logo.size} hidden sm:block grayscale hover:grayscale-0 transition-all duration-500`}
          >
            <img 
              src={logo.url} 
              alt={logo.name} 
              className="h-full w-full object-contain"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        ))}
      </div>

      {/* TikTok-style background accents */}
      <div className="absolute -left-20 top-0 h-96 w-96 rounded-full bg-tiktok-cyan/10 blur-[80px]"></div>
      <div className="absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-tiktok-magenta/10 blur-[80px]"></div>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-brand-500/5 blur-[100px]"></div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-tiktok-cyan/30 bg-white/50 backdrop-blur-sm px-4 py-2"
          >
            <Zap className="h-4 w-4 text-tiktok-cyan animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-tiktok-black">SỐ 1 DỊCH VỤ PREMIUM TẠI VN</span>
          </motion.div>

          <h1 className="mb-6 w-full font-sans text-3xl font-black leading-[1.2] tracking-tight text-tiktok-black sm:text-5xl lg:text-6xl xl:text-7xl">
            <span className="inline-block whitespace-nowrap">
              {displayText}
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="inline-block w-1 h-[0.8em] bg-tiktok-cyan ml-1 align-middle"
              />
            </span>
            <br />
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="relative inline-block mt-4 text-xl sm:text-3xl lg:text-4xl whitespace-nowrap"
            >
              <span className="relative z-10">Chuyên nghiệp – Tận tâm – Đồng hành bền vững.</span>
              <div className="absolute -bottom-1 left-0 h-2 w-full bg-tiktok-cyan/30 -skew-x-12"></div>
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mb-10 max-w-2xl text-lg font-medium text-brand-500 sm:text-xl"
          >
            Dịch vụ hỗ trợ đăng ký & kích hoạt gói Premium chính chủ: Google, Microsoft, OpenAI, CapCut... 
            Giải pháp tiết kiệm tối ưu cho người dùng cá nhân và hộ kinh doanh.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <button 
              onClick={scrollToProducts}
              className="tiktok-button group flex items-center gap-2 px-10 py-4 text-base"
            >
              Khám phá
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
            <button 
              onClick={() => window.open('https://zalo.me/0778957345', '_blank')}
              className="flex items-center gap-2 rounded-sm border-2 border-tiktok-black bg-white px-10 py-4 text-base font-bold text-tiktok-black transition-all hover:bg-brand-50 active:scale-95"
            >
              <MessageCircle className="h-5 w-5 text-tiktok-cyan" />
              Tư vấn qua Zalo
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

