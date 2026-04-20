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
  increment,
  serverTimestamp,
  Timestamp
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
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { Product, Category, Post, PostComment, CommentReply } from '../types';

const normalizeData = (doc: any) => {
  const data = doc.data();
  const item = { id: doc.id, ...data };
  Object.keys(item).forEach(key => {
    if (item[key] instanceof Timestamp) {
      item[key] = item[key].toDate().toISOString();
    }
  });
  return item;
};

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('name'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => normalizeData(doc)) as Product[];
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
  const [profile, setProfile] = useState<any>(null);
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
          // Listen to user doc changes to keep profile in sync
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setProfile(userData);
            const role = userData.role;
            setIsAdmin(role === 'admin' || isDefaultAdmin);

            // Update emailVerified status if changed
            if (userData.emailVerified !== firebaseUser.emailVerified) {
              await updateDoc(userDocRef, {
                emailVerified: firebaseUser.emailVerified
              });
            }
          } else {
            console.log('User doc does not exist, creating...');
            const role = isDefaultAdmin ? 'admin' : 'user';
            const initialProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              role: role,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              emailVerified: firebaseUser.emailVerified
            };
            await setDoc(userDocRef, initialProfile);
            setProfile(initialProfile);
            setIsAdmin(role === 'admin');
          }
        } catch (error) {
          console.error('Error checking/creating user doc:', error);
          if (isDefaultAdmin) setIsAdmin(true);
        }
      } else {
        setIsAdmin(false);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
        // User closed the popup, no need to log as error
        return;
      }
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

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  };

  const updateProfileData = async (data: { displayName?: string; photoURL?: string }) => {
    if (!auth.currentUser) return;
    try {
      // Firebase Auth photoURL has a length limit. Data URLs (base64) are often too long.
      // We only update Auth profile with displayName and if photoURL is a standard URL.
      const authUpdates: any = {};
      if (data.displayName) authUpdates.displayName = data.displayName;
      
      // Only set photoURL in Auth if it's not a data URL (base64)
      if (data.photoURL && !data.photoURL.startsWith('data:')) {
        authUpdates.photoURL = data.photoURL;
      }

      if (Object.keys(authUpdates).length > 0) {
        await updateProfile(auth.currentUser, authUpdates);
      }

      // Always update Firestore doc (Firestore has 1MB limit for strings)
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, data);
      
      // Update local profile state immediately
      setProfile((prev: any) => ({ ...prev, ...data }));
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  return { 
    user, 
    profile,
    isAdmin, 
    loading, 
    login: loginWithGoogle, // Maintain compatibility
    loginWithGoogle,
    registerWithEmail,
    loginWithEmail,
    logout,
    resendVerification,
    resetPassword,
    updateProfile: updateProfileData
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
      const items = snapshot.docs.map(doc => normalizeData(doc));
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
        createdAt: serverTimestamp()
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
        createdAt: serverTimestamp()
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
      const items = snapshot.docs.map(doc => normalizeData(doc));
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
        createdAt: serverTimestamp()
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

export function usePosts(pageSize = 9) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<any>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'posts'), 
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => normalizeData(doc)) as Post[];
      setPosts(items);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length >= pageSize);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'posts');
    });

    return () => unsubscribe();
  }, [pageSize]);

  const loadMore = async () => {
    if (!lastDoc || loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    try {
      const q = query(
        collection(db, 'posts'),
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        limit(pageSize)
      );
      
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => normalizeData(doc)) as Post[];
      
      setPosts(prev => [...prev, ...items]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length >= pageSize);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'posts');
    } finally {
      setLoadingMore(false);
    }
  };

  const addPost = async (post: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'views'>) => {
    try {
      await addDoc(collection(db, 'posts'), {
        ...post,
        views: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'posts');
    }
  };

  const editPost = async (id: string, post: Partial<Post>) => {
    try {
      const postRef = doc(db, 'posts', id);
      await updateDoc(postRef, {
        ...post,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `posts/${id}`);
    }
  };

  const removePost = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'posts', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `posts/${id}`);
    }
  };

  return { posts, loading, loadingMore, hasMore, loadMore, addPost, editPost, removePost };
}

export function usePostComments(postId: string) {
  const [comments, setComments] = useState<PostComment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!postId) return;
    const q = query(
      collection(db, 'post_comments'),
      where('postId', '==', postId),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => normalizeData(doc)) as PostComment[];
      setComments(items);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'post_comments');
    });

    return () => unsubscribe();
  }, [postId]);

  const addComment = async (comment: Omit<PostComment, 'id' | 'createdAt' | 'status'>) => {
    try {
      await addDoc(collection(db, 'post_comments'), {
        ...comment,
        status: 'pending',
        replies: [],
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'post_comments');
    }
  };

  const addReply = async (commentId: string, reply: Omit<CommentReply, 'createdAt'>) => {
    try {
      const commentRef = doc(db, 'post_comments', commentId);
      const commentSnap = await getDoc(commentRef);
      if (commentSnap.exists()) {
        const currentReplies = commentSnap.data().replies || [];
        await updateDoc(commentRef, {
          replies: [...currentReplies, {
            ...reply,
            createdAt: new Date().toISOString()
          }]
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `post_comments/${commentId}`);
    }
  };

  const approveComment = async (id: string) => {
    try {
      await updateDoc(doc(db, 'post_comments', id), { status: 'approved' });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `post_comments/${id}`);
    }
  };

  const deleteComment = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'post_comments', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `post_comments/${id}`);
    }
  };

  return { comments, loading, addComment, addReply, approveComment, deleteComment };
}

export function useAllPostComments() {
  const [comments, setComments] = useState<PostComment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'post_comments'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => normalizeData(doc)) as PostComment[];
      setComments(items);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'post_comments');
    });

    return () => unsubscribe();
  }, []);

  const approveComment = async (id: string) => {
    try {
      await updateDoc(doc(db, 'post_comments', id), { status: 'approved' });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `post_comments/${id}`);
    }
  };

  const markSpam = async (id: string) => {
    try {
      await updateDoc(doc(db, 'post_comments', id), { status: 'spam' });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `post_comments/${id}`);
    }
  };

  const deleteComment = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'post_comments', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `post_comments/${id}`);
    }
  };

  return { comments, loading, approveComment, markSpam, deleteComment };
}

export function useAnalytics() {
  const [summary, setSummary] = useState<any>(null);
  const [dailyStats, setDailyStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const summaryRef = doc(db, 'site_stats', 'summary');
    const dailyRef = query(
      collection(db, 'site_stats', 'daily', 'records'),
      orderBy('date', 'desc'),
      limit(30)
    );

    const unsubSummary = onSnapshot(summaryRef, (doc) => {
      if (doc.exists()) setSummary(doc.data());
      else setSummary({ totalVisits: 0 });
    });

    const unsubDaily = onSnapshot(dailyRef, (snapshot) => {
      const items = snapshot.docs.map(doc => doc.data());
      setDailyStats(items);
      setLoading(false);
    });

    return () => {
      unsubSummary();
      unsubDaily();
    };
  }, []);

  return { summary, dailyStats, loading };
}

export const trackVisit = async () => {
  // Simple session tracking to avoid overcounting refreshes
  const today = new Date().toISOString().split('T')[0];
  const sessionKey = `v_tracked_${today}`;
  
  if (sessionStorage.getItem(sessionKey)) return;

  try {
    const batch = writeBatch(db);
    
    const summaryRef = doc(db, 'site_stats', 'summary');
    batch.set(summaryRef, { 
      totalVisits: increment(1),
      lastVisit: serverTimestamp() 
    }, { merge: true });
    
    const dailyRef = doc(db, 'site_stats', 'daily', 'records', today);
    batch.set(dailyRef, { 
      count: increment(1), 
      date: today 
    }, { merge: true });
    
    await batch.commit();
    sessionStorage.setItem(sessionKey, 'true');
  } catch (error) {
    // Silent fail for analytics
    console.warn('Analytics silent fail:', error);
  }
};
