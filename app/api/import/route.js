import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Import from '@/models/Import';
import { Vendor } from '@/models/Purchase';
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

async function createExpenseFromImport(importItem) {
  if (importItem.amountDutyPaid > 0) {
    // Get the next expense srNo
    const lastExpense = await Expense.findOne().sort({ createdAt: -1 });
    let nextSrNo = 1;
    if (lastExpense && lastExpense.srNo) {
      const lastNumber = parseInt(lastExpense.srNo.replace('EXP-', ''));
      nextSrNo = lastNumber + 1;
    }

    const expenseEntry = new Expense({
      srNo: `EXP-${nextSrNo.toString().padStart(4, '0')}`,
      type: 'expense',
      category: 'Import Duty',
      account: importItem.paymentMode || 'cash',
      bankName: importItem.bankName || '',
      amount: importItem.amountDutyPaid,
      sourceExpense: `Import Duty - ${importItem.serialNumber}`,
      debitAmount: importItem.amountDutyPaid,
      creditAmount: 0,
      remark: `Duty paid for import ${importItem.serialNumber} - ${importItem.invoiceNumber}`,
      comment: `Duty paid for import ${importItem.serialNumber} - ${importItem.invoiceNumber}`,
      date: importItem.dateOfReceiving || importItem.dateOfShipping,
    });
    await expenseEntry.save();
    logger.info('Expense entry created for import duty', { importId: importItem._id, expenseId: expenseEntry._id });
  }
}

async function createPendingFromImport(importItem) {
  if (importItem.items && importItem.items.length > 0) {
    for (let i = 0; i < importItem.items.length; i++) {
      const item = importItem.items[i];
      const pendingEntry = new Pending({
        srNo: `${importItem.serialNumber}-${(i + 1).toString().padStart(2, '0')}`,
        itemDescription: item.itemDescription,
        qtyPending: item.quantity,
        shipment: 'Import',
        priority: 'Not Urgent',
        status: importItem.status === 'Received' ? 'Received' : 'Enroute',
      });
      await pendingEntry.save();
    }
    logger.info('Pending entries created for import', { importId: importItem._id, itemCount: importItem.items.length });
  }
}

export async function GET(req) {
  try {
    logger.info('GET request received for imports', {
      method: 'GET',
      path: '/api/import'
    });
    
    const authenticated = await isAuthenticated(req);
    if (!authenticated) {
      logger.warn('Unauthorized attempt to access imports', {
        method: 'GET',
        path: '/api/import',
        statusCode: 401,
        authorized: false
      });
      
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const imports = await Import.find({})
      .populate('vendor', 'company salespersonName contact')
      .sort({ createdAt: -1 });
    
    logger.info('Imports fetched successfully', {
      method: 'GET',
      path: '/api/import',
      count: imports.length,
      statusCode: 200
    });
    
    return NextResponse.json(imports);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    logger.error(`Failed to fetch imports: ${errorMessage}`, {
      method: 'GET',
      path: '/api/import',
      statusCode: 500,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { error: 'Failed to fetch imports' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    logger.info('POST request received for imports', {
      method: 'POST',
      path: '/api/import'
    });
    
    const authenticated = await isAuthenticated(req);
    if (!authenticated) {
      logger.warn('Unauthorized attempt to create import', {
        method: 'POST',
        path: '/api/import',
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
    
    // Populate vendor name if not provided
    if (body.vendor && !body.vendorName) {
      const vendor = await Vendor.findById(body.vendor);
      if (vendor) {
        body.vendorName = vendor.company;
      }
    }

    const importItem = new Import(body);
    await importItem.save();

    // Automated workflows
    await createExpenseFromImport(importItem);
    await createPendingFromImport(importItem);
    
    logger.info('Import created successfully', {
      method: 'POST',
      path: '/api/import',
      importId: importItem._id,
      statusCode: 201
    });
    
    return NextResponse.json(importItem, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    logger.error(`Failed to create import: ${errorMessage}`, {
      method: 'POST',
      path: '/api/import',
      statusCode: 500,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { error: 'Failed to create import' },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    logger.info('PUT request received for imports', {
      method: 'PUT',
      path: '/api/import'
    });
    
    const authenticated = await isAuthenticated(req);
    if (!authenticated) {
      logger.warn('Unauthorized attempt to update import', {
        method: 'PUT',
        path: '/api/import',
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
    
    const oldImport = await Import.findById(id);
    if (!oldImport) {
      return NextResponse.json(
        { error: 'Import not found' },
        { status: 404 }
      );
    }
    
    // Populate vendor name if not provided
    if (body.vendor && !body.vendorName) {
      const vendor = await Vendor.findById(body.vendor);
      if (vendor) {
        body.vendorName = vendor.company;
      }
    }
    
    const updatedImport = await Import.findByIdAndUpdate(id, body, { new: true });
    
    // If status changed to 'Received' or duty amount changed, update workflows
    if (oldImport.status !== 'Received' && updatedImport.status === 'Received') {
      await createPendingFromImport(updatedImport);
    }
    
    if (oldImport.amountDutyPaid !== updatedImport.amountDutyPaid && updatedImport.amountDutyPaid > 0) {
      await createExpenseFromImport(updatedImport);
    }
    
    logger.info('Import updated successfully', {
      method: 'PUT',
      path: '/api/import',
      importId: id,
      statusCode: 200
    });
    
    return NextResponse.json(updatedImport);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    logger.error(`Failed to update import: ${errorMessage}`, {
      method: 'PUT',
      path: '/api/import',
      statusCode: 500,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { error: 'Failed to update import' },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    logger.info('DELETE request received for imports', {
      method: 'DELETE',
      path: '/api/import'
    });
    
    const authenticated = await isAuthenticated(req);
    if (!authenticated) {
      logger.warn('Unauthorized attempt to delete import', {
        method: 'DELETE',
        path: '/api/import',
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
    
    const deletedImport = await Import.findByIdAndDelete(id);
    
    if (!deletedImport) {
      return NextResponse.json(
        { error: 'Import not found' },
        { status: 404 }
      );
    }
    
    logger.info('Import deleted successfully', {
      method: 'DELETE',
      path: '/api/import',
      importId: id,
      statusCode: 200
    });
    
    return NextResponse.json({ message: 'Import deleted successfully' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    logger.error(`Failed to delete import: ${errorMessage}`, {
      method: 'DELETE',
      path: '/api/import',
      statusCode: 500,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { error: 'Failed to delete import' },
      { status: 500 }
    );
  }
}