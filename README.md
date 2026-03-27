# StreamView - Professional Streaming Platform

A modern, responsive streaming platform built with Next.js, React, and Tailwind CSS featuring glassmorphism design.

## 🚀 Quick Start

### Prerequisites:
- Node.js 18+
- npm or yarn

### Installation:
```bash
cd d:\Mov\streaming-app
npm install
npm run dev
```

Visit `http://localhost:3000`

## 📱 Pages

- **Home** (`/`) - Featured content & categories
- **Movies** (`/movies`) - All movies with search & infinite scroll
- **Series** (`/series`) - All TV series
- **Miscellaneous** (`/miscellaneous`) - Varied content
- **Search** (`/search?q=...`) - Search results

## 🎨 Features

✨ **Glassmorphism Design** - Modern semi-transparent cards with blur effect  
🔍 **Real-time Search** - Live filtering across all content  
♾️ **Infinite Scroll** - Automatic content loading on scroll  
📱 **Fully Responsive** - Mobile, tablet, desktop optimized  
🌙 **Dark Theme** - Netflix-style professional interface  
🎯 **Arabic Support** - Full RTL (right-to-left) support  

## 🛠️ Technologies

- **Next.js 14+** - React framework
- **React 19+** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **Mock Data** - Sample content (ready for API integration)

## 📁 Project Structure

```
app/
├── page.tsx              # Home page
├── movies/page.tsx       # Movies page
├── series/page.tsx       # Series page
├── miscellaneous/page.tsx # Miscellaneous page
├── search/page.tsx       # Search results
├── layout.tsx            # Root layout
└── globals.css           # Global styles

components/
├── Header.tsx            # Navigation
├── Footer.tsx            # Footer
├── SearchBar.tsx         # Search component
├── ContentCard.tsx       # Item card
├── CategorySection.tsx   # Top 10 sections
└── ContentGrid.tsx       # Grid with infinite scroll

lib/
└── mockData.ts           # Sample data
```

## 🎯 Key Components

- **ContentCard**: Displays individual items with hover effects
- **Header**: Navigation bar with mobile menu support
- **SearchBar**: Real-time search functionality
- **ContentGrid**: Responsive grid with infinite scroll
- **CategorySection**: Featured content sections (Top 10)
- **Footer**: Social media links & quick navigation

## 🔍 Search Features

- Real-time filtering by title and description
- Auto-redirect to search results page
- Supports all content across categories
- Case-insensitive search

## ∞ Infinite Scroll

- Loads 20 items initially
- Auto-loads 20 more on scroll to bottom
- Loading indicator
- "All loaded" message on completion

## 📦 Build & Deploy

```bash
# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 🔮 Future Features

- [ ] Content detail pages
- [ ] User ratings & comments
- [ ] Watchlist/favorites
- [ ] User authentication
- [ ] Personalized recommendations
- [ ] Advanced filtering
- [ ] Video player
- [ ] Multiple language support

## 📖 For More Details

See [README_AR.md](./README_AR.md) for detailed Arabic documentation.

---

**© 2024 StreamView - Built with Next.js & ❤️**
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
