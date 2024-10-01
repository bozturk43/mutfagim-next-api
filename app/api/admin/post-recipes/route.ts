// app/api/recipes/route.ts
import { NextResponse } from 'next/server';
import { db } from '../../../lib/firebase'; // Firebase yapılandırmanız
import { collection, addDoc } from 'firebase/firestore';

// POST isteği ile tarif ekleme
export async function POST() {
    const recipes = [
        {
            "name": "Makarna Salatası",
            "categoryId": "UcqORaiXhqu14ZeVC4sJ",
            "description": "Renkli sebzeler ve makarna ile hazırlanan hafif bir salata.",
            "ingredients": [
                {
                    "quantity": 1,
                    "productId": "EqcNJ5HQeAyrOOQnkDms",
                    "con_id": "Ot8spdBOMv9akplZ39Pb"
                },
                {
                    "productId": "CFPp70zgvizbrzk1TN6Z",
                    "quantity": 2,
                    "con_id": "Ot8spdBOMv9akplZ39Pb"
                },
                {
                    "quantity": 3,
                    "productId": "hWpr6qJGLImr9JicEmVs",
                    "con_id": "Ot8spdBOMv9akplZ39Pb"
                }
            ]
        },
        {
            "name": "Tavuklu Makarna",
            "categoryId": "exiqeujukEyBNeJxROda",
            "description": "Kıtır tavuk ile servis edilen makarna.",
            "ingredients": [
                {
                    "con_id": "Ot8spdBOMv9akplZ39Pb",
                    "productId": "gvCINFEwqZ7ShuO83DxF",
                    "quantity": 1
                },
                {
                    "con_id": "Ot8spdBOMv9akplZ39Pb",
                    "quantity": 1,
                    "productId": "EqcNJ5HQeAyrOOQnkDms"
                },
                {
                    "quantity": 100,
                    "productId": "CFPp70zgvizbrzk1TN6Z",
                    "con_id": "Ot8spdBOMv9akplZ39Pb"
                }
            ]
        },
        {
            "name": "Peynirli Makarna",
            "categoryId": "exiqeujukEyBNeJxROda",
            "description": "Sıcak makarnanın üzerine eritilmiş peynir ile hazırlanan basit bir yemek.",
            "ingredients": [
                {
                    "productId": "EqcNJ5HQeAyrOOQnkDms",
                    "quantity": 1,
                    "con_id": "Ot8spdBOMv9akplZ39Pb"
                },
                {
                    "quantity": 1,
                    "productId": "919Lx2Fsxz0ycCzqVqQZ",
                    "con_id": "togvwD9a0CYp2LFUcEoK"
                }
            ]
        },
        {   
            "name": "Zeytinli Makarna",
            "categoryId": "exiqeujukEyBNeJxROda",
            "description": "Zeytin ve baharatlarla tatlandırılmış makarna.",
            "ingredients": [
                {
                    "productId": "EqcNJ5HQeAyrOOQnkDms",
                    "quantity": 1,
                    "con_id": "Ot8spdBOMv9akplZ39Pb"
                },
                {
                    "productId": "CFPp70zgvizbrzk1TN6Z",
                    "quantity": 1,
                    "con_id": "Ot8spdBOMv9akplZ39Pb"
                }
            ]
        },
        {
            "name": "Zeytinyağlı Makarna",
            "categoryId": "exiqeujukEyBNeJxROda",
            "description": "Sade zeytinyağı ile hazırlanmış lezzetli makarna.",
            "ingredients": [
                {
                    "productId": "EqcNJ5HQeAyrOOQnkDms",
                    "quantity": 1,
                    "con_id": "Ot8spdBOMv9akplZ39Pb"
                },
                {
                    "productId": "CFPp70zgvizbrzk1TN6Z",
                    "quantity": 2,
                    "con_id": "Ot8spdBOMv9akplZ39Pb"
                }
            ]
        }
    ]
    
    ;

    try {
        for (const recipe of recipes) {
            await addDoc(collection(db, 'recipes'), recipe);
        }
        return NextResponse.json({ message: 'Tarifler başarıyla eklendi!' }, { status: 201 });
    } catch (error) {
        console.error('Veritabanına eklenirken bir hata oluştu:', error);
        return NextResponse.json({ error: 'Tarifler eklenirken bir hata oluştu.' }, { status: 500 });
    }
}