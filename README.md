# AOD Intake Form

An immersive, Typeform-style intake form built with Next.js, Framer Motion, and Supabase.

## Features

- 🎨 **Immersive Design** — Glassmorphism, animated gradients, and smooth transitions
- 📱 **Fully Responsive** — Works beautifully on desktop and mobile
- ⌨️ **Keyboard Friendly** — Press Enter to advance, Ctrl+Enter for text areas
- 📊 **Progress Bar** — Visual indicator of completion progress
- ✅ **Validation** — Inline field validation with friendly error messages
- 🗄️ **Supabase Backend** — Data stored securely in PostgreSQL

## Setup

### 1. Install Dependencies

```bash
cd aod-form
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase-schema.sql`
3. Go to **Settings > API** and copy your:
   - **Project URL** (e.g. `https://xxxxx.supabase.co`)
   - **anon public key**

### 3. Configure Environment Variables

Create a `.env.local` file in the `aod-form` directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Deploy to Vercel

1. Push your code to GitHub
2. Import the repository in [Vercel](https://vercel.com)
3. Set the **Root Directory** to `aod-form` (if the repo root is `AOD Form`)
4. Add your environment variables in **Settings > Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy!

## Form Fields

| Step | Field | Type |
|------|-------|------|
| 1 | Name | Text |
| 2 | Phone Number | Tel |
| 3 | Email | Email |
| 4 | Business Name | Text |
| 5 | Why are you passionate about what you do? | Textarea |
| 6 | Fun Fact: proud accomplishment | Textarea |
| 7 | Goals for this month/year | Textarea |
| 8 | Who do you need to meet? | Textarea |

## Tech Stack

- **Next.js 16** — React framework
- **Framer Motion** — Animations
- **Supabase** — PostgreSQL database
- **Vercel** — Hosting & deployment
