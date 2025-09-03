import { supabase } from '@/lib/supabaseClient'

export type TableName = 'transactions' | 'goals' | 'emotions'

export async function getUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id ?? null
}

export async function selectAll<T>(table: TableName, userId: string): Promise<T[]> {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('user_id', userId)

  if (error) throw error
  return (data as T[]) || []
}

export async function insertOne<T extends { user_id?: string }>(table: TableName, record: T & Record<string, any>) {
  const { data, error } = await supabase
    .from(table)
    .insert(record)
    .select()

  if (error) throw error
  return (data as any[])[0]
}

export async function updateById<T>(table: TableName, id: number, patch: Partial<T>) {
  const { data, error } = await supabase
    .from(table)
    .update(patch as any)
    .eq('id', id)
    .select()

  if (error) throw error
  return (data as any[])[0]
}

export async function deleteById(table: TableName, id: number) {
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', id)

  if (error) throw error
}

