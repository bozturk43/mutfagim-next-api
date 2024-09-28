import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../lib/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { PantryItem } from '@/app/models/PantryItem';
import { Ingredients, Recipe } from '@/app/models/Recipe';
import { Product } from '@/app/models/Product';

export async function GET(request: NextRequest) {
    const userPayload = request.headers.get('x-user-payload');
  
    if (!userPayload) {
        return NextResponse.json({ error: 'Kullanıcı bilgileri bulunamadı!' }, { status: 403 });
    }

    const { id } = JSON.parse(userPayload);

    // Kullanıcının pantriesini al
    const pantryRef = doc(db, 'userPantries', id);
    const pantryDoc = await getDoc(pantryRef);

    if (!pantryDoc.exists()) {
        return NextResponse.json({ error: 'Pantry bulunamadı!' }, { status: 404 });
    }

    const pantries = pantryDoc.data().items || [];
    const pantryProductIds = pantries.map((item: PantryItem) => item.productId);

    // Tüm recipes belgelerini çek
    const recipesRef = collection(db, 'recipes');
    const recipeDocs = await getDocs(recipesRef);

    // Ürünleri almak için products koleksiyonunu çek
    const productsRef = collection(db, 'produtcs');
    const productDocs = await getDocs(productsRef);
    const products: Record<string, any> = productDocs.docs.reduce((acc: Record<string, any>, doc) => {
        acc[doc.id] = doc.data(); // Ürün ID'sini anahtar olarak kullan
        return acc;
    }, {});

    console.log(products);

    const matchingRecipes: Recipe[] = [];
    const unavailableRecipes: { id: string; name: string; img_url:string; description: string; missingIngredients: { productId: string; name: string }[] }[] = [];

    // Firestore'dan çekilen her bir recipe üzerinde işlemleri yap
    recipeDocs.forEach(doc => {
        const recipeData = doc.data();
        const recipeIngredients = recipeData.ingredients;

        // Kullanıcının dolabındaki ürünlerle eşleşen tarifleri kontrol et
        const isMatch = recipeIngredients.every((ingredient: Ingredients) => {
            const pantryItem = pantries.find((pantryItem: PantryItem) => pantryItem.productId === ingredient.productId);
            return pantryItem && pantryItem.quantity >= ingredient.quantity;
        });

        if (isMatch) {
            // Eşleşen tarif
            const recipe = new Recipe(
                doc.id,
                recipeData.name,
                recipeData.description,
                recipeData.img_url,
                recipeIngredients
            );
            matchingRecipes.push(recipe);
        } else {
            // Eşleşmeyen tarif
            const missingIngredients = recipeIngredients.filter((ingredient: Ingredients) => {
                return !pantryProductIds.includes(ingredient.productId);
            }).map((ingredient: Ingredients) => {
                const product:Product = products[ingredient.productId];
                console.log(product);
                return {
                    productId: ingredient.productId,
                    name: product ? product.name : 'Bilinmiyor', // Ürün adı alınamıyorsa varsayılan bir değer
                };
            });

            if (missingIngredients.length > 0) {
                unavailableRecipes.push({
                    id: doc.id,
                    name: recipeData.name,
                    description: recipeData.description,
                    img_url:recipeData.img_url,
                    missingIngredients: missingIngredients
                });
            }
        }
    });

    return NextResponse.json({ 
        availableRecipes: matchingRecipes, 
        unavailableRecipes: unavailableRecipes 
    }, { status: 200 });
}
