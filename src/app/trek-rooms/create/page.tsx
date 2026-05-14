'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// ✅ Singleton
const supabase = createClient()

export default function CreateTrekRoomPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [trekDate, setTrekDate] = useState('')
  const [maxMembers, setMaxMembers] = useState('10')
  const [tags, setTags] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit() {
    if (!name.trim()) { setError('Room name is required'); return }
    setLoading(true)
    setError('')

    // ✅ getUser() on mutation — correct and only called once on submit
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) { router.push('/login'); return }

    const { data: group, error: groupError } = await supabase
      .from('groups')
      .insert({
        creator_id: user.id,
        name: name.trim(),
        description: description.trim() || null,
        location: location.trim() || null,
        trek_date: trekDate || null,
        max_members: parseInt(maxMembers) || 10,
        tags: tags.split(',').map((t: string) => t.trim()).filter(Boolean),
        status: 'open',
        is_private: false,
      })
      .select()
      .single()

    if (groupError) { setError(groupError.message); setLoading(false); return }

    // ✅ Both inserts can't be parallel — member needs group.id from above.
    // This sequential order is correct and unavoidable.
    await supabase.from('group_members').insert({
      group_id: group.id,
      user_id: user.id,
      role: 'admin',
    })

    router.push(`/trek-rooms/${group.id}`)
    router.refresh()
  }

  return (
    <div className="max-w-xl mx-auto px-3 py-4">
      <h1 className="text-lg font-semibold mb-4">Create Trek Room</h1>
      <div className="space-y-3">
        <input className="input" placeholder="Room name *" value={name}
          onChange={e => setName(e.target.value)} />
        <textarea className="input min-h-[80px] resize-none" placeholder="Description"
          value={description} onChange={e => setDescription(e.target.value)} />
        <input className="input" placeholder="Location (e.g. Everest Base Camp)"
          value={location} onChange={e => setLocation(e.target.value)} />
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-xs text-earth-500 mb-1 block">Trek Date</label>
            <input type="date" className="input" value={trekDate}
              onChange={e => setTrekDate(e.target.value)} />
          </div>
          <div className="w-28">
            <label className="text-xs text-earth-500 mb-1 block">Max Members</label>
            <input type="number" className="input" min="2" max="50"
              value={maxMembers} onChange={e => setMaxMembers(e.target.value)} />
          </div>
        </div>
        <input className="input" placeholder="Tags, comma separated"
          value={tags} onChange={e => setTags(e.target.value)} />
        {error && (
          <p className="text-red-400 text-xs bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>
        )}
        <button className="btn-primary w-full" onClick={submit}
          disabled={loading || !name.trim()}>
          {loading ? 'Creating…' : 'Create Room'}
        </button>
      </div>
    </div>
  )
}