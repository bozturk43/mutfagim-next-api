import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { FoodCategory } from '@/app/models/FoodCategory';

export async function GET(request: NextRequest) {
  const userPayload = request.headers.get('x-user-payload');

  if (!userPayload) {
    return NextResponse.json({ error: 'Kullanıcı bilgileri bulunamadı!' }, { status: 403 });
  }

  try {
    // Firestore'dan tüm ürünleri çek
    const categoryListRef = collection(db, 'foodCategories'); // Products koleksiyonuna referans
    const categorySnapshot = await getDocs(categoryListRef); // Tüm belgeleri al
    if (categorySnapshot.empty) {
      return NextResponse.json({ productList: [] }); // Koleksiyonda ürün yoksa boş döndür
    }

    const categoryList: FoodCategory[] = categorySnapshot.docs.map(doc => ({
      id: doc.id, // Belge ID'sini al
      ...doc.data(), // Belge verilerini al
    })) as FoodCategory[]; // Data'yı Product tipine çevir

    return NextResponse.json({ categoryList });
    
  } catch (error) {
    console.error('Error fetching pantry items:', error);
    return NextResponse.json({ error: 'Kategori verileri getirilemedi!' }, { status: 500 });
  }
}
