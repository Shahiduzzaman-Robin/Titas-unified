import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import ExcelJS from 'exceljs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { logAdminActivity, getAdminIdFromSession, getIpAddress, getUserAgent } from '@/lib/admin-activity';

export async function GET(req: NextRequest) {
    try {
        // 1. Authenticate admin
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== 'admin') {
            return NextResponse.json({ msg: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);

        // 2. Build filters from query params
        const sessions = searchParams.getAll('session').filter(v => v && v !== 'all');
        const departments = searchParams.getAll('department').filter(v => v && v !== 'all');
        const upazilas = searchParams.getAll('upazila').filter(v => v && v !== 'all');
        const statuses = searchParams.getAll('status').filter(v => v && v !== 'all');

        // 3. Define display fields
        const fields = searchParams.get('fields')?.split(',') || ['titasId', 'name', 'session', 'department', 'mobile', 'status'];

        const where: any = {};
        if (statuses.length > 0) {
            where.approval = { in: statuses.map(s => parseInt(s)) };
        }
        if (sessions.length > 0) where.student_session = { in: sessions };
        if (departments.length > 0) where.department = { in: departments };
        if (upazilas.length > 0) where.upazila = { in: upazilas };

        // 4. Fetch matching students from DB
        const students = await prisma.students.findMany({
            where,
            orderBy: [
                { student_session: 'desc' },
                { department: 'asc' },
                { name_en: 'asc' }
            ]
        });

        // --- AUDIT LOGGING ---
        await logAdminActivity({
            adminId: getAdminIdFromSession(session),
            action: 'export_data',
            description: `Exported student directory to Excel (${students.length} records)`,
            metadata: {
                filters: { sessions, departments, upazilas, statuses, fields },
                record_count: students.length
            },
            ipAddress: getIpAddress(req),
            userAgent: getUserAgent(req)
        });

        // 5. Initialize Workbook
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Titas DU Website';
        workbook.lastModifiedBy = 'Admin';
        workbook.created = new Date();

        const totalCount = students.length;

        // --- DATA PROCESSING FOR DASHBOARDS ---
        const sessionStats: Record<string, number> = {};
        const deptStats: Record<string, number> = {};
        const upazilaStats: Record<string, number> = {};
        const hallStats: Record<string, number> = {};
        const genderStats: Record<string, number> = {};
        const bloodStats: Record<string, number> = {};
        const correlationStats: Record<string, Record<string, number>> = {};
        const deptSessionStats: Record<string, Record<string, number>> = {};
        const upazilaSessionStats: Record<string, Record<string, number>> = {};
        const yearlyGrowth: Record<string, number> = {};

        students.forEach(s => {
            const sess = s.student_session || 'Unknown';
            const dept = s.department || 'Unknown';
            const upazilla = s.upazila || 'Unknown';
            const hall = s.hall || 'Unknown';
            const regYear = new Date(s.createdAt).getFullYear().toString();

            sessionStats[sess] = (sessionStats[sess] || 0) + 1;
            deptStats[dept] = (deptStats[dept] || 0) + 1;
            upazilaStats[upazilla] = (upazilaStats[upazilla] || 0) + 1;
            hallStats[hall] = (hallStats[hall] || 0) + 1;
            genderStats[s.gender || 'Other'] = (genderStats[s.gender || 'Other'] || 0) + 1;
            bloodStats[s.blood_group || 'Unknown'] = (bloodStats[s.blood_group || 'Unknown'] || 0) + 1;

            if (!correlationStats[upazilla]) correlationStats[upazilla] = {};
            correlationStats[upazilla][hall] = (correlationStats[upazilla][hall] || 0) + 1;

            if (!deptSessionStats[dept]) deptSessionStats[dept] = {};
            deptSessionStats[dept][sess] = (deptSessionStats[dept][sess] || 0) + 1;

            if (!upazilaSessionStats[upazilla]) upazilaSessionStats[upazilla] = {};
            upazilaSessionStats[upazilla][sess] = (upazilaSessionStats[upazilla][sess] || 0) + 1;

            yearlyGrowth[regYear] = (yearlyGrowth[regYear] || 0) + 1;
        });


        // --- SHEET 1: Students List (Moved to Front) ---
        const worksheet = workbook.addWorksheet('Students List', {
            views: [{ state: 'frozen', ySplit: 5 }]
        });

        // 6. Define Columns based on selection
        const columns: any[] = [{ header: 'SL', key: 'sl', width: 8 }];

        if (fields.includes('titasId')) columns.push({ header: 'ID', key: 'titasId', width: 12 });
        
        if (fields.includes('name')) {
            columns.push({ header: 'Name (EN)', key: 'name_en', width: 25 });
            columns.push({ header: 'Name (BN)', key: 'name_bn', width: 25 });
        }
        if (fields.includes('session')) columns.push({ header: 'Session', key: 'session', width: 15 });
        if (fields.includes('department')) columns.push({ header: 'Department', key: 'department', width: 25 });
        if (fields.includes('hall')) columns.push({ header: 'Hall', key: 'hall', width: 20 });
        if (fields.includes('upazila')) columns.push({ header: 'Upazila', key: 'upazila', width: 15 });
        if (fields.includes('address')) columns.push({ header: 'Address', key: 'address', width: 30 });
        if (fields.includes('mobile')) columns.push({ header: 'Mobile', key: 'mobile', width: 18 });
        if (fields.includes('email')) columns.push({ header: 'Email', key: 'email', width: 25 });
        if (fields.includes('blood_group')) columns.push({ header: 'Blood', key: 'blood', width: 10 });
        if (fields.includes('gender')) columns.push({ header: 'Gender', key: 'gender', width: 10 });
        if (fields.includes('du_reg_number')) columns.push({ header: 'DU Reg', key: 'du_reg', width: 15 });
        if (fields.includes('job_info')) {
            columns.push({ header: 'Current Position', key: 'job_des', width: 25 });
            columns.push({ header: 'Organization', key: 'job_org', width: 25 });
        }
        if (fields.includes('status')) columns.push({ header: 'Status', key: 'status', width: 12 });

        // Move Photo column to the end
        columns.push({ header: 'Photo Link', key: 'photo', width: 15 });

        worksheet.columns = columns;

        // 7. Branded Header Styling
        const totalCols = columns.length;
        const generatedAt = new Date();

        // Row 1: Title
        worksheet.mergeCells(1, 1, 1, totalCols);
        const titleCell = worksheet.getCell('A1');
        titleCell.value = 'TITAS DU STUDENTS DIRECTORY';
        titleCell.font = { name: 'Arial', size: 20, bold: true, color: { argb: 'FFFFFFFF' } };
        titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF115E59' } }; // Teal-800
        titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getRow(1).height = 45;

        // Row 2: Subtitle
        worksheet.mergeCells(2, 1, 2, totalCols);
        const subTitleCell = worksheet.getCell('A2');
        subTitleCell.value = 'Dhaka University students and Alumni from Brahmanbaria District';
        subTitleCell.font = { name: 'Arial', size: 11, color: { argb: 'FFD1FAE5' }, italic: true };
        subTitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF134E4A' } }; // Teal-900
        subTitleCell.alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getRow(2).height = 25;

        // Row 3: Meta
        worksheet.mergeCells(3, 1, 3, totalCols);
        const metaCell = worksheet.getCell('A3');
        metaCell.value = `Exported on: ${generatedAt.toLocaleString('en-GB')} | Total Records: ${students.length} | Generated by Admin Panel`;
        metaCell.font = { name: 'Arial', size: 10, color: { argb: 'FF475569' }, bold: true };
        metaCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } }; // Slate-100
        metaCell.alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getRow(3).height = 20;

        // Row 5: Column Headers
        const headerRow = worksheet.getRow(5);
        headerRow.values = columns.map(c => c.header);
        headerRow.height = 30;
        headerRow.eachCell((cell) => {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } }; // Slate-800
            cell.font = { name: 'Arial', bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.border = {
                top: { style: 'thin', color: { argb: 'FF475569' } },
                left: { style: 'thin', color: { argb: 'FF475569' } },
                bottom: { style: 'medium', color: { argb: 'FF000000' } },
                right: { style: 'thin', color: { argb: 'FF475569' } }
            };
        });

        // 8. Add Data Rows
        const origin = req.nextUrl.origin;
        students.forEach((s, idx) => {
            const data: any = { sl: idx + 1 };
            if (fields.includes('titasId')) data.titasId = `${s.prefix}-${String(s.id).padStart(4, '0')}`;
            
            // Photo link preparation
            let photoUrl = '';
            if (s.image_path) {
                if (s.image_path.startsWith('http')) {
                    photoUrl = s.image_path;
                } else {
                    const cleanPath = s.image_path.startsWith('/') ? s.image_path : `/${s.image_path}`;
                    photoUrl = `${origin}${cleanPath}`;
                }
            }
            data.photo = photoUrl || 'No Photo'; // Assign to data object

            if (fields.includes('name')) { data.name_en = s.name_en || ''; data.name_bn = s.name_bn || ''; }
            if (fields.includes('session')) data.session = s.student_session || '';
            if (fields.includes('department')) data.department = s.department || '';
            if (fields.includes('hall')) data.hall = s.hall || '';
            if (fields.includes('upazila')) data.upazila = s.upazila || '';
            if (fields.includes('address')) data.address = s.address_en || s.address_bn || '';
            if (fields.includes('mobile')) data.mobile = s.mobile || '';
            if (fields.includes('email')) data.email = s.email || '';
            if (fields.includes('blood_group')) data.blood = s.blood_group || '';
            if (fields.includes('gender')) data.gender = s.gender || '';
            if (fields.includes('du_reg_number')) data.du_reg = s.du_reg_number || '';
            if (fields.includes('job_info')) { 
                data.job_des = s.job_designation || ''; 
                data.job_org = s.job_position || ''; 
            }
            if (fields.includes('status')) data.status = s.approval === 1 ? 'Approved' : s.approval === 2 ? 'Rejected' : 'Pending';

            const row = worksheet.addRow(data);
            row.height = 25;
            const isEven = idx % 2 === 0;

            row.eachCell((cell) => {
                cell.font = { name: 'Arial', size: 10 };
                cell.border = { 
                    top: { style: 'thin', color: { argb: 'FFE2E8F0' } }, 
                    left: { style: 'thin', color: { argb: 'FFE2E8F0' } }, 
                    bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } }, 
                    right: { style: 'thin', color: { argb: 'FFE2E8F0' } } 
                };
                cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
                if (!isEven) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };

                // Photo Column Logic (Hyperlink)
                const colKey = columns[(cell as any).col - 1]?.key;
                if (colKey === 'photo') {
                    if (data.photo !== 'No Photo') {
                        cell.value = { text: 'View Photo', hyperlink: data.photo, tooltip: 'Click to view photo' };
                        cell.font = { color: { argb: 'FF2563EB' }, underline: true, size: 10 };
                        cell.alignment = { horizontal: 'center', vertical: 'middle' };
                    } else {
                        cell.value = 'No Photo';
                        cell.font = { color: { argb: 'FF94A3B8' }, italic: true, size: 9 };
                        cell.alignment = { horizontal: 'center', vertical: 'middle' };
                    }
                }

                // Centering some columns
                if (['sl', 'titasId', 'mobile', 'blood', 'gender', 'status'].includes(colKey)) {
                    cell.alignment = { horizontal: 'center', vertical: 'middle' };
                }

                // Status Column Coloring
                if (colKey === 'status') {
                    if (cell.value === 'Approved') cell.font = { color: { argb: 'FF059669' }, bold: true };
                    if (cell.value === 'Rejected') cell.font = { color: { argb: 'FFDC2626' }, bold: true };
                    if (cell.value === 'Pending') cell.font = { color: { argb: 'FFD97706' }, bold: true };
                }
            });
        });

        // --- SHEET 2: Summary Dashboard ---
        const summarySheet = workbook.addWorksheet('Summary Dashboard', {
            views: [{ showGridLines: false }]
        });

        // Dashboard Header
        summarySheet.mergeCells('B2:K2');
        const dashTitle = summarySheet.getCell('B2');
        dashTitle.value = 'Students Statistics Dashboard';
        dashTitle.font = { name: 'Arial Black', size: 18, bold: true, color: { argb: 'FF1E293B' } };
        dashTitle.alignment = { horizontal: 'center' };


        const styleTableHeaders = (cells: string[], bgColor = 'FFE2E8F0') => {
            cells.forEach(cell => {
                const c = summarySheet.getCell(cell);
                c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
                c.font = { bold: true, size: 10 };
                c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                c.alignment = { horizontal: 'center' };
            });
        };

        const renderTable = (title: string, data: Record<string, number>, colStart: string, startRow: number, idLabel?: string) => {
            summarySheet.getCell(`${colStart}${startRow - 1}`).value = title;
            summarySheet.getCell(`${colStart}${startRow - 1}`).font = { bold: true, size: 12 };
            
            summarySheet.getCell(`${colStart}${startRow}`).value = idLabel || title.split(' ').pop();
            summarySheet.getCell(`${String.fromCharCode(colStart.charCodeAt(0) + 1)}${startRow}`).value = 'Count';
            summarySheet.getCell(`${String.fromCharCode(colStart.charCodeAt(0) + 2)}${startRow}`).value = '%';
            
            styleTableHeaders([
                `${colStart}${startRow}`, 
                `${String.fromCharCode(colStart.charCodeAt(0) + 1)}${startRow}`,
                `${String.fromCharCode(colStart.charCodeAt(0) + 2)}${startRow}`
            ]);

            let r = startRow;
            Object.entries(data).sort((a, b) => b[1] - a[1]).forEach(([label, count]) => {
                r++;
                const cCol = String.fromCharCode(colStart.charCodeAt(0) + 1);
                const pCol = String.fromCharCode(colStart.charCodeAt(0) + 2);
                
                summarySheet.getCell(`${colStart}${r}`).value = label;
                summarySheet.getCell(`${cCol}${r}`).value = count;
                summarySheet.getCell(`${pCol}${r}`).value = ((count / totalCount) * 100).toFixed(1) + '%';
                
                [colStart, cCol, pCol].forEach(col => {
                    summarySheet.getCell(`${col}${r}`).border = { left: { style: 'thin' }, right: { style: 'thin' }, bottom: { style: 'thin' } };
                });
                summarySheet.getCell(`${cCol}${r}`).alignment = { horizontal: 'center' };
                summarySheet.getCell(`${pCol}${r}`).alignment = { horizontal: 'center' };
            });
            return r; // return last row
        };

        // Render Summary Tables - Row 1
        renderTable('By Session', sessionStats, 'B', 5);
        renderTable('By Upazila', upazilaStats, 'F', 5);
        renderTable('By Hall', hallStats, 'J', 5);

        // Render Summary Tables - Row 2 (Positioned dynamically)
        const row2Start = Math.max(
            5 + Object.keys(sessionStats).length + 3,
            5 + Object.keys(upazilaStats).length + 3,
            5 + Object.keys(hallStats).length + 3
        );

        renderTable('By Department', deptStats, 'B', row2Start);
        renderTable('Gender Distribution', genderStats, 'F', row2Start, 'Gender');
        renderTable('Blood Registry', bloodStats, 'J', row2Start, 'Blood Group');

        summarySheet.getColumn('B').width = 25;
        summarySheet.getColumn('F').width = 20;
        summarySheet.getColumn('J').width = 25;

        // --- SHEET 2: Upazila vs Hall Correlation ---
        const corrSheet = workbook.addWorksheet('Geographic Trends', {
            views: [{ showGridLines: false, state: 'frozen', xSplit: 1, ySplit: 4 }]
        });

        corrSheet.mergeCells('A1:O1');
        corrSheet.getCell('A1').value = 'Upazila vs Hall Distribution Matrix';
        corrSheet.getCell('A1').font = { bold: true, size: 16, color: { argb: 'FF1E293B' } };
        corrSheet.getCell('A1').alignment = { horizontal: 'center' };

        const allHalls = Object.keys(hallStats).sort();
        const allUpazilas = Object.keys(upazilaStats).sort();

        // Matrix Header (Halls as columns)
        corrSheet.getCell('A4').value = 'UPAZILA \\ HALL';
        corrSheet.getCell('A4').font = { bold: true };
        corrSheet.getCell('A4').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
        corrSheet.getCell('A4').font = { color: { argb: 'FFFFFFFF' }, bold: true };

        allHalls.forEach((hall, i) => {
            const col = String.fromCharCode(66 + i); // B, C, D...
            const cell = corrSheet.getCell(`${col}4`);
            cell.value = hall;
            cell.font = { bold: true, size: 9 };
            cell.alignment = { textRotation: 45, horizontal: 'center', vertical: 'middle' };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
            corrSheet.getColumn(col).width = 12;
        });

        // Matrix Body
        allUpazilas.forEach((upazila, ri) => {
            const rowIdx = 5 + ri;
            corrSheet.getCell(`A${rowIdx}`).value = upazila;
            corrSheet.getCell(`A${rowIdx}`).font = { bold: true };
            corrSheet.getCell(`A${rowIdx}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
            corrSheet.getColumn('A').width = 25;

            allHalls.forEach((hall, ci) => {
                const col = String.fromCharCode(66 + ci);
                const count = correlationStats[upazila]?.[hall] || 0;
                const cell = corrSheet.getCell(`${col}${rowIdx}`);
                cell.value = count || '';
                cell.alignment = { horizontal: 'center' };
                cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                
                // Heatmap logic
                if (count > 0) {
                    const intensity = Math.min(255, 230 - (count * 15));
                    const hex = intensity.toString(16).padStart(2, '0');
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${hex}FAF0` } };
                }
            });
        });

        // --- SHEET 3: Historical Trends ---
        const trendsSheet = workbook.addWorksheet('Historical Trends', {
            views: [{ showGridLines: false, state: 'frozen', xSplit: 1, ySplit: 4 }]
        });

        // Render Trend Matrices using indices for column safety
        const allSessions = Object.keys(sessionStats).sort().reverse();
        const totalSessions = allSessions.length;

        const renderTrendMatrix = (title: string, rowData: Record<string, Record<string, number>>, startRow: number) => {
            const lastColIndex = totalSessions + 1; // A (1) + totalSessions
            
            trendsSheet.mergeCells(startRow, 1, startRow, lastColIndex);
            const t = trendsSheet.getCell(startRow, 1);
            t.value = title;
            t.font = { bold: true, size: 14, color: { argb: 'FF115E59' } };
            t.alignment = { horizontal: 'center' };

            const headerRow = startRow + 2;
            const matrixTitle = title.split(' ').pop();
            const firstCell = trendsSheet.getCell(headerRow, 1);
            firstCell.value = `${matrixTitle} \\ SESSION`;
            firstCell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
            firstCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
            
            allSessions.forEach((sess, i) => {
                const cell = trendsSheet.getCell(headerRow, 2 + i);
                cell.value = sess;
                cell.font = { color: { argb: 'FFFFFFFF' }, bold: true, size: 9 };
                cell.alignment = { horizontal: 'center' };
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0D9488' } }; 
                trendsSheet.getColumn(2 + i).width = 12;
            });

            let currentMatrixRow = headerRow + 1;
            Object.entries(rowData).sort((a,b) => b[0].localeCompare(a[0])).forEach(([label, counts]) => {
                const rowLabelCell = trendsSheet.getCell(currentMatrixRow, 1);
                rowLabelCell.value = label;
                rowLabelCell.font = { bold: true };
                rowLabelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };

                allSessions.forEach((sess, ci) => {
                    const count = counts[sess] || 0;
                    const cell = trendsSheet.getCell(currentMatrixRow, 2 + ci);
                    cell.value = count || '';
                    cell.alignment = { horizontal: 'center' };
                    cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                    
                    if (count > 0) {
                        const intensity = Math.min(255, 240 - (count * 10));
                        const hex = intensity.toString(16).padStart(2, '0');
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${hex}EDEB` } };
                    }
                });
                currentMatrixRow++;
            });
            return currentMatrixRow + 2;
        };

        // 1. Dept Grow/Decline Trend
        let nextStart = renderTrendMatrix('Department Participation Trends over Sessions', deptSessionStats, 1);

        // 2. Upazila Presence heatmap
        nextStart = renderTrendMatrix('Upazila Outreach Trends over Sessions', upazilaSessionStats, nextStart);

        // 3. Yearly Member Growth
        trendsSheet.mergeCells(nextStart, 1, nextStart, 3);
        const growthTitle = trendsSheet.getCell(nextStart, 1);
        growthTitle.value = 'Yearly Member Registration Growth';
        growthTitle.font = { bold: true, size: 14, color: { argb: 'FF1E293B' } };

        const regHeaderRow = nextStart + 1;
        const hYear = trendsSheet.getCell(regHeaderRow, 1);
        const hCount = trendsSheet.getCell(regHeaderRow, 2);
        hYear.value = 'Year';
        hCount.value = 'New Registrations';
        [hYear, hCount].forEach(c => {
            c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
            c.font = { color: { argb: 'FFFFFFFF' }, bold: true };
        });

        let regRow = regHeaderRow + 1;
        Object.entries(yearlyGrowth).sort((a, b) => b[0].localeCompare(a[0])).forEach(([year, count]) => {
            const cYear = trendsSheet.getCell(regRow, 1);
            const cCount = trendsSheet.getCell(regRow, 2);
            cYear.value = year;
            cCount.value = count;
            cYear.border = { bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
            cCount.border = { bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
            cCount.alignment = { horizontal: 'center' };
            regRow++;
        });

        trendsSheet.getColumn(1).width = 30;


        // 9. Return as Excel Stream
        const buffer = await workbook.xlsx.writeBuffer();
        const fileName = `Titas_Students_Export_${generatedAt.toISOString().split('T')[0]}.xlsx`;

        return new Response(buffer as ArrayBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="${fileName}"`,
                'Cache-Control': 'no-cache',
            }
        });

    } catch (error: any) {
        console.error('Export Error:', error);
        return NextResponse.json({ msg: 'Export failed' }, { status: 500 });
    }
}
