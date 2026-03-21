const { PrismaClient } = require('@prisma/client');
const xlsx = require('xlsx');
const axios = require('axios');
const cloudinary = require('cloudinary').v2;
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();

// Configure Cloudinary (Load from environment variables)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadToCloudinary(url) {
    if (!url || url.includes('placeholder')) return null;
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data);
        
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'titas_students',
                    resource_type: 'image',
                    transformation: [
                        { quality: 'auto', fetch_format: 'auto' }
                    ]
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result.secure_url);
                }
            );
            uploadStream.end(buffer);
        });
    } catch (error) {
        console.error(`Failed to upload image ${url}:`, error.message);
        return null;
    }
}

async function importStudents() {
    const filePath = path.join(__dirname, 'public', 'students_export_2026-03-20.xlsx');
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    console.log(`Found ${data.length} students in Excel.`);

    for (let i = 0; i < data.length; i++) {
        const row = data[i];
        
        // Extract Hyperlink for Photo (Column T or U depending on zero-index)
        // In the screenshot Photo was column T or U. Based on my previous debug test, it was column 'U'.
        const cellAddress = 'U' + (i + 2); // Excel is 1-indexed, headers are at 1, so data starts at 2
        const cell = sheet[cellAddress];
        const photoLink = cell?.l?.Target || cell?.v || null;

        const studentData = {
            prefix: "TITAS",
            name_en: row['Name (EN)'] || null,
            name_bn: row['Name (BN)'] || null,
            student_session: row['Session (EN)'] || null,
            du_reg_number: row['DU Reg.']?.toString() || null,
            department: row['Department (EN)'] || null,
            hall: row['Hall (EN)'] || null,
            upazila: row['Upazila (BN)'] || null,
            address_bn: row['Address (BN)'] || null,
            address_en: row['Address (EN)'] || null,
            mobile: row['Phone Number']?.toString() || null,
            email: row['Email'] || null,
            blood_group: row['Blood Group'] || null,
            gender: (row['Gender'] || 'male').toLowerCase(),
            approval: 1, 
            image_show: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        let cloudinaryUrl = null;
        if (photoLink && typeof photoLink === 'string' && photoLink.startsWith('http')) {
             cloudinaryUrl = await uploadToCloudinary(photoLink);
        }

        studentData.image_path = cloudinaryUrl;


        try {
            // 1. Ensure relations exist (Session, Dept, Hall, Upazila)
            if (studentData.student_session) {
                await prisma.sessions.upsert({
                    where: { name: studentData.student_session },
                    update: {},
                    create: { name: studentData.student_session, name_bn: row['Session (BN)'] }
                });
            }
            if (studentData.department) {
                await prisma.departments.upsert({
                    where: { name: studentData.department },
                    update: {},
                    create: { name: studentData.department, name_bn: row['Department (BN)'] }
                });
            }
            if (studentData.hall) {
                await prisma.halls.upsert({
                    where: { name: studentData.hall },
                    update: {},
                    create: { name: studentData.hall, name_bn: row['Hall (BN)'] }
                });
            }
            if (studentData.upazila) {
                await prisma.upazilas.upsert({
                    where: { name: studentData.upazila },
                    update: {},
                    create: { name: studentData.upazila, name_bn: row['Upazila (BN)'], district: "ব্রাহ্মণবাড়িয়া" }
                });
            }

            // 2. Insert Student
            await prisma.students.create({
                data: studentData
            });

            console.log(`[${i+1}/${data.length}] Imported: ${studentData.name_en}`);
        } catch (err) {
            console.error(`Error importing ${studentData.name_en}:`, err.message);
        }
    }

    console.log('Import Complete!');
}

importStudents()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
