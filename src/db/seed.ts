import { db } from "./index";
import { roasts } from "./schema";
import { VERDICT_ENUMS, type Verdict } from "./constants";
import { faker } from "@faker-js/faker";

const SAMPLES = 50;

const LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "rust",
  "go",
  "java",
  "csharp",
  "php",
];

const CODE_SNIPPETS = [
  `function sum(a, b) {\n  return a + b;\n}`,
  `const isTrue = (val) => {\n  if (val === true) return true;\n  else if (val === false) return false;\n  return null;\n};`,
  `for (let i = 0; i < 10; i++) {\n  setTimeout(() => console.log(i), 1000);\n}`,
  `try {\n  doSomething();\n} catch (e) {\n  // ignore\n}`,
  `let x = 1;\nx = x + 1;\nx = x - 1;\nconsole.log(x);`,
];

async function seed() {
  console.log("🌱 Starting database seeding...");

  try {
    const dataToInsert = Array.from({ length: SAMPLES }).map(() => {
      const isRoastMode = faker.datatype.boolean();
      const codeSnippet = faker.helpers.arrayElement(CODE_SNIPPETS);
      const language = faker.helpers.arrayElement(LANGUAGES);

      // Calculate fake score (0.0 to 10.0)
      const scoreString = faker.number.float({ min: 0, max: 10, fractionDigits: 1 }).toFixed(1);
      const score = scoreString;

      // Determine verdict based roughly on score for realism
      const numScore = parseFloat(score);
      let verdict: Verdict;

      if (numScore > 8) {
        verdict = VERDICT_ENUMS.CODE_GOD;
      } else if (numScore > 5) {
        verdict = VERDICT_ENUMS.ACTUALLY_DECENT;
      } else if (numScore > 3) {
        verdict = VERDICT_ENUMS.MIGHT_SURVIVE;
      } else {
        verdict = VERDICT_ENUMS.NEEDS_SERIOUS_HELP;
      }

      return {
        codeSnippet,
        language,
        linesCount: codeSnippet.split("\n").length,
        isRoastMode,
        score,
        verdict,
        roastSummary: isRoastMode
          ? faker.hacker.phrase() + " " + faker.company.catchPhrase() // Extra sarcastic
          : faker.lorem.sentences(2),
        // Spread created_at across the last 30 days
        createdAt: faker.date.recent({ days: 30 }),
      };
    });

    console.log(`Inserting ${SAMPLES} fake roasts...`);

    // Execute manual insert
    await db.insert(roasts).values(dataToInsert);

    console.log("✅ Seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seed();
