interface StudentLite {
  _id: string;
  displayName: string;
}

function shuffle<T>(items: T[]): T[] {
  const clone = [...items];
  for (let i = clone.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }
  return clone;
}

function toRuleKey(a: string, b: string): string {
  return [a, b].sort().join(':');
}

export function generateValidPairs(
  students: StudentLite[],
  neverPairRules: Array<{ studentA: string; studentB: string }>,
  maxRetries = 500
): StudentLite[][] | null {
  const blocked = new Set(neverPairRules.map((rule) => toRuleKey(rule.studentA, rule.studentB)));

  for (let attempt = 0; attempt < maxRetries; attempt += 1) {
    const shuffled = shuffle(students);
    const pairs: StudentLite[][] = [];
    let valid = true;

    for (let i = 0; i < shuffled.length; i += 2) {
      const first = shuffled[i];
      const second = shuffled[i + 1];

      if (!first) {
        continue;
      }

      if (!second) {
        pairs.push([first]);
        continue;
      }

      if (blocked.has(toRuleKey(first._id, second._id))) {
        valid = false;
        break;
      }

      pairs.push([first, second]);
    }

    if (valid) {
      return pairs;
    }
  }

  return null;
}

export function generateGroups<T>(items: T[], groupSize: number): T[][] {
  if (groupSize < 2) {
    return [items];
  }

  const shuffled = shuffle(items);
  const groups: T[][] = [];
  for (let i = 0; i < shuffled.length; i += groupSize) {
    groups.push(shuffled.slice(i, i + groupSize));
  }
  return groups;
}
