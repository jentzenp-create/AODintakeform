import Image from 'next/image';
import Link from 'next/link';
import CalendarEmbed from './CalendarEmbed';

export const metadata = {
  title: 'Strategy Session with Joe Wexler | Acres of Diamonds',
  description: 'Book a session with Joe Wexler to map out your financial future.',
};

export default function BookWithJoePage() {
  return (
    <main className="min-h-screen relative overflow-hidden bg-dark">
      {/* Animated Background matching the rest of the application */}
      <div className="bg-animated">
        <div className="orb-1" />
        <div className="orb-2" />
        <div className="grid-overlay" />
      </div>

      {/* Header */}
      <header className="relative z-20 w-full glass-card max-w-7xl mx-auto mt-6 px-6 py-4 flex items-center justify-between rounded-3xl mb-12 border border-[var(--border-glass)] shadow-xl">
        <Link href="/" className="flex items-center gap-4 group transition-transform hover:scale-105">
          <img 
            src="/images/aod-logo.svg" 
            alt="Acres of Diamonds" 
            className="h-10 w-auto group-hover:drop-shadow-[0_0_15px_rgba(92,157,215,0.5)] transition-all duration-300"
          />
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-[var(--primary-light)] text-transparent bg-clip-text hidden sm:block">Acres of Diamonds</h2>
        </Link>
        <Link href="/" className="inline-flex items-center text-sm font-semibold text-[var(--text-secondary)] hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-xl border border-white/5 hover:bg-white/10">
          <span className="hidden sm:inline">Back to Main</span>
          <span className="inline sm:hidden">Go Back</span>
        </Link>
      </header>

      {/* Main Layout Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pb-24">
        
        {/* Landing Hero Section */}
        <div className="text-center mb-24 max-w-3xl mx-auto relative mt-8">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight text-white drop-shadow-lg leading-tight">
            Schedule Your <br className="md:hidden" /><span className="bg-gradient-to-r from-[var(--primary-light)] to-[var(--primary)] text-transparent bg-clip-text">Strategy Session</span>
          </h1>
          <p className="text-lg md:text-xl text-[var(--text-secondary)] font-medium max-w-2xl mx-auto">
            Take the first step toward building a solid financial roadmap with professional guidance tailored to your goals.
          </p>
        </div>

        {/* Content Section (Stacked & Centered) */}
        <div className="flex flex-col items-center gap-20 max-w-4xl mx-auto">
          
          {/* Top: Bio & Image */}
          <div className="w-full mt-12">
            {/* Image & Name Profile Card */}
            <div className="glass-card w-full p-6 sm:p-10 md:p-12 flex flex-col items-center">
              <div className="w-48 h-48 sm:w-56 sm:h-56 mx-auto mb-6 rounded-full overflow-hidden border-[4px] border-[var(--primary)] shadow-[0_0_40px_rgba(92,157,215,0.4)] relative mt-[-100px] sm:mt-[-120px] bg-[#0a0a0f]">
                <img 
                  src="/images/joe-wexler.jpg" 
                  alt="Joe Wexler" 
                  className="w-full h-full object-cover" 
                />
              </div>
              
              <h2 className="text-3xl sm:text-4xl font-bold mb-2 text-center text-white tracking-widest leading-none mt-2">JOE WEXLER</h2>
              <p className="text-[var(--primary)] text-center font-bold tracking-[0.2em] text-xs sm:text-sm uppercase mb-10">Financial Advisor</p>
              
              <div className="text-[var(--text-secondary)] space-y-6 text-[1.05rem] sm:text-lg leading-relaxed text-center px-2 sm:px-8">
                <p>
                  Knowledge is the key to a successful financial future. My background, experience and commitment to providing you with the resources you need to make financial decisions, can help make your financial future as successful as you need it to be.
                </p>
                <div className="h-px bg-white/10 w-1/3 mx-auto my-8"/>
                <p>
                  I pride myself in getting to know each client so that I can understand their individual needs and what matters most to them. This helps me recommend products and strategies designed to meet their current needs, and more importantly, their future needs.
                </p>
              </div>
              
            </div>
          </div>
          
          {/* Bottom: Calendar Embed */}
          <div className="w-full relative mt-4">
            <h3 className="text-2xl md:text-3xl font-bold text-center mb-8 drop-shadow-md bg-gradient-to-r from-white to-[var(--primary-light)] text-transparent bg-clip-text">Select a Date & Time</h3>
            
            {/* Soft backdrop glow behind calendar */}
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--glow)] to-[var(--glow-strong)] blur-3xl opacity-50 z-0 rounded-3xl -m-4 mt-12"></div>
            
            <div className="glass-card-elevated p-2 sm:p-4 lg:p-6 min-h-[800px] flex flex-col border-[var(--border-glass)] relative z-10 transition-transform duration-500 hover:scale-[1.01] w-full">
              <CalendarEmbed />
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}

