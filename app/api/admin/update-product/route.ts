import { NextRequest, NextResponse } from 'next/server';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';

export async function POST(request:NextRequest) {
  const { id, ...updateData } = await request.json(); 
  const userPayload = request.headers.get('x-user-payload');

  if (!userPayload) {
    return NextResponse.json({ error: 'Kullanıcı bilgileri bulunamadı!' }, { status: 403 });
  }


  try {
    // Belirtilen ID'ye sahip belgeyi al
    const productRef = doc(db, 'produtcs', id);
    // Ürün belgesini güncelle
    await updateDoc(productRef, updateData);

    return NextResponse.json({ message: 'Ürün başarıyla güncellendi!' }, { status: 200 });
  } catch (error) {
    console.error('Güncelleme Hatası:', error);
    return NextResponse.json({ error: 'Güncelleme sırasında bir hata oluştu.' }, { status: 500 });
  }
}
