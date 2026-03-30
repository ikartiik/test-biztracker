import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Pending from '@/models/Pending';

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
    logger.info('GET request received for pending items', {
      method: 'GET',
      path: '/api/pending'
    });
    
    const authenticated = await isAuthenticated(req);
    if (!authenticated) {
      logger.warn('Unauthorized attempt to access pending items', {
        method: 'GET',
        path: '/api/pending',
        statusCode: 401,
        authorized: false
      });
      
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const pending = await Pending.find({ status: { $in: ['Pending', 'Received'] } }).sort({ createdAt: -1 });
    
    logger.info('Pending items fetched successfully', {
      method: 'GET',
      path: '/api/pending',
      count: pending.length,
      statusCode: 200
    });
    
    return NextResponse.json(pending);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    logger.error(`Failed to fetch pending items: ${errorMessage}`, {
      method: 'GET',
      path: '/api/pending',
      statusCode: 500,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { error: 'Failed to fetch pending items' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    logger.info('POST request received for pending items', {
      method: 'POST',
      path: '/api/pending'
    });
    
    const authenticated = await isAuthenticated(req);
    if (!authenticated) {
      logger.warn('Unauthorized attempt to create pending item', {
        method: 'POST',
        path: '/api/pending',
        statusCode: 401,
        authorized: false
      });
      
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const body = await req.json();
    const pendingItem = new Pending(body);
    await pendingItem.save();
    
    logger.info('Pending item created successfully', {
      method: 'POST',
      path: '/api/pending',
      pendingId: pendingItem._id,
      statusCode: 201
    });
    
    return NextResponse.json(pendingItem, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    logger.error(`Failed to create pending item: ${errorMessage}`, {
      method: 'POST',
      path: '/api/pending',
      statusCode: 500,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { error: 'Failed to create pending item' },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    logger.info('PUT request received for pending items', {
      method: 'PUT',
      path: '/api/pending'
    });
    
    const authenticated = await isAuthenticated(req);
    if (!authenticated) {
      logger.warn('Unauthorized attempt to update pending item', {
        method: 'PUT',
        path: '/api/pending',
        statusCode: 401,
        authorized: false
      });
      
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    const body = await req.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID parameter is required' },
        { status: 400 }
      );
    }
    
    const pendingItem = await Pending.findById(id);
    if (!pendingItem) {
      return NextResponse.json(
        { error: 'Pending item not found' },
        { status: 404 }
      );
    }

    // If only priority is being updated (from inline dropdown)
    if (body.priority && Object.keys(body).length === 1) {
      const updatedPending = await Pending.findByIdAndUpdate(
        id,
        { priority: body.priority },
        { new: true }
      );
      
      logger.info('Pending item priority updated', {
        method: 'PUT',
        path: '/api/pending',
        pendingId: id,
        statusCode: 200
      });
      
      return NextResponse.json(updatedPending);
    }
    
    // Regular full update
    const updateData = {
      itemDescription: body.itemDescription,
      qtyPending: parseInt(body.qtyPending) || 0,
      shipment: body.shipment,
      priority: body.priority,
      status: body.status,
    };
    
    // If status is being changed to "Shipped", remove from pending and create shipping entry
    if (body.status === 'Shipped' && pendingItem.status !== 'Shipped') {
      const Shipping = require('@/models/Shipping').default;
      
      const shippingEntry = new Shipping({
        srNo: pendingItem.srNo,
        itemDescription: pendingItem.itemDescription,
        quantity: pendingItem.qtyPending,
        quantityShipped: pendingItem.qtyPending,
        dateOfShipping: new Date(),
        source: pendingItem.shipment,
        status: 'Shipped'
      });
      
      await shippingEntry.save();
      await Pending.findByIdAndDelete(id);
      
      logger.info('Pending item moved to shipped', {
        method: 'PUT',
        path: '/api/pending',
        pendingId: id,
        shippingId: shippingEntry._id,
        statusCode: 200
      });
      
      return NextResponse.json({ 
        message: 'Item moved to shipping tracker',
        shippingEntry 
      });
    }
    
    const updatedPending = await Pending.findByIdAndUpdate(id, updateData, { new: true });
    
    logger.info('Pending item updated successfully', {
      method: 'PUT',
      path: '/api/pending',
      pendingId: id,
      statusCode: 200
    });
    
    return NextResponse.json(updatedPending);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    logger.error(`Failed to update pending item: ${errorMessage}`, {
      method: 'PUT',
      path: '/api/pending',
      statusCode: 500,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { error: 'Failed to update pending item' },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    logger.info('DELETE request received for pending items', {
      method: 'DELETE',
      path: '/api/pending'
    });
    
    const authenticated = await isAuthenticated(req);
    if (!authenticated) {
      logger.warn('Unauthorized attempt to delete pending item', {
        method: 'DELETE',
        path: '/api/pending',
        statusCode: 401,
        authorized: false
      });
      
      return NextResponse.json(
        { error: 'Unauthorized' },
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
    
    const deletedPending = await Pending.findByIdAndDelete(id);
    
    if (!deletedPending) {
      return NextResponse.json(
        { error: 'Pending item not found' },
        { status: 404 }
      );
    }
    
    logger.info('Pending item deleted successfully', {
      method: 'DELETE',
      path: '/api/pending',
      pendingId: id,
      statusCode: 200
    });
    
    return NextResponse.json({ message: 'Pending item deleted successfully' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    logger.error(`Failed to delete pending item: ${errorMessage}`, {
      method: 'DELETE',
      path: '/api/pending',
      statusCode: 500,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { error: 'Failed to delete pending item' },
      { status: 500 }
    );
  }
}