tsx
import { Subject } from '@/lib/db/schema';
import { getSubjectById } from '@/lib/db/models/subject';

interface SubjectDetailPageProps {
  params: { subjectId: string };
}

export default async function SubjectDetailPage({ params }: SubjectDetailPageProps) {
  const subjectId = parseInt(params.subjectId);
  if (isNaN(subjectId)) {
    return <div>Invalid subject ID</div>;
  }
  const subject: Subject | null = await getSubjectById(subjectId);

  if (!subject) {
    return <div>Subject not found</div>;
  }

  return (
    <div>
      <h1>{subject.name}</h1>
      <p>{subject.description}</p>
      {/* Add more subject details here */}
    </div>
  );
}