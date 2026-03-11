import type { TotoOutcome, TotoPrediction } from '@/types';

const OUTCOME_ORDER: TotoOutcome[] = ['1', '0', '2'];

function isTotoOutcome(value: string): value is TotoOutcome {
  return OUTCOME_ORDER.includes(value as TotoOutcome);
}

export function splitPrediction(prediction: string): TotoOutcome[] {
  const items = prediction
    .split('-')
    .map(item => item.trim())
    .filter(isTotoOutcome);

  return OUTCOME_ORDER.filter(outcome => items.includes(outcome));
}

export function normalizePrediction(input: string | TotoOutcome[]): TotoPrediction {
  const source = Array.isArray(input) ? input : splitPrediction(input);
  const uniqueOrdered = OUTCOME_ORDER.filter(outcome => source.includes(outcome));

  if (uniqueOrdered.length === 0) {
    return '1';
  }

  return uniqueOrdered.join('-') as TotoPrediction;
}

export function predictionIncludes(prediction: string, result: TotoOutcome | null): boolean {
  if (!result) return false;
  return splitPrediction(prediction).includes(result);
}
