/**
 * Class CRUD Operations
 */
export const ClassService = {
  create: async (schoolId: string, classData: any) => {
    try {
      const collectionPath = `schools/${schoolId}/classes`;
      return await createDocument(collectionPath, classData);
    } catch (error) {
      handleFirestoreError(error, "creating class");
      throw error;
    }
  },

  getById: async (schoolId: string, classId: string) => {
    try {
      const docPath = `schools/${schoolId}/classes`;
      return await readDocument(docPath, classId);
    } catch (error) {
      handleFirestoreError(error, "fetching class");
      throw error;
    }
  },

  getAll: async (schoolId: string, constraints: QueryConstraint[] = []) => {
    try {
      const collectionPath = `schools/${schoolId}/classes`;
      return await readDocuments(collectionPath, constraints);
    } catch (error) {
      handleFirestoreError(error, "fetching classes");
      throw error;
    }
  },

  update: async (schoolId: string, classId: string, data: any) => {
    try {
      const docPath = `schools/${schoolId}/classes`;
      return await updateDocument(docPath, classId, data);
    } catch (error) {
      handleFirestoreError(error, "updating class");
      throw error;
    }
  },

  delete: async (schoolId: string, classId: string) => {
    try {
      const docPath = `schools/${schoolId}/classes`;
      return await deleteDocument(docPath, classId);
    } catch (error) {
      handleFirestoreError(error, "deleting class");
      throw error;
    }
  },

  search: async (
    schoolId: string,
    field: string,
    operator: WhereFilterOp,
    value: any,
    additionalConstraints: QueryConstraint[] = []
  ) => {
    try {
      const collectionPath = `schools/${schoolId}/classes`;
      return await searchDocuments(collectionPath, field, operator, value, additionalConstraints);
    } catch (error) {
      handleFirestoreError(error, "searching classes");
      throw error;
    }
  }
};
