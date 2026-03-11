'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { normalizePrediction } from '@/lib/spor-toto-prediction';
import type { TotoOutcome, TotoPrediction } from '@/types';

interface TotoMatchInput {
  match_number: number;
  home_team: string;
  away_team: string;
  prediction: TotoPrediction;
}

export async function createTotoWeek(data: {
  week_label: string;
  date: string;
  matches: TotoMatchInput[];
}) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Yetkisiz erişim');

  const { data: week, error: weekError } = await supabase
    .from('spor_toto_weeks')
    .insert({
      week_label: data.week_label,
      date: data.date,
      status: 'pending',
    })
    .select()
    .single();

  if (weekError) throw weekError;

  const matchesData = data.matches.map(m => ({
    ...m,
    prediction: normalizePrediction(m.prediction),
    week_id: week.id,
    actual_result: null,
  }));

  const { error: matchesError } = await supabase
    .from('spor_toto_matches')
    .insert(matchesData);

  if (matchesError) throw matchesError;

  revalidatePath('/spor-toto');
  revalidatePath('/admin/spor-toto');
  redirect('/admin/spor-toto');
}

export async function updateTotoWeek(
  weekId: string,
  data: {
    week_label: string;
    date: string;
    matches: (TotoMatchInput & { actual_result?: TotoOutcome | null })[];
  }
) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Yetkisiz erişim');

  // Tüm sonuçlar girildiyse completed yap
  const allResultsIn = data.matches.every(m => m.actual_result != null);

  const { error: weekError } = await supabase
    .from('spor_toto_weeks')
    .update({
      week_label: data.week_label,
      date: data.date,
      status: allResultsIn ? 'completed' : 'pending',
    })
    .eq('id', weekId);

  if (weekError) throw weekError;

  await supabase.from('spor_toto_matches').delete().eq('week_id', weekId);

  const matchesData = data.matches.map(m => ({
    match_number: m.match_number,
    home_team: m.home_team,
    away_team: m.away_team,
    prediction: normalizePrediction(m.prediction),
    actual_result: m.actual_result ?? null,
    week_id: weekId,
  }));

  const { error: matchesError } = await supabase
    .from('spor_toto_matches')
    .insert(matchesData);

  if (matchesError) throw matchesError;

  revalidatePath('/spor-toto');
  revalidatePath('/admin/spor-toto');
}

export async function deleteTotoWeek(weekId: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Yetkisiz erişim');

  const { error } = await supabase
    .from('spor_toto_weeks')
    .delete()
    .eq('id', weekId);

  if (error) throw error;

  revalidatePath('/spor-toto');
  revalidatePath('/admin/spor-toto');
  redirect('/admin/spor-toto');
}
