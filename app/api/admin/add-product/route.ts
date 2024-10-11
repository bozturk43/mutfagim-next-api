import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';

export async function POST(request: NextRequest) {
  const productData = await request.json(); 
  const userPayload = request.headers.get('x-user-payload');

  if (!userPayload) {
    return NextResponse.json({ error: 'Kullanıcı bilgileri bulunamadı!' }, { status: 403 });
  }

  try {
    // Firestore'daki 'products' koleksiyonuna yeni ürün ekle
    const productRef = await addDoc(collection(db, 'produtcs'), productData);

    return NextResponse.json({ message: 'Ürün başarıyla eklendi!', id: productRef.id }, { status: 201 });
  } catch (error) {
    console.error('Ürün Ekleme Hatası:', error);
    return NextResponse.json({ error: 'Ürün eklenirken bir hata oluştu.' }, { status: 500 });
  }
}
