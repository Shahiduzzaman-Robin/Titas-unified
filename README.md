# Titas Student Management System

A Next.js application for student registration and management.

## 🌍 Internationalization (i18n)

The project supports **English (en)** and **Bengali (bn)** languages using `next-intl`.

### Default Language
- Bengali (`bn`) is the default language.
- The language preference is saved in `localStorage`.

### Adding Translations
Translations are stored in JSON files in the `messages` directory:
- `messages/en.json` (English)
- `messages/bn.json` (Bengali)

To add new text:
1. Add the key-value pair to both JSON files.
2. Use valid JSON structure.
3. Use nested objects for organization (e.g., `page.section.key`).

### Usage in Components
- **Client Components:**
  ```tsx
  import { useTranslations } from 'next-intl';
  
  export default function MyComponent() {
    const t = useTranslations('section');
    return <h1>{t('key')}</h1>;
  }
  ```
- **Server Components:**
  ```tsx
  import { getTranslations } from 'next-intl/server';
  
  export default async function Page() {
    const t = await getTranslations('section');
    return <h1>{t('key')}</h1>;
  }
  ```

## 📂 Project Structure
- `app/[locale]/`: Localized pages and layouts.
- `messages/`: Translation JSON files.
- `i18n.ts`: i18n configuration.
- `middleware.ts`: Locale detection and routing middleware.
- `components/LanguageSwitcher.tsx`: Language toggle component.

## 🌟 Features

### 🎓 Student Management
- **Registration Form**: Comprehensive data collection including profile image.
- **Bilingual Support**: Fields for English and Bengali (Name, Address).
- **Validation**: Automatic validation for duplicate students (by Name or Mobile).
- **Timezone Support**: Automatic UTC+6 (Dhaka) timestamps for all registrations.

### 🛡️ Admin Dashboard
- **Student List**: View all registered students with status monitoring.
- **Approval Workflow**:
  - ✅ **Approve**: Activates student profile.
  - ❌ **Reject**: Marks as rejected with a mandatory reason.
- **Filtering**: Filter students by Session, Department, Hall, or Status.
- **Export/Print**: Export student list to Excel or generic print view.
- **SMS Logs**: Track all sent SMS and delivery status.

### 💬 Notification System

**1. Discord Webhooks** (Real-time admin alerts)
- **Registration**: Yellow alert when new student applies.
- **Approval**: Green alert when student is approved.
- **Rejection**: Red alert when student is rejected.
- **Rich Embeds**: Includes full student profile, photo, and registration time.

**2. SMS Integration** (Student alerts)
- Automatic SMS sent on Approval and Rejection.
- Custom templates for different messages.
- Robust error handling (hides API failures from UI).

### 🖼️ Image Storage
- **Dual Support**: Works with **Cloudflare R2** or **Local File System**.
- **Migration Tool**: Built-in script to migrate legacy images.
- **Optimization**: Images automatically resized/optimized via Next.js Image component.

## 🚀 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment**:
   Copy `.env.example` to `.env` and configure:
   - Database connection
   - Discord Webhook URLs
   - SMS API credentials
   - Storage provider settings

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Access the application**:
   - Public: [http://localhost:3000](http://localhost:3000)
   - Admin: [http://localhost:3000/en/admin/login](http://localhost:3000/en/admin/login)

## 🔄 Image Migration

The project includes a script to migrate student images from legacy URLs or external sources to your configured storage provider (Cloudflare R2 or Local).

### Running the Migration
To migrate images, run the following command behavior:
```bash
npx tsx scripts/migrate-images.ts
```

This script will:
1. Scan all students in the database.
2. Identify images needing migration (external URLs or legacy paths).
3. Download the image and upload it to your current storage provider.
4. Update the student record with the new path.
