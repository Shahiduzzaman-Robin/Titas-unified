
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Common Maps
const vowels: Record<string, string> = {
    'অ': 'a', 'আ': 'a', 'ই': 'i', 'ঈ': 'ee', 'উ': 'u', 'ঊ': 'u', 'ঋ': 'ri',
    'এ': 'e', 'ঐ': 'oi', 'ও': 'o', 'ঔ': 'ou'
}

const consonants: Record<string, string> = {
    'ক': 'k', 'খ': 'kh', 'গ': 'g', 'ঘ': 'gh', 'ঙ': 'ng',
    'চ': 'ch', 'ছ': 'chh', 'জ': 'j', 'ঝ': 'jh', 'ঞ': 'n',
    'ট': 't', 'ঠ': 'th', 'ড': 'd', 'ঢ': 'dh', 'ণ': 'n',
    'ত': 't', 'থ': 'th', 'দ': 'd', 'ধ': 'dh', 'ন': 'n',
    'প': 'p', 'ফ': 'f', 'ব': 'b', 'ভ': 'bh', 'ম': 'm',
    'য': 'z', 'র': 'r', 'ল': 'l', 'শ': 'sh', 'ষ': 'sh', 'স': 's', 'হ': 'h',
    'ড়': 'r', 'ঢ়': 'rh', 'য়': 'y', 'ৎ': 't', 'ং': 'ng', 'ঃ': '.', 'ঁ': 'n'
}

const kars: Record<string, string> = {
    'া': 'a', 'ি': 'i', 'ী': 'ee', 'ু': 'u', 'ূ': 'u', 'ৃ': 'ri',
    'ে': 'e', 'ৈ': 'oi', 'ো': 'o', 'ৌ': 'ou'
}

const special: Record<string, string> = {
    '্': ''
}

// --- V1 Logic (To identify targets) ---
function transliterateV1(text: string): string {
    if (!text) return ''
    let result = text
    result = result.replace(/মোঃ/g, 'Md.')

    let enText = ''
    for (let i = 0; i < result.length; i++) {
        const char = result[i]
        if (vowels[char]) enText += vowels[char]
        else if (consonants[char]) enText += consonants[char]
        else if (kars[char]) enText += kars[char]
        else if (special[char] !== undefined) enText += special[char]
        else enText += char
    }
    return formatName(enText)
}

// --- V2 Logic (Improved) ---
function transliterateV2(text: string): string {
    if (!text) return ''
    let result = text
    // Expanded prefix handling
    result = result.replace(/মোঃ/g, 'Md. ')
    result = result.replace(/মো[:\.]/g, 'Md. ')
    result = result.replace(/মুহা[:\.]/g, 'Md. ')
    result = result.replace(/মোছাঃ/g, 'Mst. ')
    result = result.replace(/মোছা[:\.]/g, 'Mst. ')

    let enText = ''
    for (let i = 0; i < result.length; i++) {
        const char = result[i]
        const nextChar = result[i + 1]

        let mappedChar = ''
        if (vowels[char]) mappedChar = vowels[char]
        else if (consonants[char]) mappedChar = consonants[char]
        else if (kars[char]) mappedChar = kars[char]
        else if (special[char] !== undefined) mappedChar = special[char]
        else mappedChar = char

        enText += mappedChar

        // 'a' insertion logic
        if (consonants[char]) {
            // Insert 'a' if next is consonant and this is NOT the end of a semantic unit
            // And next is not specialized marker like Virama (handled by logic that Virama is not Consonant in map check key)
            // But WAIT, if next char is ' ' (space), we do NOT insert 'a'.
            // My map check `consonants[nextChar]` returns undefined for space. So safe.
            if (nextChar && consonants[nextChar]) {
                enText += 'a'
            }
        }
    }
    return formatName(enText)
}

function formatName(name: string): string {
    return name.split(' ')
        .filter(w => w.trim().length > 0)
        .map(word => {
            // Fix special case: Md. and Mst. (case insensitive)
            if (word.match(/^md\.$/i)) return 'Md.'
            if (word.match(/^mst\.$/i)) return 'Mst.'
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        })
        .join(' ')
}

async function main() {
    console.log('Starting Smart Repair Transliteration...')

    try {
        const students = await prisma.students.findMany({
            where: { name_bn: { not: null } }
        })

        console.log(`Scanning ${students.length} students...`)

        let updatedCount = 0
        let skippedCount = 0

        for (const student of students) {
            if (!student.name_bn) continue

            const currentEn = student.name_en
            const v1 = transliterateV1(student.name_bn)
            const v2 = transliterateV2(student.name_bn)

            let shouldUpdate = false

            // Case 1: Missing English Name (Backfill)
            if (!currentEn || currentEn.trim() === '') {
                shouldUpdate = true
            }
            // Case 2: Current Name matches V1 (the "bad" one) AND V2 is different
            // effectively upgrading V1 -> V2
            else if (currentEn === v1 && v1 !== v2) {
                shouldUpdate = true
            }
            // Case 3: Current Name matches V1 AND V1 == V2.
            // It's already simplified correct. No update needed (data is fine).
            // Case 4: Current Name != V1. 
            // Likely manual entry or modified. Do NOT touch.

            if (shouldUpdate) {
                // Check if V2 is actually different from current (to avoid db write if v1==v2 and current==v1)
                // But we filtered v1!==v2 in Case 2.
                // In Case 1, current is empty, so v2 is diff.

                console.log(`Updating ID ${student.id}: ${student.name_bn}`)
                console.log(`   Old: "${currentEn || ''}"`)
                console.log(`   New: "${v2}"`)

                await prisma.students.update({
                    where: { id: student.id },
                    data: { name_en: v2 }
                })
                updatedCount++
            } else {
                skippedCount++
                // console.log(`Skipping ID ${student.id}: "${currentEn}" (Manual or already correct)`)
            }
        }

        console.log(`Migration complete. Updated: ${updatedCount}, Skipped: ${skippedCount}`)

    } catch (error) {
        console.error('Error during migration:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
