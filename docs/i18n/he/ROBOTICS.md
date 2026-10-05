<!-- machine-translated: gemma4:26b 2026-10-04; English is the reference: docs/ROBOTICS.md -->
# Cookwala ומחסנית הרובוטיקה

Cookwala אינו מחליף שום חלק ברובוט. הוא מוסיף את השכבה שחסרה ל-robotics stack לצורך בישול: **מה להכין, מתי כל שלב מסתיים, ומה לעולם לא חייב לקרות**, בצורה שכל רובוט, מכשיר, סימולטור או learning pipeline יכולים לקרוא ולבדוק.

## איפה זה מתאים

| שכבה | דוגמאות לשכבה (2026; לא קיימת אינטגרציה עם אף אחת מהן) | מה Cookwala מוסיפה |
|---|---|---|
| רובוטים ומכשירי חשמל | Figure 03, 1X NEO, Unitree G1/H2, Pollen Reachy, רובוטים למטבח (Moley, Miso, Chef Robotics), תנורים חכמים | מתכון בלתי-תלוי מכשיר שהיא יכולה לבצע dry run, לסרב או לבשל; מגבלות בטיחות על גבי המכשיר |
| Middleware | ROS 2, ros-controls, Open-RMF (fleets), Matter (appliances) | פעולות ROS 2 עבור מתכונים ושלבים (`bindings/ros2`); טיוטה של מיפוי Matter op (`bindings/matter.json`, לא מאומת); משימת Open-RMF היא תרומה מתוכננת |
| למידת רובוטים | LeRobot (Hugging Face), NVIDIA Isaac GR00T, Physical Intelligence π models, Figure Helix | משימות שלבים בשפה טבעית ומקטעי שלבים עבור מאגרי נתונים; קריטריוני "בוצע" כיעדי הערכה |
| סימולציה | NVIDIA Isaac Sim / Isaac Lab, Gazebo, MuJoCo | operation envelope ווקטורי conformance כתנאי בדיקה |
| סוכני AI | MCP, A2A, Claude, OpenAI ודגמים פתוחים | AgentMandate, חוק untrusted-text, מדד בטיחות סוכן-מטבח |

Cookwala נמצא במכוון **מעל תנועה**. רובוטים מודרניים לומדים מניפולציה מקצה לקצה;
Cookwala נותן להם את המשימה, את מבחן ההצלחה ואת מעטפת הבטיחות, ומקבל בחזרה
execution log.

## ROS 2

`bindings/ros2/` מגדיר שתי פעולות:

| פעולה | מטרה | משוב | תוצאה |
|---|---|---|---|
| `ExecuteRecipe` | `ExecuteRequest` (recipe ref, hash, servings, idempotency key) | `ExecutionStatus` (seq, state, node, progress, sensor-ladder rung, medium temperature) | מצב סופי, סיבת refusal before heat, `ExecutionLog` |
| `ExecuteNode` | צומת מתכון אחד, ה-operation envelope שלו, יעד צר יותר אופציונלי | התקדמות, medium temperature, יעד הושג | Envelope OK, rung שבוצע, סיכום שלב, סטייה |

**ביטול** של יעד `ExecuteRecipe` הוא `StopRequest`: השרת חייב לעצור בבטחה.
**מגבלות בטיחות** נשארות בתוך המכשיר; אף שדה יעד אינו יכול לשנות אותן. hub שמפצל מתכון על פני מספר רובוטים שולח יעדי `ExecuteNode`, ויכול להעביר שליטה ברמת צי (fleet-level dispatch) ל-**Open-RMF** כמשימות.

## LeRobot ומאגרי נתונים של למידת רובוטים

הלופ של LeRobot הוא teleoperate → record → train → deploy, ו-LeRobotDataset v2.1 שלו שומר
משימות בשפה טבעית ב-`meta/tasks.jsonl` (v3 העביר את ה-metadata ל-parquet; ה-exporter כותב את
הקובץ בסגנון v2.1 היום ו-v3 writer הוא next). מתכונים של Cookwala כבר מכילים משפט אחד
לכל שלב, ו-execution logs מתעדים מתי כל שלב התחיל ונגמר.

```bash
python tools/execlog_export.py lerobot recipe.cookwala.json execution-log.json my-dataset/
```

זה כותב:
- `meta/tasks.jsonl`, משימה אחת לכל שלב במתכון;
- `meta/cookwala/<log>.json` עם ה-hash של המתכון, מקטעי שלבים (שניות התחלה וסיום,
  sensor-ladder rung, envelope result) והסכמת ה-household.

וידאו ופעולות מגיעים מהמקליט של הרובוט עצמו. הייצוא מסרב ללוגים ללא
conformance של ה-dataset.

## סימולציה

וקטורי ה-conformance ב-`conformance/envelope.json` (עקבות טמפרטורה עם תוצאות צפויות) וחוקי ה-sensor-ladder מוכנים לסימולטור. סימולציה תרמית או פיזיקלית של מחבת, סיר או תנור יכולה להימדד מול אותם envelopes שמכשיר אמיתי חייב לשמור עליהם. Isaac Lab, Gazebo ו-MuJoCo הם מועמדים למבחן ביצועים (benchmark) ציבורי של "cook in simulation".

## Observability

```bash
python tools/execlog_export.py otel recipe.cookwala.json execution-log.json trace.json
```

זה כותב OpenTelemetry trace: span אחד לכל שלב, עם attributes מסוג `cookwala.*` (rung,
envelope OK, deviation) ואירועי safety-limit. זה נטען לכל OTLP backend
(Jaeger, Grafana Tempo, LangSmith…), כך שצוותים יכולים לדבג מכשירים כפי שהם דבגים agents.

## dry run: האם המכשיר הזה יכול לבשל את המתכון הזה?

```bash
python tools/cookwala_ref.py dryrun examples/shakshuka.cookwala.json --device examples/capabilities/robot-arm.json --human-present
```

ה-dry run עונה לפני שמשהו מתחמם. הוא מציין אילו שלבים המכשיר מבצע, אילו שלבים אדם מבצע, כיצד כל שלב יאומת (sensor, model, time או person), או את הסיבה הראשונה שבגינה עליו לבצע refusal before heat.

