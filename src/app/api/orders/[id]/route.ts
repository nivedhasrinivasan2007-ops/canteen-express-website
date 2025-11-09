import { NextRequest, NextResponse } from 'next/server';
import { headers } from "next/headers";
import { db } from '@/db';
import { orders, orderItems, products } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authentication check
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: "Valid order ID is required",
          code: "INVALID_ID" 
        },
        { status: 400 }
      );
    }

    const orderId = parseInt(id);

    // Get order with user verification
    const order = await db.select()
      .from(orders)
      .where(
        and(
          eq(orders.id, orderId),
          eq(orders.userId, session.user.id)
        )
      )
      .limit(1);

    if (order.length === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Get order items with product details using JOIN
    const items = await db.select({
      id: orderItems.id,
      orderId: orderItems.orderId,
      productId: orderItems.productId,
      quantity: orderItems.quantity,
      price: orderItems.price,
      product: {
        id: products.id,
        name: products.name,
        emoji: products.emoji,
        description: products.description,
        category: products.category
      }
    })
    .from(orderItems)
    .innerJoin(products, eq(orderItems.productId, products.id))
    .where(eq(orderItems.orderId, orderId));

    // Construct response with nested items
    const orderWithItems = {
      id: order[0].id,
      userId: order[0].userId,
      total: order[0].total,
      status: order[0].status,
      createdAt: order[0].createdAt,
      items: items
    };

    return NextResponse.json(orderWithItems, { status: 200 });

  } catch (error) {
    console.error('GET order error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}