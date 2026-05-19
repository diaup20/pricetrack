import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  return `${amount.toLocaleString('en-YE')} ريال يمني`;
}

export function formatSAR(amount: number) {
  return new Intl.NumberFormat('en-YE', {
    style: 'currency',
    currency: 'SAR',
    maximumFractionDigits: 2,
  }).format(amount);
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

import { auth } from './firebase';

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function compressImage(file: File, maxSize: number = 400, maxBytes: number = 100000): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height *= maxSize / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width *= maxSize / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        let quality = 0.8;
        let compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        
        // Iteratively reduce quality if still too large
        while (compressedBase64.length > maxBytes && quality > 0.1) {
          quality -= 0.1;
          compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        }

        // If still too large, resize again more aggressively
        if (compressedBase64.length > maxBytes) {
          const tinyMaxSize = maxSize / 2;
          const tinyCanvas = document.createElement('canvas');
          let tWidth = width;
          let tHeight = height;
          
          if (tWidth > tHeight) {
            tHeight *= tinyMaxSize / tWidth;
            tWidth = tinyMaxSize;
          } else {
            tWidth *= tinyMaxSize / tHeight;
            tHeight = tinyMaxSize;
          }
          
          tinyCanvas.width = tWidth;
          tinyCanvas.height = tHeight;
          tinyCanvas.getContext('2d')?.drawImage(canvas, 0, 0, tWidth, tHeight);
          compressedBase64 = tinyCanvas.toDataURL('image/jpeg', 0.1);
        }

        if (compressedBase64.length <= maxBytes * 1.5) { // Allow a bit over for base64 overhead
          resolve(compressedBase64);
        } else {
          reject(new Error('Image too large even after compression'));
        }
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = reject;
  });
}
