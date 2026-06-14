export type Intent = {
  food?: string | null;
  meal?: string | null;
  mood?: string | null;
  occasion?: string | null;
  budget?: string | null;
  time?: string | null;
};

const foodKeywords: Record<string, string[]> = {
  shawarma: ['shawarma'],
  biryani: ['biryani'],
  pizza: ['pizza'],
  burger: ['burger'],
  coffee: ['coffee', 'cafe', 'latte', 'espresso'],
  sushi: ['sushi'],
};

const mealKeywords: Record<string, string[]> = {
  breakfast: ['breakfast', 'morning'],
  brunch: ['brunch'],
  lunch: ['lunch', 'afternoon'],
  dinner: ['dinner', 'supper'],
  snack: ['snack'],
};

const moodKeywords: Record<string, string[]> = {
  'work-friendly': ['work', 'study', 'laptop', 'remote'],
  'romantic': ['romantic', 'cozy', 'date'],
};

const occasionKeywords: Record<string, string[]> = {
  family: ['family', 'family-friendly', 'kids', 'kids-friendly'],
  birthday: ['birthday', 'celebration'],
  anniversary: ['anniversary'],
};

const budgetKeywords: Record<string, string[]> = {
  budget: ['budget', 'cheap', 'affordable', 'inexpensive', 'dhaba', 'canteen'],
  premium: ['expensive', 'fine dining', 'fine-dining', 'upscale', 'premium'],
};

const timeKeywords: Record<string, string[]> = {
  'late-night': ['late night', 'late-night', 'late', 'night', 'tonight', 'after hours'],
  morning: ['morning', 'a.m', 'am'],
  evening: ['evening', 'pm', 'p.m'],
};

function findKeyword(map: Record<string, string[]>, text: string): string | null {
  for (const key of Object.keys(map)) {
    for (const kw of map[key]) {
      if (text.includes(kw)) return key;
    }
  }
  return null;
}

export function parseIntent(query: string): Intent {
  const q = (query || '').toLowerCase();
  if (!q) return {};

  const intent: Intent = {};

  // Food
  const food = findKeyword(foodKeywords, q);
  if (food) intent.food = food;

  // Meal
  const meal = findKeyword(mealKeywords, q);
  if (meal) intent.meal = meal;

  // Mood
  const mood = findKeyword(moodKeywords, q);
  if (mood) intent.mood = mood;

  // Occasion
  const occasion = findKeyword(occasionKeywords, q);
  if (occasion) intent.occasion = occasion;

  // Budget
  const budget = findKeyword(budgetKeywords, q);
  if (budget) intent.budget = budget;

  // Time
  const time = findKeyword(timeKeywords, q);
  if (time) intent.time = time;

  return intent;
}

export default parseIntent;
