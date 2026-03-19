import Script from 'next/script';
import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: 'Book a Strategy Session with Joe Wexler | Acres of Diamonds',
  description: 'Book a session with Joe Wexler. Knowledge is the key to a successful financial future.',
};

export default function BookWithJoePage() {
  return (
    <main className="min-h-screen relative pt-12 pb-24 overflow-hidden">
      {/* Animated Background matching the rest of the application */}
      <div className="bg-animated">
        <div className="orb-1" />
        <div className="orb-2" />
        <div className="grid-overlay" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col lg:flex-row gap-12 mt-12">
        {/* Left Column: Bio & Image */}
        <div className="w-full lg:w-5/12">
          <div className="glass-card p-8 lg:sticky lg:top-24">
            
            <Link href="/" className="inline-flex items-center text-[var(--text-muted)] hover:text-white transition-colors mb-8 text-sm group">
              <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Back to Home
            </Link>

            <div className="w-48 h-48 mx-auto mb-8 rounded-full overflow-hidden border-4 border-[var(--primary)] shadow-[0_0_30px_rgba(92,157,215,0.3)] relative">
              {/* Note: The user's image must be saved as /images/joe-wexler.jpg for this to resolve properly. */}
              <img 
                src="/images/joe-wexler.jpg" 
                alt="Joe Wexler" 
                className="w-full h-full object-cover" 
              />
            </div>
            
            <h1 className="text-3xl font-bold mb-2 text-center text-white tracking-tight">Joe Wexler</h1>
            <p className="text-[var(--primary-light)] text-center font-semibold tracking-widest text-sm uppercase mb-8">Financial Advisor</p>
            
            <div className="text-[var(--text-secondary)] space-y-5 text-[1.05rem] leading-relaxed">
              <p>
                Knowledge is the key to a successful financial future. My background, experience and commitment to providing you with the resources you need to make financial decisions, can help make your financial future as successful as you need it to be.
              </p>
              <p>
                I pride myself in getting to know each client so that I can understand their individual needs and what matters most to them. This helps me recommend products and strategies designed to meet their current needs, and more importantly, their future needs.
              </p>
            </div>
          </div>
        </div>
        
        {/* Right Column: Calendar Embed */}
        <div className="w-full lg:w-7/12">
          <div className="glass-card p-4 sm:p-6 lg:p-8 min-h-[800px] flex flex-col">
            <h2 className="text-2xl font-bold mb-6 text-white border-b border-[var(--border-glass)] pb-4">Schedule Your Strategy Session</h2>
            
            <div className="flex-1 w-full bg-white/5 rounded-xl block p-2">
              <iframe 
                src="https://api.leadconnectorhq.com/widget/booking/nrNdQt2rIRUnVAi9kfqH" 
                style={{ width: '100%', border: 'none', overflow: 'hidden', minHeight: '800px' }} 
                scrolling="no" 
                id="nrNdQt2rIRUnVAi9kfqH_1773961207864"
                title="Booking Calendar for Joe Wexler"
              ></iframe>
              <Script src="https://link.msgsndr.com/js/form_embed.js" strategy="lazyOnload" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
