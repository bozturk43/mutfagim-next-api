import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export async function POST(request: NextRequest) {
    const userPayload = request.headers.get('x-user-payload');
    
    if (!userPayload) {
        return NextResponse.json({ error: 'Kullanıcı bilgileri bulunamadı!' }, { status: 403 });
    }

    const { id } = JSON.parse(userPayload);
    const body = await request.json();
    const { productId, quantity } = body;

    const pantryRef = doc(db, 'userPantries', id);
    const pantryDoc = await getDoc(pantryRef);

    if (!pantryDoc.exists()) {
        return NextResponse.json({ error: 'Pantri bulunamadı!' }, { status: 404 });
    }

    // Mevcut items'ı al
    const pantryData = pantryDoc.data();
    const items = pantryData.items || [];

    // Mevcut productId'yi bul
    const existingItemIndex = items.findIndex((item:any) => item.productId === productId);

    if (existingItemIndex !== -1) {
        // Ürün zaten varsa, quantity'i güncelle
        items[existingItemIndex].quantity = quantity;

        // Güncellenmiş items'ı Firestore'a kaydet
        await updateDoc(pantryRef, { items });

        return NextResponse.json({ message: 'Ürün miktarı başarıyla güncellendi!' }, { status: 200 });
    } else {
        // Ürün yoksa hata döndür
        return NextResponse.json({ error: 'Güncellenmek istenen ürün bulunamadı!' }, { status: 404 });
    }
}
