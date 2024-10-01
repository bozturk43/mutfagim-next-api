// app/api/login/route.js
import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../lib/firebase';
import {doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

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

    // Yeni ürünü ekle
    const newItem = { productId, quantity };
    items.push(newItem); // Yeni ürünü items dizisine ekle
    // Güncellenmiş items'ı Firestore'a kaydet
    await updateDoc(pantryRef, { items });
    // Burada body ile ilgili işlemler yapabilirsiniz

    return NextResponse.json({ message: 'Başarıyla alındı!' }, { status: 200 });
}
