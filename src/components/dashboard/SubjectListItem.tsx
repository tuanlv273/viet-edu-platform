tsx
import Link from 'next/link';
import { Subject } from '@/lib/db/schema';

interface SubjectListItemProps {
  subject: Subject;
  slug: string;
}

export default function SubjectListItem({ subject, slug }: SubjectListItemProps) {
  return (
    <Link href={`/subjects/${slug}`} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <h3 className="text-lg font-semibold">{subject.name}</h3>
      <p className="text-gray-600">{subject.description}</p>
    </Link>
  );
}