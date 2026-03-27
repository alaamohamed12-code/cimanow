# CimaNow

تطبيق `Next.js` بواجهة عربية `RTL` لعرض المحتوى مع صفحات أفلام ومسلسلات وبرامج وصفحات تفاصيل ومشاهدة وتحميل ولوحة تحكم.

## التشغيل محليًا

```bash
npm install
npm run dev
```

ثم افتح:

`http://localhost:3000`

## فحوصات ما قبل النشر

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## متغيرات البيئة المطلوبة

انسخ القيم من `.env.example` واضبطها قبل النشر:

```bash
DASHBOARD_USERNAME=admin
DASHBOARD_PASSWORD=change-this-password
DASHBOARD_AUTH_SECRET=change-this-secret
```

إذا لم تضبطها، فلن تعمل لوحة التحكم عمدًا لحماية المشروع.

## لماذا أصبح النشر على Vercel أكثر استقرارًا

- مسارات الصفحة الرئيسية والأقسام الأساسية في الإنتاج تعتمد على ملفات JSON محلية داخل `lib/`
- لم يعد البناء يعتمد على تحميل خطوط Google أثناء `build`
- تم إيقاف الاعتماد على الجلب الخارجي وقت بناء الصفحات الأساسية في بيئة الإنتاج

## ملاحظات مهمة

- إذا ظهر على Vercel سجل قديم فيه `403` من `ak.sv` فغالبًا يتم بناء commit أقدم، وليس النسخة الحالية
- تأكد أن Vercel ينشر آخر commit من فرع `main`

راجع ملف [`DEPLOY-VERCEL.md`](./DEPLOY-VERCEL.md) لخطوات النشر الموصى بها.
