import SongDetail from "./SongDetail";

export default async function SongPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SongDetail id={id} />;
}
