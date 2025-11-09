import { db } from '@/db';
import { products } from '@/db/schema';

async function main() {
    const sampleProducts = [
        {
            name: 'Idli',
            price: 30,
            description: 'Fluffy steamed rice cakes',
            emoji: '🍚',
            category: 'Breakfast',
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Masala Dosa',
            price: 60,
            description: 'Crispy rice crepe with potato filling',
            emoji: '🥞',
            category: 'Breakfast',
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Pongal',
            price: 40,
            description: 'Traditional rice and lentil comfort food',
            emoji: '🍲',
            category: 'Breakfast',
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Poori',
            price: 50,
            description: 'Golden fried bread with curry',
            emoji: '🥯',
            category: 'Breakfast',
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Idiyappam',
            price: 35,
            description: 'Delicate string hoppers',
            emoji: '🍝',
            category: 'Breakfast',
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Chicken Biryani',
            price: 120,
            description: 'Aromatic basmati rice with tender chicken',
            emoji: '🍛',
            category: 'Main Course',
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Chicken 65',
            price: 100,
            description: 'Spicy fried chicken bites',
            emoji: '🍗',
            category: 'Main Course',
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Paneer Butter Masala',
            price: 100,
            description: 'Creamy paneer in rich tomato gravy',
            emoji: '🧈',
            category: 'Main Course',
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Chapathi',
            price: 30,
            description: 'Soft whole wheat flatbread',
            emoji: '🫓',
            category: 'Main Course',
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Kerala Parota',
            price: 40,
            description: 'Layered crispy flatbread',
            emoji: '🥐',
            category: 'Main Course',
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Cold Coffee',
            price: 50,
            description: 'Chilled coffee with ice cream',
            emoji: '☕',
            category: 'Beverages',
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Masala Tea',
            price: 20,
            description: 'Spiced Indian tea',
            emoji: '🫖',
            category: 'Beverages',
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Fresh Juice',
            price: 40,
            description: 'Seasonal fruit juice',
            emoji: '🧃',
            category: 'Beverages',
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Sweet Lassi',
            price: 35,
            description: 'Creamy yogurt drink',
            emoji: '🥛',
            category: 'Beverages',
            createdAt: new Date().toISOString(),
        },
    ];

    await db.insert(products).values(sampleProducts);
    
    console.log('✅ Products seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});