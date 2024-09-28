// app/api/recipes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/firebase'; // Firebase yapılandırmanız
import { collection, addDoc, getDocs } from 'firebase/firestore';

// GET isteği ile tarifleri alma
export async function GET(request: NextRequest) {
    try {
        const recipesRef = collection(db, 'produtcs');
        const snapshot = await getDocs(recipesRef);
        
        const recipes = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json(recipes, { status: 200 });
    } catch (error) {
        console.error('Tarifleri alırken bir hata oluştu:', error);
        return NextResponse.json({ error: 'Tarifleri alırken bir hata oluştu.' }, { status: 500 });
    }
}