import { NextRequest, NextResponse } from 'next/server';
import { headers } from "next/headers";
import { db } from '@/db';
import { orders, orderItems, products, user } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import { auth } from "@/lib/auth";

// Helper function to check if user is admin
async function isAdmin(userId: string) {
  // For now, we'll check if the user exists in our system
  // In a real application, you would have a more sophisticated admin check
  const users = await db.select().from(user).where(eq(user.id, userId));
  return users.length > 0;
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const userIsAdmin = await isAdmin(session.user.id);
    if (!userIsAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Fetch all orders with user information
    let query = db.select({
      id: orders.id,
      userId: orders.userId,
      total: orders.total,
      status: orders.status,
      createdAt: orders.createdAt,
      userName: user.name,
      userEmail: user.email,
    })
    .from(orders)
    .leftJoin(user, eq(orders.userId, user.id))
    .orderBy(desc(orders.createdAt))
    .limit(limit)
    .offset(offset);

    let results;
    if (status) {
      results = await db.select({
        id: orders.id,
        userId: orders.userId,
        total: orders.total,
        status: orders.status,
        createdAt: orders.createdAt,
        userName: user.name,
        userEmail: user.email,
      })
        .from(orders)
        .leftJoin(user, eq(orders.userId, user.id))
        .where(eq(orders.status, status))
        .orderBy(desc(orders.createdAt))
        .limit(limit)
        .offset(offset);
    } else {
      results = await query;
    }

    // Fetch order items for each order
    const ordersWithItems = await Promise.all(results.map(async (order) => {
      const items = await db.select({
        id: orderItems.id,
        orderId: orderItems.orderId,
        productId: orderItems.productId,
        quantity: orderItems.quantity,
        price: orderItems.price,
        productName: products.name,
      })
        .from(orderItems)
        .leftJoin(products, eq(orderItems.productId, products.id))
        .where(eq(orderItems.orderId, order.id));

      return {
        ...order,
        items,
      };
    }));

    return NextResponse.json({ orders: ordersWithItems }, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const userIsAdmin = await isAdmin(session.user.id);
    if (!userIsAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { orderId, status } = await request.json();

    if (!orderId || !status) {
      return NextResponse.json({ error: 'Order ID and status are required' }, { status: 400 });
    }

    // Update order status
    const updatedOrder = await db.update(orders)
      .set({ status })
      .where(eq(orders.id, orderId))
      .returning();

    if (!updatedOrder || updatedOrder.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ order: updatedOrder[0] }, { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}