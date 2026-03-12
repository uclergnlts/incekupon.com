'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { normalizePrediction } from '@/lib/spor-toto-prediction';
import type { TotoOutcome, TotoPrediction } from '@/types';

const WEEK_MATCH_COUNT = 15;

interface TotoMatchInput {
  match_number: number;
  home_team: string;
  away_team: string;
  prediction: TotoPrediction;
}

type SporTotoActionResult = { ok: true } | { ok: false; message: string };

function validateWeekMatches(matches: TotoMatchInput[]): SporTotoActionResult {
  if (matches.length !== WEEK_MATCH_COUNT) {
    return { ok: false, message: `Haftalik mac sayisi ${WEEK_MATCH_COUNT} olmali.` };
  }

  const invalidMatch = matches.find(
    item =>
      !item.home_team.trim() ||
      !item.away_team.trim() ||
      !item.prediction.trim() ||
      item.match_number < 1,
  );

  if (invalidMatch) {
    return { ok: false, message: 'Tum maclar icin ev sahibi, deplasman ve tahmin girin.' };
  }

  return { ok: true };
}

function mapSporTotoError(error: unknown): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
  ) {
    const message = (error as { message: string }).message;
    if (message.includes('prediction') || message.includes('spor_toto_matches_prediction_check')) {
      return 'Veritabani guncel degil: supabase-spor-toto-multiselect.sql dosyasini calistirin.';
    }
    return message;
  }

  return 'Beklenmeyen bir hata olustu.';
}

function buildMatchesPayload(
  weekId: string,
  matches: (TotoMatchInput & { actual_result?: TotoOutcome | null })[],
) {
  return matches.map(match => ({
    match_number: match.match_number,
    home_team: match.home_team.trim(),
    away_team: match.away_team.trim(),
    prediction: normalizePrediction(match.prediction),
    actual_result: match.actual_result ?? null,
    week_id: weekId,
  }));
}

export async function createTotoWeek(data: {
  week_label: string;
  date: string;
  matches: TotoMatchInput[];
}): Promise<SporTotoActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, message: 'Oturum bulunamadi. Lutfen tekrar giris yapin.' };

  const validation = validateWeekMatches(data.matches);
  if (!validation.ok) return validation;

  const { data: week, error: weekError } = await supabase
    .from('spor_toto_weeks')
    .insert({
      week_label: data.week_label.trim(),
      date: data.date,
      status: 'pending',
    })
    .select()
    .single();

  if (weekError) {
    return { ok: false, message: mapSporTotoError(weekError) };
  }

  const matchesData = buildMatchesPayload(week.id, data.matches);

  const { error: matchesError } = await supabase.from('spor_toto_matches').insert(matchesData);
  if (matchesError) {
    return { ok: false, message: mapSporTotoError(matchesError) };
  }

  revalidatePath('/spor-toto');
  revalidatePath('/admin/spor-toto');
  return { ok: true };
}

export async function updateTotoWeek(
  weekId: string,
  data: {
    week_label: string;
    date: string;
    matches: (TotoMatchInput & { actual_result?: TotoOutcome | null })[];
  },
): Promise<SporTotoActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, message: 'Oturum bulunamadi. Lutfen tekrar giris yapin.' };

  const validation = validateWeekMatches(data.matches);
  if (!validation.ok) return validation;

  const allResultsIn = data.matches.every(item => item.actual_result != null);

  const { error: weekError } = await supabase
    .from('spor_toto_weeks')
    .update({
      week_label: data.week_label.trim(),
      date: data.date,
      status: allResultsIn ? 'completed' : 'pending',
    })
    .eq('id', weekId);

  if (weekError) {
    return { ok: false, message: mapSporTotoError(weekError) };
  }

  const { error: deleteError } = await supabase.from('spor_toto_matches').delete().eq('week_id', weekId);
  if (deleteError) {
    return { ok: false, message: mapSporTotoError(deleteError) };
  }

  const matchesData = buildMatchesPayload(weekId, data.matches);

  const { error: matchesError } = await supabase.from('spor_toto_matches').insert(matchesData);
  if (matchesError) {
    return { ok: false, message: mapSporTotoError(matchesError) };
  }

  revalidatePath('/spor-toto');
  revalidatePath('/admin/spor-toto');
  revalidatePath(`/admin/spor-toto/${weekId}`);
  return { ok: true };
}

export async function deleteTotoWeek(weekId: string): Promise<SporTotoActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Yetkisiz erisim');

  const { error } = await supabase.from('spor_toto_weeks').delete().eq('id', weekId);
  if (error) return { ok: false, message: mapSporTotoError(error) } as const;

  revalidatePath('/spor-toto');
  revalidatePath('/admin/spor-toto');
  return { ok: true } as const;
}
