import { collection, doc, getDocs, setDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { db, auth } from './firebase';

// Collections
export const COLLECTIONS = {
  CAMPAIGNS: 'campaigns',
  LEADS: 'leads',
  TEMPLATES: 'templates',
  ANALYTICS: 'analytics',
  ACCOUNTS: 'accounts',
};

const requireAuth = () => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  return user.uid;
};

// Accounts
export async function getAccounts() {
  const userId = requireAuth();
  const q = query(
    collection(db, COLLECTIONS.ACCOUNTS),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
}

export async function createAccount(data: any) {
  const userId = requireAuth();
  const docRef = await addDoc(collection(db, COLLECTIONS.ACCOUNTS), {
    ...data,
    userId,
    createdAt: serverTimestamp(),
    sentToday: 0,
    status: 'connected'
  });
  return docRef.id;
}

export async function updateAccount(id: string, data: any) {
  const userId = requireAuth();
  await updateDoc(doc(db, COLLECTIONS.ACCOUNTS, id), data);
}

export async function deleteAccount(id: string) {
  const userId = requireAuth();
  await deleteDoc(doc(db, COLLECTIONS.ACCOUNTS, id));
}

// Campaigns
export async function getCampaigns() {
  const userId = requireAuth();
  const q = query(
    collection(db, COLLECTIONS.CAMPAIGNS),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
}

export async function createCampaign(data: any) {
  const userId = requireAuth();
  const docRef = await addDoc(collection(db, COLLECTIONS.CAMPAIGNS), {
    ...data,
    userId,
    createdAt: serverTimestamp(),
    status: 'active',
    sent: 0,
    opens: 0,
    replies: 0,
  });
  return docRef.id;
}

export async function updateCampaignStatus(id: string, status: string) {
  const userId = requireAuth();
  await updateDoc(doc(db, COLLECTIONS.CAMPAIGNS, id), { status });
}

// Leads
export async function getLeads() {
  const userId = requireAuth();
  const q = query(
    collection(db, COLLECTIONS.LEADS),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
}

export async function createLead(data: any) {
  const userId = requireAuth();
  const docRef = await addDoc(collection(db, COLLECTIONS.LEADS), {
    ...data,
    userId,
    createdAt: serverTimestamp(),
    status: 'new',
  });
  return docRef.id;
}

export async function createMultipleLeads(leads: any[]) {
  // Simple batch for now
  const promises = leads.map(lead => createLead(lead));
  await Promise.all(promises);
}

// Templates
export async function getTemplates() {
  const userId = requireAuth();
  const q = query(
    collection(db, COLLECTIONS.TEMPLATES),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
}

export async function createTemplate(data: any) {
  const userId = requireAuth();
  const docRef = await addDoc(collection(db, COLLECTIONS.TEMPLATES), {
    ...data,
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateTemplate(id: string, data: any) {
  const userId = requireAuth();
  await updateDoc(doc(db, COLLECTIONS.TEMPLATES, id), { 
    ...data, 
    updatedAt: serverTimestamp() 
  });
}

export async function deleteTemplate(id: string) {
  const userId = requireAuth();
  await deleteDoc(doc(db, COLLECTIONS.TEMPLATES, id));
}
