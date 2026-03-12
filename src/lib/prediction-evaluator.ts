function normalizePrediction(value: string): string {
  return value
    .toLowerCase()
    .replace(/\u0131/g, 'i')
    .replace(/\u015f/g, 's')
    .replace(/\u011f/g, 'g')
    .replace(/\u00fc/g, 'u')
    .replace(/\u00f6/g, 'o')
    .replace(/\u00e7/g, 'c')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/,/g, '.')
    .trim();
}

export function evaluatePrediction(
  prediction: string,
  homeGoals: number,
  awayGoals: number,
): boolean | null {
  const text = normalizePrediction(prediction);
  const compact = text.replace(/\s+/g, '');
  const resultSign = homeGoals > awayGoals ? '1' : homeGoals < awayGoals ? '2' : '0';
  const totalGoals = homeGoals + awayGoals;
  const bothTeamsScored = homeGoals > 0 && awayGoals > 0;

  if (/\b1x\b/.test(text) || compact.includes('1x')) return ['1', '0'].includes(resultSign);
  if (/\bx2\b/.test(text) || compact.includes('x2') || compact.includes('02')) return ['0', '2'].includes(resultSign);
  if (/\b12\b/.test(text) || compact.includes('12')) return ['1', '2'].includes(resultSign);

  const overMatch = text.match(/(\d+(?:\.\d+)?)\s*(ust|over)\b/);
  if (overMatch) return totalGoals > Number(overMatch[1]);

  const underMatch = text.match(/(\d+(?:\.\d+)?)\s*(alt|under)\b/);
  if (underMatch) return totalGoals < Number(underMatch[1]);

  if (/\bkg\s*var\b/.test(text) || /\bbtts\s*yes\b/.test(text) || /\bgg\b/.test(text)) return bothTeamsScored;
  if (/\bkg\s*yok\b/.test(text) || /\bbtts\s*no\b/.test(text) || /\bng\b/.test(text)) return !bothTeamsScored;

  const plain = text.replace(/[^a-z0-9]/g, '');
  if (['1', 'ms1', 'macsonucu1'].includes(plain)) return resultSign === '1';
  if (['2', 'ms2', 'macsonucu2'].includes(plain)) return resultSign === '2';
  if (['0', 'x', 'ms0', 'msx', 'macsonucu0', 'macsonucux'].includes(plain)) return resultSign === '0';

  return null;
}
