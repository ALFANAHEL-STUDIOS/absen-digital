/**
* Class API Service
*/
export const classApi = {
 // Create a new class
 create: async (schoolId: string, classData: any) => {
   try {
     const existingClasses = await ClassService.search(schoolId, 'name', '==', classData.name);
     if (existingClasses.length > 0) {
       throw new Error('Nama kelas sudah digunakan');
     }
     const result = await ClassService.create(schoolId, {
       ...classData,
       studentCount: 0,
       createdAt: new Date(),
       updatedAt: new Date()
     });
     toast.success('Kelas berhasil ditambahkan');
     return result;
   } catch (error) {
     console.error("Error creating class:", error);
     toast.error(error instanceof Error ? error.message : 'Gagal menambahkan kelas');
     throw error;
   }
 },

 // Get all classes for a school
 getAll: async (schoolId: string) => {
   try {
     return await ClassService.getAll(schoolId, [orderBy('level'), orderBy('name')]);
   } catch (error) {
     console.error("Error fetching classes:", error);
     toast.error('Gagal mengambil data kelas');
     throw error;
   }
 },

 // Get a specific class
 getById: async (schoolId: string, classId: string) => {
   try {
     return await ClassService.getById(schoolId, classId);
   } catch (error) {
     console.error("Error fetching class:", error);
     toast.error('Gagal mengambil data kelas');
     throw error;
   }
 },

 // Update class information
 update: async (schoolId: string, classId: string, data: any) => {
   try {
     if (data.name) {
       const currentClass = await ClassService.getById(schoolId, classId);
       if (currentClass && currentClass.name !== data.name) {
         const existingClasses = await ClassService.search(schoolId, 'name', '==', data.name);
         if (existingClasses.length > 0) {
           throw new Error('Nama kelas sudah digunakan');
         }
       }
     }
     await ClassService.update(schoolId, classId, {
       ...data,
       updatedAt: new Date()
     });
     toast.success('Data kelas berhasil diperbarui');
     return true;
   } catch (error) {
     console.error("Error updating class:", error);
     toast.error(error instanceof Error ? error.message : 'Gagal memperbarui data kelas');
     throw error;
   }
 },

 // Delete a class
 delete: async (schoolId: string, classId: string) => {
   try {
     const classData = await ClassService.getById(schoolId, classId);
     if (classData && classData.name) {
       const studentsInClass = await StudentService.search(schoolId, 'class', '==', classData.name);
       if (studentsInClass.length > 0) {
         throw new Error(`Tidak dapat menghapus kelas. Masih ada ${studentsInClass.length} siswa di kelas ini.`);
       }
     }
     await ClassService.delete(schoolId, classId);
     toast.success('Kelas berhasil dihapus');
     return true;
   } catch (error) {
     console.error("Error deleting class:", error);
     toast.error(error instanceof Error ? error.message : 'Gagal menghapus kelas');
     throw error;
   }
 },

 // Get class with students count
 getClassesWithStudents: async (schoolId: string) => {
   try {
     const classes = await ClassService.getAll(schoolId, [orderBy('name')]) as unknown as Class[];
     const students = await StudentService.getAll(schoolId) as unknown as Student[];
     const studentCountByClass = students.reduce((acc, student: Student) => {
       const className = student.class;
       if (className) {
         acc[className] = (acc[className] || 0) + 1;
       }
       return acc;
     }, {} as Record<string, number>);
     return classes.map((cls: Class) => ({
       ...cls,
       studentCount: studentCountByClass[cls.name] || 0
     }));
   } catch (error) {
     toast.error('Gagal mengambil data kelas dengan jumlah siswa');
     throw error;
   }
 },

 // Search class
 search: async (
   schoolId: string,
   field: string,
   operator: any,
   value: any,
   additionalConstraints: any[] = []
 ) => {
   try {
     return await ClassService.search(schoolId, field, operator, value, additionalConstraints);
   } catch (error) {
     console.error("Error searching classes:", error);
     toast.error('Gagal mencari data kelas');
     throw error;
   }
 }
};
