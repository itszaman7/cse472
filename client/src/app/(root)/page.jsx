import { auth } from '@/lib/auth';
import NewsfeedPage from './NewsFeedPage';

// This is a Server Component, so it can be async
export default async function Home() {
  // 1. Fetch the session data on the server
  const session = await auth();

  // 2. Pass the session data as a prop to the client component
  return <NewsfeedPage session={session} />;
}