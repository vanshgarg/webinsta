/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import { 
  Globe, 
  Search, 
  Rocket, 
  BarChart as BarChartIcon, 
  Layout, 
  MessageSquare, 
  TrendingUp, 
  Check,
  Plus,
  Wrench,
  Eye,
  RefreshCw,
  Zap,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Send,
  X,
  Bot,
  User as UserIcon,
  Smile,
  Heart,
  Smartphone,
  Palette,
  Monitor,
  MousePointer2,
  Type,
  Image,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { GoogleGenAI } from "@google/genai";

// Firebase and Google Sheets Integrations
import { initAuth, googleSignIn, logout, getAccessToken } from './firebase';
import { initializeHeaders, appendLeadsToSheet } from './services/googleSheets';
import type { LeadData } from './services/googleSheets';

import AdminPortalModal from './components/AdminPortalModal';

// Additional icons for Admin Panel
import { 
  Lock, 
  FileSpreadsheet, 
  LogOut, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  Sparkles, 
  Database,
  ArrowRightLeft,
  Mail,
  ShoppingBag,
  Award,
  Utensils,
  Briefcase
} from 'lucide-react';

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const model = "gemini-3-flash-preview";

// Text Reveal Component
const RevealText = ({ text, delay = 0 }: { text: string, delay?: number }) => {
  return (
    <span style={{ display: 'inline' }}>
      {text.split(' ').map((word, i) => (
        <span key={i} style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom', paddingBottom: '0.1em', marginBottom: '-0.1em' }}>
          <motion.span
            initial={{ y: '100%' }}
            whileInView={{ y: 0 }}
            viewport={{ once: false }}
            transition={{ 
              duration: 0.8, 
              delay: delay + (i * 0.05),
              ease: [0.22, 1, 0.36, 1] 
            }}
            style={{ display: 'inline-block' }}
          >
            {word}&nbsp;
          </motion.span>
        </span>
      ))}
    </span>
  );
};

// Real-time animated chart component
const RealTimeChart = () => {
  const [data, setData] = useState(() => 
    Array.from({ length: 20 }, (_, i) => ({
      time: i,
      value: 400 + Math.random() * 200
    }))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setData(currentData => {
        const lastValue = currentData[currentData.length - 1].value;
        const newValue = Math.max(300, Math.min(900, lastValue + (Math.random() - 0.5) * 100));
        return [...currentData.slice(1), { time: Date.now(), value: newValue }];
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', perspective: '1000px', padding: 'var(--chart-p, 20px)' }}>
      <style>{`
        :root { --chart-p: 20px; }
        @media (max-width: 640px) { :root { --chart-p: 10px; } }
      `}</style>
      <motion.div 
        initial={{ rotateX: 20, rotateY: -10 }}
        animate={{ rotateX: [15, 20, 15], rotateY: [-10, -5, -10] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        style={{ width: '100%', height: '100%', transformStyle: 'preserve-3d' }}
      >
        <div style={{ 
          width: '100%', 
          height: '100%', 
          background: 'rgba(255,255,255,0.9)', 
          borderRadius: '20px', 
          boxShadow: '0 30px 60px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(0,0,0,0.05)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <p style={{ fontSize: '12px', fontWeight: 700, color: '#888', letterSpacing: '1px' }}>CONVERSIONS</p>
              <h4 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>Live Growth</h4>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981', fontWeight: 700 }}>
                <motion.span
                  animate={{ 
                    x: [0, 2, 0], 
                    y: [0, -2, 0] 
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  style={{ display: 'inline-flex' }}
                >
                  <TrendingUp size={16} />
                </motion.span>
                <span>+12.5%</span>
              </div>
              <p style={{ fontSize: '10px', color: '#888' }}>LAST 24H</p>
            </div>
          </div>
          <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="var(--accent)" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
            
            {/* Pulsing Dots for "Real-time" feel */}
            <motion.div 
               animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
               transition={{ duration: 2, repeat: Infinity }}
               style={{ position: 'absolute', top: '20%', right: '10%', width: '12px', height: '12px', background: 'var(--accent)', borderRadius: '50%', border: '4px solid white', boxShadow: '0 0 15px var(--accent)' }}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// 3D Visual for Partnership component
const Animated3DVisual = () => {
  return (
    <div style={{ width: '100%', height: '100%', perspective: '1200px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ position: 'relative', width: '100%', maxWidth: '280px', height: '200px', transformStyle: 'preserve-3d' }}>
        {/* Layer 1 - Background */}
        <motion.div 
          animate={{ rotateY: [-5, 5, -5], translateZ: [0, 10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          style={{ 
            position: 'absolute', 
            inset: 0, 
            background: 'var(--bg-card-alt)', 
            borderRadius: '24px', 
            boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
            zIndex: 1,
            border: '1px solid var(--border)'
          }}
        />
        
        {/* Layer 2 - Middle floating elements */}
        <motion.div 
          animate={{ translateZ: [40, 60, 40], x: [-10, 10, -10], y: [-5, 5, -5] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          style={{ 
            position: 'absolute', 
            top: '20px', 
            left: '20px',
            width: '140px',
            height: '90px',
            background: 'white', 
            borderRadius: '16px', 
            boxShadow: '0 15px 30px rgba(0,0,0,0.1)',
            zIndex: 2,
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            border: '1px solid rgba(0,0,0,0.03)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent-3)20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Globe size={12} color="var(--accent-3)" />
            </div>
            <div style={{ width: '60px', height: '6px', background: '#f0f0f0', borderRadius: '3px' }} />
          </div>
          <div style={{ width: '100%', height: '12px', background: 'var(--accent-2)15', borderRadius: '6px', position: 'relative', overflow: 'hidden' }}>
            <motion.div 
              animate={{ x: ['-100%', '100%'] }} 
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              style={{ position: 'absolute', top: 0, left: 0, width: '40%', height: '100%', background: 'var(--accent-2)' }} 
            />
          </div>
          <div style={{ width: '80%', height: '6px', background: '#f8f9fa', borderRadius: '3px' }} />
        </motion.div>

        {/* Layer 3 - Topmost visual element */}
        <motion.div 
          animate={{ translateZ: [80, 100, 80], rotateZ: [-2, 2, -2] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          style={{ 
            position: 'absolute', 
            bottom: '20px', 
            right: '-20px',
            width: '180px',
            background: 'white', 
            borderRadius: '20px', 
            boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
            zIndex: 3,
            padding: '20px',
            border: '1px solid rgba(0,0,0,0.02)'
          }}
        >
           <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-2)20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={16} color="var(--accent-2)" />
              </div>
              <span style={{ fontWeight: 800, fontSize: '20px', color: 'var(--accent-2)' }}>3x More Leads</span>
           </div>
           <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Proven strategy for growth</p>
        </motion.div>

        {/* Floating Accent Blobs */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
          style={{ 
            position: 'absolute', 
            top: '-40px', 
            right: '-40px', 
            width: '120px', 
            height: '120px', 
            background: 'var(--accent-glow)', 
            filter: 'blur(40px)', 
            borderRadius: '50%',
            zIndex: 0
          }}
        />
      </div>
    </div>
  );
};

const testimonialsList = [
  {
    name: "Ramesh Gupta",
    designation: "Owner",
    brand: "Gupta Electronics",
    location: "Delhi",
    quote: "I had no idea where to start with getting my business online. They understood exactly what I needed, explained everything clearly, and delivered a website I'm genuinely proud to share with my customers."
  },
  {
    name: "Sneha Iyer",
    designation: "Wellness Coach",
    brand: "InnerBalance",
    location: "Bangalore",
    quote: "As a coach just starting out, I needed a website that looked professional but didn't cost a fortune. What I got was beyond my expectations, and the strategy session before building it made all the difference."
  },
  {
    name: "Arif Khan",
    designation: "Retailer",
    brand: "Khan & Sons",
    location: "Mumbai",
    quote: "What I appreciated most was that I was talking to the same people building my site. No confusion, no delays. They even set up my Google listing and now I'm getting calls from people who found me online."
  },
  {
    name: "Ananya Sharma",
    designation: "Founder",
    brand: "The Jaipur Boutique",
    location: "Jaipur",
    quote: "The team at WebInsta understood my brand's aesthetic perfectly. My online sales have doubled since the new website went live. Their MBA-driven approach is a game-changer."
  },
  {
    name: "Vikram Singh",
    designation: "Lead Consultant",
    brand: "V-Tech Advisors",
    location: "Hyderabad",
    quote: "I needed a technical landing page that didn't feel robotic. They delivered a site that strikes the perfect balance between professional and approachable. Highly recommend their services."
  },
  {
    name: "Priya Reddy",
    designation: "Restaurateur",
    brand: "SpiceRoute",
    location: "Chennai",
    quote: "Marketing my restaurant used to be a struggle. WebInsta built an integrated reservation system that has simplified my operations and improved customer satisfaction significantly."
  }
];

export default function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // --- Leads & Google Sheets Integration States ---
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [leads, setLeads] = useState<LeadData[]>(() => {
    try {
      const saved = localStorage.getItem('devduo_leads');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [spreadsheetId, setSpreadsheetId] = useState<string>(() => localStorage.getItem('devduo_sheet_id') || '1OP_-L7qfANxSeE3MmP6CmR8WZ-8onBe3TEw0F1YMeOE');
  const [sheetUrl, setSheetUrl] = useState<string>(() => localStorage.getItem('devduo_sheet_url') || 'https://docs.google.com/spreadsheets/d/1OP_-L7qfANxSeE3MmP6CmR8WZ-8onBe3TEw0F1YMeOE');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isCreatingSheet, setIsCreatingSheet] = useState(false);
  const [adminError, setAdminError] = useState('');
  const [adminSuccess, setAdminSuccess] = useState('');
  const [manualSheetId, setManualSheetId] = useState('');

  // Contact Form Submission States
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState(false);

  // Controlled interactive contact form states
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formBusiness, setFormBusiness] = useState('');
  const [formBusinessType, setFormBusinessType] = useState('');
  const [formMessage, setFormMessage] = useState('');

  // Testimonial slider states
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  const [isTestimonialHovered, setIsTestimonialHovered] = useState(false);
  const [visibleSlides, setVisibleSlides] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setVisibleSlides(1);
      } else if (window.innerWidth < 1100) {
        setVisibleSlides(2);
      } else {
        setVisibleSlides(3);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const maxIndex = Math.max(0, testimonialsList.length - visibleSlides);
    if (currentTestimonialIndex > maxIndex) {
      setCurrentTestimonialIndex(maxIndex);
    }
  }, [visibleSlides, currentTestimonialIndex]);

  useEffect(() => {
    if (isTestimonialHovered) return;
    const interval = setInterval(() => {
      const maxIndex = Math.max(0, testimonialsList.length - visibleSlides);
      setCurrentTestimonialIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [isTestimonialHovered, visibleSlides]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Sync state observer
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setAdminUser(user);
        setAdminToken(token);
      },
      () => {
        setAdminUser(null);
        setAdminToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Sync actions
  const handleAdminAuth = async () => {
    setAdminError('');
    setAdminSuccess('');
    try {
      const res = await googleSignIn();
      if (res) {
        setAdminUser(res.user);
        setAdminToken(res.accessToken);
        setAdminSuccess('Successfully authenticated with Google!');
      }
    } catch (err: any) {
      console.error('Auth login error:', err);
      setAdminError('Google authentication failed. Please confirm the popup block status.');
    }
  };

  const handleAdminLogout = async () => {
    setAdminError('');
    setAdminSuccess('');
    try {
      await logout();
      setAdminUser(null);
      setAdminToken(null);
      setAdminSuccess('Logged out successfully.');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const handleInitializeSheetHeaders = async () => {
    const token = getAccessToken() || adminToken;
    if (!token) {
      setAdminError('Please connect your Google account first.');
      return;
    }

    setAdminError('');
    setAdminSuccess('');
    setIsCreatingSheet(true);

    try {
      const success = await initializeHeaders(token, spreadsheetId);
      if (success) {
        setAdminSuccess('Google Sheet headers initialized successfully!');
      } else {
        setAdminError('Failed to initialize sheets headers. Please verify your drive access.');
      }
    } catch (err: any) {
      if (err.message && err.message.includes('session has expired')) {
        setAdminUser(null);
        setAdminToken(null);
        setAdminError('Your Google session has expired. Please sign in again.');
      } else {
        console.error('Error initializing Google Sheet headers:', err);
        setAdminError(err.message || 'Initialization failed on Google Drive.');
      }
    } finally {
      setIsCreatingSheet(false);
    }
  };

  const handleLinkExistingSheet = () => {
    const cleanId = manualSheetId.trim();
    if (!cleanId) {
      setAdminError('Spreadsheet ID cannot be blank.');
      return;
    }
    setSpreadsheetId(cleanId);
    const url = `https://docs.google.com/spreadsheets/d/${cleanId}`;
    setSheetUrl(url);
    localStorage.setItem('devduo_sheet_id', cleanId);
    localStorage.setItem('devduo_sheet_url', url);
    setManualSheetId('');
    setAdminSuccess('Existing Google Sheet linked successfully!');
  };

  const handleSyncAllLeads = async () => {
    const token = getAccessToken() || adminToken;

    if (!token) {
      setAdminError('Please authenticate with Google first.');
      return;
    }

    setAdminError('');
    setAdminSuccess('');
    setIsSyncing(true);

    try {
      const unsyncedLeads = leads.filter(l => !l.synced);
      if (unsyncedLeads.length === 0) {
        setAdminSuccess('All leads are already fully synced.');
        return;
      }

      const successIds: string[] = [];
      let isExpired = false;

      for (const lead of unsyncedLeads) {
        try {
          const rowValues = [
            lead.submittedAt,
            lead.name,
            lead.email || 'N/A',
            lead.phone,
            lead.business || 'N/A',
            lead.businessType || 'N/A',
            lead.message || 'None'
          ];
          const success = await appendLeadsToSheet(token, rowValues, spreadsheetId);
          if (success) {
            successIds.push(lead.id);
          }
        } catch (itemErr: any) {
          if (itemErr.message && itemErr.message.includes('session has expired')) {
            isExpired = true;
            setAdminUser(null);
            setAdminToken(null);
            throw itemErr;
          }
          console.error(`Error syncing lead ${lead.id}:`, itemErr);
        }
      }
      
      const updatedLeads = leads.map(l => 
        successIds.includes(l.id) ? { ...l, synced: true } : l
      );
      setLeads(updatedLeads);
      localStorage.setItem('devduo_leads', JSON.stringify(updatedLeads));

      if (successIds.length === unsyncedLeads.length) {
        setAdminSuccess(`Successfully synced ${successIds.length} lead(s) to Google Sheets!`);
      } else if (successIds.length > 0) {
        setAdminSuccess(`Synced ${successIds.length} lead(s); ${unsyncedLeads.length - successIds.length} failed.`);
      } else {
        setAdminError('Failed to sync leads. Please check your network or credentials.');
      }
    } catch (err: any) {
      if (err.message && err.message.includes('session has expired')) {
        setAdminError('Your Google session has expired. Please log in again.');
      } else {
        console.error('Error syncing leads:', err);
        setAdminError(err.message || 'Leads sync failed.');
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteLead = (id: string) => {
    if (window.confirm('Are you sure you want to delete this lead from local tracking?')) {
      const updated = leads.filter(l => l.id !== id);
      setLeads(updated);
      localStorage.setItem('devduo_leads', JSON.stringify(updated));
      setAdminSuccess('Lead removed locally.');
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (leadSubmitting) return;

    setLeadSubmitting(true);
    setLeadSuccess(false);

    try {
      const emailVal = formEmail.trim() || 'N/A';
      const newLead: LeadData = {
        id: 'lead_' + Date.now(),
        name: formName.trim() || 'Anonymous',
        email: emailVal,
        phone: formPhone.trim(),
        business: formBusiness.trim() || 'N/A',
        businessType: formBusinessType || 'N/A',
        message: formMessage.trim() || 'None',
        submittedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        synced: false
      };

      // 1. Add locally
      const updatedLeads = [newLead, ...leads];
      setLeads(updatedLeads);
      localStorage.setItem('devduo_leads', JSON.stringify(updatedLeads));

      // 2. Auto sync if connected
      const token = getAccessToken() || adminToken;
      
      if (token) {
        try {
          const rowValues = [
            newLead.submittedAt,
            newLead.name,
            newLead.email,
            newLead.phone,
            newLead.business || 'N/A',
            newLead.businessType || 'N/A',
            newLead.message || 'None'
          ];
          const success = await appendLeadsToSheet(token, rowValues, spreadsheetId);
          if (success) {
            const syncedLeads = updatedLeads.map(l => l.id === newLead.id ? { ...l, synced: true } : l);
            setLeads(syncedLeads);
            localStorage.setItem('devduo_leads', JSON.stringify(syncedLeads));
          }
        } catch (sheetsErr: any) {
          if (sheetsErr.message && sheetsErr.message.includes('session has expired')) {
            setAdminUser(null);
            setAdminToken(null);
          }
          console.warn('Google Sheets append skipped due to auth issue. Captured locally for manually syncing.');
        }
      }

      setLeadSuccess(true);
      // Reset form fields
      setFormName('');
      setFormEmail('');
      setFormPhone('');
      setFormBusiness('');
      setFormBusinessType('');
      setFormMessage('');
    } catch (err) {
      console.error('Submission error:', err);
    } finally {
      setLeadSubmitting(false);
    }
  };

  // Chatbot State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'model', content: string }[]>([
    { role: 'model', content: "Hi! I'm your WebInsta AI assistant. How can I help you grow your business today?" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll Progress for parallax effects
  const { scrollYProgress } = useScroll();
  const smoothYProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const [isDisableParallax, setIsDisableParallax] = useState(false);

  useEffect(() => {
    const checkViewport = () => setIsDisableParallax(window.innerWidth < 1024);
    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  const heroY = useTransform(smoothYProgress, [0, 0.2], [0, isDisableParallax ? 0 : -100]);
  const scale = useTransform(smoothYProgress, [0, 0.2], [1, isDisableParallax ? 1 : 0.95]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isAiTyping) return;

    const userMsg = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsAiTyping(true);

    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: [
          ...chatMessages.map(m => ({ role: m.role, parts: [{ text: m.content }] })),
          { role: 'user', parts: [{ text: userMsg }] }
        ],
        config: {
          systemInstruction: "You are a human co-founder of WebInsta (either Vansh or Yash speaking in a professional, direct, business-first human voice). WebInsta is a strategy-first web development agency for Indian businesses founded by two MBA graduates. OBJECTIVE: Answer user inquiries regarding WebInsta's services and its unique MBA-driven approach. STYLE DIRECTIVES: 1. DO NOT sound like a generic AI or use assistant fill phrases (e.g., 'Sure!', 'Let me help you with that', 'As an assistant...'). Speak with real human business logic. 2. Present details in highly structured, logical, and numbered or bulleted formats. 3. Be concrete. Explain why we code websites in React from scratch rather than slow WordPress, and emphasize conversion rates, profit margins, and local SEO competitive mapping. 4. If asked about pricing or to speak live, guide them to contact the founders Vansh or Yash on WhatsApp at +91 9560870678."
        }
      });

      const aiText = response.text || "Sorry about that, my connection is a bit slow. Ask again or buzz us directly on WhatsApp!";
      setChatMessages(prev => [...prev, { role: 'model', content: aiText }]);
    } catch (error) {
      console.error("AI Error:", error);
      setChatMessages(prev => [...prev, { role: 'model', content: "Our team is currently optimizing systems. Connect with us directly at hello@webinsta.in!" }]);
    } finally {
      setIsAiTyping(false);
    }
  };

  const handleQuickOptionClick = async (optionText: string) => {
    if (isAiTyping) return;

    // Standardize user's selection content
    const normalizedOption = optionText.trim();
    setChatMessages(prev => [...prev, { role: 'user', content: normalizedOption }]);
    setIsAiTyping(true);

    // Provide a beautiful, pre-written high-fidelity logical answer with quick delay
    setTimeout(() => {
      let reply = "";
      const lower = normalizedOption.toLowerCase();

      if (lower.includes("mba") || lower.includes("approach")) {
        reply = `We aren't just developers who write lines of code; we are business builders.

Most agencies focus entirely on aesthetic elements, completely ignoring your economics. Because we are MBAs, we map your:
• Customer Acquisition Cost (CAC)
• Dynamic conversion loops & landing retention
• Competitor gaps (local SEO discovery)
• High-converting copywriting hooks

A stunning page is entirely useless if it doesn't turn real visitors into cash flow. We build WebInsta machines specifically to scale your revenue.`;
      } else if (lower.includes("service") || lower.includes("timeline")) {
        reply = `WebInsta designs clean, custom, strategy-first platforms for local businesses, shops, medical practices, agencies, and creators.

Our timeline is 100% structured:
• Strategy Mapping (1-2 Days): Full local analysis of competitor flaws.
• High-Performance Landing Pages (7 Days): Setup for bulletproof lead capture.
• Complete Modern Business Ecosystem (14 Days): SEO audit, Google maps sync, and automated lead capture.

We code in pure React & Vite—no heavy builders like WordPress or Elementor, guaranteeing blazing speed and top SEO placement.`;
      } else if (lower.includes("pricing") || lower.includes("roi") || lower.includes("price")) {
        reply = `We believe in absolute transparency—flat-rate fixed pricing with zero ongoing retainers or surprise hourly charges.

Our packages include:
• Conversion Landing Page: ₹15,000 (Ready in 7 days, lifetime cheap/free hosting, optimized speed).
• Full Business Suite: ₹45,000 (Multi-page React build, custom SEO mapping, dynamic database integration for leads).

Most independent businesses recover their full initial investment within 60 days via direct organic lead acquisition!`;
      } else {
        reply = `Let's make this simple. You can consult directly with our co-founders for free:

• Chat instantly on WhatsApp: +91 9560870678
• Drop a quick email: hello@webinsta.in

We will do a free 30-minute lookup of your current competitors and outline exactly how to double your current web bookings.`;
      }

      setChatMessages(prev => [...prev, { role: 'model', content: reply }]);
      setIsAiTyping(false);
    }, 600);
  };

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('state-visible');
          } else {
            entry.target.classList.remove('state-visible');
          }
        });
      },
      { threshold: 0.12 }
    );

    document.querySelectorAll('.fade-up').forEach((el) => observer.observe(el));

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 60);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Counter animation logic
  const Counter = ({ target, suffix = "" }: { target: number, suffix?: string }) => {
    const [count, setCount] = useState(0);
    const countRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
      let animationFrame: number;
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            let start = 0;
            const end = target;
            const duration = 2000;
            let startTime: number | null = null;

            const animate = (currentTime: number) => {
              if (!startTime) startTime = currentTime;
              const progress = Math.min((currentTime - startTime) / duration, 1);
              setCount(Math.floor(progress * end));
              if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
              }
            };
            animationFrame = requestAnimationFrame(animate);
          } else {
            setCount(0); // Reset when leaving view
          }
        },
        { threshold: 0.5 }
      );

      if (countRef.current) observer.observe(countRef.current);
      return () => {
        observer.disconnect();
        if (animationFrame) cancelAnimationFrame(animationFrame);
      };
    }, [target]);

    return <span ref={countRef}>{count}{suffix}</span>;
  };

  const faqs = [
    {
      q: "I'm not very technical; will I be able to manage my website after it's built?",
      a: "Absolutely. We make sure you're comfortable with your website before we hand it over. We also provide a simple walkthrough so you can make basic updates yourself, with no technical knowledge needed."
    },
    {
      q: "How long does it take to build a website?",
      a: "Typically 2 to 4 weeks from our first conversation to launch. It depends on the complexity of the site and how quickly we can get content and inputs from your side. We always give you a clear timeline upfront."
    },
    {
      q: "Do I need to have everything ready before I contact you?",
      a: "Not at all. Most of our clients come to us with just an idea. That's exactly what our discovery session is for, as we figure it out together."
    }
  ];

  return (
    <>
      <AnimatePresence>
        {isPageLoading && (
          <motion.div
            key="global-loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            style={{
              position: 'fixed',
              inset: 0,
              background: '#0a0a0c',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 99999,
              overflow: 'hidden'
            }}
          >
            {/* Ambient glowing background blur */}
            <div style={{
              position: 'absolute',
              width: '400px',
              height: '400px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(124, 58, 237, 0.1) 0%, transparent 70%)',
              filter: 'blur(50px)',
              top: '15%',
              left: '10%'
            }} />
            <div style={{
              position: 'absolute',
              width: '400px',
              height: '400px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(251, 146, 60, 0.08) 0%, transparent 70%)',
              filter: 'blur(50px)',
              bottom: '15%',
              right: '10%'
            }} />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative',
                zIndex: 10
              }}
            >
              <div style={{ position: 'relative', marginBottom: '28px' }}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
                  style={{
                    width: '84px',
                    height: '84px',
                    borderRadius: '50%',
                    border: '3px solid transparent',
                    borderTopColor: 'var(--accent)',
                    borderRightColor: 'var(--accent-2)',
                    boxShadow: '0 0 30px rgba(124, 58, 237, 0.15)'
                  }}
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg viewBox="0 0 100 100" style={{ width: '38px', height: '38px' }}>
                    <defs>
                      <linearGradient id="logo-grid-grad-loader" x1="0%" y1="100%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#7C3AED" />
                        <stop offset="40%" stopColor="#C084FC" />
                        <stop offset="70%" stopColor="#FF7E40" />
                        <stop offset="100%" stopColor="#FF5722" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 18 40 C 18 40, 32 75, 42 75 C 48 75, 50 48, 55 48 C 60 48, 62 75, 68 75 C 75 75, 84 45, 84 45"
                      fill="none"
                      stroke="url(#logo-grid-grad-loader)"
                      strokeWidth="13"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="83" cy="20" r="9" fill="url(#logo-grid-grad-loader)" />
                  </svg>
                </div>
              </div>

              <h2 style={{
                color: '#ffffff',
                fontSize: '19px',
                fontWeight: 600,
                letterSpacing: '0.5px',
                marginBottom: '6px',
                textAlign: 'center',
                fontFamily: 'var(--font-sans)'
              }}>
                WebInsta Strategy Hub
              </h2>
              <p style={{
                color: 'rgba(255, 255, 255, 0.45)',
                fontSize: '11px',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-mono)',
                marginBottom: '36px'
              }}>
                Analyzing & Crafting Growth Engine
              </p>

              <div style={{
                width: '180px',
                height: '2px',
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '999px',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <motion.div
                  initial={{ left: '-100%' }}
                  animate={{ left: '100%' }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                  style={{
                    position: 'absolute',
                    width: '100px',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, var(--accent), var(--accent-2), transparent)'
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="app-wrapper">
      {/* Navigation */}
      <nav className={isScrolled ? 'scrolled' : ''}>
        <div className="container nav-container">
          <a href="#hero" className="logo">
            <svg viewBox="0 0 100 100" style={{ width: '32px', height: '32px', display: 'inline-block', verticalAlign: 'middle' }}>
              <defs>
                <linearGradient id="logo-grid-grad" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#7C3AED" />
                  <stop offset="40%" stopColor="#C084FC" />
                  <stop offset="70%" stopColor="#FF7E40" />
                  <stop offset="100%" stopColor="#FF5722" />
                </linearGradient>
              </defs>
              <path
                d="M 18 40 C 18 40, 32 75, 42 75 C 48 75, 50 48, 55 48 C 60 48, 62 75, 68 75 C 75 75, 84 45, 84 45"
                fill="none"
                stroke="url(#logo-grid-grad)"
                strokeWidth="13"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="83" cy="20" r="9" fill="url(#logo-grid-grad)" />
            </svg>
            <span className="logo-brand-text">WebInsta</span>
          </a>
          <div className="nav-links">
            <a href="#hero">Home</a>
            <a href="#benefits">About</a>
            <a href="#features">Services</a>
            <a href="#work">Work</a>
            <a href="#contact">Contact</a>
          </div>
          <a href="#contact" className="nav-cta">Get Started</a>
          <button className="hamburger" onClick={() => setIsMobileMenuOpen(true)}>
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        <button className="close-menu" onClick={() => setIsMobileMenuOpen(false)}>&times;</button>
        <div className="mobile-links">
          <a href="#hero" onClick={() => setIsMobileMenuOpen(false)}>Home</a>
          <a href="#benefits" onClick={() => setIsMobileMenuOpen(false)}>About</a>
          <a href="#features" onClick={() => setIsMobileMenuOpen(false)}>Services</a>
          <a href="#work" onClick={() => setIsMobileMenuOpen(false)}>Work</a>
          <a href="#contact" onClick={() => setIsMobileMenuOpen(false)}>Contact</a>
        </div>
      </div>

      <main>
        {/* Hero Section */}
        <section id="hero" className="hero">
          <div className="hero-glow"></div>
          <div className="container hero-content">
            <div className="hero-layout">
              <div className="hero-text-side">
                <div className="social-proof fade-up">
                  <div className="avatar-stack">
                    <img 
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&auto=format&q=80" 
                      srcSet="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&auto=format&q=80 1x, https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&h=128&fit=crop&auto=format&q=80 2x"
                      alt="User" 
                      loading="lazy"
                    />
                    <img 
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&auto=format&q=80" 
                      srcSet="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&auto=format&q=80 1x, https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&h=128&fit=crop&auto=format&q=80 2x"
                      alt="User" 
                      loading="lazy"
                    />
                    <img 
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop&auto=format&q=80" 
                      srcSet="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop&auto=format&q=80 1x, https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&h=128&fit=crop&auto=format&q=80 2x"
                      alt="User" 
                      loading="lazy"
                    />
                    <img 
                      src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=64&h=64&fit=crop&auto=format&q=80" 
                      srcSet="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=64&h=64&fit=crop&auto=format&q=80 1x, https://images.unsplash.com/photo-1517841905240-472988babdf9?w=128&h=128&fit=crop&auto=format&q=80 2x"
                      alt="User" 
                      loading="lazy"
                    />
                    <div className="avatar-more">80+</div>
                  </div>
                  <div className="proof-text">
                    <div className="stars-mini">★★★★★ <span style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 500 }}>4.5+</span></div>
                    <p>1,000+ Businesses Growing</p>
                  </div>
                </div>
                
                <motion.h1 
                  className="hero-headline" 
                  style={{ transitionDelay: '0.1s' }}
                >
                  <RevealText text="Built by MBAs. Designed for Business." />
                </motion.h1>
                
                <motion.p 
                  className="subtext hero-subheadline"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  Most websites just exist. Ours are built with a business strategy behind every page, crafted by two MBA grads who understand what makes customers click, trust, and buy. We specialise in websites for Indian businesses and personal brands who are serious about growing online.
                </motion.p>
                
                <motion.div 
                  className="cta-row"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 100, 
                    delay: 0.8 
                  }}
                >
                  <a href="#work" className="btn-gradient">
                    See Our Work <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                  </a>
                  <a href="#contact" className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', border: '1px solid var(--border)', padding: '14px 28px', borderRadius: '12px', fontWeight: 600 }}>
                    Free Consultation
                  </a>
                </motion.div>
                
                <div className="fade-up hero-badge-india">
                  🇮🇳 Built for Indian businesses
                </div>
              </div>

              <div className="hero-visual-side">
                <motion.div 
                  className="hero-image-container"
                  initial={{ opacity: 0, y: 100, rotateX: 15 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  style={{ y: heroY, scale }}
                >
                  <div className="hero-mockup-wrapper">
                    {/* Main Phone Mockup */}
                    <div className="hero-iphone">
                      <div className="iphone-inner">
                        <div className="iphone-notch"></div>
                        <div className="iphone-content" style={{ 
                          padding: '0', 
                          display: 'flex', 
                          flexDirection: 'column', 
                          background: '#fff',
                          overflowY: 'auto',
                          scrollbarWidth: 'none',
                          msOverflowStyle: 'none'
                        }}>
                          {/* Mini-site Sticky Header */}
                          <div style={{ 
                            position: 'sticky', 
                            top: 0, 
                            zIndex: 100, 
                            background: 'rgba(255,255,255,0.95)', 
                            backdropFilter: 'blur(10px)',
                            padding: '45px 20px 15px', 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            borderBottom: '1px solid rgba(0,0,0,0.05)'
                          }}>
                             <div style={{ fontWeight: 900, fontSize: '14px', letterSpacing: '-0.5px', color: '#1a1a1a' }}>
                               BLOOM<span style={{ color: '#4d7c0f' }}>.</span>
                             </div>
                             <div style={{ display: 'flex', gap: '15px' }}>
                               <Search size={16} color="#444" />
                               <div style={{ position: 'relative' }}>
                                 <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '8px', height: '8px', background: '#4d7c0f', borderRadius: '50%' }}></div>
                                 <Zap size={16} color="#444" />
                               </div>
                             </div>
                          </div>

                          {/* Mini-site Pages content */}
                          <div style={{ flex: 1 }}>
                            {/* Hero Section */}
                            <section style={{ padding: '30px 20px', background: '#f8faf4' }}>
                               <motion.div
                                 initial={{ opacity: 0, y: 20 }}
                                 whileInView={{ opacity: 1, y: 0 }}
                                 transition={{ duration: 0.6 }}
                               >
                                 <span style={{ fontSize: '9px', fontWeight: 800, color: '#4d7c0f', textTransform: 'uppercase', letterSpacing: '1px' }}>New Arrival</span>
                                 <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#1a1a1a', lineHeight: 1.1, margin: '8px 0 15px', letterSpacing: '-1px' }}>
                                   The Glow <br />Serum 1.0
                                 </h1>
                                 <div style={{ 
                                   width: '100%', 
                                   height: '240px', 
                                   borderRadius: '24px', 
                                   overflow: 'hidden', 
                                   position: 'relative',
                                   boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                                 }}>
                                    <img 
                                      src="https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400&h=600&fit=crop" 
                                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                      alt="Serum" 
                                    />
                                    <motion.div 
                                      style={{ position: 'absolute', bottom: '15px', left: '15px', background: '#fff', padding: '10px 18px', borderRadius: '12px', fontSize: '11px', fontWeight: 800 }}
                                      whileHover={{ scale: 1.05 }}
                                    >
                                      SHOP NOW
                                    </motion.div>
                                 </div>
                                 <motion.div 
                                   animate={{ y: [0, 5, 0] }}
                                   transition={{ duration: 2, repeat: Infinity }}
                                   style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', opacity: 0.5 }}
                                 >
                                   <div style={{ width: '1px', height: '30px', background: '#000' }}></div>
                                 </motion.div>
                               </motion.div>
                            </section>

                            {/* Info Tiles */}
                            <section style={{ padding: '0 20px', display: 'flex', gap: '10px' }}>
                               <div style={{ flex: 1, background: '#f0f2ea', padding: '20px', borderRadius: '20px' }}>
                                  <div style={{ fontSize: '16px', fontWeight: 900 }}>100%</div>
                                  <div style={{ fontSize: '9px', fontWeight: 700, color: '#666' }}>NATURAL</div>
                               </div>
                               <div style={{ flex: 1, background: '#fcf4f4', padding: '20px', borderRadius: '20px' }}>
                                  <div style={{ fontSize: '16px', fontWeight: 900 }}>4.9/5</div>
                                  <div style={{ fontSize: '9px', fontWeight: 700, color: '#666' }}>RATING</div>
                               </div>
                            </section>

                            {/* Featured Grid */}
                            <section style={{ padding: '40px 20px' }}>
                               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
                                  <h3 style={{ fontSize: '16px', fontWeight: 800 }}>Bestsellers</h3>
                                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#666', borderBottom: '1px solid #ccc' }}>View All</span>
                               </div>
                               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                                  {[
                                    { name: "Dewy Mist", price: "₹899", img: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=200&h=200&fit=crop" },
                                    { name: "Night Balm", price: "₹1,249", img: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=200&h=200&fit=crop" }
                                  ].map((p, i) => (
                                    <motion.div 
                                      key={i}
                                      initial={{ opacity: 0, scale: 0.9 }}
                                      whileInView={{ opacity: 1, scale: 1 }}
                                      transition={{ delay: i * 0.1 }}
                                    >
                                       <div style={{ width: '100%', aspectRatio: '1', borderRadius: '18px', overflow: 'hidden', marginBottom: '10px' }}>
                                          <img src={p.img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={p.name} />
                                       </div>
                                       <h4 style={{ fontSize: '12px', fontWeight: 700, margin: 0 }}>{p.name}</h4>
                                       <p style={{ fontSize: '11px', color: '#666', margin: '2px 0' }}>{p.price}</p>
                                    </motion.div>
                                  ))}
                               </div>
                            </section>

                            {/* "Why Bloom" Section */}
                            <section style={{ padding: '0 20px 40px' }}>
                               <div style={{ background: '#111', borderRadius: '24px', padding: '30px 20px', color: '#fff' }}>
                                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px' }}>
                                     <Smile size={20} color="#fff" />
                                  </div>
                                  <h3 style={{ fontSize: '18px', fontWeight: 800, lineHeight: 1.3 }}>Sustainable Beauty, <br />Back to the Roots.</h3>
                                  <p style={{ fontSize: '11px', opacity: 0.6, marginTop: '8px', lineHeight: 1.5 }}>Our botanicals are ethically sourced and bottled in recycled glass.</p>
                                  <div style={{ marginTop: '20px', display: 'flex', gap: '8px', opacity: 0.4 }}>
                                     <div style={{ fontSize: '20px', fontWeight: 900 }}>VEGAN.</div>
                                  </div>
                               </div>
                            </section>

                            {/* Footer */}
                            <footer style={{ padding: '20px', borderTop: '1px solid #eee', textAlign: 'center' }}>
                               <div style={{ fontSize: '10px', color: '#999', letterSpacing: '2px', textTransform: 'uppercase' }}>Bloom & Bold © 2024</div>
                               <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '10px' }}>
                                  <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#eee' }}></div>
                                  <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#eee' }}></div>
                                  <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#eee' }}></div>
                               </div>
                            </footer>
                          </div>
                        </div>
                      </div>
                    </div>

                     {/* Floating Notifications */}
                     <motion.div 
                        className="ui-element-floating ui-notif-likes"
                        style={{ 
                          position: 'absolute', 
                          background: 'white',
                          padding: '10px 16px',
                          borderRadius: '20px',
                          boxShadow: '0 15px 35px rgba(0,0,0,0.08)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          zIndex: 20
                        }}
                        initial={{ opacity: 0, scale: 0.8, x: 20 }}
                        animate={{ opacity: 1, scale: 1, x: 0, y: [0, 10, 0] }}
                        transition={{ 
                          opacity: { duration: 0.5, delay: 1.5 },
                          scale: { duration: 0.5, delay: 1.5 },
                          y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                        }}
                      >
                         <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#ff4d4d', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                            <Heart size={16} fill="white" />
                         </div>
                         <div>
                            <p style={{ fontSize: '13px', fontWeight: 800, margin: 0, color: '#000' }}>2.4k</p>
                            <p style={{ fontSize: '9px', color: '#666', margin: 0 }}>New Likes</p>
                         </div>
                      </motion.div>

                      <motion.div 
                        className="ui-element-floating ui-notif-strategy"
                        style={{ 
                          position: 'absolute', 
                          background: 'white',
                          padding: '10px 16px',
                          borderRadius: '20px',
                          boxShadow: '0 15px 35px rgba(0,0,0,0.08)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          zIndex: 20
                        }}
                        initial={{ opacity: 0, scale: 0.8, x: -20 }}
                        animate={{ opacity: 1, scale: 1, x: 0, y: [0, -10, 0] }}
                        transition={{ 
                          opacity: { duration: 0.5, delay: 1.8 },
                          scale: { duration: 0.5, delay: 1.8 },
                          y: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }
                        }}
                      >
                         <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                            <Zap size={16} fill="white" />
                         </div>
                         <div>
                            <p style={{ fontSize: '13px', fontWeight: 800, margin: 0, color: '#000' }}>Live</p>
                            <p style={{ fontSize: '9px', color: '#666', margin: 0 }}>Strategy Session</p>
                         </div>
                      </motion.div>

                    {/* Floating Floating UI Elements */}

                    <motion.div 
                      className="floating-ui-card ui-chart"
                      animate={{ y: [0, 12, 0] }}
                      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                    >
                       <div className="ui-chart-header">
                        <TrendingUp size={14} color="var(--accent-2)" />
                        <span>Engagement</span>
                      </div>
                      <div className="ui-chart-bars">
                        {[40, 70, 50, 90].map((h, i) => (
                          <div key={i} className="ui-bar" style={{ height: `${h}%` }}></div>
                        ))}
                      </div>
                    </motion.div>

                    <motion.div 
                      className="floating-ui-card ui-indicator"
                      animate={{ scale: [1, 1.05, 1], rotate: [2, -2, 2] }}
                      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    >
                       <div className="ui-indicator-dot"></div>
                      <span>Brand Live</span>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

          <div className="marquee-container">
            <p className="marquee-label">Trusted by Businesses Across India</p>
            <div className="marquee-content">
              {['Retailers', 'Personal Brands', 'Coaches', 'Restaurants', 'Home Services', 'Consultants', 'Clinics', 'Studios'].map((name, i) => (
                <span key={i} className="marquee-item" style={{ color: 'var(--text-muted)', opacity: 0.6, fontSize: '20px' }}>{name}</span>
              ))}
              {['Retailers', 'Personal Brands', 'Coaches', 'Restaurants', 'Home Services', 'Consultants', 'Clinics', 'Studios'].map((name, i) => (
                <span key={i + 10} className="marquee-item" style={{ color: 'var(--text-muted)', opacity: 0.6, fontSize: '20px' }}>{name}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section Replica */}
        <motion.section 
          id="benefits" 
          className="section-padding" 
          style={{ background: 'var(--bg-card)', position: 'relative' }}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="container" style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ textAlign: 'left', marginBottom: 'clamp(32px, 5vw, 40px)' }}>
              <div className="tag fade-up">
                The world is moving online. Is your business?
              </div>
              <h2 style={{ fontSize: 'clamp(28px, 5vw, 64px)', fontWeight: 500, color: '#111', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '20px' }}>
                <RevealText text="Your customers are online. Your business should be too." />
              </h2>
              <motion.p 
                className="subtext" 
                style={{ maxWidth: '800px', fontSize: '18px', color: '#666', lineHeight: 1.6, margin: '20px 0 0' }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                The way people discover, trust, and choose a business has changed. If you're not online, you're invisible to an entire generation of customers who are ready to buy.
              </motion.p>
            </div>

            <div className="benefits-replica">
              {/* Left Column with staggered slide-in */}
              <div className="feature-col">
                <motion.div 
                  className="benefit-card-replica"
                  initial={{ opacity: 0, x: -50, rotateY: 15 }}
                  whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
                  viewport={{ once: false, amount: 0.2 }}
                  transition={{ duration: 0.8, delay: 0.1, type: "spring", damping: 15 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                >
                  <div className="bcr-icon" style={{ background: 'var(--accent)10' }}>
                    <Search size={24} color="var(--accent)" />
                  </div>
                  <h3 className="bcr-title">People search before they visit</h3>
                  <p className="bcr-text">
                    Before anyone walks through your door, they Google you first. If nothing shows up or nothing professional, they move on.
                  </p>
                </motion.div>
                <motion.div 
                  className="benefit-card-replica"
                  initial={{ opacity: 0, x: -50, rotateY: 15 }}
                  whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
                  viewport={{ once: false, amount: 0.2 }}
                  transition={{ duration: 0.8, delay: 0.3, type: "spring", damping: 15 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                >
                  <div className="bcr-icon" style={{ background: 'var(--accent-2)10' }}>
                    <UserIcon size={24} color="var(--accent-2)" />
                  </div>
                  <h3 className="bcr-title">Your own website, your own customers</h3>
                  <p className="bcr-text">
                    Depending on someone else's platform means playing by their rules. Your own website means your brand, pricing, and story are fully in your control.
                  </p>
                </motion.div>
              </div>

              {/* Center Phone with floating animation */}
              <motion.div 
                className="phone-central-wrapper"
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 1, type: "spring", damping: 20 }}
              >
                <div className="benefits-bg-glow" />
                <motion.div 
                  className="phone-central"
                  animate={{ 
                    y: [0, -15, 0],
                    rotateZ: [0, 1, 0, -1, 0]
                  }}
                  transition={{ 
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <div className="phone-central-inner">
                    <div className="dynamic-island"></div>
                    <div className="phone-replica-content">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 800 }}>9:41</span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <BarChartIcon size={14} /> <Globe size={14} />
                        </div>
                      </div>
                      
                      <div className="replica-profile">
                        <img 
                          src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=96&h=96&fit=crop&auto=format&q=80" 
                          srcSet="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=48&h=48&fit=crop&auto=format&q=80 48w, https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=96&h=96&fit=crop&auto=format&q=80 96w, https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=144&h=144&fit=crop&auto=format&q=80 144w"
                          sizes="48px"
                          alt="WebInsta" 
                          className="replica-avatar" 
                        />
                        <div>
                          <p style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>Analytics Pro</p>
                          <p style={{ fontSize: '10px', color: '#666', margin: 0 }}>₹42,850.00 <span style={{ color: '#10b981' }}>↗ 12.4%</span></p>
                        </div>
                        <div style={{ marginLeft: 'auto', width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent)20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Zap size={16} color="var(--accent)" />
                        </div>
                      </div>

                      <h4 className="replica-qt-title">Active Projects</h4>
                      <div className="replica-contacts">
                        {[
                          { name: "Brand ID", icon: <Globe size={18} />, color: "var(--accent)" },
                          { name: "UI Kit", icon: <Layout size={18} />, color: "var(--accent-2)" },
                          { name: "SEO Audit", icon: <Search size={18} />, color: "var(--accent-3)" },
                          { name: "Launch", icon: <Rocket size={18} />, color: "var(--accent-4)" }
                        ].map((c, i) => (
                          <motion.div 
                            key={i} 
                            className="replica-contact-item"
                            initial={{ opacity: 0, scale: 0 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 + (i * 0.1), type: "spring" }}
                          >
                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: `${c.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.color }}>
                              {c.icon}
                            </div>
                            <span>{c.name}</span>
                          </motion.div>
                        ))}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>Campaign ROI:</h4>
                      </div>

                      <div className="replica-currency-box">
                        <div className="replica-currency-row">
                          <div>
                            <p style={{ fontSize: '10px', color: '#666', margin: 0 }}>Ad Spend</p>
                            <p style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>₹5,000</p>
                            <p style={{ fontSize: '9px', color: '#888', margin: 0 }}>Last 30 days (-2%)</p>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--accent-4)10', padding: '4px 8px', borderRadius: '8px', color: 'var(--accent-4)' }}>
                            <TrendingUp size={12} />
                            <span style={{ fontSize: '10px', fontWeight: 700 }}>PAID</span>
                          </div>
                        </div>

                        <div className="replica-swap-btn" style={{ background: 'var(--accent)', color: 'white', border: 'none' }}>
                          <ArrowRight size={14} />
                        </div>

                        <div className="replica-currency-row">
                          <div>
                            <p style={{ fontSize: '10px', color: '#666', margin: 0 }}>Revenue</p>
                            <p style={{ fontSize: '16px', fontWeight: 500, margin: 0 }}>₹18,200</p>
                            <p style={{ fontSize: '9px', color: '#888', margin: 0 }}>Organic Growth (+15%)</p>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--accent-2)10', padding: '4px 8px', borderRadius: '8px', color: 'var(--accent-2)' }}>
                            <Check size={12} />
                            <span style={{ fontSize: '10px', fontWeight: 700 }}>REAL</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Right Column with staggered slide-in */}
              <div className="feature-col">
                <motion.div 
                  className="benefit-card-replica"
                  initial={{ opacity: 0, x: 50, rotateY: -15 }}
                  whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
                  viewport={{ once: false, amount: 0.2 }}
                  transition={{ duration: 0.8, delay: 0.5, type: "spring", damping: 15 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                >
                  <div className="bcr-icon" style={{ background: 'var(--accent-3)10' }}>
                    <MessageSquare size={24} color="var(--accent-3)" />
                  </div>
                  <h3 className="bcr-title">Word of mouth has a ceiling</h3>
                  <p className="bcr-text">
                    Your regulars love you. But how does someone new find you? A website works 24/7, reaching people your network never could.
                  </p>
                </motion.div>
                <motion.div 
                  className="benefit-card-replica"
                  initial={{ opacity: 0, x: 50, rotateY: -15 }}
                  whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
                  viewport={{ once: false, amount: 0.2 }}
                  transition={{ duration: 0.8, delay: 0.7, type: "spring", damping: 15 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                >
                  <div className="bcr-icon" style={{ background: 'var(--accent-4)10' }}>
                    <Zap size={24} color="var(--accent-4)" />
                  </div>
                  <h3 className="bcr-title">Your competitors are already doing it</h3>
                  <p className="bcr-text">
                    Someone in your space is getting more inquiries not because they're better, but because they're easier to find online.
                  </p>
                </motion.div>
              </div>
            </div>
            
            <div className="fade-up" style={{ textAlign: 'center', marginTop: '40px' }}>
              <p style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', fontStyle: 'italic' }}>
                "You've built your business through skill, hard work, and trust. Your website should reflect exactly that."
              </p>
            </div>
          </div>
        </motion.section>

        {/* What we do Section */}
        <motion.section 
          id="features" 
          className="section-padding" 
          style={{ background: 'white' }}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="container">
            <div style={{ textAlign: 'left', marginBottom: 'clamp(32px, 5vw, 40px)' }}>
              <div className="tag fade-up">
                What we do
              </div>
              <h2 style={{ fontSize: 'clamp(32px, 5vw, 64px)', fontWeight: 500, color: '#111', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '20px' }}>
                <RevealText text="Everything you need to get online and grow there." />
              </h2>
              <p className="fade-up subtext" style={{ maxWidth: '800px', fontSize: '18px', color: '#666', lineHeight: 1.6, margin: '20px 0 0' }}>
                We handle the full journey, so you don't have to figure out the technical stuff alone.
              </p>
            </div>

            <div className="features-replica-container">
              {/* Row 1: Design & Discovery */}
              <div className="feature-showcase-row fade-up" style={{ background: '#FAF5FF' }}>
                <div className="fs-text-col">
                  <motion.div 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '48px',
                      height: '48px',
                      borderRadius: '16px',
                      background: 'rgba(124, 58, 237, 0.1)',
                      color: 'var(--accent)',
                      marginBottom: '-8px'
                    }}
                    animate={{
                      scale: [1, 1.08, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Palette size={24} />
                  </motion.div>
                  <h3 className="fs-title">Website Design & Discovery</h3>
                  <p className="fs-desc">
                    Fully custom, mobile-friendly websites built to represent your business professionally. We start with a strategy session to understand your business, customers, and goals.
                  </p>
                  <a href="#contact" className="btn-feature-cta">
                    Start your strategy session <ArrowRight size={18} />
                  </a>
                </div>
                <div className="fs-visual-col">
                  <div className="card-backdrop" />
                  <div className="showcase-card design-studio-card">
                    <div className="browser-window">
                      <div className="browser-header">
                        <div className="browser-dots">
                          <span></span><span></span><span></span>
                        </div>
                        <div className="browser-address">editor.webinsta.in</div>
                        <div className="browser-plus"><Plus size={12} /></div>
                      </div>
                      <div className="browser-toolbar">
                        <div className="toolbar-group">
                          <motion.span
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            style={{ display: 'inline-flex' }}
                          >
                            <MousePointer2 size={12} />
                          </motion.span>
                          <motion.span
                            animate={{ scale: [1, 1.15, 1] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                            style={{ display: 'inline-flex' }}
                          >
                            <Type size={12} />
                          </motion.span>
                          <motion.span
                            animate={{ y: [0, -2, 2, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            style={{ display: 'inline-flex' }}
                          >
                            <Image size={12} />
                          </motion.span>
                          <motion.span
                            animate={{ rotate: [0, -5, 5, 0], scale: [1, 1.08, 1] }}
                            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                            style={{ display: 'inline-flex' }}
                          >
                            <Layers size={12} />
                          </motion.span>
                        </div>
                        <div className="toolbar-center">
                          <span>Desktop Preview</span>
                        </div>
                        <div className="toolbar-right">
                          <div className="share-btn">Publish</div>
                        </div>
                      </div>
                      <div className="browser-editor">
                        <div className="editor-sidebar">
                          <div className="sidebar-group">
                            <p>Layers</p>
                            <div className="layer-item active"><div className="layer-icon" /> Hero Section</div>
                            <div className="layer-item"><div className="layer-icon" /> Features</div>
                            <div className="layer-item"><div className="layer-icon" /> Contact</div>
                          </div>
                          <div className="sidebar-group">
                            <p>Assets</p>
                            <div className="asset-grid">
                              <div className="asset-box" />
                              <div className="asset-box" />
                              <div className="asset-box" />
                              <div className="asset-box" />
                            </div>
                          </div>
                        </div>
                        <div className="editor-main">
                          <div className="web-preview-header">
                            <div className="web-logo"></div>
                            <div className="web-nav">
                              <span></span><span></span><span></span>
                            </div>
                          </div>
                          <div className="web-preview-hero">
                            <div className="web-tag" />
                            <div className="web-line-lg"></div>
                            <div className="web-line-md"></div>
                            <div className="web-cta"></div>
                          </div>
                          <div className="web-preview-grid">
                            <div className="web-grid-item"></div>
                            <div className="web-grid-item"></div>
                          </div>
                        </div>
                        <div className="editor-properties">
                          <p>Properties</p>
                          <div className="prop-row"><div className="prop-label" /><div className="prop-val" /></div>
                          <div className="prop-row"><div className="prop-label" /><div className="prop-val" /></div>
                          <div className="prop-row"><div className="prop-label" /><div className="prop-val" /></div>
                        </div>
                      </div>
                    </div>

                    <motion.div 
                      className="design-element palette-card"
                      animate={{ y: [0, -8, 0], x: [0, 4, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <div className="palette-colors">
                        <span style={{ background: 'var(--accent)' }}></span>
                        <span style={{ background: '#F0F4FF' }}></span>
                        <span style={{ background: '#111' }}></span>
                      </div>
                      <div className="palette-info">
                        <p>Brand Identity</p>
                        <span>#0066FF</span>
                      </div>
                    </motion.div>

                    <motion.div 
                      className="design-element responsive-toggle"
                      animate={{ y: [0, 10, 0], x: [0, -6, 0] }}
                      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    >
                      <div className="toggle-icons">
                        <Monitor size={12} className="opacity-20" />
                        <Smartphone size={14} className="text-blue-600" />
                      </div>
                      <span>Responsive</span>
                    </motion.div>

                    <motion.div 
                      className="design-element stats-preview"
                      animate={{ scale: [1, 1.02, 1], y: [0, -5, 0] }}
                      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                    >
                      <div className="stats-icon"><Zap size={14} fill="currentColor" /></div>
                      <div className="stats-text">
                        <p>Speed Score</p>
                        <span>98/100</span>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Row 2: Tech & SEO */}
              <div className="feature-showcase-row fade-up" style={{ background: '#FFF9F5' }}>
                <div className="fs-text-col">
                  <motion.div 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '48px',
                      height: '48px',
                      borderRadius: '16px',
                      background: 'rgba(255, 126, 64, 0.1)',
                      color: 'var(--accent-4)',
                      marginBottom: '-8px'
                    }}
                    animate={{
                      y: [0, -6, 0],
                      scale: [1, 1.06, 1]
                    }}
                    transition={{
                      duration: 3.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Globe size={24} />
                  </motion.div>
                  <h3 className="fs-title">Domain, Hosting & SEO</h3>
                  <p className="fs-desc">
                    We handle all the technical setups, starting from buying your domain to ranking you on Google, so your business will show up when customers search for what you offer.
                  </p>
                  <a href="#contact" className="btn-feature-cta">
                    Get found on Google <ArrowRight size={18} />
                  </a>
                </div>
                <div className="fs-visual-col">
                  <div className="card-backdrop" style={{ left: '-10%', top: '10%' }} />
                  <div className="showcase-card" style={{ transform: 'rotate(-2deg)' }}>
                    <div className="showcase-card-header">
                      <span className="sch-title">Google Visibility</span>
                      <motion.div 
                        className="sch-more"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                      >
                        <Plus size={14} />
                      </motion.div>
                    </div>
                    <div style={{ height: '180px', width: '100%' }}>
                      <RealTimeChart />
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 3: Growth & Support */}
              <div className="feature-showcase-row fade-up" style={{ background: '#F5F7FF' }}>
                <div className="fs-text-col">
                  <motion.div 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '48px',
                      height: '48px',
                      borderRadius: '16px',
                      background: 'rgba(0, 102, 255, 0.1)',
                      color: 'var(--accent-2)',
                      marginBottom: '-8px'
                    }}
                    animate={{
                      rotate: [0, 8, -8, 0],
                      scale: [1, 1.06, 1]
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Layers size={24} />
                  </motion.div>
                  <h3 className="fs-title">Google Tools & Content Support</h3>
                  <p className="fs-desc">
                    We set up your entire Google ecosystem and help craft the words that drive action.
                  </p>
                  <a href="#contact" className="btn-feature-cta">
                    Join our ecosystem <ArrowRight size={18} />
                  </a>
                </div>
                <div className="fs-visual-col">
                  <div className="card-backdrop" />
                  <div className="showcase-card">
                    <div className="showcase-card-header">
                      <span className="sch-title">New Leads by source</span>
                      <motion.div 
                        className="sch-more"
                        animate={{ scale: [1, 1.2, 1], rotate: [0, 45, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <Plus size={14} />
                      </motion.div>
                    </div>
                    <div style={{ height: '160px', marginTop: '20px', position: 'relative' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-end', height: '100%', gap: '2px' }}>
                        {Array.from({length: 30}).map((_, i) => (
                           <motion.div 
                            key={i}
                            initial={{ height: '20%' }}
                            animate={{ height: [`${30 + Math.sin(i * 0.5) * 20}%`, `${40 + Math.sin(i * 0.5) * 30}%`, `${30 + Math.sin(i * 0.5) * 20}%`] }}
                            transition={{ duration: 3, repeat: Infinity, delay: i * 0.1 }}
                            style={{ flex: 1, background: 'var(--accent-2)', opacity: 0.3 + (i/30)*0.7, borderRadius: '1px' }}
                           />
                        ))}
                      </div>
                      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                         <p style={{ fontSize: '10px', color: '#666', margin: 0 }}>Conversion Rate</p>
                         <h4 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>94.2%</h4>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', fontSize: '9px', color: '#999' }}>
                      <span>Today 12:30 PM</span>
                      <span>Target: High</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Recent Work Section */}
        <motion.section 
          id="work" 
          className="recent-work-section" 
          style={{ background: 'var(--bg-card)' }}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="container">
            <div style={{ textAlign: 'left', marginBottom: 'clamp(32px, 5vw, 40px)' }}>
              <span className="tag fade-up">Portfolio</span>
              <h2 style={{ fontSize: 'clamp(28px, 5vw, 64px)', fontWeight: 500, color: '#111', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '20px' }}>
                <RevealText text="Crafting Digital Excellence" />
              </h2>
              <p className="fade-up subtext" style={{ maxWidth: '800px', fontSize: '18px', color: '#666', lineHeight: 1.6, margin: '20px 0 0' }}>
                Take a look at some of our recent projects where we've helped businesses transform their online identity.
              </p>
            </div>

            <div className="portfolio-grid">
              {[
                { 
                  title: "StyleHive Store", 
                  cat: "E-commerce · React", 
                  desc: "A fully custom e-commerce experience built for growth.",
                  img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8",
                  delay: "0.1s",
                  accent: "var(--accent)"
                },
                { 
                  title: "Mindbloom Coaching", 
                  cat: "Personal Brand · Next.js", 
                  desc: "A professional hub for wellness and coaching strategy.",
                  img: "https://images.unsplash.com/photo-1515378960530-7c0da6231fb1",
                  delay: "0.2s",
                  accent: "var(--accent-2)"
                },
                { 
                  title: "Apex Real Estate", 
                  cat: "Landing Page · Next.js", 
                  desc: "High-conversion landing page for modern property listings.",
                  img: "https://images.unsplash.com/photo-1560518883-ce09059eeffa",
                  delay: "0.3s",
                  accent: "var(--accent-4)"
                },
                { 
                  title: "FitTrack Pro", 
                  cat: "Health · Fitness App", 
                  desc: "Interactive fitness tracking platform for personal trainers.",
                  img: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd",
                  delay: "0.4s",
                  accent: "var(--accent-3)"
                }
              ].map((project, i) => (
                <motion.div 
                  key={i} 
                  className="portfolio-item"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  whileHover={{ y: -10 }}
                >
                  <div className="portfolio-img-wrapper">
                    <img 
                      src={`${project.img}?w=800&q=80&auto=format&fit=crop`} 
                      srcSet={`${project.img}?w=400&q=70&auto=format&fit=crop 400w, ${project.img}?w=800&q=80&auto=format&fit=crop 800w, ${project.img}?w=1200&q=80&auto=format&fit=crop 1200w`}
                      sizes="(max-width: 768px) 100vw, 50vw"
                      alt={project.title} 
                      loading="lazy" 
                    />
                    <div className="portfolio-overlay">
                      <div className="portfolio-details-hover">
                        <div className="p-tag-accent" style={{ background: project.accent }}>{project.cat}</div>
                        <h4 className="p-title">{project.title}</h4>
                        <p className="p-desc">{project.desc}</p>
                        <div className="p-link">
                          Explore Project 
                          <motion.div
                            animate={{ x: [0, 5, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                          >
                            <ArrowRight size={16} />
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Why Choose Us Section (Moved) */}
        <motion.section 
          id="why-us" 
          className="why-us-section" 
          style={{ background: 'white' }}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="container">
            <div style={{ textAlign: 'left', marginBottom: 'clamp(32px, 5vw, 40px)' }}>
              <div className="tag fade-up">
                Why Choose Us
              </div>
              <h2 style={{ fontSize: 'clamp(32px, 5vw, 64px)', fontWeight: 500, color: '#111', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '24px', maxWidth: '1000px' }}>
                <RevealText text="A website built by people who understand your business, not just your brief." />
              </h2>
              <p className="fade-up subtext" style={{ maxWidth: '800px', fontSize: '18px', color: '#666', lineHeight: 1.6, margin: '20px 0 0' }}>
                We're not an agency. We're two MBA grads who work directly with you bringing both business thinking and technical execution to every project.
              </p>
            </div>

            <div className="why-us-grid">
              {[
                {
                  num: "01",
                  title: "Business Logic First",
                  text: "Our MBA background means we don't just ask 'what should the website look like', we ask 'what should this website achieve?'"
                },
                {
                  num: "02",
                  title: "Direct Access",
                  text: "No account managers. Talk to the builders, faster decisions, zero miscommunication."
                },
                {
                  num: "03",
                  title: "High Attention",
                  text: "We take on limited projects so you always get our full attention. Quick replies, clear timelines."
                },
                {
                  num: "04",
                  title: "Local Expertise",
                  text: "We understand Indian customer behaviour and what works in your city, not just global templates."
                },
                {
                  num: "05",
                  title: "ROI Focused",
                  text: "A well-built website brings in inquiries while you sleep. We make sure you see a return on your asset."
                },
                {
                  num: "06",
                  title: "Long-term Partners",
                  text: "As your business grows, your website should too. We stay available, no starting from scratch."
                }
              ].map((item, i) => (
                <div key={i} className="why-card fade-up" style={{ transitionDelay: `${i * 0.1}s` }}>
                  <div className="why-num">{item.num}</div>
                  <div className="why-content">
                    <h4 className="why-title">{item.title}</h4>
                    <p className="why-text">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Testimonials Section - Revamped */}
        <motion.section 
          id="testimonials" 
          className="testimonials-section" 
          style={{ background: 'var(--bg-card)' }}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="container">
            <div style={{ textAlign: 'left', marginBottom: 'clamp(32px, 5vw, 40px)' }}>
              <div className="tag fade-up">
                Testimonials
              </div>
              <h2 style={{ fontSize: 'clamp(32px, 5vw, 64px)', fontWeight: 500, color: '#111', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '24px', maxWidth: '1000px' }}>
                <RevealText text="Voices of Growth" />
              </h2>
              <p className="fade-up subtext" style={{ maxWidth: '800px', fontSize: '18px', color: '#666', lineHeight: 1.6, margin: '20px 0 0' }}>
                We don't just build websites; we build partnerships. Here's what some of our clients have to say about the impact on their business.
              </p>
            </div>

            <div 
              className="testimonials-slider-container"
              style={{ padding: '10px 4px 20px' }}
              onMouseEnter={() => setIsTestimonialHovered(true)}
              onMouseLeave={() => setIsTestimonialHovered(false)}
            >
              <div 
                className="testimonials-slider-track"
                style={{ 
                  transform: `translateX(calc(-${currentTestimonialIndex} * (100% + 24px) / ${visibleSlides}))`,
                }}
              >
                {testimonialsList.map((t, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ 
                      duration: 0.6, 
                      delay: (i % 3) * 0.1,
                      ease: [0.16, 1, 0.3, 1]
                    }}
                    className="testimonial-card-v2"
                    style={{ 
                      flex: `0 0 calc(${100 / visibleSlides}% - ${(24 * (visibleSlides - 1)) / visibleSlides}px)`,
                      boxSizing: 'border-box',
                      background: i % 2 === 0 ? '#fcfcfc' : '#fff',
                      padding: '40px',
                      borderRadius: '24px',
                      border: '1px solid rgba(0,0,0,0.04)',
                      boxShadow: i % 2 === 0 ? 'none' : '0 10px 30px rgba(0,0,0,0.03)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: '280px'
                    }}
                    whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}
                  >
                    <div>
                      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', color: '#FFD700' }}>
                         {[...Array(5)].map((_, j) => <Heart key={j} size={14} fill="#FFD700" stroke="none" />)}
                      </div>
                      <p style={{ fontSize: '18px', color: '#222', lineHeight: 1.6, fontWeight: 400, letterSpacing: '-0.01em' }}>
                        "{t.quote}"
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '30px', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '24px' }}>
                      <div>
                        <h4 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#111', letterSpacing: '-0.01em' }}>{t.name}</h4>
                        <p style={{ fontSize: '13px', color: '#666', margin: '4px 0 0', fontWeight: 600 }}>
                          {t.designation}
                        </p>
                        <p style={{ fontSize: '12px', color: '#999', margin: '2px 0 0', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Globe size={11} /> {t.location}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Slider Navigation & Dots */}
            <div className="testimonials-slider-controls">
              <button 
                title="Previous testimonial"
                className="testimonial-nav-btn"
                onClick={() => {
                  const maxIndex = Math.max(0, testimonialsList.length - visibleSlides);
                  setCurrentTestimonialIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
                }}
              >
                <ChevronLeft size={20} />
              </button>

              <div className="testimonial-dots">
                {[...Array(Math.max(0, testimonialsList.length - visibleSlides) + 1)].map((_, idx) => (
                  <button
                    key={idx}
                    title={`Go to slide ${idx + 1}`}
                    className={`testimonial-dot ${currentTestimonialIndex === idx ? 'active' : ''}`}
                    onClick={() => setCurrentTestimonialIndex(idx)}
                  />
                ))}
              </div>

              <button 
                title="Next testimonial"
                className="testimonial-nav-btn"
                onClick={() => {
                  const maxIndex = Math.max(0, testimonialsList.length - visibleSlides);
                  setCurrentTestimonialIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
                }}
              >
                <ChevronRight size={20} />
              </button>
            </div>

            <div style={{ marginTop: '60px', textAlign: 'center' }} className="fade-up">
               <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', background: '#f8f9fa', padding: '12px 24px', borderRadius: '100px', cursor: 'pointer', border: '1px solid rgba(0,0,0,0.05)' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#555' }}>Already trusted by 50+ businesses across India</span>
               </div>
            </div>
          </div>
        </motion.section>

        {/* The people behind the work */}
        <motion.section 
          id="team" 
          className="section-padding" 
          style={{ background: 'white' }}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="container">
            <div style={{ textAlign: 'left', marginBottom: 'clamp(32px, 5vw, 40px)' }}>
               <span className="tag fade-up">The people behind the work</span>
               <h2 style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 500, color: '#111', marginTop: '16px' }}>
                 <RevealText text="Two MBAs. One goal: your business online." />
               </h2>
               <p className="subtext fade-up" style={{ maxWidth: '800px', fontSize: '18px', color: '#666', lineHeight: 1.6, margin: '20px 0 0' }}>
                 We're not a faceless agency. We're two people who genuinely care about seeing your business grow.
               </p>
            </div>
            <div className="team-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
               <div className="team-card fade-up" style={{ background: '#f8f9fa', padding: '40px', borderRadius: '24px' }}>
                  <h4 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '4px' }}>Vansh</h4>
                  <p style={{ color: 'var(--accent)', fontWeight: 600, marginBottom: '16px' }}>Co-founder · Strategy & Frontend</p>
                  <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>MBA, IIM Calcutta</p>
                  <p style={{ fontSize: '13px', color: '#888', marginBottom: '24px', lineHeight: 1.6 }}>UI/UX Design · React · Business Strategy · Client Consulting · Figma</p>
                  <p style={{ fontStyle: 'italic', color: 'var(--text-primary)', borderLeft: '3px solid var(--accent)', paddingLeft: '16px' }}>
                    "I've always believed a great website is less about how it looks and more about how it works for your business. My job is to make sure every page we build has a clear purpose and delivers on it."
                  </p>
               </div>
               <div className="team-card fade-up" style={{ background: '#f8f9fa', padding: '40px', borderRadius: '24px' }}>
                  <h4 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '4px' }}>Yash</h4>
                  <p style={{ color: 'var(--accent-2)', fontWeight: 600, marginBottom: '16px' }}>Co-founder · Tech & Growth</p>
                  <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>MBA, Masters' Union</p>
                  <p style={{ fontSize: '13px', color: '#888', marginBottom: '24px', lineHeight: 1.6 }}>Node.js · SEO · Google Analytics · Web Performance · Growth Strategy</p>
                  <p style={{ fontStyle: 'italic', color: 'var(--text-primary)', borderLeft: '3px solid var(--accent-2)', paddingLeft: '16px' }}>
                    "I geek out on the stuff most people find boring, load speeds, search rankings, conversion rates. Because that's where a good website becomes a great business tool."
                  </p>
               </div>
            </div>
          </div>
        </motion.section>

        {/* Quotes & Consultation Section */}
        <motion.section 
          id="contact" 
          className="consultation-section" 
          style={{ background: 'var(--bg-card)' }}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="container">
            <div className="consultation-grid" style={{ alignItems: 'flex-start' }}>
              <div className="consultation-text">
                <span className="tag fade-up">Get in touch</span>
                <h2 style={{ fontSize: 'clamp(32px,4vw,64px)', fontWeight: 500, color: '#111', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '16px' }}>
                  <RevealText text="Let's talk about your business." />
                </h2>
                <p className="subtext fade-up" style={{ maxWidth: '800px', fontSize: '18px', color: '#666', lineHeight: 1.6, margin: '20px 0 32px' }}>
                  Fill in the details below and we'll get back to you within 24 hours. No technical jargon, no pressure, just a conversation.
                </p>

                {/* Consultation Visual Features to rebalance whitespace */}
                <div className="consultation-features fade-up">
                  <div className="consult-feat-item">
                    <div className="feat-icon">
                      <Smile size={20} />
                    </div>
                    <div>
                      <h5>30-Min Discovery Session</h5>
                      <p>Consult with co-founders to map your digital business targets. No sales pitch, just pure strategic alignment.</p>
                    </div>
                  </div>
                  <div className="consult-feat-item">
                    <div className="feat-icon">
                      <Search size={20} />
                    </div>
                    <div>
                      <h5>Competitive Local Audit</h5>
                      <p>We analyze your top 3 local competitors, parsing content hooks, loading speeds, and search optimization gaps.</p>
                    </div>
                  </div>
                  <div className="consult-feat-item">
                    <div className="feat-icon">
                      <Layout size={20} />
                    </div>
                    <div>
                      <h5>No-Commitment Interactive Blueprint</h5>
                      <p>Receive an itemized architectural map, exact feature options, and fixed cost bounds to help you choose confidently.</p>
                    </div>
                  </div>
                </div>

                <div className="contact-direct fade-up" style={{ marginTop: '48px' }}>
                   <p style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: 500 }}>
                     <MessageSquare size={18} color="var(--accent)" /> 💬 WhatsApp us directly at 9560870678
                   </p>
                   <p style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: 500 }}>
                     <Send size={18} color="var(--accent-2)" /> 📧 hello@webinsta.in
                   </p>
                   <p style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: 500 }}>
                     <Zap size={18} color="var(--accent-4)" /> ⏱ We reply within a few hours
                   </p>
                </div>
              </div>

              <div className="quote-form-container fade-up" style={{ position: 'relative', overflow: 'hidden' }}>
                <AnimatePresence>
                  {leadSubmitting && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: '32px',
                        background: 'rgba(255, 255, 255, 0.85)',
                        backdropFilter: 'blur(6px)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 400,
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            border: '3px solid rgba(124, 58, 237, 0.12)',
                            borderTopColor: 'var(--accent)',
                            borderRightColor: 'var(--accent-2)',
                          }}
                        />
                        <div style={{ textAlign: 'center' }}>
                           <h4 style={{ margin: '0 0 4px 0', color: 'var(--text-primary)', fontSize: '15px', fontWeight: 600 }}>Syncing Blueprint...</h4>
                           <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '12px' }}>Connecting dev pipeline & Google Sheets.</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                {leadSuccess ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: '400px'
                    }}
                  >
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#DEF7EC', color: '#03543F', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '28px' }}>
                      <Check size={40} strokeWidth={3} />
                    </div>
                    <h3 style={{ fontSize: '28px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px', letterSpacing: '-0.02em' }}>Lead Registered Successfully!</h3>
                    <p style={{ color: '#4A5568', fontSize: '16px', lineHeight: 1.6, maxWidth: '440px', marginBottom: '32px' }}>
                      Thank you! We've saved your blueprint details locally and automated sync to Google Sheets securely. Our co-founders will review and get back within a few hours over WhatsApp!
                    </p>
                    <button 
                      onClick={() => setLeadSuccess(false)}
                      className="btn-primary"
                      style={{ width: 'auto', padding: '12px 32px', fontSize: '15px', borderRadius: '12px', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Submit Another Blueprint
                    </button>
                  </motion.div>
                ) : (
                  <form className="quote-form" onSubmit={handleLeadSubmit}>
                    <div className="form-header" style={{ marginBottom: '24px' }}>
                      <h3 style={{ fontSize: '24px', fontWeight: 600, color: '#111', margin: '0 0 8px 0', letterSpacing: '-0.02em', fontFamily: 'var(--font-sans), sans-serif' }}>
                        Fill out your project details.
                      </h3>
                      <p style={{ fontSize: '14px', color: '#666', margin: 0, lineHeight: '1.5', fontFamily: 'var(--font-sans), sans-serif' }}>
                        We will consult and follow up on WhatsApp within a few hours.
                      </p>
                    </div>

                    <div className="form-grid">
                      <div className="form-group">
                        <label htmlFor="name">Your Name</label>
                        <input 
                          type="text" 
                          id="name" 
                          placeholder="John Doe" 
                          required 
                          disabled={leadSubmitting}
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input 
                          type="email" 
                          id="email" 
                          placeholder="john@example.com" 
                          required 
                          disabled={leadSubmitting}
                          value={formEmail}
                          onChange={(e) => setFormEmail(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="form-grid" style={{ marginTop: '16px' }}>
                      <div className="form-group">
                        <label htmlFor="phone">WhatsApp Number</label>
                        <input 
                          type="tel" 
                          id="phone" 
                          placeholder="+91 XXXX XXX XXX" 
                          required 
                          disabled={leadSubmitting}
                          value={formPhone}
                          onChange={(e) => setFormPhone(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="business">Business Name (optional)</label>
                        <input 
                          type="text" 
                          id="business" 
                          placeholder="Your Business" 
                          disabled={leadSubmitting}
                          value={formBusiness}
                          onChange={(e) => setFormBusiness(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="form-group" style={{ marginTop: '16px' }}>
                      <label htmlFor="type">Type of Business</label>
                      <select 
                        id="type" 
                        required 
                        disabled={leadSubmitting}
                        value={formBusinessType}
                        onChange={(e) => setFormBusinessType(e.target.value)}
                        style={{
                          color: formBusinessType === '' ? 'rgba(134,142,150,0.8)' : 'var(--text-primary)',
                        }}
                      >
                        <option value="">Select industry</option>
                        <option value="retail">Retail Shop / E-Commerce</option>
                        <option value="coach">Personal Brand or Coach</option>
                        <option value="restaurant">Restaurant or Cafe</option>
                        <option value="service">Service Agency / Consulting</option>
                        <option value="other">Other Unique Custom Project</option>
                      </select>
                    </div>

                    <div className="form-group" style={{ marginTop: '16px' }}>
                      <label htmlFor="message">Anything you want to share or your query? (optional)</label>
                      <textarea 
                        id="message" 
                        rows={4} 
                        placeholder="Briefly describe your goals, features, or timeline..." 
                        disabled={leadSubmitting}
                        value={formMessage}
                        onChange={(e) => setFormMessage(e.target.value)}
                        style={{ resize: 'none' }}
                      ></textarea>
                    </div>

                    <button 
                      type="submit" 
                      className="btn-primary w-full" 
                      disabled={leadSubmitting}
                      style={{ opacity: leadSubmitting ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '24px' }}
                    >
                      {leadSubmitting ? (
                        <>
                          <RefreshCw className="animate-spin" size={18} />
                          Sending Message...
                        </>
                      ) : (
                        <>
                          Send Message <Send size={18} />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </motion.section>

        {/* FAQ Section */}
        <motion.section 
          id="faq" 
          className="section-padding" 
          style={{ background: 'white' }}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="container">
            <div style={{ textAlign: 'left', marginBottom: 'clamp(32px, 5vw, 40px)' }}>
              <span className="tag fade-up">FAQ</span>
              <h2 style={{ fontSize: 'clamp(32px,4vw,48px)', fontWeight: 500, color: '#111', letterSpacing: '-0.02em', marginBottom: '20px' }}>
                <RevealText text="Your Questions Answered" />
              </h2>
            </div>

            <div className="faq-container">
              {faqs.map((faq, i) => (
                <motion.div 
                  key={i} 
                  className={`faq-item ${activeFaq === i ? 'active' : ''}`}
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: i * 0.05 }}
                >
                  <button className="faq-question" onClick={() => setActiveFaq(activeFaq === i ? null : i)}>
                    <h4 style={{ color: 'var(--text-primary)' }}>{faq.q}</h4>
                    <div className="faq-icon" style={{ color: 'var(--text-primary)', borderColor: 'var(--border)' }}><Plus size={18} /></div>
                  </button>
                  <div className="faq-answer">
                    <p>{faq.a}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* CTA Banner */}
        <section id="cta-action" className="cta-banner-wrapper" style={{ background: 'var(--bg-card)' }}>
          <div className="container">
            <motion.div 
              className="cta-banner" 
              style={{ background: '#F8F9FA' }}
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              whileInView={{ scale: 1, opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-100px" }}
              transition={{ type: "spring", damping: 12, stiffness: 60 }}
            >
              <div className="cta-banner-glow" style={{ background: 'radial-gradient(ellipse at center, var(--accent-glow) 0%, transparent 70%)' }}></div>
              <div className="cta-banner-content">
                  <h2 style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: 'clamp(28px, 4vw, 42px)', lineHeight: 1.2, marginBottom: '20px' }}>
                    <RevealText text="Your business is great. Your website should say that too." />
                  </h2>
                <p className="subtext">
                  Join Indian businesses and personal brands already using WebInsta to grow online with a strategy-first website built by MBAs.
                </p>
                <div className="cta-row">
                  <motion.a 
                    href="#contact" 
                    className="btn-primary"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >Get a Free Consultation</motion.a>
                  <motion.a 
                    href="#work" 
                    className="btn-outline" 
                    style={{ color: 'var(--text-primary)' }}
                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(0,0,0,0.02)' }}
                    whileTap={{ scale: 0.95 }}
                  >See Our Work</motion.a>
                </div>
                <div className="trust-badges">
                  <span className="trust-badge">🎓 MBA-Built</span>
                  <span className="trust-badge">🇮🇳 Built for India</span>
                  <span className="trust-badge">💬 WhatsApp Support</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer>
        <div className="container">
          <div className="footer-grid">
            <div className="footer-col">
              <a href="#hero" className="logo" style={{ marginBottom: '24px' }}>
                <svg viewBox="0 0 100 100" style={{ width: '32px', height: '32px', display: 'inline-block', verticalAlign: 'middle' }}>
                  <defs>
                    <linearGradient id="logo-grid-grad-footer" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#7C3AED" />
                      <stop offset="40%" stopColor="#C084FC" />
                      <stop offset="70%" stopColor="#FF7E40" />
                      <stop offset="100%" stopColor="#FF5722" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 18 40 C 18 40, 32 75, 42 75 C 48 75, 50 48, 55 48 C 60 48, 62 75, 68 75 C 75 75, 84 45, 84 45"
                    fill="none"
                    stroke="url(#logo-grid-grad-footer)"
                    strokeWidth="13"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="83" cy="20" r="9" fill="url(#logo-grid-grad-footer)" />
                </svg>
                <span className="logo-brand-text">WebInsta</span>
              </a>
              <p className="footer-about-text">
                Built by MBAs. Designed for Business. Strategy-first websites for Indian businesses and personal brands.
              </p>
              <a href="mailto:hello@webinsta.in" style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>hello@webinsta.in</a>
            </div>

            <div className="footer-col">
              <h5>Company</h5>
              <div className="footer-links">
                <a href="#hero">Home</a>
                <a href="#benefits">About</a>
                <a href="#features">Services</a>
                <a href="#testimonials">Work</a>
              </div>
            </div>

            <div className="footer-col">
              <h5>Services</h5>
              <div className="footer-links">
                <a href="#features">Website Design</a>
                <a href="#features">SEO</a>
                <a href="#features">Google Setup</a>
                <a href="#features">Copywriting</a>
              </div>
            </div>

            <div className="footer-col">
              <h5>Stay Updated</h5>
              <div className="newsletter">
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Send me WebInsta updates.</p>
                <div className="newsletter-form">
                  <input type="email" placeholder="email@example.com" />
                  <button className="btn-primary" style={{ padding: '10px 20px', fontSize: '14px' }}>Join</button>
                </div>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© 2025 WebInsta. All rights reserved.</p>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms</a>
              <button 
                onClick={() => setIsAdminOpen(true)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: 'var(--text-secondary)', 
                  cursor: 'pointer', 
                  fontSize: '14px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px' 
                }}
              >
                <Lock size={12} /> Admin Portal
              </button>
            </div>
          </div>
        </div>
        <div className="footer-bg-text">WebInsta</div>
      </footer>
    </div>
    <AnimatePresence>
      {isAdminOpen && (
        <AdminPortalModal
          isOpen={isAdminOpen}
          onClose={() => setIsAdminOpen(false)}
          adminUser={adminUser}
          adminToken={adminToken}
          leads={leads}
          spreadsheetId={spreadsheetId}
          sheetUrl={sheetUrl}
          isSyncing={isSyncing}
          isCreatingSheet={isCreatingSheet}
          adminError={adminError}
          adminSuccess={adminSuccess}
          manualSheetId={manualSheetId}
          setManualSheetId={setManualSheetId}
          onLogin={handleAdminAuth}
          onLogout={handleAdminLogout}
          onCreateSheet={handleInitializeSheetHeaders}
          onLinkSheet={handleLinkExistingSheet}
          onSync={handleSyncAllLeads}
          onDeleteLead={handleDeleteLead}
        />
      )}
    </AnimatePresence>
     <AIFloatingChat 
      isOpen={isChatOpen}
      onClose={(val?: boolean) => val === true ? setIsChatOpen(true) : setIsChatOpen(false)}
      messages={chatMessages}
      input={chatInput}
      setInput={setChatInput}
      onSend={handleSendMessage}
      onSelectOption={handleQuickOptionClick}
      isTyping={isAiTyping}
      scrollRef={scrollRef}
    />
    </>
  );
}

// Helper to beautifully format text responses with human-friendly bullet structures in JSX
const renderMessageContent = (content: string) => {
  return content.split('\n').map((line, i) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
      const pureText = trimmed.replace(/^[•-]\s*/, '');
      return (
        <div key={i} style={{ display: 'flex', gap: '8px', margin: '4px 0', paddingLeft: '4px', fontSize: '13.5px', lineHeight: '1.45' }}>
          <span style={{ color: 'var(--accent)', fontWeight: 800 }}>•</span>
          <span style={{ color: '#444' }}>{pureText}</span>
        </div>
      );
    }
    return (
      <p key={i} style={{ margin: '4px 0', minHeight: trimmed === '' ? '8px' : 'unset', fontSize: '13.5px', lineHeight: '1.45', color: '#333' }}>
        {line}
      </p>
    );
  });
};

const SUGGESTION_CHIPS = [
  "📈 Why the MBA approach?",
  "🛠 Services & Timelines",
  "💰 Pricing & ROI",
  "🤝 Consult a Founder"
];

// Chatbot UI Component
const AIFloatingChat = ({ 
  isOpen, 
  onClose, 
  messages, 
  input, 
  setInput, 
  onSend, 
  onSelectOption,
  isTyping, 
  scrollRef 
}: any) => (
  <>
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="ai-chat-window"
          initial={{ opacity: 0, y: 50, scale: 0.9, rotate: -2 }}
          animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, y: 50, scale: 0.9, rotate: 2 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        >
          <div className="chat-header">
            <div className="chat-user-info">
              <div className="ai-icon-bg">
                <Bot size={20} color="white" />
              </div>
              <div>
                <h5 className="chat-ai-name">WebInsta Growth AI</h5>
                <div className="chat-status-ai">
                  <span className="pulse-dot"></span>
                  Online & Thinking
                </div>
              </div>
            </div>
            <button className="chat-close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          <div className="chat-messages" ref={scrollRef}>
            {messages.map((msg: any, i: number) => (
              <motion.div 
                key={i} 
                className={`chat-msg-wrapper ${msg.role === 'user' ? 'user-msg' : 'ai-msg'}`}
                initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="msg-bubble">
                  {msg.role === 'user' ? msg.content : renderMessageContent(msg.content)}
                </div>
              </motion.div>
            ))}
            {isTyping && (
              <div className="ai-msg chat-msg-wrapper">
                <div className="msg-bubble typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
          </div>

          {/* Suggestion Chips Container */}
          <div style={{
            display: 'flex',
            gap: '8px',
            padding: '10px 16px',
            background: '#fafafa',
            borderTop: '1px solid rgba(0,0,0,0.02)',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch'
          }} className="suggestion-chips-scrollbar">
            {SUGGESTION_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => onSelectOption && onSelectOption(chip)}
                style={{
                  flex: '0 0 auto',
                  background: 'white',
                  border: '1px solid #e4e4e7',
                  borderRadius: '100px',
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#27272a',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                }}
                className="hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/20"
              >
                {chip}
              </button>
            ))}
          </div>

          <div className="chat-input-area">
            <input 
              type="text" 
              placeholder="Ask about SEO, ROI, or custom websites..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && onSend()}
            />
            <button className="chat-send-btn" onClick={onSend} disabled={!input.trim()}>
              <Send size={18} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    <motion.a 
      href="https://wa.me/919560870678" 
      target="_blank" 
      rel="noopener noreferrer"
      className="whatsapp-trigger"
      whileHover={{ scale: 1.1, rotate: -5 }}
      whileTap={{ scale: 0.9 }}
    >
      <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    </motion.a>

    <motion.button 
      className="ai-chat-trigger"
      whileHover={{ scale: 1.1, rotate: 5 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => isOpen ? onClose() : onClose(true)} // Toggle logic handled in parent
    >
      {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
    </motion.button>
  </>
);

