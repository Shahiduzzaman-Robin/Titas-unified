import { Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
    page: {
        width: 500,
        height: 315,
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
    },
    // Header
    header: {
        height: 40,
        backgroundColor: '#1a4d2e',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
    },
    headerPattern: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.1,
    },
    headerTitle: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 2,
        zIndex: 10,
    },
    // Body
    body: {
        flex: 1,
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        position: 'relative',
    },
    watermark: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: 80,
        fontWeight: 900,
        color: '#000000',
        opacity: 0.03,
    },
    content: {
        maxWidth: '80%',
        zIndex: 10,
    },
    description: {
        fontSize: 12,
        color: '#4b5563',
        lineHeight: 1.5,
        fontStyle: 'italic',
        marginBottom: 16,
    },
    divider: {
        width: 64,
        height: 2,
        backgroundColor: '#e5e7eb',
        marginVertical: 16,
    },
    authoritySection: {
        marginBottom: 8,
    },
    authorityLabel: {
        fontSize: 10,
        color: '#6b7280',
        textTransform: 'uppercase',
        fontWeight: 'bold',
        marginBottom: 4,
    },
    authorityName: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#1a4d2e',
    },
    validityBox: {
        marginTop: 8,
    },
    validityText: {
        fontSize: 9,
        color: '#e11d48',
        fontWeight: 'bold',
        border: '1px solid #e11d48',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 2,
    },
    // Footer
    footer: {
        backgroundColor: '#f9fafb',
        padding: 12,
        borderTop: '1px solid #e5e7eb',
        textAlign: 'center',
    },
    disclaimer: {
        fontSize: 9,
        color: '#6b7280',
        marginBottom: 4,
    },
    contactRow: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
    },
    contactText: {
        fontSize: 9,
        fontWeight: 600,
        color: '#1a4d2e',
    },
    separator: {
        fontSize: 9,
        color: '#1a4d2e',
    },
})

export function BackCardPDF() {
    return (
        <Page size={[500, 315]} style={styles.page}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerPattern} />
                <Text style={styles.headerTitle}>TITAS RIVER</Text>
            </View>

            {/* Body */}
            <View style={styles.body}>
                {/* Watermark */}
                <Text style={styles.watermark}>TITAS</Text>

                <View style={styles.content}>
                    <Text style={styles.description}>
                        "The Titas River (Bengali: তিতাস নদী) is a transboundary river of Bangladesh and India.
                        It is a lifeline for the people of Brahmanbaria, representing the cultural heritage and
                        flowing beauty of the region."
                    </Text>

                    <View style={styles.divider} />

                    <View style={styles.authoritySection}>
                        <Text style={styles.authorityLabel}>Issuing Authority</Text>
                        <Text style={styles.authorityName}>TITAS CENTRAL COMMITTEE</Text>
                    </View>

                    <View style={styles.validityBox}>
                        <Text style={styles.validityText}>
                            Valid until completion of study
                        </Text>
                    </View>
                </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.disclaimer}>
                    This card is the property of TITAS. If found, please return to the address below.
                </Text>
                <View style={styles.contactRow}>
                    <Text style={styles.contactText}>www.titasdu.com</Text>
                    <Text style={styles.separator}>•</Text>
                    <Text style={styles.contactText}>contact@titasdu.com</Text>
                </View>
            </View>
        </Page>
    )
}
