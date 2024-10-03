import { NextRequest, NextResponse } from 'next/server';
import { db, storage } from '../../lib/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { PantryItem } from '@/app/models/PantryItem';
import { Ingredients, Recipe } from '@/app/models/Recipe';
import { Product } from '@/app/models/Product';
import { getDownloadURL, ref } from 'firebase/storage';

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

    // Resim URL'lerini alma işlemi
    const recipeList: Recipe[] = await Promise.all(recipeDocs.docs.map(async (doc) => {
        const recipeData = doc.data();
        
        // Storage'dan img_url alma işlemi
        let img_url = '';
        try {
            const imageRef = ref(storage, `recipe_images/${doc.id}.jpg`);
            img_url = await getDownloadURL(imageRef); // Resmin download URL'sini al
        } catch (error) {
            console.error(`Resim URL'si alınırken hata oluştu: ${doc.id}`, error);
            img_url = ""; // Eğer resim yoksa null olarak döndür
        }
    
        // Recipe objesini döndür
        return {
            id: doc.id,  // Firestore'dan gelen recipe ID
            name: recipeData.name,
            description: recipeData.description,
            recipe_instructions: recipeData.recipe_instructions,
            categoryId: recipeData.categoryId,
            img_url: img_url,  // Yukarıda alınan img_url
            ingredients: recipeData.ingredients  // Diğer recipe verileri
        } as Recipe;  // Recipe tipinde döndür
    }));

    // Ürünleri almak için products koleksiyonunu çek
    const productsRef = collection(db, 'produtcs');
    const productDocs = await getDocs(productsRef);
    const products: Record<string, any> = productDocs.docs.reduce((acc: Record<string, any>, doc) => {
        acc[doc.id] = doc.data(); // Ürün ID'sini anahtar olarak kullan
        return acc;
    }, {});

    const matchingRecipes: Recipe[] = [];
    const unavailableRecipes: Recipe[] = [];

    // Firestore'dan çekilen her bir recipe üzerinde işlemleri yap
    recipeList.forEach(doc => {
        const recipeData = {...doc}
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
                recipeData.recipe_instructions,
                recipeData.categoryId,
                recipeData.img_url,
                recipeIngredients
            );
            matchingRecipes.push(recipe);
        } else {
            // Eşleşmeyen tarif
            const missingIngredients = recipeIngredients.filter((ingredient: Ingredients) => {
                return !pantryProductIds.includes(ingredient.productId);
            }).map((ingredient: Ingredients) => {
                const product: Product = products[ingredient.productId];
            
                // Ürün adı yoksa varsayılan değer veriyoruz, diğer alanlar ise Ingredient tipine uygun şekilde dolduruluyor
                return {
                    productId: ingredient.productId,
                    name: product ? product.name : 'Bilinmiyor',
                    con_id: ingredient.con_id, // Ingredient'den alıyoruz
                    quantity: ingredient.quantity // Ingredient'den alıyoruz
                } as Ingredients; // Ingredients tipine uygun döndürüyoruz
            });

            if (missingIngredients.length > 0) {
                unavailableRecipes.push({
                    id: doc.id,
                    name: recipeData.name,
                    description: recipeData.description,
                    recipe_instructions:recipeData.recipe_instructions,
                    categoryId:recipeData.categoryId,
                    img_url:recipeData.img_url,
                    ingredients:recipeData.ingredients,
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
