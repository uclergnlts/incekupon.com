import { getTotoWeekById } from '@/lib/queries/spor-toto';
import { notFound } from 'next/navigation';
import SportTotoForm from '@/components/admin/SportTotoForm';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditTotoWeekPage({ params }: Props) {
  const { id } = await params;

  if (id === 'yeni') {
    return (
      <div className="admin-shell max-w-3xl">
        <h1 className="admin-title mb-6">Yeni Spor Toto Haftasi</h1>
        <SportTotoForm />
      </div>
    );
  }

  const week = await getTotoWeekById(id);
  if (!week) notFound();

  return (
    <div className="admin-shell max-w-3xl">
      <h1 className="admin-title mb-6">{week.week_label} - Duzenle</h1>
      <SportTotoForm week={week} />
    </div>
  );
}
