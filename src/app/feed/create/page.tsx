'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// ✅ Client singleton — not inside component
const supabase = createClient()

export default function CreatePostPage() {
  const router = useRouter()
  const [type, setType] = useState('text')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [location, setLocation] = useState('')
  const [tags, setTags] = useState('')
  const [dataSections, setDataSections] = useState([{ label: '', value: '' }])
  const [pollOptions, setPollOptions] = useState(['', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (!title.trim()) { setError('Title is required'); return }
    setLoading(true)
    setError('')

    // ✅ getUser() is correct here — this is a mutation (insert), we want
    // verified identity before writing to DB. Only called once on submit,
    // not on every render, so the network cost is acceptable.
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) { router.push('/login'); return }

    const tagsArr = tags.split(',').map((t: string) => t.trim()).filter(Boolean)

    const insertData: any = {
      author_id: user.id,
      title: title.trim(),
      body: body.trim() || null,
      post_type: type,
      location: location.trim() || null,
      tags: tagsArr,
      data_sections: type === 'data'
        ? dataSections.filter(d => d.label && d.value)
        : [],
      poll_options: type === 'poll'
        ? pollOptions.filter(Boolean).map((o: string, i: number) => ({ id: i, text: o, votes: 0 }))
        : [],
    }

    const { error: insertError } = await supabase.from('posts').insert(insertData)

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push('/feed')
    router.refresh()
  }

  return (
    <div className="max-w-xl mx-auto px-3 py-4">
      <h1 className="text-lg font-semibold mb-4">Create Post</h1>

      <div className="flex gap-2 mb-4">
        {['text', 'poll', 'data'].map(t => (
          <button key={t} onClick={() => setType(t)}
            className={`text-sm px-3 py-1.5 rounded-lg capitalize transition-colors ${type === t ? 'bg-brand-600 text-white' : 'bg-earth-800 text-earth-400'}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <input className="input" placeholder="Title *" value={title}
          onChange={e => setTitle(e.target.value)} />
        <textarea className="input min-h-[80px] resize-none" placeholder="Body (optional)"
          value={body} onChange={e => setBody(e.target.value)} />
        <input className="input" placeholder="Location (e.g. Annapurna Circuit)"
          value={location} onChange={e => setLocation(e.target.value)} />
        <input className="input" placeholder="Tags, comma separated (e.g. hiking, gear)"
          value={tags} onChange={e => setTags(e.target.value)} />

        {type === 'data' && (
          <div className="space-y-2">
            <p className="text-xs text-earth-500 font-medium uppercase tracking-wide">Data Fields</p>
            {dataSections.map((ds, i) => (
              <div key={i} className="flex gap-2">
                <input className="input" placeholder="Label (e.g. Price)" value={ds.label}
                  onChange={e => setDataSections(prev => prev.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} />
                <input className="input" placeholder="Value (e.g. NPR 500)" value={ds.value}
                  onChange={e => setDataSections(prev => prev.map((x, j) => j === i ? { ...x, value: e.target.value } : x))} />
                {i > 0 && (
                  <button onClick={() => setDataSections(prev => prev.filter((_, j) => j !== i))}
                    className="text-earth-500 hover:text-earth-200 flex-shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button onClick={() => setDataSections(prev => [...prev, { label: '', value: '' }])}
              className="btn-ghost flex items-center gap-1 text-xs">
              <Plus className="w-3 h-3" /> Add field
            </button>
          </div>
        )}

        {type === 'poll' && (
          <div className="space-y-2">
            <p className="text-xs text-earth-500 font-medium uppercase tracking-wide">Poll Options</p>
            {pollOptions.map((opt, i) => (
              <div key={i} className="flex gap-2">
                <input className="input" placeholder={`Option ${i + 1}`} value={opt}
                  onChange={e => setPollOptions(prev => prev.map((x, j) => j === i ? e.target.value : x))} />
                {i > 1 && (
                  <button onClick={() => setPollOptions(prev => prev.filter((_, j) => j !== i))}
                    className="text-earth-500 hover:text-earth-200 flex-shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button onClick={() => setPollOptions(prev => [...prev, ''])}
              className="btn-ghost flex items-center gap-1 text-xs">
              <Plus className="w-3 h-3" /> Add option
            </button>
          </div>
        )}

        {error && (
          <p className="text-red-400 text-xs bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>
        )}

        <button className="btn-primary w-full" onClick={handleSubmit}
          disabled={loading || !title.trim()}>
          {loading ? 'Posting…' : 'Post'}
        </button>
      </div>
    </div>
  )
}