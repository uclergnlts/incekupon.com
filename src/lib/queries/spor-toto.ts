import { createClient } from '@/lib/supabase/server';
import type { SportTotoWeek } from '@/types';
import { predictionIncludes } from '@/lib/spor-toto-prediction';

export async function getCurrentTotoWeek(): Promise<SportTotoWeek | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('spor_toto_weeks')
    .select('*, spor_toto_matches(*)')
    .eq('status', 'pending')
    .order('date', { ascending: false })
    .limit(1)
    .single();

  if (error) return null;
  return data as SportTotoWeek;
}

export async function getTotoWeeks(): Promise<SportTotoWeek[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('spor_toto_weeks')
    .select('*, spor_toto_matches(*)')
    .order('date', { ascending: false });

  if (error) throw error;
  return (data as SportTotoWeek[]) ?? [];
}

export async function getTotoWeekById(id: string): Promise<SportTotoWeek | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('spor_toto_weeks')
    .select('*, spor_toto_matches(*)')
    .eq('id', id)
    .single();

  if (error) return null;
  return data as SportTotoWeek;
}

export interface TotoStats {
  totalWeeks: number;
  completedWeeks: number;
  totalMatches: number;
  correctPredictions: number;
  overallRate: number;
  avgCorrectPerWeek: number;
  bestWeek: { label: string; correct: number } | null;
  weeklyResults: { weekLabel: string; correct: number; total: number; rate: number }[];
}

export async function getTotoStats(): Promise<TotoStats> {
  const weeks = await getTotoWeeks();
  const completedWeeks = weeks.filter(w => w.status === 'completed');

  let totalMatches = 0;
  let correctPredictions = 0;
  let bestWeek: { label: string; correct: number } | null = null;
  const weeklyResults: TotoStats['weeklyResults'] = [];

  for (const week of completedWeeks) {
    const matches = week.spor_toto_matches ?? [];
    const withResult = matches.filter(m => m.actual_result != null);
    const correct = withResult.filter(m => predictionIncludes(m.prediction, m.actual_result)).length;

    totalMatches += withResult.length;
    correctPredictions += correct;

    if (!bestWeek || correct > bestWeek.correct) {
      bestWeek = { label: week.week_label, correct };
    }

    weeklyResults.push({
      weekLabel: week.week_label,
      correct,
      total: withResult.length,
      rate: withResult.length > 0 ? Math.round((correct / withResult.length) * 100) : 0,
    });
  }

  const overallRate = totalMatches > 0 ? Math.round((correctPredictions / totalMatches) * 100) : 0;
  const avgCorrectPerWeek = completedWeeks.length > 0
    ? Math.round((correctPredictions / completedWeeks.length) * 10) / 10
    : 0;

  return {
    totalWeeks: weeks.length,
    completedWeeks: completedWeeks.length,
    totalMatches,
    correctPredictions,
    overallRate,
    avgCorrectPerWeek,
    bestWeek,
    weeklyResults,
  };
}
