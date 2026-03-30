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
  const srNo = `PND-${purchase.serialNumber}`;

  // Check if pending entry already exists
  const existingPending = await Pending.findOne({ srNo });

  if (existingPending) {
    // Update existing entry
    existingPending.itemDescription = purchase.itemDescription;
    existingPending.qtyPending = purchase.quantity;
    existingPending.status = purchase.status === 'Purchased' ? 'Received' : 'Pending';
    await existingPending.save();
    return existingPending;
  }

  // Create new entry
  const pendingEntry = new Pending({
    srNo,
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
  if (purchase.status === 'Purchased' && purchase.paymentAccount && purchase.totalInAED > 0) {
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
      comment: `Purchase from ${purchase.vendorName} - ${purchase.currency} ${purchase.total} (AED ${purchase.totalInAED})`,
      linkedPurchaseId: purchase._id
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
      .sort({ srNo: 1 });
    
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
    const pendingEntry = await createPendingEntry(purchase);
    const expenseEntry = await createExpenseEntry(purchase);

    // Link the entries to the purchase
    if (pendingEntry) {
      purchase.linkedPendingId = pendingEntry._id;
    }
    if (expenseEntry) {
      purchase.linkedExpenseId = expenseEntry._id;
    }
    if (pendingEntry || expenseEntry) {
      await purchase.save();
    }

    logger.info('Purchase created successfully', {
      method: 'POST',
      path: '/api/purchase',
      purchaseId: purchase._id,
      pendingCreated: !!pendingEntry,
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

    // Update linked pending entry
    if (updatedPurchase.linkedPendingId) {
      const existingPending = await Pending.findById(updatedPurchase.linkedPendingId);
      if (existingPending) {
        existingPending.itemDescription = updatedPurchase.itemDescription;
        existingPending.qtyPending = updatedPurchase.quantity;
        existingPending.status = updatedPurchase.status === 'Purchased' ? 'Received' : 'Pending';
        await existingPending.save();

        logger.info('Pending entry updated for purchase', {
          purchaseId: id,
          pendingId: existingPending._id
        });
      }
    } else {
      // No linked pending, create one
      const newPending = await createPendingEntry(updatedPurchase);
      if (newPending) {
        updatedPurchase.linkedPendingId = newPending._id;
        await updatedPurchase.save();

        logger.info('Pending entry created for updated purchase', {
          purchaseId: id,
          pendingId: newPending._id
        });
      }
    }

    // Handle expense entry creation/update for "Purchased" status with payment account
    if (updatedPurchase.status === 'Purchased' && updatedPurchase.paymentAccount) {
      if (updatedPurchase.linkedExpenseId) {
        // Update existing expense entry
        const existingExpense = await Expense.findById(updatedPurchase.linkedExpenseId);

        if (existingExpense) {
          existingExpense.account = updatedPurchase.paymentAccount;
          existingExpense.amount = updatedPurchase.totalInAED;
          existingExpense.debitAmount = updatedPurchase.totalInAED;
          existingExpense.remark = `Purchase: ${updatedPurchase.itemDescription} from ${updatedPurchase.vendorName}`;
          existingExpense.comment = `Purchase from ${updatedPurchase.vendorName} - ${updatedPurchase.currency} ${updatedPurchase.total} (AED ${updatedPurchase.totalInAED})`;
          existingExpense.date = updatedPurchase.dateOfPurchase;

          await existingExpense.save();

          logger.info('Expense entry updated for purchase', {
            purchaseId: id,
            expenseId: existingExpense._id
          });
        } else {
          // Linked expense was deleted, create a new one
          const newExpense = await createExpenseEntry(updatedPurchase);
          if (newExpense) {
            updatedPurchase.linkedExpenseId = newExpense._id;
            await updatedPurchase.save();

            logger.info('New expense entry created (previous was deleted)', {
              purchaseId: id,
              expenseId: newExpense._id
            });
          }
        }
      } else {
        // No linked expense, create a new one
        const newExpense = await createExpenseEntry(updatedPurchase);
        if (newExpense) {
          // Store the expense ID in the purchase
          updatedPurchase.linkedExpenseId = newExpense._id;
          await updatedPurchase.save();

          logger.info('Expense entry created for updated purchase', {
            purchaseId: id,
            expenseId: newExpense._id,
            status: updatedPurchase.status
          });
        }
      }
    } else if (updatedPurchase.status !== 'Purchased' && updatedPurchase.linkedExpenseId) {
      // Status changed from "Purchased" to something else, delete the expense entry
      await Expense.findByIdAndDelete(updatedPurchase.linkedExpenseId);
      updatedPurchase.linkedExpenseId = undefined;
      await updatedPurchase.save();

      logger.info('Expense entry deleted due to status change', {
        purchaseId: id,
        newStatus: updatedPurchase.status
      });
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

    // First, get the purchase details before deleting
    const purchase = await Purchase.findById(id);

    if (!purchase) {
      return NextResponse.json(
        { error: 'Purchase not found' },
        { status: 404 }
      );
    }

    // Import Shipping model for cascade delete
    const Shipping = require('@/models/Shipping').default;

    // CASCADE DELETE: Delete all related entries
    const cascadeResults = {
      pending: 0,
      shipping: 0,
      expense: 0
    };

    try {
      // 1. Delete linked pending entry using the reference
      if (purchase.linkedPendingId) {
        const deletedPending = await Pending.findByIdAndDelete(purchase.linkedPendingId);
        cascadeResults.pending = deletedPending ? 1 : 0;
      } else {
        // Fallback: Delete by text matching (for old entries without linkedPendingId)
        const deletedPending = await Pending.deleteMany({
          srNo: { $regex: purchase.serialNumber, $options: 'i' }
        });
        cascadeResults.pending = deletedPending.deletedCount || 0;
      }

      // 2. Delete related shipping entries
      // Shipping entries linked by sourceId and sourceModel
      const deletedShipping = await Shipping.deleteMany({
        sourceId: purchase._id,
        sourceModel: 'Purchase'
      });
      cascadeResults.shipping = deletedShipping.deletedCount || 0;

      // 3. Delete linked expense entry using the reference
      if (purchase.linkedExpenseId) {
        const deletedExpense = await Expense.findByIdAndDelete(purchase.linkedExpenseId);
        cascadeResults.expense = deletedExpense ? 1 : 0;
      } else {
        // Fallback: Delete by linkedPurchaseId or text matching (for old entries)
        const deletedExpenses = await Expense.deleteMany({
          $or: [
            { linkedPurchaseId: purchase._id },
            { remark: { $regex: `Purchase: ${purchase.itemDescription}`, $options: 'i' } },
            { remark: { $regex: purchase.serialNumber, $options: 'i' } },
            { sourceExpense: { $regex: `Purchase - ${purchase.itemDescription}`, $options: 'i' } }
          ]
        });
        cascadeResults.expense = deletedExpenses.deletedCount || 0;
      }

    } catch (cascadeError) {
      logger.error('Error during cascade delete', {
        error: cascadeError instanceof Error ? cascadeError.message : 'Unknown error',
        purchaseId: id
      });
      // Continue with purchase deletion even if cascade fails
    }

    // Finally, delete the purchase itself
    const deletedPurchase = await Purchase.findByIdAndDelete(id);

    logger.info('Purchase and related entries deleted successfully', {
      method: 'DELETE',
      path: '/api/purchase',
      purchaseId: id,
      serialNumber: purchase.serialNumber,
      cascadeResults,
      statusCode: 200
    });

    return NextResponse.json({
      message: 'Purchase and all related entries deleted successfully',
      deletedPurchase,
      cascadeResults
    });
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