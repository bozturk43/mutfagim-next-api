import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../lib/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { Recipe, Ingredients } from '@/app/models/Recipe';
import { Product } from '@/app/models/Product';
import { PantryItem } from '@/app/models/PantryItem';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const recipeId = searchParams.get('recipeId');
    const userPayload = request.headers.get('x-user-payload');
  
    if (!userPayload) {
        return NextResponse.json({ error: 'Kullanıcı bilgileri bulunamadı!' }, { status: 403 });
    }

    if (!recipeId) {
        return NextResponse.json({ error: 'Recipe ID bulunamadı!' }, { status: 400 });
    }

    const { id } = JSON.parse(userPayload);

    // Kullanıcının dolabını (pantries) Firestore'dan çek
    const pantryRef = doc(db, 'userPantries', id);
    const pantryDoc = await getDoc(pantryRef);

    if (!pantryDoc.exists()) {
        return NextResponse.json({ error: 'Pantry bulunamadı!' }, { status: 404 });
    }

    const pantries = pantryDoc.data().items || [];
    const pantryProductIds = pantries.map((item: PantryItem) => item.productId);

    // Recipe'yi Firestore'dan çek
    const recipeRef = doc(db, 'recipes', recipeId);
    const recipeDoc = await getDoc(recipeRef);

    if (!recipeDoc.exists()) {
        return NextResponse.json({ error: 'Recipe bulunamadı!' }, { status: 404 });
    }

    const recipeData = recipeDoc.data();

    // Recipe içindeki ingredients arrayini al
    const ingredients: Ingredients[] = recipeData.ingredients;

    // Ürünleri almak için products koleksiyonunu çek
    const productsRef = collection(db, 'produtcs');
    const productDocs = await getDocs(productsRef);

    const products: Record<string, any> = productDocs.docs.reduce((acc: Record<string, any>, doc) => {
        acc[doc.id] = doc.data(); // Ürün ID'sini anahtar olarak kullan
        return acc;
    }, {});

    // Conversion bilgilerini almak için conversions koleksiyonunu çek
    const conversionsRef = collection(db, 'conversationNames');
    const conversionDocs = await getDocs(conversionsRef);

    const conversions: Record<string, any> = conversionDocs.docs.reduce((acc: Record<string, any>, doc) => {
        acc[doc.id] = doc.data(); // Conversion ID'sini anahtar olarak kullan
        return acc;
    }, {});

    // Kullanıcının dolabında olan ve olmayan ürünleri ayırarak ingredient'leri işle
    const detailedIngredients = ingredients.map((ingredient: Ingredients) => {
        const product: Product = products[ingredient.productId];
        const conversion: string = conversions[ingredient.con_id];

        return {
            productId: ingredient.productId,
            productName: product ? product.name : 'Bilinmiyor', // Ürün adı yoksa 'Bilinmiyor' yaz
            con_id: ingredient.con_id,
            conversionName: conversion ? conversion : 'Bilinmiyor', // Conversion yoksa 'Bilinmiyor' yaz
            quantity: ingredient.quantity,
            isMissing: !pantryProductIds.includes(ingredient.productId) // Kullanıcının dolabında olup olmadığını kontrol et
        };
    });

    // Dolapta bulunmayan ürünleri tespit et ve missingIngredients olarak ekle
    const missingIngredients = detailedIngredients.filter((ingredient) => ingredient.isMissing);

    // Tarifi geri döndür, missingIngredients'i de ekle
    const recipe:Recipe = {
        id: recipeDoc.id,
        name: recipeData.name,
        description: recipeData.description,
        recipe_instructions:recipeData.recipe_instructions,
        categoryId: recipeData.categoryId,
        img_url: recipeData.img_url,
        ingredients: detailedIngredients, // Detaylandırılmış ingredient listesi
        missingIngredients: missingIngredients.length > 0 ? missingIngredients : null // Dolapta olmayanlar varsa ekle
    };

    return NextResponse.json(recipe, { status: 200 });
}

