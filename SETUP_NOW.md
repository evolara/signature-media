# 🚀 إعداد نظام الحجز الآن - Setup Booking System NOW

## ✅ حالة المشروع:
- ✅ الكود جاهز
- ✅ Supabase Credentials محدثة (ujbxsmwjgvvpwkdgbkcu)
- ✅ Dev Server يعمل على http://localhost:5174
- ⏳ **ينقص فقط: إنشاء جدول `booked_seats`**

---

## 📋 خطوة واحدة فقط لتشغيل النظام:

### **الخطوة 1: إنشاء الجدول في Supabase**

1. **افتح**: https://app.supabase.com/project/ujbxsmwjgvvpwkdgbkcu

2. **اذهب إلى**: SQL Editor (على اليسار)

3. **اضغط**: New Query (الزر الأزرق)

4. **انسخ والصق هذا الكود بالدقة:**

```sql
CREATE TABLE IF NOT EXISTS public.booked_seats (
  seat_key TEXT PRIMARY KEY,
  ticket_type TEXT NOT NULL CHECK (ticket_type IN ('vip', 'classic')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.booked_seats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public SELECT" 
  ON public.booked_seats FOR SELECT USING (true);

CREATE POLICY "Allow public INSERT" 
  ON public.booked_seats FOR INSERT WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_booked_seats_ticket_type 
  ON public.booked_seats(ticket_type);
```

5. **اضغط**: ▶️ Run (الزر الأزرق)

6. **اضغط**: Execute (إذا طُلب)

---

### **الخطوة 2: اختبر النظام**

عد للـ Terminal واكتب:

```bash
node test-supabase.mjs
```

يجب أن تري:
```
✅ تم حجز المقعد: A-5
✅ عدد المقاعد المحجوزة: 1
✅ النظام يعمل بشكل صحيح!
```

---

### **الخطوة 3: جرب التطبيق**

1. افتح: http://localhost:5174
2. انقر على زر الحجز
3. اختر مقاعد
4. اضغط "أرسل عبر واتساب" 
5. يجب أن تُحفظ المقاعد في Supabase

---

## ✅ كيف تعرف أن كل شيء يعمل:

- ✅ لا ترى رسائل خطأ
- ✅ المقاعد تُحفظ عند الحجز
- ✅ اختبر في متصفحين مختلفين = **رؤية الحجوزات في الوقت الفعلي**

---

## 🔧 استكشاف المشاكل:

### خطأ: "relation does not exist"
→ لم تنشئ الجدول بعد. أعد الخطوة 1

### خطأ: "Invalid API key"  
→ تحقق من .env file - يجب أن تكون المفاتيح صحيحة

### لا شيء يحدث
→ تأكد من:
- Dev server يعمل: `npm run dev`
- Supabase project تم اختياره الصحيح
- Credentials في .env صحيحة

---

## 📞 معلومات المشروع:
- **Project ID**: ujbxsmwjgvvpwkdgbkcu
- **URL**: https://ujbxsmwjgvvpwkdgbkcu.supabase.co
- **Dashboard**: https://app.supabase.com/project/ujbxsmwjgvvpwkdgbkcu

---

## ✨ بعد الانتهاء:

يمكنك نشر على Vercel بـ:
```bash
git push
```

Deploy automatically حيث:
- Settings → Environment Variables
- أضف نفس SUPABASE_ variables

**كل شيء سيعمل تلقائياً!** 🚀
