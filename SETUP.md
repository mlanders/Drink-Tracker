# Drink Tracker - Setup Instructions

## What's Been Built

A complete drink tracking web application with:
- User authentication (signup/login)
- Daily drink counter with +/- buttons
- Monthly summary statistics
- Automated monthly cron job
- PostgreSQL database with Prisma ORM
- Next.js 15 with TypeScript
- Tailwind CSS styling
- Ready for Vercel deployment

## Next Steps

### 1. Set Up Database Credentials

Edit the `.env` file and add your PostgreSQL credentials:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"
CRON_SECRET="your-cron-secret-here"
```

Generate secrets with:
```bash
openssl rand -base64 32
```

### 2. Run Database Migrations

Push the schema to your database:
```bash
npm run prisma:push
```

Or create a migration:
```bash
npm run prisma:migrate
```

### 3. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000

### 4. Test the Application

1. Sign up for a new account
2. Log in with your credentials
3. Click "+" to add drinks
4. Click "-" to remove drinks
5. View your count persist on refresh

### 5. Deploy to Vercel

1. Push code to GitHub:
```bash
git add .
git commit -m "Complete drink tracker implementation"
git push
```

2. Connect to Vercel:
   - Go to vercel.com
   - Import your GitHub repository
   - Add environment variables in Vercel dashboard

3. Deploy and enjoy!

## Environment Variables for Vercel

Add these in the Vercel dashboard:

- `DATABASE_URL` - Your PostgreSQL connection string
- `NEXTAUTH_URL` - Your production URL (e.g., https://your-app.vercel.app)
- `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
- `CRON_SECRET` - Generate with `openssl rand -base64 32`

## Monthly Cron Job

The cron job runs automatically on the 1st of each month at midnight (UTC) when deployed to Vercel.

To test locally:
```bash
curl -X GET http://localhost:3000/api/cron/monthly \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Database Schema

- **Users**: Email, password (hashed), optional name
- **DrinkEntries**: User ID, count (+1 or -1), date, timestamp
- **MonthlySummaries**: User ID, year, month, total drinks, average per day, days tracked

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run prisma:push` - Push schema to database
- `npm run prisma:migrate` - Create database migration
- `npm run prisma:studio` - Open Prisma Studio (database GUI)

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma 7
- **Auth**: NextAuth.js v5
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Project Structure

```
drink-tracker/
├── app/
│   ├── api/
│   │   ├── auth/         # Authentication endpoints
│   │   ├── drinks/       # Drink tracking endpoints
│   │   ├── summary/      # Monthly summary endpoint
│   │   └── cron/         # Cron job endpoint
│   ├── dashboard/        # Main dashboard page
│   ├── login/            # Login page
│   ├── signup/           # Signup page
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Landing page
│   └── globals.css       # Global styles
├── components/
│   ├── DrinkCounter.tsx  # +/- buttons component
│   ├── MonthlySummary.tsx # Summary display
│   └── SessionProvider.tsx # Auth provider
├── lib/
│   ├── auth.ts           # NextAuth config
│   └── prisma.ts         # Prisma client
├── prisma/
│   └── schema.prisma     # Database schema
├── types/
│   └── index.ts          # TypeScript types
├── .env                  # Environment variables (you fill this in)
├── .env.example          # Environment template
├── vercel.json           # Vercel cron config
└── package.json          # Dependencies
```

## Support

If you encounter any issues:
1. Check that DATABASE_URL is correct
2. Ensure database is running and accessible
3. Run `npm run prisma:push` to sync schema
4. Check browser console for errors
5. Check terminal for server errors

Happy tracking! 🍺
