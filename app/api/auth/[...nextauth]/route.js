import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

// Logger helper
const logger = {
  info: (message, meta = {}) => console.log(`INFO: ${message}`, meta),
  warn: (message, meta = {}) => console.warn(`WARN: ${message}`, meta),
  error: (message, meta = {}) => console.error(`ERROR: ${message}`, meta)
};

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        logger.info('Authentication attempt', {
          username: credentials?.username,
          path: '/api/auth/[...nextauth]'
        });

        await dbConnect();
        
        try {
          const user = await User.findOne({ username: credentials.username });
          
          if (user && await user.comparePassword(credentials.password)) {
            logger.info('Authentication successful', {
              username: credentials.username,
              userId: user._id,
              role: user.role,
              path: '/api/auth/[...nextauth]'
            });

            return {
              id: user._id,
              username: user.username,
              email: user.email,
              role: user.role,
            };
          }

          logger.warn('Authentication failed - Invalid credentials', {
            username: credentials?.username,
            path: '/api/auth/[...nextauth]'
          });

          return null;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          
          logger.error(`Authentication error: ${errorMessage}`, {
            username: credentials?.username,
            path: '/api/auth/[...nextauth]',
            error: errorMessage,
            stack: error instanceof Error ? error.stack : undefined
          });

          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.username = user.username;
        
        logger.info('JWT token created', {
          userId: user.id,
          username: user.username,
          role: user.role,
          path: '/api/auth/[...nextauth]'
        });
      }
      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role;
      session.user.username = token.username;
      session.user.id = token.sub;
      
      logger.info('Session created', {
        userId: token.sub,
        username: token.username,
        role: token.role,
        path: '/api/auth/[...nextauth]'
      });

      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  events: {
    async signOut(message) {
      logger.info('User signed out', {
        userId: message.token?.sub,
        username: message.token?.username,
        path: '/api/auth/[...nextauth]'
      });
    },
    async session(message) {
      logger.info('Session accessed', {
        userId: message.session?.user?.id,
        username: message.session?.user?.username,
        path: '/api/auth/[...nextauth]'
      });
    }
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };