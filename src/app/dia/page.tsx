import { redirect } from "next/navigation"

export default async function Dia({
  searchParams,
}: {
  searchParams: Promise<{ data?: string }>
}) {
  const { data } = await searchParams
  redirect(data && /^\d{4}-\d{2}-\d{2}$/.test(data) ? `/agenda?vista=dia&data=${data}` : "/agenda?vista=dia")
}
