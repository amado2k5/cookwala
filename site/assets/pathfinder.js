/* "I am a… and I want to…" routes to a page and a first action. Works without JS as a plain list (noscript). */
(function () {
  var AR = document.documentElement.lang === 'ar'; var P = AR ? '/ar' : '';
  var WHO = AR ? [
    ['developers', 'مطوّرًا أو باني وكلاء ذكاء اصطناعي'], ['device-makers', 'صانع أجهزة: أفران، مواقد، روبوتات مطبخ، روبوتات بشرية'], ['companies', 'شركة أو متجرًا أو مطعمًا أو شركة تأمين'], ['providers', 'مزوّدًا: بقالة، مزرعة، توصيل، طاقة، نماذج ذكاء اصطناعي، ناشر وصفات'], ['food', 'مزارعًا أو طباخًا أو شيفًا أو مدرسة طهي'], ['humanitarian', 'منظمة غير حكومية أو بنك طعام أو برنامج تغذية مدرسية أو إغاثة'], ['health', 'أخصائي تغذية أو مسؤول سلامة غذاء أو جهة صحة عامة'], ['education', 'معلّمًا أو أستاذًا أو باحثًا أو طالبًا'], ['government', 'حكومة أو جهة تنظيمية أو مشرّعًا أو هيئة معايير'], ['capital', 'مستثمرًا أو مؤسسة خيرية أو بنك تنمية'], ['thought', 'فيلسوفًا أو أخلاقيًا أو مستقبليًا'], ['everyone', 'شخصًا يهتم بالطعام والهدر والعمل والمناخ']]
    : [
    ['developers', 'a developer or AI-agent builder'], ['device-makers', 'a device maker: ovens, hobs, kitchen robots, humanoids'], ['companies', 'a company, grocer, restaurant or insurer'], ['providers', 'a provider: grocer, farm, delivery, energy, AI vendor, recipe publisher'], ['food', 'a farmer, cook, chef or culinary school'], ['humanitarian', 'an NGO, food bank, school-meal or relief program'], ['health', 'a dietitian, food-safety officer or public-health body'], ['education', 'a teacher, professor, researcher or student'], ['government', 'a government, regulator, legislator or standards body'], ['capital', 'an investor, philanthropy or development bank'], ['thought', 'a philosopher, ethicist or futurist'], ['everyone', 'someone who cares about food, waste, jobs and the climate']];
  var WANT = AR ? [
    ['try', 'أجرّبه الآن', 'التجربة المباشرة تعمل في المتصفح بلا تثبيت.', P + '/playground/', 'افتح ساحة التجربة'],
    ['understand', 'أفهم ما هو ولماذا', 'صفحة واحدة تشرح المشكلة والقصة والأهداف الثلاثة بصدق.', P + '/why/', 'لماذا كوكوالا'],
    ['build', 'أبني عليه', 'بداية سريعة في خمس دقائق، حزمة بايثون وسطر أوامر، أنواع TypeScript، خادم MCP، موزّع مرجعي.', P + '/developers/', 'ابدأ البناء'],
    ['rescue', 'أنقذ طعامًا', 'الملف الإنساني يعمل بالرسائل النصية وجداول البيانات بلا بيانات شخصية.', P + '/humanitarian/', 'بنوك الطعام والإغاثة'],
    ['review', 'أراجع قاعدة أو مظروفًا', 'نموذج مراجعة من ساعتين لأخصائيي التغذية ومسؤولي سلامة الغذاء.', '/docs/REVIEW-TEMPLATE/', 'نموذج المراجعة'],
    ['teach', 'أدرّسه أو أبحث فيه', 'حقيبة دروس من خمس حصص وقائمة موضوعات بحث.', P + '/education/', 'التعليم'],
    ['legislate', 'أشير إليه في سياسة أو قانون', 'موجز من صفحتين ونصوص نموذجية.', P + '/policy/', 'السياسات'],
    ['invest', 'أموّله أو أشارك فيه', 'الفرصة والتوقيت ونموذج العمل والمخاطر والحوكمة، بلا وعود مالية.', P + '/investors/', 'المستثمرون والشركاء'],
    ['think', 'أفكر فيه', 'مقالات تطرح المواقف التي اتخذناها في الكود وتدعو إلى الاختلاف.', P + '/ideas/', 'أفكار ومقالات'],
    ['publish', 'أنشر وصفة أو جهازًا أو حزمة', 'أسماء مثبتة الملكية ونسخ دقيقة وبصمات.', P + '/registry/', 'السجل']]
    : [
    ['try', 'try it right now', 'The live dry run works in your browser; nothing to install.', P + '/playground/', 'Open the playground'],
    ['understand', 'understand what it is and why', 'One page on the problem, the story and the three goals, told honestly.', P + '/why/', 'Why Cookwala'],
    ['build', 'build on it', 'A five-minute quickstart, a Python package and CLI, TypeScript types, an MCP server, a reference hub.', P + '/developers/', 'Start building'],
    ['rescue', 'rescue food', 'The Humanitarian Profile works by SMS and spreadsheet, with no personal data.', P + '/humanitarian/', 'Food banks & aid'],
    ['review', 'review a rule or an envelope', 'A two-hour review template for dietitians and food-safety officers.', '/docs/REVIEW-TEMPLATE/', 'Review template'],
    ['teach', 'teach or research it', 'A five-lesson kit and a list of research topics with open problems.', P + '/education/', 'Education'],
    ['legislate', 'reference it in policy or law', 'A two-page brief and model language.', P + '/policy/', 'Policy'],
    ['invest', 'fund or partner', 'Opportunity, timing, business model, risks and governance, with no financial promises.', P + '/investors/', 'Investors and partners'],
    ['think', 'think about it', 'Essays that state the positions taken in code and invite disagreement.', P + '/ideas/', 'Ideas and essays'],
    ['publish', 'publish a recipe, device or pack', 'Proven names, exact versions, hashes.', P + '/registry/', 'Registry']];
  var who = document.getElementById('pfWho'), want = document.getElementById('pfWant'), out = document.getElementById('pfResult'); if (!who || !want || !out) return;
  WHO.forEach(function (w) { var o = document.createElement('option'); o.value = w[0]; o.textContent = w[1]; who.append(o); });
  WANT.forEach(function (w) { var o = document.createElement('option'); o.value = w[0]; o.textContent = w[1]; want.append(o); });
  function render() {
    var w = WANT.filter(function (x) { return x[0] === want.value; })[0]; var g = who.value;
    out.textContent = '';
    var p = document.createElement('p'); p.innerHTML = '<b>' + w[2] + '</b>';
    var links = document.createElement('p'); links.className = 'cta';
    var a = document.createElement('a'); a.className = 'btn primary'; a.href = w[3]; a.textContent = w[4];
    var b = document.createElement('a'); b.className = 'btn'; b.href = P + '/for/' + g + '/'; b.textContent = AR ? 'صفحتك: لماذا يهمّك وماذا تفعل اليوم' : 'Your page: why it matters to you and what to do today';
    links.append(a, b); out.append(p, links);
  }
  who.addEventListener('change', render); want.addEventListener('change', render); render();
})();
