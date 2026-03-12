import type { Metadata } from 'next';
import { formatDate } from '@/lib/utils';
import { predictionIncludes } from '@/lib/spor-toto-prediction';
import { getCurrentTotoWeek, getTotoWeeks, getTotoStats } from '@/lib/queries/spor-toto';
import { Target, Award, BarChart3 } from 'lucide-react';

const WEEK_MATCH_COUNT = 15;

export const metadata: Metadata = {
  title: 'Spor Toto Tahminleri - incekupon',
  description: 'Haftalik Spor Toto 15 mac tahminleri, basari oranlari ve gecmis hafta sonuclari.',
  openGraph: {
    title: 'Spor Toto Tahminleri - incekupon',
    description: 'Haftalik Spor Toto 15 mac tahminleri ve performans analizi.',
    type: 'website',
  },
};

export default async function SporTotoPage() {
  const [currentWeek, allWeeks, stats] = await Promise.all([
    getCurrentTotoWeek(),
    getTotoWeeks(),
    getTotoStats(),
  ]);

  const pastWeeks = allWeeks.filter(week => week.status === 'completed');

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <h1 className="text-2xl font-bold">Spor Toto Tahminleri</h1>

      {/* Stats Summary */}
      {stats.completedWeeks > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-4 h-4 text-primary" />
              <p className="text-xs text-muted">Tamamlanan Hafta</p>
            </div>
            <p className="text-2xl font-bold">{stats.completedWeeks}</p>
          </div>
          <div className="bg-white rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-success" />
              <p className="text-xs text-muted">Basari Orani</p>
            </div>
            <p className="text-2xl font-bold text-success">%{stats.overallRate}</p>
          </div>
          <div className="bg-white rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-primary" />
              <p className="text-xs text-muted">Haftalik Ort. Dogru</p>
            </div>
            <p className="text-2xl font-bold text-primary">{stats.avgCorrectPerWeek}</p>
          </div>
          {stats.bestWeek && (
            <div className="bg-white rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-4 h-4 text-yellow-500" />
                <p className="text-xs text-muted">En Iyi Hafta</p>
              </div>
              <p className="text-lg font-bold">{stats.bestWeek.correct}/15</p>
              <p className="text-xs text-muted">{stats.bestWeek.label}</p>
            </div>
          )}
        </div>
      )}

      {/* Performance Chart */}
      {stats.weeklyResults.length > 1 && (
        <div className="bg-white rounded-xl border border-border p-5">
          <h2 className="text-lg font-bold mb-4">Haftalik Performans</h2>
          <div className="flex items-end gap-2 h-40 overflow-x-auto pb-2">
            {stats.weeklyResults.map(week => {
              const barHeight = Math.max((week.correct / WEEK_MATCH_COUNT) * 100, 5);
              return (
                <div key={week.weekLabel} className="flex flex-col items-center gap-1 min-w-[40px]">
                  <span className="text-[11px] font-bold text-muted">{week.correct}</span>
                  <div className="w-8 rounded-t-md bg-gray-100 relative" style={{ height: '100px' }}>
                    <div
                      className={`absolute bottom-0 inset-x-0 rounded-t-md transition-all ${
                        week.correct >= 10 ? 'bg-green-500' : week.correct >= 7 ? 'bg-blue-500' : 'bg-red-400'
                      }`}
                      style={{ height: `${barHeight}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-muted text-center leading-tight whitespace-nowrap">
                    {week.weekLabel.replace('Hafta ', 'H')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {currentWeek ? (
        <section>
          <h2 className="text-lg font-bold mb-4">{currentWeek.week_label}</h2>
          <TotoTable week={currentWeek} />
        </section>
      ) : (
        <div className="text-center py-12 text-muted">
          <p>Bu hafta icin henuz tahmin eklenmedi.</p>
        </div>
      )}

      {pastWeeks.length > 0 && (
        <section>
          <h2 className="text-lg font-bold mb-4">Gecmis Haftalar</h2>
          <div className="space-y-6">
            {pastWeeks.map(week => (
              <div key={week.id}>
                <h3 className="text-sm font-semibold text-muted mb-2">
                  {week.week_label} - {formatDate(week.date)}
                </h3>
                <TotoTable week={week} showResults />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function TotoTable({
  week,
  showResults = false,
}: {
  week: NonNullable<Awaited<ReturnType<typeof getCurrentTotoWeek>>>;
  showResults?: boolean;
}) {
  const existing = [...(week.spor_toto_matches ?? [])].sort((a, b) => a.match_number - b.match_number);
  const byNumber = new Map(existing.map(match => [match.match_number, match]));
  const rows = Array.from({ length: WEEK_MATCH_COUNT }, (_, index) => byNumber.get(index + 1) ?? null);

  const correctCount = rows.filter(
    match => !!match && showResults && match.actual_result != null && predictionIncludes(match.prediction, match.actual_result),
  ).length;

  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-border">
              <th className="text-left px-4 py-3 font-medium text-muted w-8">#</th>
              <th className="text-left px-4 py-3 font-medium text-muted">Mac</th>
              <th className="text-center px-4 py-3 font-medium text-muted w-28">Tahmin</th>
              {showResults && (
                <th className="text-center px-4 py-3 font-medium text-muted w-20">Sonuc</th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((match, index) => {
              const matchNumber = index + 1;
              const isCorrect = !!match && showResults && match.actual_result != null && predictionIncludes(match.prediction, match.actual_result);
              const isWrong = !!match && showResults && match.actual_result != null && !predictionIncludes(match.prediction, match.actual_result);

              return (
                <tr key={match?.id ?? `placeholder-${week.id}-${matchNumber}`} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3 text-muted">{matchNumber}</td>
                  <td className="px-4 py-3 font-medium">
                    {match ? `${match.home_team} - ${match.away_team}` : '-'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex items-center justify-center min-w-[52px] px-2 h-8 rounded-full text-center font-bold text-sm ${
                        !match
                          ? 'bg-gray-50 text-gray-400'
                          :
                        isCorrect
                          ? 'bg-green-100 text-green-800'
                          : isWrong
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-foreground'
                      }`}
                    >
                      {match ? match.prediction : '-'}
                    </span>
                  </td>
                  {showResults && (
                    <td className="px-4 py-3 text-center">
                      <span className="inline-block w-8 h-8 leading-8 rounded-full bg-gray-100 text-center font-bold text-sm">
                        {match?.actual_result ?? '-'}
                      </span>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {showResults && (
        <div className="px-4 py-3 bg-gray-50 border-t border-border text-sm flex items-center justify-between">
          <span className="font-medium">Dogru: {correctCount} / {WEEK_MATCH_COUNT}</span>
          <span className={`text-xs font-bold px-2 py-1 rounded ${
            correctCount >= 10 ? 'bg-green-100 text-green-800' :
            correctCount >= 7 ? 'bg-blue-100 text-blue-800' :
            'bg-red-100 text-red-800'
          }`}>
            %{Math.round((correctCount / WEEK_MATCH_COUNT) * 100)}
          </span>
        </div>
      )}
    </div>
  );
}
