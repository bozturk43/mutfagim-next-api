// app/api/user-pantry/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { Lov } from '@/app/models/Lov';

export async function GET(request: NextRequest) {
  const userPayload = request.headers.get('x-user-payload');

  if (!userPayload) {
    return NextResponse.json({ error: 'Kullanıcı bilgileri bulunamadı!' }, { status: 403 });
  }

  try {
    const prdCategoryListRef = collection(db, 'productCategories');
    const prdCategorySnapshot = await getDocs(prdCategoryListRef);
    if (prdCategorySnapshot.empty) {
      return NextResponse.json({ productCategories: [] });
    }
    const productCategories:Lov[] = prdCategorySnapshot.docs.map((doc)=>{
      const itemData = doc.data();
      return{
        id:doc.id,
        name:itemData.name
      }
    })

    const prdUnitListRef = collection(db,"unitTypes");
    const prdUnitListSnapshot = await getDocs(prdUnitListRef);
    if (prdUnitListSnapshot.empty) {
      return NextResponse.json({ unitTypes: [] });
    }
    const unitTypes:Lov[] = prdUnitListSnapshot.docs.map((doc)=>{
      const itemData = doc.data();
      return{
        id:doc.id,
        name:itemData.name
      }
    })

    return NextResponse.json({ productCategories,unitTypes });

  } catch (error) {
    console.error('Error fetching pantry items:', error);
    return NextResponse.json({ error: 'Ürün verileri getirilemedi!' }, { status: 500 });
  }
}
