# Habib Mohamed Gouda - Portfolio Website

A production-ready portfolio website built with Next.js 14, TypeScript, Tailwind CSS, and Supabase.

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env.local` file in the root directory with:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```
   The service role key is required for the contact form API (server-only; never exposed to the client).

3. **Add profile image:**
   Place your profile photo at `public/profile.jpg`

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

- `/app` - Next.js App Router pages and layouts
- `/components` - Reusable React components
- `/lib` - Utility functions and Supabase clients
- `/types` - TypeScript type definitions
- `/public` - Static assets

## Features

- ✅ Server-side rendering with Next.js 14 App Router
- ✅ TypeScript strict mode
- ✅ Tailwind CSS for styling
- ✅ Supabase integration for data fetching
- ✅ SEO-friendly metadata
- ✅ Responsive design
- ✅ Dynamic project pages with sections and images
- ✅ Contact form with Supabase storage, validation, and rate limiting

## Troubleshooting

If styles aren't loading:
1. Make sure dependencies are installed: `npm install`
2. Restart the dev server: Stop (Ctrl+C) and run `npm run dev` again
3. Clear Next.js cache: Delete `.next` folder and restart
4. Check browser console for errors

If Supabase errors occur:
- Verify your `.env.local` file has correct credentials
- The app will still render without Supabase data (shows empty states)
