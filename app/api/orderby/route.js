import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import OrderBy from '@/models/OrderBy';

// Helper function to check authentication
async function isAuthenticated(req) {
  const session = await getServerSession(authOptions);
  return session !== null ? session : false;
}

// Logger helper
const logger = {
  info: (message, meta = {}) => console.log(`INFO: ${message}`, meta),
  warn: (message, meta = {}) => console.warn(`WARN: ${message}`, meta),
  error: (message, meta = {}) => console.error(`ERROR: ${message}`, meta)
};

export async function GET(req) {
  try {
    const authenticated = await isAuthenticated(req);
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    // Initialize default options if none exist
    const count = await OrderBy.countDocuments();
    if (count === 0) {
      await OrderBy.initializeDefaults();
    }
    
    const orderByOptions = await OrderBy.find({ isActive: true }).sort({ name: 1 });
    
    return NextResponse.json(orderByOptions);
  } catch (error) {
    logger.error(`Failed to fetch order by options: ${error.message}`);
    return NextResponse.json({ error: 'Failed to fetch order by options' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const authenticated = await isAuthenticated(req);
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    
    const orderBy = new OrderBy({
      name: body.name,
      createdBy: 'user'
    });
    
    await orderBy.save();
    
    return NextResponse.json(orderBy, { status: 201 });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Person name already exists' }, { status: 400 });
    }
    logger.error(`Failed to create order by option: ${error.message}`);
    return NextResponse.json({ error: 'Failed to create order by option' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const authenticated = await isAuthenticated(req);
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID parameter is required' }, { status: 400 });
    }
    
    const deletedOrderBy = await OrderBy.findByIdAndDelete(id);
    
    if (!deletedOrderBy) {
      return NextResponse.json({ error: 'Order by option not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Order by option deleted successfully' });
  } catch (error) {
    logger.error(`Failed to delete order by option: ${error.message}`);
    return NextResponse.json({ error: 'Failed to delete order by option' }, { status: 500 });
  }
}