import { Document, Page, Text, View, Image, StyleSheet, Font } from '@react-pdf/renderer'

// Create styles
const styles = StyleSheet.create({
    page: {
        width: 500,
        height: 315,
        backgroundColor: '#ffffff',
    },
    // Header with background image
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 85,
        overflow: 'hidden',
    },
    headerImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    headerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    // Content container
    content: {
        position: 'relative',
        paddingLeft: 24,
        paddingRight: 24,
        paddingTop: 20,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
    },
    // Organization title
    orgTitle: {
        textAlign: 'center',
        marginBottom: 16,
        zIndex: 10,
    },
    orgTitleText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
        lineHeight: 1.2,
        textShadow: '0 2px 4px rgba(0,0,0,0.3)',
    },
    // Main content area
    mainContent: {
        display: 'flex',
        flexDirection: 'row',
        gap: 16,
        flex: 1,
        marginTop: 4,
    },
    // Left column - Photo and ID
    leftColumn: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        width: '33%',
    },
    photoContainer: {
        width: 96,
        height: 96,
        borderRadius: 48,
        border: '4px solid #ffffff',
        overflow: 'hidden',
        backgroundColor: '#f3f4f6',
    },
    studentPhoto: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    idContainer: {
        textAlign: 'center',
    },
    idLabel: {
        fontSize: 10,
        color: '#6b7280',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    idValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1a4d2e',
    },
    // Right column - Details
    rightColumn: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        paddingTop: 8,
    },
    nameSection: {
        marginBottom: 4,
    },
    studentName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1a4d2e',
    },
    department: {
        fontSize: 12,
        color: '#4b5563',
        fontWeight: 500,
    },
    detailsGrid: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 4,
    },
    detailItem: {
        width: '48%',
        marginBottom: 4,
    },
    detailLabel: {
        fontSize: 9,
        color: '#6b7280',
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    detailValue: {
        fontSize: 12,
        fontWeight: 600,
        color: '#1f2937',
    },
    bloodGroup: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#e11d48',
        backgroundColor: '#fef2f2',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 2,
    },
    addressSection: {
        marginTop: 4,
    },
    addressText: {
        fontSize: 10,
        lineHeight: 1.3,
        color: '#1f2937',
    },
    // QR Code
    qrContainer: {
        position: 'absolute',
        bottom: 8,
        right: 16,
        backgroundColor: '#ffffff',
        padding: 4,
        borderRadius: 4,
        border: '1px solid #f3f4f6',
    },
    qrCode: {
        width: 48,
        height: 48,
    },
    // Bottom red bar
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 6,
        backgroundColor: '#e11d48',
    },
})

interface FrontCardPDFProps {
    student: any
    qrCodeDataUrl: string
    studentImageUrl: string
    backgroundImageUrl: string
}

export function FrontCardPDF({ student, qrCodeDataUrl, studentImageUrl, backgroundImageUrl }: FrontCardPDFProps) {
    return (
        <Page size={[500, 315]} style={styles.page}>
            {/* Header Background */}
            <View style={styles.header}>
                <Image
                    src={backgroundImageUrl}
                    style={styles.headerImage}
                />
                <View style={styles.headerOverlay} />
            </View>

            {/* Content */}
            <View style={styles.content}>
                {/* Organization Title */}
                <View style={styles.orgTitle}>
                    <Text style={styles.orgTitleText}>
                        Dhaka University Students' Welfare Association of Brahmanbaria
                    </Text>
                </View>

                {/* Main Content */}
                <View style={styles.mainContent}>
                    {/* Left Column - Photo & ID */}
                    <View style={styles.leftColumn}>
                        <View style={styles.photoContainer}>
                            <Image
                                src={studentImageUrl}
                                style={styles.studentPhoto}
                            />
                        </View>
                        <View style={styles.idContainer}>
                            <Text style={styles.idLabel}>Student ID</Text>
                            <Text style={styles.idValue}>TITAS-{student.id}</Text>
                        </View>
                    </View>

                    {/* Right Column - Details */}
                    <View style={styles.rightColumn}>
                        <View style={styles.nameSection}>
                            <Text style={styles.studentName}>{student.name_en}</Text>
                            <Text style={styles.department}>{student.department}</Text>
                        </View>

                        <View style={styles.detailsGrid}>
                            <View style={styles.detailItem}>
                                <Text style={styles.detailLabel}>Session</Text>
                                <Text style={styles.detailValue}>{student.student_session}</Text>
                            </View>
                            <View style={styles.detailItem}>
                                <Text style={styles.detailLabel}>Hall</Text>
                                <Text style={styles.detailValue}>
                                    {student.hall.split('Hall')[0]}
                                </Text>
                            </View>
                            <View style={styles.detailItem}>
                                <Text style={styles.detailLabel}>Blood Group</Text>
                                <Text style={styles.bloodGroup}>{student.blood_group}</Text>
                            </View>
                            <View style={styles.detailItem}>
                                <Text style={styles.detailLabel}>Mobile</Text>
                                <Text style={styles.detailValue}>{student.mobile}</Text>
                            </View>
                        </View>

                        <View style={styles.addressSection}>
                            <Text style={styles.detailLabel}>Permanent Address</Text>
                            <Text style={styles.addressText}>
                                {student.address_en}, {student.upazila}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* QR Code */}
                <View style={styles.qrContainer}>
                    <Image
                        src={qrCodeDataUrl}
                        style={styles.qrCode}
                    />
                </View>

                {/* Bottom Red Bar */}
                <View style={styles.bottomBar} />
            </View>
        </Page>
    )
}
