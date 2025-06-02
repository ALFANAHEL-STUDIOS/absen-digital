import {
 collection,
 doc,
 addDoc,
 getDoc,
 getDocs,
 updateDoc,
 deleteDoc,
 query,
 where,
 orderBy,
 limit,
 serverTimestamp,
 QueryConstraint,
 DocumentData
} from 'firebase/firestore';
import { db } from './firebase';
export interface FirestoreDocument<T = DocumentData> {
 id: string;
 data(): T;
}
// Base Firestore Service
class BaseFirestoreService {
 constructor(protected collectionName: string) {}
 async create(data: any, customId?: string): Promise<string> {
   try {
     if (customId) {
       await updateDoc(doc(db, this.collectionName, customId), {
         ...data,
         createdAt: serverTimestamp(),
         updatedAt: serverTimestamp()
       });
       return customId;
     } else {
       const docRef = await addDoc(collection(db, this.collectionName), {
         ...data,
         createdAt: serverTimestamp(),
         updatedAt: serverTimestamp()
       });
       return docRef.id;
     }
   } catch (error) {
     console.error('Error creating document:', error);
     throw error;
   }
 }
 async getById(id: string): Promise<FirestoreDocument | null> {
   try {
     const docRef = doc(db, this.collectionName, id);
     const docSnap = await getDoc(docRef);

     if (docSnap.exists()) {
       return {
         id: docSnap.id,
         data: () => docSnap.data()
       };
     }
     return null;
   } catch (error) {
     console.error('Error getting document:', error);
     throw error;
   }
 }
 async getAll(constraints: QueryConstraint[] = []): Promise<FirestoreDocument[]> {
   try {
     const collectionRef = collection(db, this.collectionName);
     const q = constraints.length > 0 ? query(collectionRef, ...constraints) : collectionRef;
     const querySnapshot = await getDocs(q);

     return querySnapshot.docs.map(doc => ({
       id: doc.id,
       data: () => doc.data()
     }));
   } catch (error) {
     console.error('Error getting documents:', error);
     throw error;
   }
 }
 async update(id: string, data: any): Promise<void> {
   try {
     const docRef = doc(db, this.collectionName, id);
     await updateDoc(docRef, {
       ...data,
       updatedAt: serverTimestamp()
     });
   } catch (error) {
     console.error('Error updating document:', error);
     throw error;
   }
 }
 async delete(id: string): Promise<void> {
   try {
     const docRef = doc(db, this.collectionName, id);
     await deleteDoc(docRef);
   } catch (error) {
     console.error('Error deleting document:', error);
     throw error;
   }
 }
 async search(field: string, operator: any, value: any, constraints: QueryConstraint[] = []): Promise<FirestoreDocument[]> {
   try {
     const collectionRef = collection(db, this.collectionName);
     const searchConstraints = [where(field, operator, value), ...constraints];
     const q = query(collectionRef, ...searchConstraints);
     const querySnapshot = await getDocs(q);

     return querySnapshot.docs.map(doc => ({
       id: doc.id,
       data: () => doc.data()
     }));
   } catch (error) {
     console.error('Error searching documents:', error);
     throw error;
   }
 }
}
// School-specific services
class SchoolBasedService extends BaseFirestoreService {
 constructor(collectionName: string) {
   super(collectionName);
 }
 async create(schoolId: string, data: any, customId?: string): Promise<string> {
   const schoolCollectionName = `schools/${schoolId}/${this.collectionName}`;
   try {
     if (customId) {
       await updateDoc(doc(db, schoolCollectionName, customId), {
         ...data,
         createdAt: serverTimestamp(),
         updatedAt: serverTimestamp()
       });
       return customId;
     } else {
       const docRef = await addDoc(collection(db, schoolCollectionName), {
         ...data,
         createdAt: serverTimestamp(),
         updatedAt: serverTimestamp()
       });
       return docRef.id;
     }
   } catch (error) {
     console.error('Error creating school document:', error);
     throw error;
   }
 }
 async getById(schoolId: string, id: string): Promise<FirestoreDocument | null> {
   try {
     const docRef = doc(db, `schools/${schoolId}/${this.collectionName}`, id);
     const docSnap = await getDoc(docRef);

     if (docSnap.exists()) {
       return {
         id: docSnap.id,
         data: () => docSnap.data()
       };
     }
     return null;
   } catch (error) {
     console.error('Error getting school document:', error);
     throw error;
   }
 }
 async getAll(schoolId: string, constraints: QueryConstraint[] = []): Promise<FirestoreDocument[]> {
   try {
     const collectionRef = collection(db, `schools/${schoolId}/${this.collectionName}`);
     const q = constraints.length > 0 ? query(collectionRef, ...constraints) : collectionRef;
     const querySnapshot = await getDocs(q);

     return querySnapshot.docs.map(doc => ({
       id: doc.id,
       data: () => doc.data()
     }));
   } catch (error) {
     console.error('Error getting school documents:', error);
     throw error;
   }
 }
 async update(schoolId: string, id: string, data: any): Promise<void> {
   try {
     const docRef = doc(db, `schools/${schoolId}/${this.collectionName}`, id);
     await updateDoc(docRef, {
       ...data,
       updatedAt: serverTimestamp()
     });
   } catch (error) {
     console.error('Error updating school document:', error);
     throw error;
   }
 }
 async delete(schoolId: string, id: string): Promise<void> {
   try {
     const docRef = doc(db, `schools/${schoolId}/${this.collectionName}`, id);
     await deleteDoc(docRef);
   } catch (error) {
     console.error('Error deleting school document:', error);
     throw error;
   }
 }
 async search(schoolId: string, field: string, operator: any, value: any, constraints: QueryConstraint[] = []): Promise<FirestoreDocument[]> {
   try {
     const collectionRef = collection(db, `schools/${schoolId}/${this.collectionName}`);
     const searchConstraints = [where(field, operator, value), ...constraints];
     const q = query(collectionRef, ...searchConstraints);
     const querySnapshot = await getDocs(q);

     return querySnapshot.docs.map(doc => ({
       id: doc.id,
       data: () => doc.data()
     }));
   } catch (error) {
     console.error('Error searching school documents:', error);
     throw error;
   }
 }
}
// Service instances
export const StudentService = new SchoolBasedService('students');
export const ClassService = new SchoolBasedService('classes');
export const AttendanceService = new SchoolBasedService('attendance');
export const SchoolService = new BaseFirestoreService('schools');
export const UserService = new BaseFirestoreService('users');
// Additional methods for specific services
export const AttendanceServiceExtended = {
 ...AttendanceService,

 async getByStudentId(schoolId: string, studentId: string): Promise<FirestoreDocument[]> {
   return this.search(schoolId, 'studentId', '==', studentId, [orderBy('timestamp', 'desc')]);
 },
 async getByDate(schoolId: string, date: string): Promise<FirestoreDocument[]> {
   return this.search(schoolId, 'date', '==', date, [orderBy('timestamp', 'desc')]);
 },
 async getByDateRange(schoolId: string, startDate: string, endDate: string): Promise<FirestoreDocument[]> {
   try {
     const collectionRef = collection(db, `schools/${schoolId}/attendance`);
     const q = query(
       collectionRef,
       where('date', '>=', startDate),
       where('date', '<=', endDate),
       orderBy('date', 'desc')
     );
     const querySnapshot = await getDocs(q);

     return querySnapshot.docs.map(doc => ({
       id: doc.id,
       data: () => doc.data()
     }));
   } catch (error) {
     console.error('Error getting attendance by date range:', error);
     throw error;
   }
 }
};
export const UserServiceExtended = {
 ...UserService,

 async getBySchoolId(schoolId: string): Promise<FirestoreDocument[]> {
   return this.search('schoolId', '==', schoolId);
 },
 async getByRole(role: string): Promise<FirestoreDocument[]> {
   return this.search('role', '==', role);
 }
};
// Helper functions
export const createDocument = async (collectionPath: string, data: any, customId?: string): Promise<string> => {
 try {
   if (customId) {
     await updateDoc(doc(db, collectionPath, customId), {
       ...data,
       createdAt: serverTimestamp(),
       updatedAt: serverTimestamp()
     });
     return customId;
   } else {
     const docRef = await addDoc(collection(db, collectionPath), {
       ...data,
       createdAt: serverTimestamp(),
       updatedAt: serverTimestamp()
     });
     return docRef.id;
   }
 } catch (error) {
   console.error('Error creating document:', error);
   throw error;
 }
};
export const getDocument = async (collectionPath: string, id: string): Promise<FirestoreDocument | null> => {
 try {
   const docRef = doc(db, collectionPath, id);
   const docSnap = await getDoc(docRef);

   if (docSnap.exists()) {
     return {
       id: docSnap.id,
       data: () => docSnap.data()
     };
   }
   return null;
 } catch (error) {
   console.error('Error getting document:', error);
   throw error;
 }
};
export const updateDocument = async (collectionPath: string, id: string, data: any): Promise<void> => {
 try {
   const docRef = doc(db, collectionPath, id);
   await updateDoc(docRef, {
     ...data,
     updatedAt: serverTimestamp()
   });
 } catch (error) {
   console.error('Error updating document:', error);
   throw error;
 }
};
export const deleteDocument = async (collectionPath: string, id: string): Promise<void> => {
 try {
   const docRef = doc(db, collectionPath, id);
   await deleteDoc(docRef);
 } catch (error) {
   console.error('Error deleting document:', error);
   throw error;
 }
};
