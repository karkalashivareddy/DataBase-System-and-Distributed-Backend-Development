import { useEffect, useState } from 'react';
import axios from 'axios';

const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const initialForm = {
  name: '',
  email: '',
  course: '',
  age: ''
};

function getErrorMessage(error) {
  const responseMessage = error.response?.data?.message;
  const detail = error.response?.data?.error;
  return [responseMessage, detail].filter(Boolean).join(': ') || 'The request could not be completed.';
}

function App() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiBase}/students`);
      setStudents(response.data);
      setMessage(null);
    } catch (error) {
      setMessage({ type: 'error', text: getErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    const payload = {
      name: form.name,
      email: form.email,
      course: form.course,
      age: Number(form.age)
    };

    try {
      if (editingId) {
        await axios.patch(`${apiBase}/students/${editingId}`, payload);
        setMessage({ type: 'success', text: 'Student updated successfully.' });
      } else {
        await axios.post(`${apiBase}/students`, payload);
        setMessage({ type: 'success', text: 'Student created successfully.' });
      }
      resetForm();
      await loadStudents();
    } catch (error) {
      setMessage({ type: 'error', text: getErrorMessage(error) });
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (student) => {
    setEditingId(student._id);
    setForm({
      name: student.name,
      email: student.email,
      course: student.course,
      age: String(student.age)
    });
    setMessage({ type: 'info', text: 'Edit the student details and save the update.' });
  };

  const handleDelete = async (student) => {
    if (!window.confirm(`Delete ${student.name}?`)) {
      return;
    }

    setBusy(true);
    try {
      await axios.delete(`${apiBase}/students/${student._id}`);
      setMessage({ type: 'success', text: 'Student deleted successfully.' });
      if (editingId === student._id) {
        resetForm();
      }
      await loadStudents();
    } catch (error) {
      setMessage({ type: 'error', text: getErrorMessage(error) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="page-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">WEEK 9 · DATABASE SYSTEMS ENGINEERING</p>
          <h1>Student Management System</h1>
          <p className="subtitle">React form and table communicating with an Express REST API</p>
        </div>
        <div className="api-status">
          <span className="status-dot" />
          <div>
            <strong>Express API</strong>
            <span>{apiBase}/students</span>
          </div>
        </div>
      </header>

      <section className="workspace" aria-label="Student management workspace">
        <form className="card form-card" onSubmit={handleSubmit}>
          <div className="card-heading">
            <div>
              <p className="section-label">Student record</p>
              <h2>{editingId ? 'Update student' : 'Add student'}</h2>
            </div>
            {editingId && (
              <button className="button secondary" type="button" onClick={resetForm}>
                Cancel edit
              </button>
            )}
          </div>

          <div className="form-grid">
            <label>
              Student name
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Anita"
                required
              />
            </label>
            <label>
              Email address
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="e.g. anita@example.com"
                required
              />
            </label>
            <label>
              Course
              <input
                name="course"
                value={form.course}
                onChange={handleChange}
                placeholder="e.g. CSE"
                required
              />
            </label>
            <label>
              Age
              <input
                name="age"
                type="number"
                min="16"
                max="100"
                value={form.age}
                onChange={handleChange}
                placeholder="16–100"
                required
              />
            </label>
          </div>

          <button className="button primary submit-button" type="submit" disabled={busy}>
            {busy ? 'Saving…' : editingId ? 'Save update' : 'Add student'}
          </button>
        </form>

        <section className="card records-card" aria-labelledby="records-heading">
          <div className="card-heading records-heading">
            <div>
              <p className="section-label">MongoDB collection · students</p>
              <h2 id="records-heading">Student records</h2>
            </div>
            <button className="button secondary" type="button" onClick={loadStudents} disabled={busy}>
              Refresh
            </button>
          </div>

          {message && <div className={`notice ${message.type}`}>{message.text}</div>}

          {loading ? (
            <p className="empty-state">Loading student records…</p>
          ) : students.length === 0 ? (
            <p className="empty-state">No student records yet. Add the first student above.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Course</th>
                    <th>Age</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student._id}>
                      <td className="name-cell">{student.name}</td>
                      <td>{student.email}</td>
                      <td><span className="course-pill">{student.course}</span></td>
                      <td>{student.age}</td>
                      <td>
                        <div className="row-actions">
                          <button className="button table-action" type="button" onClick={() => startEdit(student)}>
                            Edit
                          </button>
                          <button className="button danger" type="button" onClick={() => handleDelete(student)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="table-note">Create, read, update and delete operations are sent to the Express API using Axios.</p>
        </section>
      </section>
    </main>
  );
}

export default App;
