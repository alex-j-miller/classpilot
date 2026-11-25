import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import type { Classroom } from '../types'

function DashboardPage() {
  const navigate = useNavigate()
  const [classes, setClasses] = useState<Classroom[]>([])
  const [newClassName, setNewClassName] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadClasses() {
    try {
      const response = await api.get('/classes')
      setClasses(response.data.classes)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load classes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadClasses()
  }, [])

  async function handleCreateClass(event: FormEvent) {
    event.preventDefault()
    if (!newClassName.trim()) {
      return
    }

    try {
      await api.post('/classes', { name: newClassName.trim() })
      setNewClassName('')
      loadClasses()
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create class')
    }
  }

  async function handleDeleteClass(classId: string) {
    try {
      await api.delete(`/classes/${classId}`)
      setClasses((prev) => prev.filter((c) => c._id !== classId))
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to delete class')
    }
  }

  function handleLogout() {
    localStorage.removeItem('classpilot_token')
    navigate('/login')
  }

  return (
    <main className="dashboard-shell">
      <section className="card">
        <header className="row between">
          <h1>ClassPilot Dashboard</h1>
          <button className="btn" onClick={handleLogout}>
            Logout
          </button>
        </header>
        <p className="warning">
          Privacy reminder: only enter first name + last initial. Do not enter personal student data.
        </p>

        <form onSubmit={handleCreateClass} className="row gap">
          <input
            value={newClassName}
            onChange={(event) => setNewClassName(event.target.value)}
            placeholder="Add a class name"
            required
          />
          <button className="btn primary" type="submit">
            Create Class
          </button>
        </form>

        {error && <p className="error">{error}</p>}
        {loading ? (
          <p className="muted">Loading classes...</p>
        ) : (
          <div className="class-grid">
            {classes.map((classroom) => (
              <article className="class-card" key={classroom._id}>
                <h3>{classroom.name}</h3>
                <div className="row gap">
                  <Link className="btn primary" to={`/class/${classroom._id}`}>
                    Open Class
                  </Link>
                  <button className="btn" onClick={() => handleDeleteClass(classroom._id)}>
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default DashboardPage
