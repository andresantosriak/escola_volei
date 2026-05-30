import { supabase } from '@/integrations/supabase/client'

const BUCKET = 'student-photos'
const SIGNED_TTL = 60 * 30 // 30 min (SEC-A3: TTL curto para fotos de menores)

export const storageService = {
  /** Path: {coach_id}/{student_id}.{ext} — isolamento por coach no primeiro segmento (RLS). */
  buildPath(coachId: string, studentId: string, ext: string) {
    return `${coachId}/${studentId}.${ext}`
  },

  async upload(coachId: string, studentId: string, file: File): Promise<string> {
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
    const path = this.buildPath(coachId, studentId, ext)
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: true })
    if (error) throw new Error(error.message)
    return path
  },

  /** Resolve um path do bucket privado para uma signed URL temporária. */
  async getSignedUrl(path: string | null | undefined): Promise<string | null> {
    if (!path) return null
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, SIGNED_TTL)
    if (error) return null
    return data.signedUrl
  },

  async remove(path: string): Promise<void> {
    await supabase.storage.from(BUCKET).remove([path])
  },
}
