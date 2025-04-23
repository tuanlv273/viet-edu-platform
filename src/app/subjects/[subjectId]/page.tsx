import { Subject } from '@/lib/db/schema';
import { getSubjectBySlug } from '@/lib/db/models/subject';

interface SubjectDetailPageProps {
  params: { subjectId: string };
}

export default async function SubjectDetailPage({ params }: SubjectDetailPageProps) {
  const subjectSlug = params.subjectId;
  const subject: Subject | null = await getSubjectBySlug(subjectSlug);

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