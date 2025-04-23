import { Subject } from '@/lib/db/schema';
import { getSubjectBySlug } from '@/lib/db/models/subject';

interface SubjectDetailPageProps {
  params: { slug: string };
}

export default async function SubjectDetailPage({ params }: SubjectDetailPageProps) {
  const slug = params.slug;
  const subject: Subject | null = await getSubjectBySlug(slug);

  console.log('SubjectDetailPage: subject data:', subject);

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