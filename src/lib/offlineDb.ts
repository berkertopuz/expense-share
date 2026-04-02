const DB_NAME = "expense-share-offline";
const DB_VERSION = 1;
const STORE_NAME = "pending-expenses";

interface PendingExpense {
  id: string;
  groupId: string;
  description: string;
  amount: number;
  payments: { userId: string; amount: number }[];
  splits: { userId: string; amount: number }[];
  createdAt: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
  });
}

export async function addPendingExpense(
  expense: Omit<PendingExpense, "id" | "createdAt">
): Promise<string> {
  const db = await openDB();
  const id = `pending-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    const data: PendingExpense = {
      ...expense,
      id,
      createdAt: Date.now(),
    };

    const request = store.add(data);
    request.onsuccess = () => resolve(id);
    request.onerror = () => reject(request.error);
  });
}

export async function getPendingExpenses(): Promise<PendingExpense[]> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function removePendingExpense(id: string): Promise<void> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getPendingCount(): Promise<number> {
  const expenses = await getPendingExpenses();
  return expenses.length;
}
