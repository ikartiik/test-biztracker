import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Shipping from '@/models/Shipping';
import Import from '@/models/Import';
import Purchase from '@/models/Purchase';
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

// Function to create shipping entries from imports
async function createShippingFromImports() {
  const imports = await Import.find({ status: 'Received' }).populate('vendor');
  const newShippingEntries = [];

  for (const importItem of imports) {
    if (importItem.items && importItem.items.length > 0) {
      for (const item of importItem.items) {
        // Check if shipping entry already exists
        const existingShipping = await Shipping.findOne({
          sourceId: importItem._id,
          itemDescription: item.itemDescription,
        });

        if (!existingShipping) {
          const shippingEntry = new Shipping({
            itemDescription: item.itemDescription,
            totalQuantity: item.quantity,
            source: 'Import',
            sourceId: importItem._id,
            sourceModel: 'Import',
            sourceSerialNumber: importItem.serialNumber,
            vendorName: importItem.vendorName,
            category: 'Import',
          });
          await shippingEntry.save();
          newShippingEntries.push(shippingEntry);
        }
      }
    }
  }
  return newShippingEntries;
}

// Function to create shipping entries from purchases
async function createShippingFromPurchases() {
  const purchases = await Purchase.find({ status: 'Purchased' }).populate('vendor');
  const newShippingEntries = [];

  for (const purchase of purchases) {
    // Check if shipping entry already exists
    const existingShipping = await Shipping.findOne({
      sourceId: purchase._id,
      itemDescription: purchase.itemDescription,
    });

    if (!existingShipping) {
      const shippingEntry = new Shipping({
        itemDescription: purchase.itemDescription,
        totalQuantity: purchase.quantity,
        source: 'Local Purchase',
        sourceId: purchase._id,
        sourceModel: 'Purchase',
        sourceSerialNumber: purchase.serialNumber,
        vendorName: purchase.vendorName,
        category: purchase.category,
      });
      await shippingEntry.save();
      newShippingEntries.push(shippingEntry);
    }
  }
  return newShippingEntries;
}

// Function to update pending tracker based on shipping
async function updatePendingTracker(shippingItem, shipmentEntry) {
  try {
    // Find corresponding pending entry by item description and source
    const pendingEntry = await Pending.findOne({
      itemDescription: shippingItem.itemDescription,
      $or: [
        { srNo: { $regex: shippingItem.sourceSerialNumber } },
        { shipment: shippingItem.source }
      ]
    });

    if (pendingEntry) {
      // Update pending quantity based on shipment
      const newPendingQty = Math.max(0, pendingEntry.qtyPending - shipmentEntry.quantityShipped);
      
      // Update pending entry
      pendingEntry.qtyPending = newPendingQty;
      
      // Update status based on shipping status
      if (shippingItem.status === 'Shipped') {
        pendingEntry.status = 'Shipped';
      } else if (shippingItem.status === 'Partially Shipped') {
        pendingEntry.status = 'Partially Shipped';
      } else {
        pendingEntry.status = 'Pending';
      }
      
      await pendingEntry.save();
      logger.info('Updated pending tracker', { 
        pendingId: pendingEntry._id, 
        newQty: pendingEntry.qtyPending,
        newStatus: pendingEntry.status
      });
    } else {
      logger.warn('No matching pending entry found for shipping item', {
        itemDescription: shippingItem.itemDescription,
        sourceSerialNumber: shippingItem.sourceSerialNumber
      });
    }
  } catch (error) {
    logger.error('Error updating pending tracker', { error: error.message });
  }
}

// Function to sync all shipping items with pending tracker
async function syncAllShippingWithPending() {
  try {
    const allShippingEntries = await Shipping.find({});
    
    for (const shippingEntry of allShippingEntries) {
      // Find matching pending entry
      const pendingEntry = await Pending.findOne({
        itemDescription: shippingEntry.itemDescription,
        $or: [
          { srNo: { $regex: shippingEntry.sourceSerialNumber } },
          { shipment: shippingEntry.source }
        ]
      });

      if (pendingEntry) {
        // Calculate remaining quantity
        const remainingQty = Math.max(0, shippingEntry.totalQuantity - shippingEntry.quantityShipped);
        
        // Update pending tracker
        pendingEntry.qtyPending = remainingQty;
        
        // Update status
        if (shippingEntry.status === 'Shipped') {
          pendingEntry.status = 'Shipped';
        } else if (shippingEntry.status === 'Partially Shipped') {
          pendingEntry.status = 'Partially Shipped';
        } else {
          pendingEntry.status = 'Pending';
        }
        
        await pendingEntry.save();
      }
    }
    
    logger.info('Synced all shipping entries with pending tracker');
  } catch (error) {
    logger.error('Error syncing shipping with pending', { error: error.message });
  }
}

export async function GET(req) {
  try {
    const authenticated = await isAuthenticated(req);
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const url = new URL(req.url);
    const syncData = url.searchParams.get('sync');
    const syncPending = url.searchParams.get('syncPending');

    if (syncData === 'true') {
      // Sync data from imports and purchases
      const [importEntries, purchaseEntries] = await Promise.all([
        createShippingFromImports(),
        createShippingFromPurchases()
      ]);
      
      logger.info('Synced shipping data', { 
        importEntries: importEntries.length, 
        purchaseEntries: purchaseEntries.length 
      });
    }

    if (syncPending === 'true') {
      // Sync all shipping entries with pending tracker
      await syncAllShippingWithPending();
      return NextResponse.json({ message: 'Synced with pending tracker successfully' });
    }

    const shippingEntries = await Shipping.find({})
      .populate('sourceId')
      .sort({ createdAt: -1 });

    return NextResponse.json(shippingEntries);
  } catch (error) {
    logger.error(`Failed to fetch shipping entries: ${error.message}`);
    return NextResponse.json({ error: 'Failed to fetch shipping entries' }, { status: 500 });
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
    const { shippingId, quantityShipped, dateOfShipping, remarks } = body;

    if (!shippingId || !quantityShipped || !dateOfShipping) {
      return NextResponse.json(
        { error: 'Shipping ID, quantity, and date are required' },
        { status: 400 }
      );
    }

    const shippingEntry = await Shipping.findById(shippingId);
    if (!shippingEntry) {
      return NextResponse.json({ error: 'Shipping entry not found' }, { status: 404 });
    }

    // Validate quantity
    const totalShipped = shippingEntry.quantityShipped + quantityShipped;
    if (totalShipped > shippingEntry.totalQuantity) {
      return NextResponse.json(
        { error: `Cannot ship ${quantityShipped}. Only ${shippingEntry.quantityRemaining} remaining.` },
        { status: 400 }
      );
    }

    // Add shipment entry
    const newShipmentEntry = {
      quantityShipped: quantityShipped,
      dateOfShipping: new Date(dateOfShipping),
      remarks: remarks || '',
    };

    shippingEntry.shipmentEntries.push(newShipmentEntry);
    await shippingEntry.save();

    // Update pending tracker
    await updatePendingTracker(shippingEntry, newShipmentEntry);

    logger.info('Shipment added successfully', {
      shippingId: shippingId,
      quantityShipped: quantityShipped,
      newStatus: shippingEntry.status
    });

    return NextResponse.json(shippingEntry, { status: 201 });
  } catch (error) {
    logger.error(`Failed to add shipment: ${error.message}`);
    return NextResponse.json({ error: 'Failed to add shipment' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const authenticated = await isAuthenticated(req);
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    const body = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'ID parameter is required' }, { status: 400 });
    }

    const updatedShipping = await Shipping.findByIdAndUpdate(id, body, { new: true });

    if (!updatedShipping) {
      return NextResponse.json({ error: 'Shipping entry not found' }, { status: 404 });
    }

    return NextResponse.json(updatedShipping);
  } catch (error) {
    logger.error(`Failed to update shipping entry: ${error.message}`);
    return NextResponse.json({ error: 'Failed to update shipping entry' }, { status: 500 });
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
    const shipmentIndex = url.searchParams.get('shipmentIndex');

    if (!id) {
      return NextResponse.json({ error: 'ID parameter is required' }, { status: 400 });
    }

    if (shipmentIndex !== null) {
      // Delete specific shipment entry
      const shippingEntry = await Shipping.findById(id);
      if (!shippingEntry) {
        return NextResponse.json({ error: 'Shipping entry not found' }, { status: 404 });
      }

      shippingEntry.shipmentEntries.splice(parseInt(shipmentIndex), 1);
      await shippingEntry.save();

      return NextResponse.json({ message: 'Shipment entry deleted successfully' });
    } else {
      // Delete entire shipping entry
      const deletedShipping = await Shipping.findByIdAndDelete(id);
      if (!deletedShipping) {
        return NextResponse.json({ error: 'Shipping entry not found' }, { status: 404 });
      }

      return NextResponse.json({ message: 'Shipping entry deleted successfully' });
    }
  } catch (error) {
    logger.error(`Failed to delete shipping entry: ${error.message}`);
    return NextResponse.json({ error: 'Failed to delete shipping entry' }, { status: 500 });
  }
}