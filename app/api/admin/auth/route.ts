// app/api/login/route.js
import { NextRequest } from 'next/server';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { User } from '@/app/models/User';
import { SignJWT } from 'jose';
import { db } from '@/app/lib/firebase';

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();
  console.log(email,password);

  const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET_KEY); // Encode secret
  try {
    // Firestore'da adminUsers koleksiyonunda email ve password'e göre sorgu yap
    const adminUsersRef = collection(db, 'adminUsers');
    const q = query(adminUsersRef, where('email', '==', email), where('password', '==', password));
    const querySnapshot = await getDocs(q);

    // Kullanıcı bulunamadıysa
    if (querySnapshot.empty) {
      return new Response(JSON.stringify({ error: 'E-posta veya şifre yanlış!' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Kullanıcı bulunduysa, bilgilerini al
    const userDoc = querySnapshot.docs[0];
    const data = userDoc.data();

    const userData: User = {
      id: userDoc.id,  // Belge ID'sini kullanarak kullanıcı ID'sini al
      name: data.name,
      img_url: data.img_url,
      age: data.age,
      email: data.email,
    };

    // JWT oluştur
    const token = await new SignJWT({ ...userData })
      .setExpirationTime('48h')
      .setProtectedHeader({ alg: 'HS256' })
      .sign(JWT_SECRET);

    return new Response(JSON.stringify({ message: 'Giriş başarılı!', user: userData, token }), {
      status:200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error:any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
