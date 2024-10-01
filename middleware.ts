// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify, JWTPayload } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET_KEY);

interface UserPayload extends JWTPayload {
  id: string;
  name: string;
  age: number;
  email: string;
}

export async function middleware(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Yetkilendirme başlığı eksik!' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1].trim();
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET) as { payload: UserPayload };
    const modifiedHeaders = new Headers(request.headers);
    modifiedHeaders.set('x-user-payload', JSON.stringify(payload));

    return NextResponse.next({
      request:{
        headers:modifiedHeaders
      }
    }); // İsteği devam ettir
  } catch (error: any) {
    console.error("JWT Error", error);
    return NextResponse.json({ error: 'Geçersiz token!' }, { status: 403 });
  }
}
// Hangi yolların bu middleware'i kullanacağını tanımla
export const config = {
  matcher: [
    '/api/user-info',
    '/api/all-products',
    '/api/add-to-pantry',
    '/api/update-pantry',
    '/api/delete-from-pantry',
    '/api/available-foods',
    '/api/get-categories',
    '/api/get-recipe-by-id'
  ],
};
