'use client';

import { useEffect } from 'react';

export default function CalendarEmbed() {
  useEffect(() => {
    // Inject the LeadConnector script explicitly on the client
    const script = document.createElement('script');
    script.src = "https://link.msgsndr.com/js/form_embed.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Optional cleanup
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="flex-1 w-full bg-white rounded-2xl block p-2 md:p-4 shadow-xl">
      <iframe 
        src="https://api.leadconnectorhq.com/widget/booking/nrNdQt2rIRUnVAi9kfqH" 
        style={{ width: '100%', border: 'none', overflow: 'hidden', minHeight: '800px' }} 
        scrolling="no" 
        id="nrNdQt2rIRUnVAi9kfqH_1773961207864"
        title="Booking Calendar for Joe Wexler"
      />
    </div>
  );
}
