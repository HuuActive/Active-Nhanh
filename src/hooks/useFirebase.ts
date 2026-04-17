import { useState, useEffect } from 'react';
import { 
  limit,
  startAfter,
  getDocs,
  query,
  where,
  orderBy,
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  writeBatch,
  increment
} from 'firebase/firestore';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  updateProfile
} from 'firebase/auth';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { Product, Category } from '../types';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('name'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setProducts(items);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'products');
    });

    return () => unsubscribe();
  }, []);

  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      await addDoc(collection(db, 'products'), product);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'products');
    }
  };

  const editProduct = async (id: string, product: Partial<Product>) => {
    try {
      const productRef = doc(db, 'products', id);
      await updateDoc(productRef, product);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `products/${id}`);
    }
  };

  const removeProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
    }
  };

  return { products, loading, addProduct, editProduct, removeProduct };
}

export function useAuth() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        console.log('User logged in:', firebaseUser.email);
        
        // Immediate check for default admin to show UI faster
        const isDefaultAdmin = firebaseUser.email === 'activenhanh@gmail.com';
        if (isDefaultAdmin) setIsAdmin(true);

        try {
          // Check if user is admin in Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const role = userData.role;
            console.log('User role from Firestore:', role);
            setIsAdmin(role === 'admin' || isDefaultAdmin);

            // Update emailVerified status if changed
            if (userData.emailVerified !== firebaseUser.emailVerified) {
              await updateDoc(doc(db, 'users', firebaseUser.uid), {
                emailVerified: firebaseUser.emailVerified
              });
            }
          } else {
            console.log('User doc does not exist, creating...');
            const role = isDefaultAdmin ? 'admin' : 'user';
            
            await setDoc(doc(db, 'users', firebaseUser.uid), {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              role: role,
              displayName: firebaseUser.displayName,
              emailVerified: firebaseUser.emailVerified
            });
            console.log('User doc created with role:', role);
            setIsAdmin(role === 'admin');
          }
        } catch (error) {
          console.error('Error checking/creating user doc:', error);
          if (isDefaultAdmin) setIsAdmin(true);
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const registerWithEmail = async (email: string, pass: string, name: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(userCredential.user, { displayName: name });
      return userCredential.user;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const resendVerification = async () => {
    if (auth.currentUser) {
      try {
        await sendEmailVerification(auth.currentUser);
      } catch (error) {
        console.error('Resend verification error:', error);
        throw error;
      }
    }
  };

  return { 
    user, 
    isAdmin, 
    loading, 
    login: loginWithGoogle, // Maintain compatibility
    loginWithGoogle,
    registerWithEmail,
    loginWithEmail,
    logout,
    resendVerification
  };
}

export function useReviews(productId?: string, onlyApproved: boolean = true, limitCount: number = 10) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<any>(null);

  useEffect(() => {
    let q = query(
      collection(db, 'reviews'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    if (productId) {
      if (onlyApproved) {
        q = query(
          collection(db, 'reviews'), 
          where('productId', '==', productId), 
          where('isApproved', '==', true),
          orderBy('createdAt', 'desc'),
          limit(limitCount)
        );
      } else {
        q = query(
          collection(db, 'reviews'), 
          where('productId', '==', productId), 
          orderBy('createdAt', 'desc'),
          limit(limitCount)
        );
      }
    } else if (onlyApproved) {
      q = query(
        collection(db, 'reviews'), 
        where('isApproved', '==', true),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReviews(items);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === limitCount);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'reviews');
    });

    return () => unsubscribe();
  }, [productId, onlyApproved, limitCount]);

  const loadMore = async () => {
    if (!lastDoc) return;
    
    let q = query(
      collection(db, 'reviews'),
      orderBy('createdAt', 'desc'),
      startAfter(lastDoc),
      limit(limitCount)
    );

    if (productId) {
      if (onlyApproved) {
        q = query(
          collection(db, 'reviews'), 
          where('productId', '==', productId), 
          where('isApproved', '==', true),
          orderBy('createdAt', 'desc'),
          startAfter(lastDoc),
          limit(limitCount)
        );
      } else {
        q = query(
          collection(db, 'reviews'), 
          where('productId', '==', productId), 
          orderBy('createdAt', 'desc'),
          startAfter(lastDoc),
          limit(limitCount)
        );
      }
    } else if (onlyApproved) {
      q = query(
        collection(db, 'reviews'), 
        where('isApproved', '==', true),
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        limit(limitCount)
      );
    }

    try {
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReviews(prev => [...prev, ...items]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === limitCount);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'reviews');
    }
  };

  const addReview = async (review: any) => {
    try {
      await addDoc(collection(db, 'reviews'), {
        ...review,
        replies: [],
        isApproved: false, // Default to false for moderation
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'reviews');
    }
  };

  const approveReview = async (reviewId: string) => {
    try {
      const reviewRef = doc(db, 'reviews', reviewId);
      await updateDoc(reviewRef, { isApproved: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `reviews/${reviewId}`);
    }
  };

  const addReply = async (reviewId: string, reply: any) => {
    try {
      const reviewRef = doc(db, 'reviews', reviewId);
      const reviewSnap = await getDoc(reviewRef);
      if (reviewSnap.exists()) {
        const currentReplies = reviewSnap.data().replies || [];
        await updateDoc(reviewRef, {
          replies: [...currentReplies, {
            ...reply,
            createdAt: new Date().toISOString()
          }]
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `reviews/${reviewId}`);
    }
  };

  const deleteReview = async (reviewId: string) => {
    try {
      await deleteDoc(doc(db, 'reviews', reviewId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `reviews/${reviewId}`);
    }
  };

  const addConsultationRequest = async (request: any) => {
    try {
      await addDoc(collection(db, 'consultations'), {
        ...request,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      console.log('Consultation request sent to activenhanh@gmail.com:', request);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'consultations');
    }
  };

  return { reviews, loading, hasMore, loadMore, addReview, addReply, deleteReview, approveReview, addConsultationRequest };
}

export function useOrders(fetchOrders: boolean = false, email?: string) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(fetchOrders);

  useEffect(() => {
    if (!fetchOrders) {
      setLoading(false);
      return;
    }
    
    let q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    
    if (email) {
      q = query(collection(db, 'orders'), where('customerInfo.email', '==', email), orderBy('createdAt', 'desc'));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(items);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'orders');
    });

    return () => unsubscribe();
  }, [fetchOrders]);

  const createOrder = async (order: any) => {
    try {
      const batch = writeBatch(db);
      
      // Create the order document
      const orderRef = doc(collection(db, 'orders'));
      batch.set(orderRef, {
        ...order,
        status: 'pending',
        createdAt: new Date().toISOString()
      });

      // Update stock for each item
      order.items.forEach((item: any) => {
        const productRef = doc(db, 'products', item.id);
        batch.update(productRef, {
          stock: increment(-item.quantity)
        });
      });

      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'orders');
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  return { orders, loading, createOrder, updateOrderStatus };
}

export function useUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('email'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(items);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
    });

    return () => unsubscribe();
  }, []);

  return { users, loading };
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'categories'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Category[];
      setCategories(items);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'categories');
    });

    return () => unsubscribe();
  }, []);

  const addCategory = async (category: Omit<Category, 'id'>) => {
    try {
      await addDoc(collection(db, 'categories'), category);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'categories');
    }
  };

  const editCategory = async (id: string, category: Partial<Category>) => {
    try {
      const categoryRef = doc(db, 'categories', id);
      await updateDoc(categoryRef, category);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `categories/${id}`);
    }
  };

  const removeCategory = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'categories', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `categories/${id}`);
    }
  };

  return { categories, loading, addCategory, editCategory, removeCategory };
}
