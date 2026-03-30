import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Expense from '@/models/Expense';

// Helper function to check authentication
async function isAuthenticated(req) {
  const session = await getServerSession(authOptions);
  return session !== null ? session : false;
}

// Logger helper (you can replace with your preferred logging library)
const logger = {
  info: (message, meta = {}) => console.log(`INFO: ${message}`, meta),
  warn: (message, meta = {}) => console.warn(`WARN: ${message}`, meta),
  error: (message, meta = {}) => console.error(`ERROR: ${message}`, meta)
};

<<<<<<< HEAD
=======

>>>>>>> blackboxai/login-mongodb-fix
export async function GET(req) {
  try {
    logger.info('GET request received for expenses', {
      method: 'GET',
      path: '/api/expense'
    });
    
    const authenticated = await isAuthenticated(req);
    if (!authenticated) {
      logger.warn('Unauthorized attempt to access expenses', {
        method: 'GET',
        path: '/api/expense',
        statusCode: 401,
        authorized: false
      });
      
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const expenses = await Expense.find({}).sort({ createdAt: -1 });
    
    logger.info('Expenses fetched successfully', {
      method: 'GET',
      path: '/api/expense',
      count: expenses.length,
      statusCode: 200
    });
    
    return NextResponse.json(expenses);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    logger.error(`Failed to fetch expenses: ${errorMessage}`, {
      method: 'GET',
      path: '/api/expense',
      statusCode: 500,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    logger.info('POST request received for expenses', {
      method: 'POST',
      path: '/api/expense'
    });
<<<<<<< HEAD
    
=======

>>>>>>> blackboxai/login-mongodb-fix
    const authenticated = await isAuthenticated(req);
    if (!authenticated) {
      logger.warn('Unauthorized attempt to create expense', {
        method: 'POST',
        path: '/api/expense',
        statusCode: 401,
        authorized: false
      });
<<<<<<< HEAD
      
=======

>>>>>>> blackboxai/login-mongodb-fix
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const body = await req.json();
<<<<<<< HEAD
    
    // Calculate balance based on previous entry
    const latestExpense = await Expense.findOne().sort({ createdAt: -1 });
    const currentBalance = latestExpense ? latestExpense.balance : 0;
    
    const expenseData = body;
    expenseData.balance = currentBalance + (expenseData.creditAmount || 0) - (expenseData.debitAmount || 0);
    
    const expense = new Expense(expenseData);
    await expense.save();
    
=======

    // Calculate balance based on previous entry
    const latestExpense = await Expense.findOne().sort({ createdAt: -1 });
    const currentBalance = latestExpense ? latestExpense.balance : 0;

    const expenseData = body;
    expenseData.balance = currentBalance + (expenseData.creditAmount || 0) - (expenseData.debitAmount || 0);

    const expense = new Expense(expenseData);
    await expense.save();

>>>>>>> blackboxai/login-mongodb-fix
    logger.info('Expense created successfully', {
      method: 'POST',
      path: '/api/expense',
      expenseId: expense._id,
      statusCode: 201
    });
<<<<<<< HEAD
    
    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
=======

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

>>>>>>> blackboxai/login-mongodb-fix
    logger.error(`Failed to create expense: ${errorMessage}`, {
      method: 'POST',
      path: '/api/expense',
      statusCode: 500,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    });
<<<<<<< HEAD
    
=======

>>>>>>> blackboxai/login-mongodb-fix
    return NextResponse.json(
      { error: 'Failed to create expense' },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    logger.info('PUT request received for expenses', {
      method: 'PUT',
      path: '/api/expense'
    });
    
    const authenticated = await isAuthenticated(req);
    if (!authenticated) {
      logger.warn('Unauthorized attempt to update expense', {
        method: 'PUT',
        path: '/api/expense',
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
    
    const updatedExpense = await Expense.findByIdAndUpdate(id, body, { new: true });
    
    if (!updatedExpense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      );
    }
    
    logger.info('Expense updated successfully', {
      method: 'PUT',
      path: '/api/expense',
      expenseId: id,
      statusCode: 200
    });
    
    return NextResponse.json(updatedExpense);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    logger.error(`Failed to update expense: ${errorMessage}`, {
      method: 'PUT',
      path: '/api/expense',
      statusCode: 500,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { error: 'Failed to update expense' },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    logger.info('DELETE request received for expenses', {
      method: 'DELETE',
      path: '/api/expense'
    });
    
    const authenticated = await isAuthenticated(req);
    if (!authenticated) {
      logger.warn('Unauthorized attempt to delete expense', {
        method: 'DELETE',
        path: '/api/expense',
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
    
    const deletedExpense = await Expense.findByIdAndDelete(id);
    
    if (!deletedExpense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      );
    }
    
    logger.info('Expense deleted successfully', {
      method: 'DELETE',
      path: '/api/expense',
      expenseId: id,
      statusCode: 200
    });
    
    return NextResponse.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    logger.error(`Failed to delete expense: ${errorMessage}`, {
      method: 'DELETE',
      path: '/api/expense',
      statusCode: 500,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { error: 'Failed to delete expense' },
      { status: 500 }
    );
  }
}