// app/api/login/route.js
import { NextRequest } from 'next/server';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { db,auth } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { User } from '@/app/models/User';
import { SignJWT } from 'jose';

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();
  const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET_KEY); // Encode secret

  try {
    // Kullanıcıyı e-posta ve şifre ile giriş yapmaya çalış
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Kullanıcı e-posta doğrulamasını kontrol et
    if (!user.emailVerified) {
      return new Response(JSON.stringify({ error: 'E-posta doğrulanmadı!' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Kullanıcı doğrulandıktan sonra Firestore'dan ek bilgi al
    const userDocRef = doc(db, 'users', user.uid); // user.uid, Firebase Authentication ile kullanıcı kimliği
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      return new Response(JSON.stringify({ error: 'Kullanıcı bilgileri bulunamadı!' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = userDoc.data();
    const userData: User = {
      id: user.uid,
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
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error:any) {
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
      return new Response(JSON.stringify({ error: 'E-posta veya şifre yanlış!' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
