// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/firebase'; // Firebase yapılandırmanız
import { collection, addDoc } from 'firebase/firestore';

// POST isteği ile ürün ekleme
export async function POST(request: NextRequest) {
    const products = [
        {
            "id": "xYz12345",
            "name": "Makarna",
            "category": "Tahıl",
            "img_url": "https://media.istockphoto.com/id/1207966124/photo/fresh-dried-pasta-in-basket.jpg?s=612x612&w=0&k=20&c=4PQMTGOSW7RYk8A9U7kLULdrU3ngU9I_N4eMgW9oaV8=",
            "unit": "paket",
            "con_table": []
        },
        {
            "id": "xYz67890",
            "name": "Tavuk",
            "category": "Et",
            "img_url": "https://media.istockphoto.com/id/1160771170/photo/raw-chicken-breast-on-the-cutting-board.jpg?s=612x612&w=0&k=20&c=6c2hRFrZfDqaxZ1L-XywYPtBNX7TmPKuF23g23iQPS8=",
            "unit": "adet",
            "con_table": []
        },
        {
            "id": "xYz111213",
            "name": "Peynir",
            "category": "Süt Ürünleri",
            "img_url": "https://media.istockphoto.com/id/1130528360/photo/cheese-on-wooden-table.jpg?s=612x612&w=0&k=20&c=L_d3s_JW4hTTi1oZZhx8IScnl0z16OjJ24nQ1hXoQ6g=",
            "unit": "kg",
            "con_table": []
        }
    ];
    

    try {
        for (const product of products) {
            await addDoc(collection(db, 'produtcs'), product);
        }
        return NextResponse.json({ message: 'Ürünler başarıyla eklendi!' }, { status: 201 });
    } catch (error) {
        console.error('Veritabanına eklenirken bir hata oluştu:', error);
        return NextResponse.json({ error: 'Ürünler eklenirken bir hata oluştu.' }, { status: 500 });
    }
}
