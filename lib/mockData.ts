export interface Content {
  id: string;
  title: string;
  image: string;
  rating: number;
  year: number;
  genre: string;
  description: string;
  sourceUrl?: string;
}

const DEFAULT_POSTER_IMAGE = "/images/poster-placeholder.svg";

const makeItem = (
  id: string,
  title: string,
  rating: number,
  year: number,
  genre: string,
  description: string,
  customImage?: string
): Content => ({
  id,
  title,
  image: customImage || DEFAULT_POSTER_IMAGE,
  rating,
  year,
  genre,
  description,
});

export const mockMovies: Content[] = [
  makeItem("movie-1", "السادة الأفاضل", 8.0, 2026, "دراما", "بعد وفاة الأب جلال، تنقلب حياة العائلة وتبدأ أزمة ديون وأسرار."),
  makeItem("movie-2", "This Is Not a Test", 6.0, 2025, "إثارة", "فيلم إثارة حديث ضمن إضافات الأفلام الجديدة."),
  makeItem("movie-3", "The Couple Across the Street", 6.0, 2026, "إثارة", "جيران في مواجهة توتر متصاعد وأحداث غامضة."),
  makeItem("movie-4", "Midwinter Break", 3.0, 2026, "دراما", "رحلة درامية في عطلة شتوية مختلفة."),
  makeItem("movie-5", "Frankenstein's Bride", 5.0, 2026, "رعب", "إعادة تخيل حديثة لعالم الرعب الكلاسيكي."),
  makeItem("movie-6", "Do Not Enter", 5.0, 2026, "إثارة", "تحذير بسيط يقود إلى كابوس أكبر."),
  makeItem("movie-7", "Demon Squad: Tooth and Claw", 6.0, 2026, "رعب", "فريق يطارد شرًا يزداد خطورة."),
  makeItem("movie-8", "SUBEDAAR", 6.0, 2026, "أكشن", "حكاية صراع وقوة في قالب أكشن سريع."),
  makeItem("movie-9", "Made in Korea", 9.0, 2026, "دراما", "دراما معاصرة بنَفَس إنتاجي قوي."),
  makeItem("movie-10", "Jockey", 5.0, 2026, "دراما", "قصة شخصية عن فرصة أخيرة وإثبات الذات."),
  makeItem("movie-11", "Lockdown", 6.0, 2026, "دراما", "اختبار نفسي في ظروف استثنائية."),
  makeItem("movie-12", "Yogida", 7.0, 2026, "أكشن", "مطاردة عالية الوتيرة وتحولات مفاجئة."),
  makeItem("movie-13", "Crime 101", 6.0, 2026, "جريمة", "لعبة قط وفأر بين محققين وعصابة."),
  makeItem("movie-14", "To Make It Back Home", 6.0, 2026, "دراما", "رحلة نجاة للعودة إلى المنزل مهما كان الثمن."),
  makeItem("movie-15", "The Boy with My Son's Face", 6.0, 2026, "إثارة", "مواجهة غامضة تخلط الحقيقة بالوهم."),
  makeItem("movie-16", "Mexicali", 7.0, 2026, "أكشن", "قصة حدود ومخاطر في عالم الجريمة."),
  makeItem("movie-17", "آلة حرب مدبلج", 7.0, 2026, "أكشن", "نسخة مدبلجة لفيلم قتالي تقني."),
  makeItem("movie-18", "War Machine", 7.0, 2026, "أكشن", "قوة نارية ومهام عسكرية معقدة."),
  makeItem("movie-19", "Agent Zeta", 6.0, 2026, "أكشن", "عميل خاص في مهمة تتجاوز التوقعات."),
  makeItem("movie-20", "Border 2", 7.5, 2026, "أكشن", "عودة ملحمية على الحدود في جزء جديد."),
  makeItem("movie-21", "السلم والثعبان: لعب عيال", 7.6, 2026, "دراما", "ألعاب بسيطة تؤدي إلى صراعات عائلية معقدة."),
  makeItem("movie-22", "أحمد وأحمد", 7.4, 2026, "كوميدي", "قصة طريفة عن شخصيتين بنفس الاسم."),
  makeItem("movie-23", "Scream 7", 7.3, 2026, "رعب", "جزء جديد من سلسلة الرعب الشهيرة يعيد الإثارة."),
  makeItem("movie-24", "The Matrix Resurrections", 6.8, 2025, "خيال علمي", "عودة إلى عالم المصفوفة بنظرة جديدة."),
  makeItem("movie-25", "Dune: Part Two", 8.5, 2024, "خيال علمي", "تطور الصراع على كوكب أراكيس في الجزء الثاني."),
  makeItem("movie-26", "Oppenheimer", 8.8, 2023, "دراما", "قصة العالم الذي غيّر مسار التاريخ."),
  makeItem("movie-27", "Barbie", 7.2, 2023, "كوميديا", "مغامرة ملونة وفكاهية في عالم باربي."),
  makeItem("movie-28", "Killers of the Flower Moon", 8.1, 2023, "دراما", "قصة غامضة عن جريمة تاريخية."),
  makeItem("movie-29", "Mission: Impossible - Dead Reckoning", 7.8, 2023, "أكشن", "مهمة خطرة في عالم التجسس الحديث."),
  makeItem("movie-30", "Aquaman and the Lost Kingdom", 7.0, 2023, "أكشن", "محارب البحار في مغامرة جديدة مظلمة."),
];

export const mockSeries: Content[] = [
  makeItem("series-1", "المداح ج6: أسطورة النهاية", 8.0, 2026, "دراما", "يعود صابر المداح في مواجهة جديدة مع قوى شريرة."),
  makeItem("series-2", "The Last Thing He Told Me الموسم الثاني", 6.0, 2026, "إثارة", "موسم جديد يكشف طبقات أعمق من الغموض."),
  makeItem("series-3", "The Hunt", 9.0, 2026, "غموض", "مطاردة نفسية مليئة بالمفاجآت."),
  makeItem("series-4", "Invincible الموسم الرابع", 6.0, 2026, "أكشن", "استمرار عالم الأبطال بقصص أكثر قتامة."),
  makeItem("series-5", "Imperfect Women", 7.0, 2026, "جريمة", "حياة ثلاث نساء تتقاطع مع لغز خطير."),
  makeItem("series-6", "يا أنا يا هي ج2", 7.0, 2026, "كوميدي", "مواقف كوميدية متسارعة في موسم ثانٍ."),
  makeItem("series-7", "شكون كان يقول", 7.0, 2026, "دراما", "دراما اجتماعية بنكهة رمضانية."),
  makeItem("series-8", "رحمة 2", 6.0, 2026, "دراما", "موسم جديد يكمل رحلة الشخصيات."),
  makeItem("series-9", "قبل وبعد", 7.0, 2026, "كوميدي", "مفارقات حياتية قبل القرارات وبعدها."),
  makeItem("series-10", "ليلي طويل", 7.0, 2026, "دراما", "ليلة واحدة تغيّر مصير الجميع."),
  makeItem("series-11", "دروب المرجلة ج3", 6.0, 2026, "دراما", "استكمال لصراعات الجزء السابق."),
  makeItem("series-12", "وطن ع وتر", 6.0, 2026, "كوميدي", "اسكتشات ساخرة من الواقع اليومي."),
  makeItem("series-13", "قبان موسى", 6.5, 2026, "كوميدي", "مغامرات كوميدية بإيقاع خفيف."),
  makeItem("series-14", "علي كلاي", 7.8, 2026, "دراما", "رحلة بطل يبحث عن ذاته."),
  makeItem("series-15", "الكينج", 7.4, 2026, "دراما", "صراع نفوذ في عالم معقّد."),
  makeItem("series-16", "Breaking Bad", 9.5, 2024, "درامي", "قصة علم الكيمياء الجنائية الأيقونية."),
  makeItem("series-17", "Stranger Things الموسم الرابع", 8.7, 2024, "خيال", "عودة إلى أبعاد غامضة مظلمة."),
  makeItem("series-18", "The Crown الموسم الخامس", 8.5, 2023, "دراما", "سنوات حرجة من تاريخ الملكية."),
  makeItem("series-19", "Westworld الموسم الثاني", 8.3, 2024, "خيال علمي", "ثورة الآليين في عالم الغرب المشعوذ."),
  makeItem("series-20", "The Mandalorian الموسم الثالث", 8.6, 2023, "أكشن", "الرجل الآلي ينقذ المجرة من جديد."),
  makeItem("series-21", "Andor الموسم الثاني", 8.9, 2024, "إثارة", "تطورات جديدة في مسلسل الحرب النجمية."),
  makeItem("series-22", "The Rings of Power الموسم الثاني", 8.0, 2024, "خيال", "تاريخ العالم الأوسط في حقب جديدة."),
  makeItem("series-23", "Severance الموسم الأول", 8.4, 2023, "خيال علمي", "مكان عمل حيث تُنسى الذاكريات."),
  makeItem("series-24", "Chernobyl", 9.3, 2024, "دراما", "كارثة نووية تهز التاريخ."),
  makeItem("series-25", "The Office الموسم الثالث", 9.0, 2024, "كوميدي", "أروع ساعات الفكاهة والدراما."),
  makeItem("series-26", "Narcos", 8.8, 2023, "جريمة", "قصة الملك والسقوط في عالم المخدرات."),
  makeItem("series-27", "Game of Thrones الموسم الثاني", 9.2, 2023, "خيال", "حروب العروش تتطور بحدة."),
  makeItem("series-28", "True Detective الموسم الأول", 9.0, 2023, "جريمة", "تحقيق عميق في جرائم مظلمة."),
  makeItem("series-29", "The Sopranos", 9.2, 2023, "جريمة", "كلاسيكي المسلسلات الدرامية."),
  makeItem("series-30", "Chernobyl: The Lost Tapes", 8.6, 2024, "وثائقي", "حقائق مكبوتة عن الكارثة النووية."),
];

export const mockMiscellaneous: Content[] = [
  makeItem("show-1", "رامز ليفل الوحش", 7.0, 2026, "ترفيهي", "برنامج مقالب وتحديات مستوحى من ألعاب خطيرة."),
  makeItem("show-2", "WWE Friday Night SmackDown 2026 0320 مترجم", 5.0, 2026, "مصارعة", "حلقة حديثة مترجمة من عروض المصارعة."),
  makeItem("show-3", "جو شو في رمضان", 7.0, 2026, "Talk Show", "برنامج حواري ساخر بمحتوى رمضاني."),
  makeItem("show-4", "الملياردير الموسم الثالث", 7.0, 2026, "مسابقات", "تحديات وربح ضمن موسم جديد."),
  makeItem("show-5", "قلبي اطمأن 2026", 7.0, 2026, "ديني", "محتوى إنساني وخيري ملهم."),
  makeItem("show-6", "واحد في النص", 6.0, 2026, "كوميدي", "عرض ترفيهي خفيف بنكهة اجتماعية."),
  makeItem("show-7", "The Tonight Show Starring Jimmy Fallon", 7.8, 2026, "Talk Show", "برنامج حواري أمريكي شهير مع نكات يومية."),
  makeItem("show-8", "Ellen", 7.5, 2024, "Talk Show", "حوارات ومقالب طريفة مع نجوم هوليوود."),
  makeItem("show-9", "The Voice الموسم الثاني", 8.1, 2026, "موسيقي", "تنافس صوتي شرس بين المواهب الأفضل."),
  makeItem("show-10", "America's Got Talent", 7.9, 2026, "مسابقات", "منصة لعرض المواهب المتنوعة المذهلة."),
  makeItem("show-11", "The Masked Singer الموسم الرابع", 7.6, 2024, "music", "تحديات موسيقية بأقنعة غامضة جذابة."),
  makeItem("show-12", "MasterChef العربية الموسم الخامس", 8.2, 2026, "طهي", "طهاة يتنافسون لإعداد أفضل الأطباق."),
  makeItem("show-13", "Top Chef الموسم الثاني", 8.0, 2025, "طهي", "مسابقة الطهي الأمريكية الشهيرة."),
  makeItem("show-14", "The Great British Bake Off", 8.3, 2024, "طهي", "منافسة خبز ودية في الريف البريطاني."),
  makeItem("show-15", "Survivor الموسم الأول", 7.7, 2023, "ريالتي", "بقاء في جزيرة نائية مليئة بالتحديات."),
  makeItem("show-16", "The Amazing Race الموسم الثالث", 8.1, 2025, "ريالتي", "سباق حول العالم مليء بالإثارة."),
  makeItem("show-17", "Love Island الموسم الثاني", 7.4, 2025, "ريالتي", "شباب في فيلا يبحثون عن الحب."),
  makeItem("show-18", "The Bachelor", 7.2, 2026, "ريالتي", "رجل واحد وعشرات النساء المهتمات."),
  makeItem("show-19", "The Real Housewives of Beverly Hills", 7.0, 2025, "ريالتي", "حياة النجمات في مدينة الملايين."),
  makeItem("show-20", "Keeping Up with the Kardashians", 6.8, 2024, "ريالتي", "عائلة كارداشيان تشارك حياتها."),
  makeItem("show-21", "Shark Tank الموسم الثاني", 8.4, 2026, "أعمال", "رواد أعمال يعرضون مشاريعهم على investment."),
  makeItem("show-22", "Dragons' Den", 8.2, 2025, "أعمال", "نسخة بريطانية من برنامج investor."),
  makeItem("show-23", "The Apprentice", 7.6, 2024, "أعمال", "تنافس على منصب إداري حديدي."),
  makeItem("show-24", "Undercover Boss", 7.8, 2025, "ريالتي", "رئيس يعمل موظفا عاديا تحت cover."),
  makeItem("show-25", "Kitchen Nightmares", 7.9, 2024, "طهي", "طاهٍ شهير ينقذ مطاعم يائسة."),
  makeItem("show-26", "Hell's Kitchen الموسم الثالث", 8.1, 2026, "طهي", "مطبخ جحيم حيث ينافس الطهاة."),
  makeItem("show-27", "Restaurant Impossible", 7.5, 2024, "طهي", "تحويل المطاعم الفاشلة بسرعة."),
  makeItem("show-28", "Museum Secrets الموسم الأول", 7.7, 2025, "وثائقي", "أسرار المتاحف العالمية الشهيرة."),
  makeItem("show-29", "Cosmos الموسم الثاني", 8.7, 2024, "وثائقي", "كون مليء بالعجائب والاستكشاف."),
  makeItem("show-30", "Planet Earth الموسم الثالث", 9.1, 2025, "وثائقي", "جمال الطبيعة في أروع صوره."),
];

export const mockFeatured: Content[] = [
  makeItem("featured-1", "Border 2", 7.5, 2026, "أكشن", "فيلم مميز ضمن واجهة الصفحة الرئيسية."),
  makeItem("featured-2", "السلم والثعبان: لعب عيال", 7.6, 2026, "دراما", "عنوان بارز ضمن قائمة المميزة."),
  makeItem("featured-3", "أحمد وأحمد", 7.4, 2026, "كوميدي", "فيلم عربي جديد ضمن الترشيحات."),
  makeItem("featured-4", "علي كلاي", 7.8, 2026, "دراما", "مسلسل عربي مميز في الواجهة."),
  makeItem("featured-5", "الكينج", 7.4, 2026, "دراما", "عنوان ترند ضمن القائمة الرئيسية."),
  makeItem("featured-6", "Scream 7", 7.3, 2026, "رعب", "جزء جديد من سلسلة الرعب الشهيرة."),
  makeItem("featured-7", "المداح ج6: أسطورة النهاية", 8.0, 2026, "دراما", "واحد من أقوى أعمال المسلسلات حاليًا."),
  makeItem("featured-8", "ون بيس الموسم 2 مدبلج", 8.1, 2026, "أنمي", "نسخة مدبلجة مطلوبة بقوة."),
  makeItem("featured-9", "ONE PIECE الموسم الثاني", 8.2, 2026, "أنمي", "موسم جديد لمحبي الأنمي."),
  makeItem("featured-10", "سوا سوا", 7.1, 2026, "دراما", "مسلسل اجتماعي ضمن العناوين البارزة."),
  makeItem("featured-11", "قسمة العدل", 7.2, 2026, "دراما", "قصة قانونية مشوّقة."),
  makeItem("featured-12", "لعبة وقلبت بجد", 7.0, 2026, "كوميدي", "مواقف غير متوقعة في إطار خفيف."),
  makeItem("featured-13", "بيت بابا", 7.1, 2026, "دراما", "حكاية عائلية مع تطورات متتالية."),
  makeItem("featured-14", "بطل العالم", 7.2, 2026, "دراما", "قصة صعود وإصرار."),
  makeItem("featured-15", "The Hunt", 9.0, 2026, "غموض", "مطاردة نفسية مليئة بالمفاجآت والتوتر."),
  makeItem("featured-16", "Made in Korea", 9.0, 2026, "دراما", "أعمال عربية وعالمية متميزة ومؤثرة."),
  makeItem("featured-17", "Dune: Part Two", 8.5, 2024, "خيال علمي", "ملحمة سينمائية في رمال الكوكب الأحمر."),
  makeItem("featured-18", "Oppenheimer", 8.8, 2023, "دراما", "قصة صانع القنبلة الذرية."),
  makeItem("featured-19", "Breaking Bad", 9.5, 2024, "درامي", "أيقونة المسلسلات الدرامية بامتياز."),
  makeItem("featured-20", "Stranger Things الموسم الرابع", 8.7, 2024, "خيال", "العودة إلى أبعاد الغموض والهرب."),
];


export const getTopContent = (content: Content[], limit: number = 10): Content[] => {
  return content.slice(0, limit);
};

export const searchContent = (content: Content[], query: string): Content[] => {
  const lowercaseQuery = query.toLowerCase();
  return content.filter((item) =>
    item.title.toLowerCase().includes(lowercaseQuery) ||
    item.description.toLowerCase().includes(lowercaseQuery)
  );
};
