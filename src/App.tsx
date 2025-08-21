import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

interface Puzzle {
  id: number
  date: string
  content: string
}

export default function App() {
  const [session, setSession] = useState<any>(null)
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session))
    fetchPuzzle()
    return () => subscription.unsubscribe()
  }, [])

  async function fetchPuzzle() {
    const today = new Date().toISOString().slice(0, 10)
    const { data } = await supabase.from('puzzles').select('*').eq('date', today).single()
    setPuzzle(data)
  }

  async function signInWithGitHub() {
    await supabase.auth.signInWithOAuth({ provider: 'github' })
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  async function submitDemoAttempt() {
    if (!session || !puzzle) return
    await supabase.from('attempts').insert({ puzzle_id: puzzle.id, user_id: session.user.id, attempt: 'demo' })
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Numblers</h1>
      {session ? (
        <button onClick={signOut}>Sign out</button>
      ) : (
        <button onClick={signInWithGitHub}>Sign in with GitHub</button>
      )}
      <div>{puzzle ? JSON.stringify(puzzle) : 'Loading puzzle...'}</div>
      <button onClick={submitDemoAttempt}>Submit demo attempt</button>
    </div>
  )
}
