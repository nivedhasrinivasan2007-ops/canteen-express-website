import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products } from '@/db/schema';
import { eq, like, and, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse query parameters
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '100'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const category = searchParams.get('category');

    // Build query
    let query = db.select().from(products);

    // Build WHERE conditions
    const conditions = [];

    // Add category filter if provided
    if (category) {
      conditions.push(eq(products.category, category));
    }

    // Add search filter if provided
    if (search) {
      conditions.push(like(products.name, `%${search}%`));
    }

    // Apply WHERE conditions if any exist
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply ordering, limit and offset
    const results = await query
      .orderBy(desc(products.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}