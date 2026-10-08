import { BlogPost, FAQItem, Testimonial } from '@/types/landing'
import {
  Bell,
  Bot,
  Crown,
  DollarSign,
  Facebook,
  FileText,
  Heart,
  HelpCircle,
  ImageIcon,
  Instagram,
  Layers,
  Layout,
  Linkedin,
  LinkIcon,
  Mail,
  MessageCircle,
  MessageSquare,
  Phone,
  Rocket,
  Send,
  Share2,
  Shield,
  Sparkles,
  Users,
  Youtube,
  Zap,
} from 'lucide-react'
import { XIcon as Twitter } from '@/components/ui/XIcon'
import { ThreadsIcon } from '@/components/ui/threadsIcon'

export const logos = [
  { name: 'WhatsApp', icon: MessageSquare, color: 'green' },
  { name: 'Telegram', icon: Send, color: 'blue' },
  { name: 'Email', icon: Mail, color: 'gray' },
  { name: 'Automations', icon: Zap, color: 'purple' },
  { name: 'CRM Sync', icon: Users, color: 'green' },
  { name: 'Push Alerts', icon: Bell, color: 'orange' },
  { name: 'AI Bot', icon: Bot, color: 'blue' },
]

export const footerLinks = [
  {
    title: 'Integrations',
    links: [
      { name: 'Linkedin', href: '#' },
      { name: 'Instagram', href: '#' },
      { name: 'Whatsapp', href: '#' },
      { name: 'Telegram', href: '#' },
      { name: 'Facebook', href: '#' },
      { name: 'Youtube', href: '#' },
    ],
  },
  {
    title: 'Use Cases',
    links: [
      { name: 'Product Launches', href: '#' },
      { name: 'Promotions', href: '#' },
      { name: 'Limited Offers', href: '#' },
      { name: 'Event Reminders', href: '#' },
      { name: 'Bulk Messages', href: '#' },
      { name: 'Collect Feedback', href: '#' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { name: 'Help Center', href: '#' },
      { name: 'Support', href: '#' },
      { name: 'Terms of Service', href: '#' },
      { name: 'Privacy Policy', href: '#' },
      { name: 'Status', href: '#' },
    ],
  },
]

export const socialLinks = [
  { name: 'LinkedIn', icon: Linkedin, href: '#' },
  { name: 'Twitter', icon: Twitter, href: '#' },
  { name: 'Telegram', icon: Send, href: '#' },
  { name: 'Instagram', icon: Instagram, href: '#' },
  { name: 'Youtube', icon: Youtube, href: '#' },
]

export const testimonialStats = [
  { val: '500+', label: 'Happy Creators' },
  { val: '4.9/5', label: 'Store Rating' },
  { val: '12+', label: 'Posts Published' },
  { val: '24/7', label: 'AI Support' },
]

export const pricingTabs = ['subscription', 'prepaid', 'lifetime']

export const socialMediaIcons = [Heart, MessageSquare, LinkIcon]

export const campaignhubPrompts = ['Business Ideas', 'Blog Post', 'Coding Help']

export const landingFeatures = [
  {
    title: 'Text to Image',
    description:
      'Transform your words into stunning, high-resolution visuals instantly using state-of-the-art AI models.',
    image: 'images/landing/feature/text-to-image.png',
    bg: 'bg-blue-400/10',
    color: 'text-blue-400',
    cardBg: 'bg-gradient-to-br from-blue-500/10 to-transparent',
  },
  {
    title: 'AI Chat Assistant',
    description: 'Engage with our intelligent AI that understands context and provides accurate, human-like responses.',
    image: 'images/landing/feature/image-to-image.png',
    bg: 'bg-emerald-400/10',
    color: 'text-emerald-400',
    cardBg: 'bg-gradient-to-br from-emerald-500/10 to-transparent',
  },
  {
    title: 'Text to Video',
    description: 'Create cinematic, high-quality videos from simple text prompts in just a few clicks.',
    image: 'images/landing/feature/Text-To-Video.png',
    bg: 'bg-pink-400/10',
    color: 'text-pink-400',
    cardBg: 'bg-gradient-to-br from-pink-500/10 to-transparent',
  },
  {
    title: 'Smart Search',
    description: 'Find exactly what you need with our AI-powered semantic search that understands your intent.',
    image: 'images/landing/feature/Image-to-Video.png',
    bg: 'bg-pink-400/10',
    color: 'text-pink-400',
    cardBg: 'bg-gradient-to-br from-pink-500/10 to-transparent',
  },
  {
    title: 'AI Coding Partner',
    description: 'Boost your productivity with an AI that helps you write, debug, and optimize code effortlessly.',
    image: 'images/landing/feature/Video-motion.png',
    bg: 'bg-emerald-400/10',
    color: 'text-emerald-400',
    cardBg: 'bg-gradient-to-br from-emerald-500/10 to-transparent',
  },
]

export const posts: BlogPost[] = [
  {
    id: 1,
    title: 'The Future of AI in Content Creation',
    excerpt: 'How artificial intelligence is reshaping the way we think about creativity and production.',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1200',
    date: 'May 10, 2024',
    author: 'Alex River',
    readTime: '5 min read',
    category: 'AI Trends',
  },
  {
    id: 2,
    title: 'Mastering Social Media with AI',
    excerpt: 'Tips for using AI tools to boost your engagement.',
    image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=800',
    date: 'May 15, 2024',
    author: 'Sam Taylor',
    readTime: '4 min read',
    category: 'Marketing',
  },
  {
    id: 3,
    title: 'From Prompt to Cinematic Video',
    excerpt: 'A deep dive into the technology behind AI video generation.',
    image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=800',
    date: 'May 20, 2024',
    author: 'Jordan Lee',
    readTime: '6 min read',
    category: 'Tutorials',
  },
  {
    id: 4,
    title: 'AI Ethics and Responsibility',
    excerpt: 'Ensuring responsible innovation in the digital age.',
    image: 'https://images.unsplash.com/photo-1620712943543-bcc463867000?auto=format&fit=crop&q=80&w=800',
    date: 'May 25, 2024',
    author: 'Morgan Smith',
    readTime: '7 min read',
    category: 'Ethics',
  },
  {
    id: 5,
    title: 'Designing the Future with AI',
    excerpt: 'How UI/UX is evolving with intelligent tools.',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800',
    date: 'May 28, 2024',
    author: 'Casey Jones',
    readTime: '4 min read',
    category: 'Design',
  },
  {
    id: 6,
    title: 'AI Productivity Hacks',
    excerpt: 'Streamline your workflow with these top AI tools.',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800',
    date: 'June 02, 2024',
    author: 'Riley Evans',
    readTime: '3 min read',
    category: 'Productivity',
  },
]

export const faqs: FAQItem[] = [
  {
    title: 'What is Smart AI Content Generation Suite?',
    description:
      'Smart AI Content Generation Suite is an all-in-one platform that combines multiple state-of-the-art AI models to help you create stunning images, videos, and social media content in seconds.',
  },
  {
    title: 'How many AI images can I generate?',
    description:
      'This depends on your plan. The Starter plan includes 10 images per month, while the Pro plan offers unlimited generations for personal and commercial use.',
  },
  {
    title: 'Can I use the generated content commercially?',
    description:
      'Yes, content generated on our Pro and Enterprise plans includes a full commercial license, allowing you to use it for your business or clients.',
  },
  {
    title: 'Do you offer a free trial?',
    description:
      'Absolutely! You can start with our Starter plan for free to explore the platform, and we often offer 7-day trials for our Pro features.',
  },
  {
    title: 'Which social media platforms do you support?',
    description:
      'We currently support Instagram, Facebook, Twitter (X), and LinkedIn, with more platforms being added regularly.',
  },
  {
    title: 'How secure is my data?',
    description:
      'We take security seriously. All your data and generated content are encrypted and stored securely. We never share your private prompts or data with third parties.',
  },
]


export const navLinks = [
  { label: 'features', href: '#features' },
  { label: 'social', href: '#social' },
  { label: 'pricing', href: '#pricing' },
  { label: 'blog', href: '#blog' },
  { label: 'testimonials', href: '#testimonials' },
  { label: 'faq', href: '#faq' },
]

export const plans = [
  {
    id: 'starter',
    name: 'starter',
    icon: Zap,
    price: { monthly: '0', yearly: '0' },
    description: 'starter_desc',
    features: [
      { name: '10_ai_images_/_mo', included: true },
      { name: '100_chat_messages', included: true },
      { name: 'basic_social_posts', included: true },
      { name: 'standard_support', included: true },
      { name: 'priority_support', included: false },
      { name: 'api_access', included: false },
    ],
    isPopular: false,
    color: 'from-blue-400 to-cyan-400',
  },
  {
    id: 'pro',
    name: 'pro',
    icon: Crown,
    price: { monthly: '29', yearly: '290' },
    description: 'pro_desc',
    features: [
      { name: 'unlimited_ai_images', included: true },
      { name: 'unlimited_chat_messages', included: true },
      { name: 'advanced_social_tools', included: true },
      { name: 'priority_support', included: true },
      { name: 'api_access', included: true },
      { name: 'custom_ai_models', included: false },
    ],
    isPopular: true,
    color: 'from-primary via-secondary to-primary',
  },
  {
    id: 'enterprise',
    name: 'enterprise',
    icon: Shield,
    price: { monthly: '99', yearly: '990' },
    description: 'enterprise_desc',
    features: [
      { name: 'custom_ai_models', included: true },
      { name: 'team_collaboration', included: true },
      { name: 'dedicated_manager', included: true },
      { name: 'white_label_options', included: true },
      { name: 'custom_training', included: true },
      { name: 'api_access', included: true },
    ],
    isPopular: false,
    color: 'from-purple-400 to-pink-400',
  },
]

export const testimonials: Testimonial[] = [
  {
    name: 'Sarah Johnson',
    role: 'Social Media Manager',
    content:
      'Smart AI Content Generation Suite has completely transformed our workflow. What used to take days of planning and editing now happens in minutes.',
    avatar: 'https://i.pravatar.cc/100?img=1',
    rating: 5,
  },
  {
    name: 'Michael Chen',
    role: 'Creative Director at PixelFlow',
    content: "The most intuitive AI platform I've used.",
    avatar: 'https://i.pravatar.cc/100?img=2',
    rating: 5,
  },
  {
    name: 'Elena Rodriguez',
    role: 'Independent Content Creator',
    content: 'As a solo creator, time is my most valuable asset.',
    avatar: 'https://i.pravatar.cc/100?img=3',
    rating: 5,
  },
  {
    name: 'David Wilson',
    role: 'Marketing Head at TechPulse',
    content:
      "We've seen a 40% increase in our social engagement since we started using Smart AI Content Generation Suite.",
    avatar: 'https://i.pravatar.cc/100?img=4',
    rating: 5,
  },
  {
    name: 'Sophie Martin',
    role: 'Digital Strategist',
    content: 'The "Magic Hooks" feature is incredible.',
    avatar: 'https://i.pravatar.cc/100?img=5',
    rating: 5,
  },
]

export const platforms = [
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: '#E1306C' },
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: '#1877F2' },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: '#0A66C2' },
  { id: 'twitter', name: 'Twitter', icon: Twitter, color: '#1DA1F2' },
  { id: 'youtube', name: 'YouTube', icon: Youtube, color: '#FF0000' },
  { id: 'threads', name: 'Threads', icon: ThreadsIcon, color: '#FFFFFF' },
]

export const platformContent = {
  instagram: {
    badge: 'Instagram Excellence',
    title: 'Master Your',
    highlight: 'Instagram Presence',
    description:
      'Create aesthetic posts, viral reels, and engaging stories with AI-powered visuals and captions tailored for Instagram.',
    gradient: 'from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]',
    secondaryColor: 'text-[#ee2a7b]',
    features: [
      { title: 'Aesthetic Posts', description: 'Generate visually stunning post concepts and captions.', icon: ImageIcon },
      { title: 'Viral Reels', description: 'AI-powered scripts for high-engagement short-form video.', icon: Sparkles },
      { title: 'Story Magic', description: 'Interactive story ideas that keep your followers engaged.', icon: Layout },
    ],
  },
  facebook: {
    badge: 'Facebook Mastery',
    title: 'Grow Your',
    highlight: 'Facebook Community',
    description:
      'Boost engagement with community-focused posts, viral video scripts, and optimized ad copy for Facebook.',
    gradient: 'from-[#1877F2] to-[#00A3FF]',
    secondaryColor: 'text-[#1877F2]',
    features: [
      { title: 'Community Engagement', description: 'Posts designed to spark conversations and shares.', icon: MessageSquare },
      { title: 'Video Scripts', description: 'Compelling scripts for Facebook Watch and long-form video.', icon: Sparkles },
      { title: 'Ad Optimization', description: 'High-converting ad copy that drives real business results.', icon: Layout },
    ],
  },
  linkedin: {
    badge: 'LinkedIn Authority',
    title: 'Build Your',
    highlight: 'Professional Brand',
    description:
      'Publish thought-leadership posts, network updates, and industry insights designed to grow your professional influence.',
    gradient: 'from-[#0A66C2] to-[#0077B5]',
    secondaryColor: 'text-[#0A66C2]',
    features: [
      { title: 'Thought Leadership', description: 'Write engaging professional posts and articles.', icon: FileText },
      { title: 'B2B Networking', description: 'Grow your network with business-focused content.', icon: Users },
      { title: 'Brand Authority', description: 'Establish credibility in your industry.', icon: Shield },
    ],
  },
  twitter: {
    badge: 'Twitter Impact',
    title: 'Grow Your',
    highlight: 'Twitter Audience',
    description:
      'Write engaging tweets, build viral threads, and schedule updates to boost your presence and network on Twitter.',
    gradient: 'from-[#1DA1F2] to-[#0D8ECF]',
    secondaryColor: 'text-[#1DA1F2]',
    features: [
      { title: 'Viral Tweets', description: 'AI-generated tweets optimized for high engagement and retweets.', icon: Sparkles },
      { title: 'Thread Builder', description: 'Create logical, interesting threads that tell a story.', icon: FileText },
      { title: 'Audience Building', description: 'Strategies and posts that convert views into active followers.', icon: Users },
    ],
  },
  youtube: {
    badge: 'YouTube Growth',
    title: 'Grow Your',
    highlight: 'YouTube Channel',
    description:
      'Draft video scripts, optimize descriptions, create catchy titles, and design YouTube Shorts to maximize watch time.',
    gradient: 'from-[#FF0000] to-[#FF4D4D]',
    secondaryColor: 'text-[#FF0000]',
    features: [
      { title: 'Video Scripts', description: 'Well-structured outlines and full video scripts.', icon: FileText },
      { title: 'YouTube Shorts', description: 'Catchy concepts for YouTube Shorts.', icon: Sparkles },
      { title: 'SEO Titles & Tags', description: 'Titles and descriptions optimized for search.', icon: Layout },
    ],
  },
  threads: {
    badge: 'Threads Engagement',
    title: 'Elevate Your',
    highlight: 'Threads Community',
    description:
      'Share text updates, join public conversations, and post viral threads with AI-optimized content.',
    gradient: 'from-white via-neutral-300 to-neutral-500',
    secondaryColor: 'text-white',
    features: [
      { title: 'Text Updates', description: 'Draft compelling short-form text posts that spark replies.', icon: MessageSquare },
      { title: 'Community Conversations', description: 'Create threads designed to drive engagement and comments.', icon: Sparkles },
      { title: 'Profile Authority', description: 'Build a strong brand presence with optimized bios and sharing.', icon: Layout },
    ],
  },
}

export const TABS = [
  { id: 'hero', label: 'Hero', icon: Rocket, description: 'Main landing header' },
  { id: 'features', label: 'Features', icon: Layers, description: 'Highlight key values' },
  { id: 'social', label: 'Social', icon: Share2, description: 'Social media section' },
  { id: 'pricing', label: 'Pricing', icon: DollarSign, description: 'Subscription plans' },
  { id: 'blog', label: 'Blog', icon: FileText, description: 'Latest articles' },
  { id: 'testimonials', label: 'Testimonials', icon: MessageCircle, description: 'Customer feedback' },
  { id: 'faq', label: 'FAQ', icon: HelpCircle, description: 'Common questions' },
  { id: 'contact', label: 'Contact', icon: Phone, description: 'Get in touch info' },
  { id: 'footer', label: 'Footer', icon: Layout, description: 'Footer links' },
]