import { useState } from "react";
import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaYoutube, FaWhatsapp } from "react-icons/fa";
import { FiMail, FiPhone, FiMapPin, FiX, FiCheckCircle } from "react-icons/fi";
import { AwesomeLogo } from "./Navbar";
import NewsletterCTA from "./NewsletterCTA";
import { MOCK_CONTACT_MESSAGES } from "../../../../../admin/src/data/mockAdminData";

export default function Footer() {
  const [showContactModal, setShowContactModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    const newMsg = {
      id: `msg-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || '+91 98243 02072',
      subject: subject.trim() || 'General Inquiry',
      message: message.trim(),
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'New' as const
    };

    MOCK_CONTACT_MESSAGES.unshift(newMsg);

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setShowContactModal(false);
      setName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
    }, 2000);
  };

  return (
    <footer className="mt-8 bg-white font-sans">
      <NewsletterCTA />
      
      <div className="mx-auto grid max-w-[1500px] gap-10 px-5 py-16 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 md:px-8">
        {/* Brand Column */}
        <div className="col-span-1 sm:col-span-2 lg:col-span-2 xl:col-span-2">
          <div className="mb-4">
            <AwesomeLogo />
          </div>
          <p className="mt-4 max-w-sm text-xs sm:text-sm text-brand-ink/70 leading-relaxed">
            100% Handcrafted Indian Heritage Craft, Traditional Jewellery, Bridal Latkans, Cholis, and Artisan Gifts made with love in Surat, Gujarat.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <a
              href="https://www.facebook.com/awesomehandmade1#"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="grid h-9 w-9 place-items-center rounded-full border border-brand-gold/30 text-brand-ink hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2] transition-all"
            >
              <FaFacebookF size={13} />
            </a>
            <a
              href="https://www.instagram.com/awesome.handmade1?igsh=OWtwd2huMmR5YnFz"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="grid h-9 w-9 place-items-center rounded-full border border-brand-gold/30 text-brand-ink hover:bg-[#E1306C] hover:text-white hover:border-[#E1306C] transition-all"
            >
              <FaInstagram size={13} />
            </a>
            <a
              href="https://wa.me/919824302072"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="grid h-9 w-9 place-items-center rounded-full border border-brand-gold/30 text-brand-ink hover:bg-[#25D366] hover:text-white hover:border-[#25D366] transition-all"
            >
              <FaWhatsapp size={14} />
            </a>
            <a
              href="https://www.youtube.com/channel/UCZhBD5VMLRLHg95ppgoqtNQ"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="grid h-9 w-9 place-items-center rounded-full border border-brand-gold/30 text-brand-ink hover:bg-[#FF0000] hover:text-white hover:border-[#FF0000] transition-all"
            >
              <FaYoutube size={13} />
            </a>
          </div>
        </div>

        {/* Quick Categories */}
        <div className="col-span-1">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-maroon mb-4">Categories</p>
          <ul className="space-y-2.5 text-xs sm:text-sm text-brand-ink/75">
            <li><Link to="/shop?category=Latkan" className="hover:text-brand-maroon">Bridal & Blouse Latkans</Link></li>
            <li><Link to="/shop?category=Necklace" className="hover:text-brand-maroon">Mirror Necklaces</Link></li>
            <li><Link to="/shop?category=Choli" className="hover:text-brand-maroon">Navratri Choli Sets</Link></li>
            <li><Link to="/shop?category=Earrings" className="hover:text-brand-maroon">Kundan & Mirror Earrings</Link></li>
            <li><Link to="/shop?category=Gift Hamper" className="hover:text-brand-maroon">Festive Gift Hampers</Link></li>
            <li><Link to="/shop?category=Krishna Outfit" className="hover:text-brand-maroon">Krishna Outfits</Link></li>
          </ul>
        </div>

        {/* Information & Store Links */}
        <div className="col-span-1">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-maroon mb-4">Customer Care</p>
          <ul className="space-y-2.5 text-xs sm:text-sm text-brand-ink/75">
            <li>
              <Link to="/contact" className="hover:text-brand-maroon font-medium text-brand-ink">
                Contact & Support
              </Link>
            </li>
            <li><Link to="/about" className="hover:text-brand-maroon">About Our Heritage</Link></li>
            <li><a href="#" className="hover:text-brand-maroon">Shipping &amp; Delivery</a></li>
            <li><a href="#" className="hover:text-brand-maroon">Custom Bridal Orders</a></li>
            <li><a href="#" className="hover:text-brand-maroon">FAQs &amp; Help</a></li>
          </ul>
        </div>

        {/* Store Address & Contact */}
        <div className="col-span-1">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-maroon mb-4">Artisan Studio</p>
          <div className="space-y-2.5 text-xs sm:text-sm text-brand-ink/75">
            <p className="font-semibold text-brand-ink">Awesome Handmade</p>
            <p className="flex items-start gap-2">
              <FiMapPin className="text-brand-gold mt-1 shrink-0" size={14} />
              <span>Shop-5, Soham Arcade, Pal Gam, Surat, Gujarat, India</span>
            </p>
            <p className="flex items-center gap-2">
              <FiPhone className="text-brand-gold shrink-0" size={14} />
              <a href="tel:+919824302072" className="hover:text-brand-maroon font-bold">+91 98243 02072</a>
            </p>
            <p className="flex items-center gap-2">
              <FiMail className="text-brand-gold shrink-0" size={14} />
              <a href="mailto:hello@awesomehandmade.com" className="hover:text-brand-maroon">hello@awesomehandmade.com</a>
            </p>
          </div>
        </div>
      </div>

      <div className="py-4">
        <div className="mx-auto flex max-w-[1500px] flex-col sm:flex-row items-center justify-between px-5 text-xs text-brand-ink/60 gap-2">
          <p>© {new Date().getFullYear()} Awesome Handmade. All rights reserved.</p>
          <p className="text-[11px]">Crafted with love in Surat, Gujarat</p>
        </div>
      </div>
    </footer>
  );
}
