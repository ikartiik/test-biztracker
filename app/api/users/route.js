import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

// Helper function to check authentication and admin role
async function isAuthenticated(req, requiredRole = null) {
  const session = await getServerSession(authOptions);
  
  console.log('Auth check:', {
    hasSession: !!session,
    user: session?.user,
    userRole: session?.user?.role,
    requiredRole,
    roleMatch: session?.user?.role === requiredRole
  });
  
  if (!session) return false;
  if (requiredRole && session.user?.role !== requiredRole) return false;
  return session;
}

// Logger helper
const logger = {
  info: (message, meta = {}) => console.log(`INFO: ${message}`, meta),
  warn: (message, meta = {}) => console.warn(`WARN: ${message}`, meta),
  error: (message, meta = {}) => console.error(`ERROR: ${message}`, meta)
};

export async function GET(req) {
  try {
    logger.info('GET request received for users', {
      method: 'GET',
      path: '/api/users'
    });
    
    const session = await isAuthenticated(req, 'admin');
    if (!session) {
      logger.warn('Unauthorized attempt to access users - Admin access required', {
        method: 'GET',
        path: '/api/users',
        statusCode: 401,
        authorized: false
      });
      
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    await dbConnect();

    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    
    logger.info('Users fetched successfully', {
      method: 'GET',
      path: '/api/users',
      count: users.length,
      statusCode: 200
    });
    
    return NextResponse.json(users);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    logger.error(`Failed to fetch users: ${errorMessage}`, {
      method: 'GET',
      path: '/api/users',
      statusCode: 500,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    logger.info('POST request received for users', {
      method: 'POST',
      path: '/api/users'
    });
    
    const session = await isAuthenticated(req, 'admin');
    if (!session) {
      logger.warn('Unauthorized attempt to create user - Admin access required', {
        method: 'POST',
        path: '/api/users',
        statusCode: 401,
        authorized: false
      });
      
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    await dbConnect();

    const body = await req.json();
    const { username, email, password, role } = body;
    
    const existingUser = await User.findOne({ 
      $or: [{ username }, { email }] 
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'Username or email already exists' },
        { status: 400 }
      );
    }

    const user = new User({ username, email, password, role });
    await user.save();
    
    const userResponse = user.toObject();
    delete userResponse.password;
    
    logger.info('User created successfully', {
      method: 'POST',
      path: '/api/users',
      userId: user._id,
      username: user.username,
      statusCode: 201
    });
    
    return NextResponse.json(userResponse, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    logger.error(`Failed to create user: ${errorMessage}`, {
      method: 'POST',
      path: '/api/users',
      statusCode: 500,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    logger.info('PUT request received for users', {
      method: 'PUT',
      path: '/api/users'
    });
    
    const session = await isAuthenticated(req, 'admin');
    if (!session) {
      logger.warn('Unauthorized attempt to update user - Admin access required', {
        method: 'PUT',
        path: '/api/users',
        statusCode: 401,
        authorized: false
      });
      
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    await dbConnect();

    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    const updateData = await req.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID parameter is required' },
        { status: 400 }
      );
    }
    
    if (updateData.password) {
      // Password will be hashed by the pre-save middleware
      const user = await User.findById(id);
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      
      user.password = updateData.password;
      user.username = updateData.username;
      user.email = updateData.email;
      user.role = updateData.role;
      user.isActive = updateData.isActive;
      await user.save();
      
      const userResponse = user.toObject();
      delete userResponse.password;
      
      logger.info('User updated successfully with password change', {
        method: 'PUT',
        path: '/api/users',
        userId: id,
        statusCode: 200
      });
      
      return NextResponse.json(userResponse);
    } else {
      delete updateData.password;
      const user = await User.findByIdAndUpdate(id, updateData, { new: true, select: '-password' });
      
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      
      logger.info('User updated successfully', {
        method: 'PUT',
        path: '/api/users',
        userId: id,
        statusCode: 200
      });
      
      return NextResponse.json(user);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    logger.error(`Failed to update user: ${errorMessage}`, {
      method: 'PUT',
      path: '/api/users',
      statusCode: 500,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    logger.info('DELETE request received for users', {
      method: 'DELETE',
      path: '/api/users'
    });
    
    const session = await isAuthenticated(req, 'admin');
    if (!session) {
      logger.warn('Unauthorized attempt to delete user - Admin access required', {
        method: 'DELETE',
        path: '/api/users',
        statusCode: 401,
        authorized: false
      });
      
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    await dbConnect();

    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID parameter is required' },
        { status: 400 }
      );
    }
    
    // Prevent admin from deleting themselves
    if (session.user.id === id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }
    
    const deletedUser = await User.findByIdAndDelete(id);
    
    if (!deletedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    logger.info('User deleted successfully', {
      method: 'DELETE',
      path: '/api/users',
      userId: id,
      statusCode: 200
    });
    
    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    logger.error(`Failed to delete user: ${errorMessage}`, {
      method: 'DELETE',
      path: '/api/users',
      statusCode: 500,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}