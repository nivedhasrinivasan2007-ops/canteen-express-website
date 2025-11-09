import { NextRequest, NextResponse } from 'next/server';
import { headers } from "next/headers";
import { db } from '@/db';
import { cartItems, products } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userCartItems = await db
      .select({
        id: cartItems.id,
        userId: cartItems.userId,
        productId: cartItems.productId,
        quantity: cartItems.quantity,
        createdAt: cartItems.createdAt,
        product: {
          id: products.id,
          name: products.name,
          price: products.price,
          description: products.description,
          emoji: products.emoji,
          category: products.category,
          createdAt: products.createdAt,
        }
      })
      .from(cartItems)
      .leftJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.userId, session.user.id));

    return NextResponse.json(userCartItems, { status: 200 });
  } catch (error) {
    console.error('GET cart error:', error);
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

    const body = await request.json();
    const { product_id, quantity } = body;

    if (!product_id || typeof product_id !== 'number') {
      return NextResponse.json({ 
        error: 'Valid product_id is required',
        code: 'INVALID_PRODUCT_ID'
      }, { status: 400 });
    }

    if (!quantity || typeof quantity !== 'number' || quantity <= 0) {
      return NextResponse.json({ 
        error: 'Valid quantity (positive number) is required',
        code: 'INVALID_QUANTITY'
      }, { status: 400 });
    }

    const product = await db
      .select()
      .from(products)
      .where(eq(products.id, product_id))
      .limit(1);

    if (product.length === 0) {
      return NextResponse.json({ 
        error: 'Product not found',
        code: 'PRODUCT_NOT_FOUND'
      }, { status: 404 });
    }

    const existingCartItem = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.userId, session.user.id),
          eq(cartItems.productId, product_id)
        )
      )
      .limit(1);

    if (existingCartItem.length > 0) {
      const updatedCartItem = await db
        .update(cartItems)
        .set({
          quantity: existingCartItem[0].quantity + quantity
        })
        .where(
          and(
            eq(cartItems.userId, session.user.id),
            eq(cartItems.productId, product_id)
          )
        )
        .returning();

      return NextResponse.json(updatedCartItem[0], { status: 201 });
    } else {
      const newCartItem = await db
        .insert(cartItems)
        .values({
          userId: session.user.id,
          productId: product_id,
          quantity: quantity,
          createdAt: new Date().toISOString()
        })
        .returning();

      return NextResponse.json(newCartItem[0], { status: 201 });
    }
  } catch (error) {
    console.error('POST cart error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}