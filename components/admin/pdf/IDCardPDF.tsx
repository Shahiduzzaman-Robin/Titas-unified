import { Document } from '@react-pdf/renderer'
import { FrontCardPDF } from './FrontCardPDF'
import { BackCardPDF } from './BackCardPDF'

interface IDCardPDFProps {
    student: any
    qrCodeDataUrl: string
    studentImageUrl: string
    backgroundImageUrl: string
}

export function IDCardPDF({ student, qrCodeDataUrl, studentImageUrl, backgroundImageUrl }: IDCardPDFProps) {
    return (
        <Document>
            <FrontCardPDF
                student={student}
                qrCodeDataUrl={qrCodeDataUrl}
                studentImageUrl={studentImageUrl}
                backgroundImageUrl={backgroundImageUrl}
            />
            <BackCardPDF />
        </Document>
    )
}
