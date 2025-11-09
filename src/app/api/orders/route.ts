import { NextRequest, NextResponse } from 'next/server';
import { headers } from "next/headers";
import { db } from '@/db';
import { orders, orderItems, cartItems, products } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    let query = db.select()
      .from(orders)
      .where(eq(orders.userId, session.user.id))
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset(offset);

    let results;
    if (status) {
      results = await db.select()
        .from(orders)
        .where(eq(orders.userId, session.user.id))
        .where(eq(orders.status, status))
        .orderBy(desc(orders.createdAt))
        .limit(limit)
        .offset(offset);
    } else {
      results = await query;
    }

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const userCartItems = await db.select({
      id: cartItems.id,
      productId: cartItems.productId,
      quantity: cartItems.quantity,
      productName: products.name,
      productPrice: products.price,
      productDescription: products.description,
      productEmoji: products.emoji,
      productCategory: products.category,
    })
      .from(cartItems)
      .leftJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.userId, userId));

    if (userCartItems.length === 0) {
      return NextResponse.json({ 
        error: 'Cart is empty',
        code: 'CART_EMPTY' 
      }, { status: 400 });
    }

    const total = userCartItems.reduce((sum, item) => {
      return sum + (item.productPrice || 0) * item.quantity;
    }, 0);

    const newOrder = await db.insert(orders)
      .values({
        userId,
        total,
        status: 'pending',
        createdAt: new Date().toISOString(),
      })
      .returning();

    if (!newOrder || newOrder.length === 0) {
      throw new Error('Failed to create order');
    }

    const orderId = newOrder[0].id;

    const orderItemsData = userCartItems.map(item => ({
      orderId,
      productId: item.productId,
      quantity: item.quantity,
      price: item.productPrice || 0,
    }));

    const createdOrderItems = await db.insert(orderItems)
      .values(orderItemsData)
      .returning();

    await db.delete(cartItems)
      .where(eq(cartItems.userId, userId));

    return NextResponse.json({
      ...newOrder[0],
      items: createdOrderItems,
    }, { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}