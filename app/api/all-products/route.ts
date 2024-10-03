// app/api/user-pantry/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Product } from '@/app/models/Product';
import { getDownloadURL, ref } from 'firebase/storage';
import { storage } from '../../lib/firebase';

export async function GET(request: NextRequest) {
  const userPayload = request.headers.get('x-user-payload');

  if (!userPayload) {
    return NextResponse.json({ error: 'Kullanıcı bilgileri bulunamadı!' }, { status: 403 });
  }

  try {
    // Firestore'dan tüm ürünleri çek
    const productListRef = collection(db, 'produtcs');
    const productSnapshot = await getDocs(productListRef);
    if (productSnapshot.empty) {
      return NextResponse.json({ productList: [] });
    }

    const productList: Product[] = await Promise.all(
      productSnapshot.docs.map(async (doc) => {
        const productId = doc.id; // Ürün ID'sini al
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: _, ...productDataWithoutId } = doc.data() as Product; // id'yi çıkarıp diğer verileri al

        try {
          const imageRef = ref(storage, `product_images/${productId}.jpg`);
          const imgUrl = await getDownloadURL(imageRef);

          return {
            id: productId, // Belge ID'sini manuel olarak ayarla
            ...productDataWithoutId, // Diğer tüm verileri ekle
            img_url: imgUrl, // Resim URL'sini ekle
          };
        } catch (error) {
          console.error(`Resim URL'si alınırken hata oluştu: ${productId}`, error);
          return {
            id: productId,
            ...productDataWithoutId,
            img_url: null, // Resim yoksa null olarak döndür
          };
        }
      })
    );

    return NextResponse.json({ productList });

  } catch (error) {
    console.error('Error fetching pantry items:', error);
    return NextResponse.json({ error: 'Ürün verileri getirilemedi!' }, { status: 500 });
  }
}
