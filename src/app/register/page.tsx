'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Mountain, Mail } from 'lucide-react'
import Link from 'next/link'

const supabase = createClient()

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [confirmed, setConfirmed] = useState(false)

  async function signUp() {
    if (!email || !password || !username) {
      setError('Please fill all fields')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    setError('')

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
        // ✅ After clicking confirm in email, user lands on /feed
        emailRedirectTo: `${window.location.origin}/feed`,
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    // ✅ Don't redirect — show "check your email" screen instead
    setConfirmed(true)
    setLoading(false)
  }

  // ✅ "Check your email" screen — shown after successful signup
  if (confirmed) {
    return (
      <div className="max-w-sm mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-semibold">Check your email</h1>
          <p className="text-earth-500 text-sm mt-2">
            We sent a confirmation link to
          </p>
          <p className="text-earth-200 text-sm font-medium mt-1">{email}</p>
        </div>
        <div className="card p-5 text-center space-y-4">
          <p className="text-earth-400 text-sm leading-relaxed">
            Click the link in your email to confirm your account.
            You&apos;ll be automatically signed in and taken to the feed.
          </p>
          <div className="border-t border-earth-700 pt-4">
            <p className="text-xs text-earth-500">
              Wrong email?{' '}
              <button
                className="text-brand-400 hover:underline"
                onClick={() => {
                  setConfirmed(false)
                  setEmail('')
                  setPassword('')
                  setUsername('')
                }}
              >
                Go back
              </button>
            </p>
          </div>
          <p className="text-xs text-earth-500">
            Already confirmed?{' '}
            <Link href="/login" className="text-brand-400 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <Mountain className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-xl font-semibold">Join HidyoNepal</h1>
        <p className="text-earth-500 text-sm mt-1">Create your account</p>
      </div>
      <div className="card p-5 space-y-3">
        <input
          className="input"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <input
          className="input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          className="input"
          type="password"
          placeholder="Password (min 6 chars)"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && signUp()}
        />
        {error && (
          <p className="text-red-400 text-xs bg-red-900/20 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}
        <button
          className="btn-primary w-full"
          onClick={signUp}
          disabled={loading}
        >
          {loading ? 'Creating account…' : 'Create Account'}
        </button>
        <p className="text-center text-xs text-earth-500">
          Have account?{' '}
          <Link href="/login" className="text-brand-400 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}