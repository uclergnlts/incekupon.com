import type { Metadata } from 'next';
import { formatDate } from '@/lib/utils';
import { predictionIncludes } from '@/lib/spor-toto-prediction';
import { getCurrentTotoWeek, getTotoWeeks } from '@/lib/queries/spor-toto';

export const metadata: Metadata = {
  title: 'Spor Toto - incekupon',
  description: 'Haftalik Spor Toto 13 mac tahminleri.',
};

export default async function SporTotoPage() {
  const [currentWeek, allWeeks] = await Promise.all([
    getCurrentTotoWeek(),
    getTotoWeeks(),
  ]);

  const pastWeeks = allWeeks.filter(week => week.status === 'completed');

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <h1 className="text-2xl font-bold">Spor Toto Tahminleri</h1>

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
  const matches = [...(week.spor_toto_matches ?? [])].sort((a, b) => a.match_number - b.match_number);
  const correctCount = matches.filter(
    match => showResults && match.actual_result != null && predictionIncludes(match.prediction, match.actual_result),
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
            {matches.map(match => {
              const isCorrect = showResults && match.actual_result != null && predictionIncludes(match.prediction, match.actual_result);
              const isWrong = showResults && match.actual_result != null && !predictionIncludes(match.prediction, match.actual_result);

              return (
                <tr key={match.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3 text-muted">{match.match_number}</td>
                  <td className="px-4 py-3 font-medium">
                    {match.home_team} - {match.away_team}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex items-center justify-center min-w-[52px] px-2 h-8 rounded-full text-center font-bold text-sm ${
                        isCorrect
                          ? 'bg-green-100 text-green-800'
                          : isWrong
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-foreground'
                      }`}
                    >
                      {match.prediction}
                    </span>
                  </td>
                  {showResults && (
                    <td className="px-4 py-3 text-center">
                      <span className="inline-block w-8 h-8 leading-8 rounded-full bg-gray-100 text-center font-bold text-sm">
                        {match.actual_result ?? '-'}
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
        <div className="px-4 py-3 bg-gray-50 border-t border-border text-sm">
          <span className="font-medium">Dogru: {correctCount} / {matches.length}</span>
        </div>
      )}
    </div>
  );
}
