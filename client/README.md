# CrimeShield Frontend

This is the frontend application for CrimeShield, a comprehensive crime reporting and analysis platform built with Next.js 15.

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm, yarn, or pnpm
- The backend server must be running (see main README.md)

### Installation

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env.local` file in the client directory:

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

3. **Set up the database:**

   ```bash
   # Generate Prisma client
   npx prisma generate

   # Run database migrations
   npx prisma migrate dev
   ```

4. **Start the development server:**

   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:5174](http://localhost:5174)

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── (auth)/            # Authentication pages
│   ├── (root)/            # Main application pages
│   │   ├── admin/         # Admin panel
│   │   ├── post/          # Individual post pages
│   │   └── profile/       # User profile pages
│   └── api/               # API routes
├── components/            # React components
│   ├── admin-ui/          # Admin panel components
│   ├── newsfeed/          # News feed components
│   └── ui/                # Reusable UI components
├── context/               # React context providers
├── hooks/                 # Custom React hooks
└── lib/                   # Utilities and configurations
    └── db/                # Database configuration
```

## 🔧 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:migrate` - Run database migrations
- `npm run db:reset` - Reset and migrate database
- `npm run db:studio` - Open Prisma Studio

## 🎯 Key Features

### Crime Reporting

- Submit crime reports with media attachments
- Real-time AI analysis of uploaded content
- Location-based reporting with map integration
- Threat level assessment and categorization

### AI-Powered Analysis

- **Deepfake Detection**: AI-powered detection of manipulated media
- **Content Analysis**: Automatic analysis of images and videos
- **Text Analysis**: Authenticity assessment of report descriptions
- **Sentiment Analysis**: Analysis of user comments and reactions

### Admin Panel

- **User Management**: Manage user accounts and permissions
- **Content Management**: Review and manage crime reports
- **Crawler Management**: Control news crawler settings
- **Analytics**: View platform statistics and insights

### Authentication

- GitHub OAuth integration
- Email/password authentication
- Secure session management
- Role-based access control

## 🛠️ Tech Stack

- **Next.js 15** - React framework with app router
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible UI components
- **NextAuth.js** - Authentication solution
- **Prisma** - Database ORM
- **Socket.IO Client** - Real-time communication
- **Lucide React** - Icon library

## 🔐 Authentication Setup

The application uses NextAuth.js for authentication. To set up GitHub OAuth:

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App
3. Set the Authorization callback URL to: `http://localhost:5174/api/auth/callback/github`
4. Add the Client ID and Client Secret to your `.env.local` file

## 📊 Database

The frontend uses SQLite with Prisma for user authentication and session management. The database file is automatically created when you run the migrations.

### Database Commands

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Reset database
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio
```

## 🚨 Troubleshooting

### Common Issues

1. **Port 5174 already in use:**

   ```bash
   lsof -ti:5174 | xargs kill -9
   ```

2. **Database connection issues:**

   ```bash
   npx prisma generate
   npx prisma migrate reset
   ```

3. **Module not found errors:**

   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **NextAuth issues:**
   - Ensure `NEXTAUTH_SECRET` is set in `.env.local`
   - Check that `NEXTAUTH_URL` matches your development URL

### Development Tips

- Use the browser's developer tools to monitor network requests
- Check the browser console for JavaScript errors
- Use Prisma Studio to inspect database data
- Monitor the terminal for server-side errors

## 🔗 API Integration

The frontend communicates with the backend API running on `http://localhost:5000`. Make sure the backend server is running before using the frontend.

### API Endpoints

- **Posts**: `/posts` - Crime report management
- **Comments**: `/posts/:id/comments` - Comment management
- **Reactions**: `/posts/:id/reactions` - Reaction management
- **Authentication**: `/api/auth/*` - NextAuth.js routes

## 🎨 Styling

The application uses Tailwind CSS for styling with custom components built using Radix UI primitives. The design system includes:

- Responsive design for all screen sizes
- Dark/light mode support
- Accessible UI components
- Consistent spacing and typography

## 📱 Responsive Design

The application is fully responsive and works on:

- Desktop computers
- Tablets
- Mobile phones
- Various screen orientations

## 🔄 Real-time Features

The application includes real-time features powered by Socket.IO:

- Live notifications
- Real-time comment updates
- Live reaction counts
- Instant status updates

## 🚀 Deployment

For production deployment:

1. Build the application:

   ```bash
   npm run build
   ```

2. Start the production server:

   ```bash
   npm start
   ```

3. Set appropriate environment variables for production

## 📝 Contributing

1. Follow the existing code style
2. Test your changes thoroughly
3. Update documentation as needed
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

For more information about the full project, see the main [README.md](../README.md) file.
