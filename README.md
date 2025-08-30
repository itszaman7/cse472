# CrimeShield - Crime Reporting and Analysis Platform

A comprehensive crime reporting and analysis platform built with Next.js, Express.js, and AI-powered content analysis. The platform allows users to report crimes, analyze content for authenticity, detect deepfakes, and provides an admin panel for content management.

## Features

- **Crime Reporting**: Users can submit crime reports with images, videos, and detailed descriptions
- **AI Content Analysis**: Automatic analysis of uploaded media for threat assessment and content verification
- **Deepfake Detection**: AI-powered detection of manipulated images and videos
- **News Crawler**: Automated news aggregation from multiple sources
- **Admin Panel**: Comprehensive admin interface for managing users, posts, and system settings
- **Real-time Updates**: Live notifications and updates using Socket.IO
- **Authentication**: Secure user authentication with NextAuth.js
- **Responsive Design**: Modern UI built with Tailwind CSS and Radix UI

## Tech Stack

### Frontend

- **Next.js 15** - React framework
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible UI components
- **NextAuth.js** - Authentication
- **Prisma** - Database ORM
- **Socket.IO Client** - Real-time communication

### Backend

- **Express.js** - Node.js web framework
- **MongoDB** - NoSQL database
- **Socket.IO** - Real-time communication
- **Multer** - File upload handling
- **Cheerio** - Web scraping
- **Google Translate API** - Content translation

### AI Services

- **Google Gemini AI** - Content analysis and threat assessment
- **Hugging Face** - Deepfake detection
- **Custom AI Models** - Text analysis and sentiment detection


##  Prerequisites


Before running this project, make sure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn** or **pnpm**
- **Git**


## Quick Start


### 1. Clone the Repository

```bash
git clone <repository-url>
cd cse372
```

### 2. Install Dependencies

Install dependencies for both client and server:

```bash
# Install client dependencies
cd client
pnpm install

# Install server dependencies
cd ../server
pnpm install
```

### 3. Environment Setup

#### Client Environment (.env.local)

Create a `.env.local` file in the `client` directory:

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:5174"
NEXTAUTH_SECRET="your-secret-key-here"

# GitHub OAuth (optional)
GITHUB_ID="your-github-client-id"
GITHUB_SECRET="your-github-client-secret"
```

#### Server Environment (.env)

Create a `.env` file in the `server` directory:

```env
# Server Configuration
PORT=5000

# Database Configuration
DB_USER=your-mongodb-username
DB_PASS=your-mongodb-password

# AI Services
GOOGLE_AI_API_KEY=your-google-ai-api-key

# File Upload (local storage)
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# News Crawler
CRAWLER_ENABLED=true
CRAWLER_INTERVAL="0 */6 * * *"
```

### 4. Database Setup

#### Client Database (SQLite)

The client uses SQLite with Prisma for user authentication:

```bash
cd client

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Open Prisma Studio to view/edit data
npx prisma studio
```

#### Server Database (MongoDB)

The server uses MongoDB for storing crime reports and other data. Make sure MongoDB is running locally or update the connection string in `server/index.js`.

### 5. Start the Development Servers

#### Start the Server

```bash
cd server
npm run dev
```

The server will start on `http://localhost:5000`

#### Start the Client

```bash
cd client
npm run dev
```

The client will start on `http://localhost:5174`

### 6. Access the Application

- **Frontend**: http://localhost:5174
- **Backend API**: http://localhost:5000
- **Admin Panel**: http://localhost:5174/admin

## 📁 Project Structure

```
cse372/
├── client/                 # Next.js frontend
│   ├── src/
│   │   ├── app/           # Next.js app router
│   │   ├── components/    # React components
│   │   ├── context/       # React context providers
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utilities and configurations
│   ├── public/            # Static assets
│   └── package.json
├── server/                # Express.js backend
│   ├── routes/            # API routes
│   ├── services/          # Business logic and external services
│   ├── config/            # Configuration files
│   └── package.json
└── README.md
```

## Available Scripts

### Client Scripts

```bash
cd client

# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npm run db:migrate   # Run database migrations
npm run db:reset     # Reset and migrate database
npm run db:studio    # Open Prisma Studio
```

### Server Scripts

```bash
cd server

# Development
npm run dev          # Start development server with nodemon
npm start           # Start production server
```

## Key Features Explained

### Crime Reporting

- Users can submit detailed crime reports with media attachments
- Automatic AI analysis of uploaded content
- Threat level assessment and categorization
- Location-based reporting with map integration

### AI Analysis

- **Media Analysis**: Analyzes images and videos for threat assessment
- **Deepfake Detection**: Detects manipulated media using AI models
- **Text Analysis**: Analyzes report descriptions for authenticity
- **Sentiment Analysis**: Analyzes user comments and reactions

### News Crawler

- Automated news aggregation from multiple sources
- AI-powered content analysis and categorization
- Automatic translation and processing
- Scheduled crawling with configurable intervals

### Admin Panel

- **User Management**: Manage user accounts and permissions
- **Content Management**: Review and manage crime reports
- **Crawler Management**: Control news crawler settings
- **Analytics**: View platform statistics and insights
- **System Settings**: Configure platform parameters

## Authentication

The application uses NextAuth.js for authentication with multiple providers:

- **GitHub OAuth** (configured)
- **Email/Password** (local authentication)
- **Session management** with secure cookies

## Database Schema

### Server Database (MongoDB)

- **Incident Reports**: Crime reports with metadata
- **Comments**: User comments on reports
- **Reactions**: User reactions and interactions
- **AI Analysis**: Stored AI analysis results


2. **Database Connection Issues**

   - Ensure MongoDB is running locally
   - Check environment variables are set correctly
   - Verify database credentials

3. **Prisma Issues**

   ```bash
   cd client
   npx prisma generate
   npx prisma migrate reset
   ```

4. **Node Modules Issues**
   ```bash
   # Clear node modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

### Development Tips

- Use `pnpm run dev` for both client and server during development
- Check browser console and server logs for errors
- Use Prisma Studio to inspect database data
- Monitor network requests in browser dev tools

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

