import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { Product } from '../types';
import Markdown from 'react-markdown';

interface AIChatbotProps {
  products: Product[];
}

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export default function AIChatbot({ products }: AIChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: 'Xin chào! Tôi là trợ lý AI của ActiveNhanh. Tôi có thể giúp gì cho bạn hôm nay?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Gemini AI
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    const newMessages = [...messages, { id: Date.now().toString(), role: 'user' as const, text: userMsg }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Create product context for the prompt
      const productContext = products.map(p => 
        `- Tên: ${p.name} | Giá: ${p.price.toLocaleString()}đ | Thể loại: ${p.category} | Mô tả ngắn: ${p.shortFeatures || p.description}`
      ).join('\n');

      const systemInstruction = `Bạn là nhân viên tư vấn khách hàng nhiệt tình và chuyên nghiệp của ActiveNhanh (chuyên cung cấp tài khoản YouTube Premium, Netflix, Canva Pro, v.v.).
Dưới đây là danh sách sản phẩm hiện tại của cửa hàng:
${productContext}

Quy tắc:
1. Chỉ tư vấn về các sản phẩm và dịch vụ có trong danh sách trên.
2. Nếu khách hàng hỏi về giá, luôn lịch sự báo giá rõ ràng kèm mô tả ưu điểm.
3. Nếu không chắc chắn, hãy khuyên khách hàng liên hệ trực tiếp Zalo của ActiveNhanh.
4. Trả lời ngắn gọn, thân thiện, dùng ngôn ngữ tự nhiên. Có thể xuống hàng và dùng emoji cho sinh động, thân thiện.
5. Không tạo ra sản phẩm ảo không có trong danh sách.
`;

      // Build chat prompt history for generateContent
      // Using generateContent instead of chats.create for finer control over system rules per request
      const formattedHistory = newMessages.map(msg => 
        `${msg.role === 'user' ? 'Khách hàng' : 'Bạn (AI)'}: ${msg.text}`
      ).join('\n');

      const prompt = `Lịch sử chat:\n${formattedHistory}\n\nBạn (AI):`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7
        }
      });

      const responseText = response.text || 'Xin lỗi, tôi không thể xử lý yêu cầu lúc này.';
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: responseText }]);

    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: 'Xin lỗi, đã có lỗi kết nối tới máy chủ AI. Bạn hãy thử lại sau nhé!' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        className="fixed bottom-6 right-6 z-50 p-4 bg-brand-500 text-white rounded-full shadow-[0_0_20px_rgba(0,0,0,0.2)] hover:bg-brand-600 transition-colors flex items-center justify-center group"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: isOpen ? 'none' : 'flex' }}
      >
        <MessageSquare className="w-6 h-6" />
        <span className="absolute right-full mr-4 bg-brand-900 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Cần tư vấn? Hỏi AI ngay
        </span>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-[90vw] sm:w-[380px] h-[500px] max-h-[85vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100"
          >
            {/* Header */}
            <div className="bg-brand-600 p-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">ActiveNhanh AI</h3>
                  <p className="text-[10px] text-white/80">Trả lời tức thì 24/7</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-4">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                    msg.role === 'user' 
                      ? 'bg-brand-500 text-white rounded-tr-sm' 
                      : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm'
                  }`}>
                    {msg.role === 'user' ? (
                       <p className="whitespace-pre-wrap">{msg.text}</p>
                    ) : (
                      <div className="markdown-body prose-sm">
                        <Markdown>{msg.text}</Markdown>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-brand-500 animate-spin" />
                    <span className="text-xs text-gray-400 font-medium">AI đang suy nghĩ...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-100 bg-white flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Hỏi AI về sản phẩm..."
                className="flex-1 px-4 py-2 bg-gray-100 rounded-full text-sm outline-none border border-transparent focus:border-brand-500 focus:bg-white transition-all"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="w-10 h-10 bg-brand-500 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4 -ml-0.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
