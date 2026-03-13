import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Purchase, { Vendor } from '@/models/Purchase';
import Pending from '@/models/Pending';
import Expense from '@/models/Expense';

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

async function createPendingEntry(purchase) {
  const pendingEntry = new Pending({
    srNo: `PND-${purchase.serialNumber}`,
    itemDescription: purchase.itemDescription,
    qtyPending: purchase.quantity,
    shipment: 'Local Purchase',
    priority: 'Not Urgent',
    status: purchase.status === 'Purchased' ? 'Received' : 'Pending',
  });
  await pendingEntry.save();
  return pendingEntry;
}

async function createExpenseEntry(purchase) {
  if (purchase.status === 'Purchased' && purchase.paymentAccount) {
    const expenseEntry = new Expense({
      type: 'expense',
      category: 'LOCAL PURCHASE',
      account: purchase.paymentAccount,
      amount: purchase.totalInAED,
      creditAmount: 0,
      debitAmount: purchase.totalInAED,
      remark: `Purchase: ${purchase.itemDescription} from ${purchase.vendorName}`,
      date: purchase.dateOfPurchase,
      srNo: `EXP-${Date.now()}`,
      sourceExpense: `Purchase - ${purchase.itemDescription}`,
      comment: `Purchase from ${purchase.vendorName} - ${purchase.currency} ${purchase.total} (AED ${purchase.totalInAED})`
    });
    await expenseEntry.save();
    return expenseEntry;
  }
  return null;
}

export async function GET(req) {
  try {
    logger.info('GET request received for purchases', {
      method: 'GET',
      path: '/api/purchase'
    });
    
    const authenticated = await isAuthenticated(req);
    if (!authenticated) {
      logger.warn('Unauthorized attempt to access purchases', {
        method: 'GET',
        path: '/api/purchase',
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
    const getDescriptions = url.searchParams.get('descriptions');
    
    if (getDescriptions === 'true') {
      // Return unique item descriptions for suggestions
      const descriptions = await Purchase.distinct('itemDescription');
      return NextResponse.json(descriptions);
    }

    const purchases = await Purchase.find({})
      .populate('vendor', 'company salespersonName contact email')
      .sort({ srNo: -1 });
    
    logger.info('Purchases fetched successfully', {
      method: 'GET',
      path: '/api/purchase',
      count: purchases.length,
      statusCode: 200
    });
    
    return NextResponse.json(purchases);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    logger.error(`Failed to fetch purchases: ${errorMessage}`, {
      method: 'GET',
      path: '/api/purchase',
      statusCode: 500,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { error: 'Failed to fetch purchases' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    logger.info('POST request received for purchases', {
      method: 'POST',
      path: '/api/purchase'
    });
    
    const authenticated = await isAuthenticated(req);
    if (!authenticated) {
      logger.warn('Unauthorized attempt to create purchase', {
        method: 'POST',
        path: '/api/purchase',
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
    
    // Populate vendor name if vendor is provided and not empty
    if (body.vendor && body.vendor !== '') {
      const vendor = await Vendor.findById(body.vendor);
      if (!vendor) {
        return NextResponse.json(
          { error: 'Vendor not found' },
          { status: 400 }
        );
      }
      body.vendorName = vendor.company;
    } else {
      // Handle empty vendor - set to undefined
      body.vendor = undefined;
      body.vendorName = body.vendorName || '';
    }
    
    const purchase = new Purchase(body);
    await purchase.save();

    // Automated workflows
    await createPendingEntry(purchase);
    const expenseEntry = await createExpenseEntry(purchase);
    
    logger.info('Purchase created successfully', {
      method: 'POST',
      path: '/api/purchase',
      purchaseId: purchase._id,
      pendingCreated: true,
      expenseCreated: !!expenseEntry,
      statusCode: 201
    });
    
    return NextResponse.json(purchase, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    logger.error(`Failed to create purchase: ${errorMessage}`, {
      method: 'POST',
      path: '/api/purchase',
      statusCode: 500,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { error: 'Failed to create purchase' },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    logger.info('PUT request received for purchases', {
      method: 'PUT',
      path: '/api/purchase'
    });
    
    const authenticated = await isAuthenticated(req);
    if (!authenticated) {
      logger.warn('Unauthorized attempt to update purchase', {
        method: 'PUT',
        path: '/api/purchase',
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

    // Get vendor information if vendor is being updated
    if (body.vendor) {
      const vendor = await Vendor.findById(body.vendor);
      if (!vendor) {
        return NextResponse.json(
          { error: 'Vendor not found' },
          { status: 400 }
        );
      }
      body.vendorName = vendor.company;
    }

    // Populate vendor name if not provided and vendor is specified
    if (body.vendor && body.vendor !== '' && !body.vendorName) {
      const vendor = await Vendor.findById(body.vendor);
      if (vendor) {
        body.vendorName = vendor.company;
      }
    }

    // Handle empty vendor - set to undefined instead of empty string
    if (body.vendor === '') {
      body.vendor = undefined;
    }
    
    const updatedPurchase = await Purchase.findByIdAndUpdate(id, body, { new: true });
    
    if (!updatedPurchase) {
      return NextResponse.json(
        { error: 'Purchase not found' },
        { status: 404 }
      );
    }
    
    logger.info('Purchase updated successfully', {
      method: 'PUT',
      path: '/api/purchase',
      purchaseId: id,
      statusCode: 200
    });
    
    return NextResponse.json(updatedPurchase);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    logger.error(`Failed to update purchase: ${errorMessage}`, {
      method: 'PUT',
      path: '/api/purchase',
      statusCode: 500,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { error: 'Failed to update purchase' },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    logger.info('DELETE request received for purchases', {
      method: 'DELETE',
      path: '/api/purchase'
    });
    
    const authenticated = await isAuthenticated(req);
    if (!authenticated) {
      logger.warn('Unauthorized attempt to delete purchase', {
        method: 'DELETE',
        path: '/api/purchase',
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
    
    const deletedPurchase = await Purchase.findByIdAndDelete(id);
    
    if (!deletedPurchase) {
      return NextResponse.json(
        { error: 'Purchase not found' },
        { status: 404 }
      );
    }
    
    logger.info('Purchase deleted successfully', {
      method: 'DELETE',
      path: '/api/purchase',
      purchaseId: id,
      statusCode: 200
    });
    
    return NextResponse.json({ message: 'Purchase deleted successfully' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    logger.error(`Failed to delete purchase: ${errorMessage}`, {
      method: 'DELETE',
      path: '/api/purchase',
      statusCode: 500,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { error: 'Failed to delete purchase' },
      { status: 500 }
    );
  }
}