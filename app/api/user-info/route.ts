// app/api/user-pantry/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { collection, doc, getDoc, query, where, getDocs,documentId } from 'firebase/firestore';
import { db, storage } from '../../lib/firebase';
import { User } from '@/app/models/User';
import { PantryItem } from '@/app/models/PantryItem';
import { Product } from '@/app/models/Product';
import { getDownloadURL, ref } from 'firebase/storage';

export async function GET(request: NextRequest) {
  const userPayload = request.headers.get('x-user-payload');
  
  if (!userPayload) {
    return NextResponse.json({ error: 'Kullanıcı bilgileri bulunamadı!' }, { status: 403 });
  }

  const user: User = JSON.parse(userPayload);

  try {
    // Kullanıcının dolabındaki ürünleri Firestore'dan çek
    const pantryDocRef = doc(db, 'userPantries', user.id);  // Kullanıcıya ait belge referansı
    const pantryDoc = await getDoc(pantryDocRef);

    if (!pantryDoc.exists()) {
      return NextResponse.json({ items: [] }); // Kullanıcının dolabında ürün yoksa boş döndür
    }

    const pantryData = pantryDoc.data() as { items: PantryItem[] };  // Firestore'dan gelen veriyi al
    
    // Ürün detaylarını çekmek için productId'lerle product koleksiyonunu sorgula
    const productIds = pantryData.items.map(item => item.productId);

    // Ürün detaylarını çekmek için Firestore'da sorgulama yap
    const productsQuery = query(
      collection(db, 'produtcs'),
      where(documentId(), 'in', productIds)  // documentId() ile sorgu yap
    );
    
    const productSnapshots = await getDocs(productsQuery);
    
    // Firestore'dan çekilen ürünler
    const products: Product[] = await Promise.all(
      productSnapshots.docs.map(async (doc) => {
        const productId = doc.id; // Ürün ID'sini al
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: _, ...productDataWithoutId } = doc.data() as Product; // id'yi çıkarıp diğer verileri al
        try{
          const imageRef = ref(storage, `product_images/${productId}.jpg`);
          const imgUrl = await getDownloadURL(imageRef);

          return {
            id: doc.id, // Belge ID'sini manuel olarak ayarla
            ...productDataWithoutId,
            img_url: imgUrl, // Resim URL'sini ekle
          };
        }
        catch(error){
          console.error(`Resim URL'si alınırken hata oluştu: ${productId}`, error);
          return {
            id: productId,
            ...productDataWithoutId,
            img_url: null, // Resim yoksa null olarak döndür
          };
        }
      })
    )
   

    // Ürün bilgilerini ve kullanıcı dolabındaki miktarlarını birleştir
    const pantryItemsWithDetails = pantryData.items.map(pantryItem => {
      const product = products.find(p => p.id === pantryItem.productId);

      if (!product) {
        return null; // Ürün bulunamadıysa atla
      }

      return {
        productId: pantryItem.productId,
        name: product.name,  // Ürünün adı
        unit: product.unit,  // Ürünün birimi
        img_url: product.img_url,
        quantity: pantryItem.quantity // Kullanıcının sahip olduğu miktar
      };
    }).filter(item => item !== null); // Geçersiz öğeleri filtrele

    return NextResponse.json({ items: pantryItemsWithDetails });
    
  } catch (error) {
    console.error('Error fetching pantry items:', error);
    return NextResponse.json({ error: 'Dolap verileri getirilemedi!' }, { status: 500 });
  }
}
