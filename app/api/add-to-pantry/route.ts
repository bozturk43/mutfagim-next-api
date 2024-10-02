// app/api/login/route.js
import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { PantryItem } from '@/app/models/PantryItem';

export async function POST(request: NextRequest) {
    const userPayload = request.headers.get('x-user-payload');
  
    if (!userPayload) {
        return NextResponse.json({ error: 'Kullanıcı bilgileri bulunamadı!' }, { status: 403 });
    }

    const { id } = JSON.parse(userPayload);
    const body = await request.json();
    const { productId, quantity } = body; // productId ve quantity'i al
    const pantryRef = doc(db, 'userPantries', id);
    const pantryDoc = await getDoc(pantryRef);
    let items = []; // Başlangıçta boş bir items dizisi

    if (pantryDoc.exists()) {
        // Eğer pantri varsa, mevcut items'ı al
        const pantryData = pantryDoc.data();
        items = pantryData.items || [];
    } else {
        // Eğer pantri yoksa, yeni bir pantri oluştur
        await setDoc(pantryRef, { items: [] });
    }

    // Mevcut ürünün olup olmadığını kontrol et
    const existingItemIndex = items.findIndex((item:PantryItem) => item.productId === productId);

    if (existingItemIndex !== -1) {
        // Ürün zaten mevcutsa, mevcut miktarı güncelle
        items[existingItemIndex].quantity += quantity;
    } else {
        // Yeni ürünü ekle
        const newItem = { productId, quantity };
        items.push(newItem); // Yeni ürünü items dizisine ekle
    }

    // Güncellenmiş items'ı Firestore'a kaydet
    await updateDoc(pantryRef, { items });

    return NextResponse.json({ message: 'Başarıyla alındı!' }, { status: 200 });
}
