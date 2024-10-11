import { NextRequest, NextResponse } from 'next/server';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';

export async function POST(request: NextRequest) {
  const { id } = await request.json(); 
  const userPayload = request.headers.get('x-user-payload');

  if (!userPayload) {
    return NextResponse.json({ error: 'Kullanıcı bilgileri bulunamadı!' }, { status: 403 });
  }

  try {
    const productRef = doc(db, 'produtcs', id);
    await deleteDoc(productRef);

    return NextResponse.json({ message: 'Ürün başarıyla silindi!' }, { status: 200 });
  } catch (error) {
    console.error('Silme Hatası:', error);
    return NextResponse.json({ error: 'Silme sırasında bir hata oluştu.' }, { status: 500 });
  }
}
