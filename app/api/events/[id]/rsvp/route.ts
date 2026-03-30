import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

// POST /api/events/[id]/rsvp - Student RSVP (Public/Authenticated)
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id);
        const session = await getServerSession(authOptions);
        const body = await request.json();

        // If authenticated as student, use their profile data
        const studentId = session?.user?.role === 'student' ? parseInt(session.user.id) : null;
        let studentData = null;

        if (studentId) {
            studentData = await prisma.students.findUnique({
                where: { id: studentId },
                select: { name_en: true, name_bn: true, email: true, mobile: true, department: true, student_session: true }
            });
        }

        const fullName = studentData 
            ? (studentData.name_bn || studentData.name_en || '') 
            : (body.fullName || '').trim();
        const email = studentData ? studentData.email : (body.email || '').trim();
        const phone = studentData ? studentData.mobile : (body.phone || '').trim();
        const department = studentData ? studentData.department : (body.department || '').trim();
        const sessionName = studentData ? studentData.student_session : (body.session || '').trim();
        const response = body.response === 'not_going' ? 'not_going' : 'going';

        if (!fullName) {
            return NextResponse.json({ success: false, message: 'Full name is required.' }, { status: 400 });
        }

        const event = await prisma.events.findUnique({
            where: { id },
            include: { rsvps: true }
        });

        if (!event) {
            return NextResponse.json({ success: false, message: 'Event not found.' }, { status: 404 });
        }

        if (!event.rsvpEnabled) {
            return NextResponse.json({ success: false, message: 'Registration is disabled for this event.' }, { status: 400 });
        }

        // Check capacity
        if (event.capacity > 0 && response === 'going') {
            const goingCount = event.rsvps.filter((r: any) => r.response === 'going').length;
            if (goingCount >= event.capacity) {
                // Check if user already has a 'going' rsvp (they might be updating)
                const existingRsvp = event.rsvps.find((r: any) => (email && r.email === email) || (phone && r.phone === phone));
                if (!existingRsvp || existingRsvp.response !== 'going') {
                    return NextResponse.json({ success: false, message: 'Event capacity is full.' }, { status: 409 });
                }
            }
        }

        // Check for existing RSVP by email or phone
        const existingRsvp = event.rsvps.find((r: any) => 
            (email && r.email === email) || (phone && r.phone === phone)
        );

        if (existingRsvp) {
            if (existingRsvp.response === response) {
                return NextResponse.json({ 
                    success: false, 
                    message: response === 'going' ? 'আপনি ইতিমধ্যে এই ইভেন্টের জন্য রেজিস্টার করেছেন।' : 'আপনি ইতিমধ্যে এই ইভেন্ট বাতিল করেছেন।'
                }, { status: 409 });
            }

            const updatedRsvp = await prisma.event_rsvps.update({
                where: { id: existingRsvp.id },
                data: {
                    fullName,
                    email,
                    phone,
                    department,
                    session: sessionName,
                    response
                }
            });
            return NextResponse.json({ 
                success: true, 
                message: 'Registration updated successfully.',
                data: updatedRsvp 
            });
        } else {
            const newRsvp = await prisma.event_rsvps.create({
                data: {
                    eventId: id,
                    fullName,
                    email,
                    phone,
                    department,
                    session: sessionName,
                    response
                }
            });
            return NextResponse.json({ 
                success: true, 
                message: 'Registration submitted successfully.',
                data: newRsvp 
            }, { status: 201 });
        }

    } catch (error) {
        console.error('RSVP submission error:', error);
        return NextResponse.json({ success: false, message: 'Server Error' }, { status: 500 });
    }
}
