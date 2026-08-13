import { redirect } from 'next/navigation';

type PersonPageProps = { params: Promise<{ slug: string }> };

export default async function PersonPage({ params }: PersonPageProps) {
  const { slug } = await params;
  redirect(`/team/${slug}`);
}
