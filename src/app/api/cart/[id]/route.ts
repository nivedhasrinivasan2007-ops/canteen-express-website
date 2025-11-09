import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { db } from '@/db';
import { cartItems } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authentication check
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get and validate ID parameter
    const { id } = await params;
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        {
          error: 'Valid ID is required',
          code: 'INVALID_ID',
        },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const { quantity } = body;

    // Validate quantity
    if (quantity === undefined || quantity === null) {
      return NextResponse.json(
        {
          error: 'Quantity is required',
          code: 'MISSING_QUANTITY',
        },
        { status: 400 }
      );
    }

    if (typeof quantity !== 'number' || quantity <= 0 || !Number.isInteger(quantity)) {
      return NextResponse.json(
        {
          error: 'Quantity must be a positive integer',
          code: 'INVALID_QUANTITY',
        },
        { status: 400 }
      );
    }

    // Check if cart item exists and belongs to authenticated user
    const existingCartItem = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.id, parseInt(id)),
          eq(cartItems.userId, session.user.id)
        )
      )
      .limit(1);

    if (existingCartItem.length === 0) {
      return NextResponse.json(
        {
          error: 'Cart item not found',
          code: 'CART_ITEM_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // Update cart item quantity
    const updated = await db
      .update(cartItems)
      .set({
        quantity,
      })
      .where(
        and(
          eq(cartItems.id, parseInt(id)),
          eq(cartItems.userId, session.user.id)
        )
      )
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        {
          error: 'Failed to update cart item',
          code: 'UPDATE_FAILED',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authentication check
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get and validate ID parameter
    const { id } = await params;
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        {
          error: 'Valid ID is required',
          code: 'INVALID_ID',
        },
        { status: 400 }
      );
    }

    // Check if cart item exists and belongs to authenticated user
    const existingCartItem = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.id, parseInt(id)),
          eq(cartItems.userId, session.user.id)
        )
      )
      .limit(1);

    if (existingCartItem.length === 0) {
      return NextResponse.json(
        {
          error: 'Cart item not found',
          code: 'CART_ITEM_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // Delete cart item
    const deleted = await db
      .delete(cartItems)
      .where(
        and(
          eq(cartItems.id, parseInt(id)),
          eq(cartItems.userId, session.user.id)
        )
      )
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        {
          error: 'Failed to delete cart item',
          code: 'DELETE_FAILED',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Cart item removed' },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      },
      { status: 500 }
    );
  }
}