import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Purchase from '@/models/Purchase';
import Pending from '@/models/Pending';
import Expense from '@/models/Expense';
import Import from '@/models/Import';
import Shipping from '@/models/Shipping';
import Vendor from '@/models/Vendor';

// Helper function to check authentication
async function isAuthenticated() {
  const session = await getServerSession(authOptions);
  return session !== null ? session : false;
}

export async function GET(req) {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const url = new URL(req.url);
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    // Build date filter if provided
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Fetch all data
    const [
      purchases,
      pending,
      expenses,
      imports,
      shipping,
      vendors
    ] = await Promise.all([
      Purchase.find(dateFilter),
      Pending.find({ ...dateFilter, status: { $in: ['Pending', 'Received'] }, qtyPending: { $gt: 0 } }),
      Expense.find(dateFilter),
      Import.find(dateFilter),
      Shipping.find(dateFilter),
      Vendor.find({})
    ]);

    // Calculate purchase statistics
    const totalPurchases = purchases.length;
    const totalPurchaseAmount = purchases.reduce((sum, p) => sum + (p.totalInAED || 0), 0);
    const purchasedCount = purchases.filter(p => p.status === 'Purchased').length;
    const quotationCount = purchases.filter(p => p.status === 'Quotation').length;

    // Calculate pending statistics (only active pending/received)
    const totalPending = pending.length;
    const urgentPending = pending.filter(p => p.priority === 'Urgent').length;
    const receivedPending = pending.filter(p => p.status === 'Received').length;
    const pendingItems = pending.filter(p => p.status === 'Pending').length;
    // Note: Shipped items now excluded via query filter above

    // Calculate expense statistics
    const totalExpenses = expenses.length;
    const totalCreditAmount = expenses.reduce((sum, e) => sum + (e.creditAmount || 0), 0);
    const totalDebitAmount = expenses.reduce((sum, e) => sum + (e.debitAmount || 0), 0);
    const currentBalance = totalCreditAmount - totalDebitAmount;

    // Calculate import statistics
    const totalImports = imports.length;
    const totalImportAmount = imports.reduce((sum, i) => sum + (i.amountDutyPaid || 0), 0);
    const receivedImports = imports.filter(i => i.status === 'Received').length;
    const enrouteImports = imports.filter(i => i.status === 'Enroute').length;

    // Calculate shipping statistics
    const totalShipments = shipping.length;
    const totalShippedQuantity = shipping.reduce((sum, s) => sum + (s.quantityShipped || 0), 0);
    const shippedCount = shipping.filter(s => s.status === 'Shipped').length;

    // Recent activity (last 10 items)
    const recentPurchases = await Purchase.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select('itemDescription totalInAED status createdAt vendorName');

    const recentExpenses = await Expense.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select('category amount type createdAt remark');

    // Category breakdown
    const categoryBreakdown = expenses.reduce((acc, expense) => {
      const category = expense.category || 'Other';
      if (!acc[category]) {
        acc[category] = { count: 0, amount: 0 };
      }
      acc[category].count++;
      acc[category].amount += expense.amount || 0;
      return acc;
    }, {});

    // Monthly trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyPurchases = await Purchase.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          total: { $sum: '$totalInAED' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    const monthlyExpenses = await Expense.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          total: { $sum: '$debitAmount' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    return NextResponse.json({
      summary: {
        purchases: {
          total: totalPurchases,
          totalAmount: totalPurchaseAmount,
          purchased: purchasedCount,
          quotations: quotationCount
        },
        pending: {
          total: totalPending,
          urgent: urgentPending,
          received: receivedPending,
          pending: pendingItems
        },
        expenses: {
          total: totalExpenses,
          totalCredit: totalCreditAmount,
          totalDebit: totalDebitAmount,
          balance: currentBalance
        },
        imports: {
          total: totalImports,
          totalAmount: totalImportAmount,
          received: receivedImports,
          enroute: enrouteImports
        },
        shipping: {
          total: totalShipments,
          totalQuantity: totalShippedQuantity,
          shipped: shippedCount
        },
        vendors: {
          total: vendors.length
        }
      },
      recentActivity: {
        purchases: recentPurchases,
        expenses: recentExpenses
      },
      categoryBreakdown,
      trends: {
        purchases: monthlyPurchases,
        expenses: monthlyExpenses
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}
