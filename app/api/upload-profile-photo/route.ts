// app/api/uploadProfilePicture/route.js
import { NextRequest, NextResponse } from 'next/server';
import { db, storage } from '../../lib/firebase'; // storage'ı da ekliyoruz
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export async function POST(request: NextRequest) {
    const userPayload = request.headers.get('x-user-payload');
  
    if (!userPayload) {
        return NextResponse.json({ error: 'Kullanıcı bilgileri bulunamadı!' }, { status: 403 });
    }

    const { id } = JSON.parse(userPayload);  // Kullanıcı ID'yi payload'dan alıyoruz
    const body = await request.json();
    let { base64Image } = body;  // Fotoğraf base64 formatında gelecek

    if (!base64Image) {
        return NextResponse.json({ error: 'Fotoğraf bilgisi eksik!' }, { status: 400 });
    }

    // Base64 ön ekini kontrol et ve uzantıyı belirle
    let imageFormat;
    if (base64Image.startsWith('data:image/jpeg;base64,')) {
        imageFormat = 'jpeg';
        base64Image = base64Image.replace('data:image/jpeg;base64,', '');
    } else if (base64Image.startsWith('data:image/png;base64,')) {
        imageFormat = 'png';
        base64Image = base64Image.replace('data:image/png;base64,', '');
    } else if (base64Image.startsWith('data:image/jpg;base64,')) {
        imageFormat = 'jpg';
        base64Image = base64Image.replace('data:image/jpg;base64,', '');
    } else {
        return NextResponse.json({ error: 'Desteklenmeyen resim formatı!' }, { status: 400 });
    }

    // Firebase Storage'a fotoğraf yükleme
    const imageBuffer = Buffer.from(base64Image, 'base64');  // Base64'ü buffer'a dönüştürüyoruz
    const storageRef = ref(storage, `user_profile_photos/${id}.${imageFormat}`);  // Dosya adını format ile oluştur
    const snapshot = await uploadBytes(storageRef, imageBuffer);  // Fotoğrafı Firebase Storage'a yüklüyoruz
    const downloadURL = await getDownloadURL(snapshot.ref);  // Yüklenen fotoğrafın URL'sini alıyoruz

    // Firestore'daki kullanıcı kaydını güncelleme (imgURL alanına fotoğraf URL'si ekliyoruz)
    const userRef = doc(db, 'users', id);  // users koleksiyonundaki ilgili kullanıcıya referans
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
        return NextResponse.json({ error: 'Kullanıcı bulunamadı!' }, { status: 404 });
    }
    await updateDoc(userRef, { img_url: downloadURL });  // `img_url` alanını yeni URL ile güncelliyoruz

    return NextResponse.json({ message: 'Fotoğraf başarıyla yüklendi!', url: downloadURL }, { status: 200 });
}
