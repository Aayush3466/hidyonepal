'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Mountain } from 'lucide-react'
import Link from 'next/link'

// ✅ Singleton — was being recreated on every render
const supabase = createClient()

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function signIn() {
    if (!email || !password) { setError('Please fill all fields'); return }
    setLoading(true)
    setError('')

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
    } else {
      window.location.href = '/feed'
    }
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <Mountain className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-xl font-semibold">Welcome back</h1>
        <p className="text-earth-500 text-sm mt-1">Sign in to HidyoNepal</p>
      </div>
      <div className="card p-5 space-y-3">
        <input className="input" type="email" placeholder="Email" value={email}
          onChange={e => setEmail(e.target.value)} />
        <input className="input" type="password" placeholder="Password" value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && signIn()} />
        {error && (
          <p className="text-red-400 text-xs bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>
        )}
        <button className="btn-primary w-full" onClick={signIn} disabled={loading}>
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
        <p className="text-center text-xs text-earth-500">
          No account?{' '}
          <Link href="/register" className="text-brand-400 hover:underline">Register</Link>
        </p>
      </div>
    </div>
  )
}