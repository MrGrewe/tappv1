This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# Testdaten und Foreign-Key-Constraint für employer_profiles & worker_profiles

## Foreign-Key-Constraint temporär entfernen (nur Entwicklung!)

Führe im Supabase SQL-Editor aus:

```sql
ALTER TABLE employer_profiles DROP CONSTRAINT IF EXISTS employer_profiles_id_fkey;
ALTER TABLE worker_profiles DROP CONSTRAINT IF EXISTS worker_profiles_id_fkey;
```

---

## Testdaten einfügen

```sql
-- Arbeitgeber (employer_profiles)
INSERT INTO employer_profiles (id, company_name, contact_person, email, industry, job_title, job_description, location, employment_type, work_model, skills, salary_min, salary_max, start_date, company_logo_url, created_at) VALUES
('emp-1', 'Tech Solutions GmbH', 'Anna Schmidt', 'hr@techsolutions.de', 'IT', 'Frontend Developer', 'Wir suchen einen kreativen Frontend-Entwickler für spannende Projekte.', 'Berlin', 'Vollzeit', 'Hybrid', '{React,TypeScript,Teamwork}', 50000, 70000, '2024-08-01', null, now()),
('emp-2', 'Green Energy AG', 'Max Müller', 'jobs@greenenergy.de', 'Energie', 'Projektmanager', 'Leite nachhaltige Energieprojekte deutschlandweit.', 'Hamburg', 'Vollzeit', 'Vor Ort', '{Projektmanagement,Nachhaltigkeit}', 60000, 80000, '2024-09-01', null, now());

-- Bewerber (worker_profiles)
INSERT INTO worker_profiles (id, full_name, email, profession, bio, skills, location, search_radius, desired_employment_types, available_from, experience_years, experience_text, profile_photo_url, created_at) VALUES
('worker-1', 'Max Mustermann', 'max@mustermann.de', 'Webentwickler', 'Erfahrener Webentwickler mit Fokus auf React.', '{React,TypeScript,CSS}', 'Berlin', 50, '{Vollzeit,Teilzeit}', '2024-08-01', 4, '4 Jahre Erfahrung in Agenturen.', null, now()),
('worker-2', 'Lisa Müller', 'lisa@mueller.de', 'UX/UI Designerin', 'Kreative Designerin für digitale Produkte.', '{Figma,Sketch,Adobe XD}', 'Hamburg', 30, '{Vollzeit}', '2024-09-01', 3, 'Design von Apps und Webseiten.', null, now());
```

---

## Foreign-Key-Constraint wieder aktivieren (nach den Tests)

```sql
ALTER TABLE employer_profiles
ADD CONSTRAINT employer_profiles_id_fkey
FOREIGN KEY (id) REFERENCES users(id);

ALTER TABLE worker_profiles
ADD CONSTRAINT worker_profiles_id_fkey
FOREIGN KEY (id) REFERENCES users(id);
```

---

**Hinweis:**
- Die IDs (z.B. 'emp-1', 'worker-1') sind für Testzwecke frei wählbar.
- Für Produktion immer wieder den Foreign-Key aktivieren!
