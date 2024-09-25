// app/api/user-pantry/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Product } from '@/app/models/Product';

export async function GET(request: NextRequest) {
  const userPayload = request.headers.get('x-user-payload');

  if (!userPayload) {
    return NextResponse.json({ error: 'Kullanıcı bilgileri bulunamadı!' }, { status: 403 });
  }

  try {
    // Firestore'dan tüm ürünleri çek
    const productListRef = collection(db, 'produtcs'); // Products koleksiyonuna referans
    const productSnapshot = await getDocs(productListRef); // Tüm belgeleri al
    if (productSnapshot.empty) {
      return NextResponse.json({ productList: [] }); // Koleksiyonda ürün yoksa boş döndür
    }

    const productList: Product[] = productSnapshot.docs.map(doc => ({
      id: doc.id, // Belge ID'sini al
      ...doc.data(), // Belge verilerini al
    })) as Product[]; // Data'yı Product tipine çevir
    console.log(productList)

    return NextResponse.json({ productList });
    
  } catch (error) {
    console.error('Error fetching pantry items:', error);
    return NextResponse.json({ error: 'Ürün verileri getirilemedi!' }, { status: 500 });
  }
}
