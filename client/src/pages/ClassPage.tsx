import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../services/api'
import type { PairRule, Student } from '../types'

type Tab = 'students' | 'rules' | 'tools'

function ClassPage() {
  const { classId } = useParams()
  const [tab, setTab] = useState<Tab>('students')
  const [students, setStudents] = useState<Student[]>([])
  const [rules, setRules] = useState<PairRule[]>([])
  const [error, setError] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [readingScore, setReadingScore] = useState('')
  const [mathScore, setMathScore] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [ruleA, setRuleA] = useState('')
  const [ruleB, setRuleB] = useState('')
  const [randomResult, setRandomResult] = useState('')
  const [pairResult, setPairResult] = useState<string[]>([])
  const [groupsResult, setGroupsResult] = useState<string[][]>([])
  const [groupSize, setGroupSize] = useState(3)

  const canCreateRule = useMemo(() => students.length > 1, [students])

  async function loadData() {
    if (!classId) {
      return
    }

    try {
      const [studentRes, rulesRes] = await Promise.all([
        api.get(`/classes/${classId}/students`),
        api.get(`/classes/${classId}/rules`),
      ])

      setStudents(studentRes.data.students)
      setRules(rulesRes.data.rules)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load class data')
    }
  }

  useEffect(() => {
    loadData()
  }, [classId])

  async function addStudent(event: FormEvent) {
    event.preventDefault()
    if (!classId) {
      return
    }

    try {
      await api.post(`/classes/${classId}/students`, {
        displayName: displayName.trim(),
        readingScore: readingScore ? Number(readingScore) : undefined,
        mathScore: mathScore ? Number(mathScore) : undefined,
        tags: tagInput
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
      })
      setDisplayName('')
      setReadingScore('')
      setMathScore('')
      setTagInput('')
      loadData()
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to add student')
    }
  }

  async function deleteStudent(studentId: string) {
    try {
      await api.delete(`/students/${studentId}`)
      loadData()
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to remove student')
    }
  }

  async function createRule(event: FormEvent) {
    event.preventDefault()
    if (!classId || !ruleA || !ruleB) {
      return
    }

    try {
      await api.post(`/classes/${classId}/rules`, {
        studentA: ruleA,
        studentB: ruleB,
        ruleType: 'neverPair',
      })
      setRuleA('')
      setRuleB('')
      loadData()
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to add rule')
    }
  }

  async function deleteRule(ruleId: string) {
    try {
      await api.delete(`/rules/${ruleId}`)
      loadData()
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to delete rule')
    }
  }

  async function pickStudent() {
    if (!classId) {
      return
    }

    try {
      const response = await api.post('/tools/random-student', { classId })
      setRandomResult(response.data.student.displayName)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to pick student')
    }
  }

  async function generatePairs() {
    if (!classId) {
      return
    }

    try {
      const response = await api.post('/tools/generate-pairs', { classId })
      const formatted = response.data.pairs.map((pair: Student[]) =>
        pair.map((s) => s.displayName).join(' + ')
      )
      setPairResult(formatted)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to generate pairs')
    }
  }

  async function generateGroups() {
    if (!classId) {
      return
    }

    try {
      const response = await api.post('/tools/generate-groups', { classId, groupSize })
      const formatted = response.data.groups.map((group: Student[]) => group.map((s) => s.displayName))
      setGroupsResult(formatted)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to generate groups')
    }
  }

  return (
    <main className="dashboard-shell">
      <section className="card">
        <header className="row between">
          <h1>Class Tools</h1>
          <Link className="btn" to="/dashboard">
            Back to Dashboard
          </Link>
        </header>

        <div className="row gap tabs">
          <button className={`btn ${tab === 'students' ? 'primary' : ''}`} onClick={() => setTab('students')}>
            Students
          </button>
          <button className={`btn ${tab === 'rules' ? 'primary' : ''}`} onClick={() => setTab('rules')}>
            Rules
          </button>
          <button className={`btn ${tab === 'tools' ? 'primary' : ''}`} onClick={() => setTab('tools')}>
            Tools
          </button>
        </div>

        {error && <p className="error">{error}</p>}

        {tab === 'students' && (
          <section className="stack">
            <p className="warning">
              Privacy reminder: store only first name and last initial. No full names or identifying details.
            </p>
            <form onSubmit={addStudent} className="stack">
              <input
                placeholder="Display name (example: Maya T.)"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
              <div className="row gap">
                <input
                  placeholder="Reading score (optional)"
                  type="number"
                  value={readingScore}
                  onChange={(e) => setReadingScore(e.target.value)}
                />
                <input
                  placeholder="Math score (optional)"
                  type="number"
                  value={mathScore}
                  onChange={(e) => setMathScore(e.target.value)}
                />
              </div>
              <input
                placeholder="Tags (optional, comma separated)"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
              />
              <button className="btn primary" type="submit">
                Add Student
              </button>
            </form>

            <div className="list">
              {students.map((student) => (
                <div className="list-row" key={student._id}>
                  <span>{student.displayName}</span>
                  <button className="btn" onClick={() => deleteStudent(student._id)}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {tab === 'rules' && (
          <section className="stack">
            <form onSubmit={createRule} className="row gap wrap">
              <select value={ruleA} onChange={(e) => setRuleA(e.target.value)} disabled={!canCreateRule} required>
                <option value="">Student A</option>
                {students.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.displayName}
                  </option>
                ))}
              </select>
              <select value={ruleB} onChange={(e) => setRuleB(e.target.value)} disabled={!canCreateRule} required>
                <option value="">Student B</option>
                {students.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.displayName}
                  </option>
                ))}
              </select>
              <button className="btn primary" disabled={!canCreateRule}>
                Add Never-Pair Rule
              </button>
            </form>
            <div className="list">
              {rules.map((rule) => {
                const a = typeof rule.studentA === 'string' ? rule.studentA : rule.studentA.displayName
                const b = typeof rule.studentB === 'string' ? rule.studentB : rule.studentB.displayName
                return (
                  <div className="list-row" key={rule._id}>
                    <span>
                      {a} and {b} should never pair
                    </span>
                    <button className="btn" onClick={() => deleteRule(rule._id)}>
                      Delete
                    </button>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {tab === 'tools' && (
          <section className="stack">
            <div className="tool-grid">
              <button className="btn tool primary" onClick={pickStudent}>
                Pick Student
              </button>
              <button className="btn tool primary" onClick={generatePairs}>
                Generate Pairs
              </button>
              <div className="row gap">
                <input
                  type="number"
                  min={2}
                  max={10}
                  value={groupSize}
                  onChange={(e) => setGroupSize(Number(e.target.value))}
                />
                <button className="btn tool primary" onClick={generateGroups}>
                  Generate Groups
                </button>
              </div>
            </div>

            {randomResult && (
              <div className="result-box">
                <h3>Picked Student</h3>
                <p>{randomResult}</p>
              </div>
            )}

            {pairResult.length > 0 && (
              <div className="result-box">
                <h3>Pairs</h3>
                <ol>
                  {pairResult.map((pair, index) => (
                    <li key={`${pair}-${index}`}>{pair}</li>
                  ))}
                </ol>
              </div>
            )}

            {groupsResult.length > 0 && (
              <div className="result-box">
                <h3>Groups</h3>
                <ol>
                  {groupsResult.map((group, index) => (
                    <li key={`${group.join('-')}-${index}`}>{group.join(', ')}</li>
                  ))}
                </ol>
              </div>
            )}
          </section>
        )}
      </section>
    </main>
  )
}

export default ClassPage
