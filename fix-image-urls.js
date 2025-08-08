// fix-image-urls.js
require('dotenv').config();
const firebase = require('firebase/app');
const firestore = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

// Inicializar Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firestore.getFirestore(app);

async function fixImageUrls() {
  try {
    // Corregir URLs en la colección 'products'
    const querySnapshot = await firestore.getDocs(firestore.collection(db, 'products'));
    for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data();
      let newImageUrl = data.imageUrl;
      if (!data.imageUrl || !data.imageUrl.startsWith('http') || data.imageUrl.includes('via.placeholder.com')) {
        newImageUrl = 'https://placehold.co/400x300?text=Producto';
      } else if (data.imageUrl.match(/^\d+_\w+\.(jpg|png|jpeg)$/)) {
        newImageUrl = `https://storage.googleapis.com/${firebaseConfig.storageBucket}/products/${data.imageUrl}`;
      }
      if (newImageUrl !== data.imageUrl) {
        await firestore.updateDoc(firestore.doc(db, 'products', docSnap.id), { imageUrl: newImageUrl });
        console.log(`Actualizada imagen de ${docSnap.id} a ${newImageUrl}`);
      }
    }

    // Corregir URLs en la colección 'orders'
    const ordersSnapshot = await firestore.getDocs(firestore.collection(db, 'orders'));
    for (const docSnap of ordersSnapshot.docs) {
      const data = docSnap.data();
      if (data.items && Array.isArray(data.items)) {
        let updated = false;
        const updatedItems = data.items.map((item) => {
          if (item.imageUrl && !item.imageUrl.startsWith('http')) {
            updated = true;
            return {
              ...item,
              imageUrl: `https://storage.googleapis.com/${firebaseConfig.storageBucket}/products/${item.imageUrl}`,
            };
          } else if (!item.imageUrl || item.imageUrl.match(/^(1920x1080|400x300|64x64)$/)) {
            updated = true;
            return { ...item, imageUrl: 'https://placehold.co/400x300?text=Producto' };
          }
          return item;
        });
        if (updated) {
          await firestore.updateDoc(firestore.doc(db, 'orders', docSnap.id), { items: updatedItems });
          console.log(`Actualizada imagen de pedido ${docSnap.id}`);
        }
      }
    }

    console.log('Corrección de URLs completada.');
  } catch (error) {
    console.error('Error al corregir URLs:', error);
  }
}

fixImageUrls();