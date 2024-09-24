// app/api/login/route.js
import { NextRequest } from 'next/server';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { User } from '@/app/models/User';
import { SignJWT } from 'jose';

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();
  const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET_KEY); // Encode secret
  console.log(email,password);

  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email), where('password', '==', password));
    const querySnapshot = await getDocs(q);
    console.log(querySnapshot);
    if (querySnapshot.empty) {
      return new Response(JSON.stringify({ error: 'Geçersiz e-posta veya şifre!' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const userDoc = querySnapshot.docs[0]; 
    const data = userDoc.data();
    const userData: User = {
      id: userDoc.id,
      name: data.name,
      age: data.age,
      email: data.email
    };

    // JWT oluştur
    const token = await new SignJWT({ ...userData })
      .setExpirationTime('48h')
      .setProtectedHeader({ alg: 'HS256' })
      .sign(JWT_SECRET);

    return new Response(JSON.stringify({ message: 'Giriş başarılı!', user: userData, token }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
