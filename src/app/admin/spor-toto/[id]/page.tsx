import { getTotoWeekById } from '@/lib/queries/spor-toto';
import { notFound } from 'next/navigation';
import SportTotoForm from '@/components/admin/SportTotoForm';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditTotoWeekPage({ params }: Props) {
  const { id } = await params;

  // "yeni" ise yeni oluştur
  if (id === 'yeni') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Yeni Spor Toto Haftası</h1>
        <SportTotoForm />
      </div>
    );
  }

  const week = await getTotoWeekById(id);
  if (!week) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{week.week_label} - Düzenle</h1>
      <SportTotoForm week={week} />
    </div>
  );
}
