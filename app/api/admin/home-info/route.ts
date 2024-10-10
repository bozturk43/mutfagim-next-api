// app/api/user-pantry/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { Product } from '@/app/models/Product';
import { Recipe } from '@/app/models/Recipe'; // Eğer Recipe modeliniz yoksa, buna göre düzenleyin
import { User } from '@/app/models/User'; // Eğer User modeliniz yoksa, buna göre düzenleyin
import { FoodCategory } from '@/app/models/FoodCategory'; // Eğer FoodCategory modeliniz yoksa, buna göre düzenleyin
import { db } from '@/app/lib/firebase';
import { ConversationName } from '@/app/models/ConversationName';

export async function GET(request: NextRequest) {
  // const userPayload = request.headers.get('x-user-payload');

  // if (!userPayload) {
  //   return NextResponse.json({ error: 'Kullanıcı bilgileri bulunamadı!' }, { status: 403 });
  // }

  try {
    // Koleksiyon referansları
    const collections = [
      { name: 'produtcs', model: Product },
      { name: 'recipes', model: Recipe },
      { name: 'users', model: User },
      { name: 'foodCategories', model: FoodCategory },
      { name: 'conversationNames', model: ConversationName },
    ];

    const result = await Promise.all(collections.map(async (collectionInfo) => {
      const collectionRef = collection(db, collectionInfo.name);
      const snapshot = await getDocs(collectionRef);
      const count = snapshot.size; // Kayıt sayısı
      const records = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as any // Modelinize göre değiştirin
      }));

      return {
        collectionName: collectionInfo.name,
        count,
        records,
      };
    }));

    return new Response(JSON.stringify({collections: result}), {
        status:200,
        headers: { 'Content-Type': 'application/json' },
      });

  } catch (error) {
    console.error('Error fetching collections:', error);
    return NextResponse.json({ error: 'Veri getirilemedi!' }, { status: 500 });
  }
}


// export const OPTIONS = async (request: NextRequest) => {
//   return new NextResponse('', {
//     status: 200
//   })
// }