// app/api/register/route.js
import { NextRequest } from 'next/server';
import { db } from '../../lib/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import {auth} from '../../lib/firebase'

export async function POST(request: NextRequest) {
  const { email, password, name } = await request.json(); // Kullanıcıdan gelen veriler

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password); // Firebase'de kullanıcı kaydı
    const user = userCredential.user;

    // E-posta doğrulama gönder
    await sendEmailVerification(user);

    // Kullanıcıyı Firestore'a kaydet
    const usersRef = collection(db, 'users');
    await setDoc(doc(usersRef, user.uid), {
      name,
      email
    });

    // Sadece başarılı olduğunu gösteren bir yanıt dön
    return new Response(JSON.stringify({ message: 'Kullanıcı kaydedildi, doğrulama e-postası gönderildi!' }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
