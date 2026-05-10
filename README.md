# Glide

> Master Move. Build on Sui. From zero to mainnet.

![Sui](https://img.shields.io/badge/Sui-Move-4DA2FF?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)

## Features

- **Zero Installation** - Everything runs in your browser. No toolchain setup, no CLI downloads.
- **Gamified Learning** - Earn XP, level up, unlock achievements, and maintain daily streaks to stay motivated.
- **Monaco Editor** - Professional code editing with full Move syntax highlighting and autocomplete.
- **Interactive Lessons** - 15 progressive lessons covering 7 Move fundamentals and 8 Sui Messaging SDK modules.
- **21+ Exercises** - Hands-on practice with four exercise types: Code Completion, Bug Fix, Multiple Choice, and Output Prediction.
- **Daily Challenges** - Fresh coding challenges every day to keep your skills sharp.
- **Dashboard** - Track your progress, review completed lessons, and monitor your learning stats.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| Code Editor | Monaco Editor |
| State Management | Zustand |
| Backend / Auth | Supabase |
| ORM | Prisma |

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to start learning.

## Project Structure

```
glide/
├── app/
│   ├── components/        # UI components
│   ├── lib/
│   │   ├── store/         # Zustand game state
│   │   └── lessons/       # Lesson content files
│   ├── data/              # Exercise database
│   ├── types/             # TypeScript types
│   ├── lessons/[id]/      # Dynamic lesson routes
│   └── page.tsx           # Homepage
├── public/
└── prisma/                # Database schema
```

## Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Contributing

Contributions are welcome.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## License

MIT License

## Acknowledgments

- [Sui](https://sui.io) - The blockchain platform powering the next generation of decentralized applications
- [Move Language](https://move-language.github.io/move/) - A safe, flexible programming language for digital assets
- [Mysten Labs](https://mystenlabs.com) - The team building the Sui network

---

Built for the Sui ecosystem.
