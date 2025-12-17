import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconPencil, IconPlus, IconSearch, IconTrash } from '../components/ui/Icons';
import { loadList, removeById, saveList, storageKey } from '../utils/storage';
import '../styles/admin/ui/Cards.css';
import '../styles/admin/ui/Controls.css';
import '../styles/admin/ui/Buttons.css';
import '../styles/admin/pages/CourseList.css';

export default function CourseList() {
  const navigate = useNavigate();
  const coursesKey = useMemo(() => storageKey('courses'), []);
  const [query, setQuery] = useState('');
  const [courses, setCourses] = useState(() => loadList(coursesKey));

  useEffect(() => {
    const refresh = () => setCourses(loadList(coursesKey));
    window.addEventListener('storage', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, [coursesKey]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return courses;
    return courses.filter((c) => `${c.name || ''} ${c.category || ''} ${c.teacher || ''}`.toLowerCase().includes(q));
  }, [courses, query]);

  return (
    <div>
      <div className="row courseListHeaderRow">
        <div className="pageTitle courseListTitle">
          Course List
        </div>
        <div />
      </div>

      <div className="row courseListSearchRow">
        <div className="searchWrap">
          <input className="search" placeholder="Search" value={query} onChange={(e) => setQuery(e.target.value)} />
          <span className="searchIcon" aria-hidden="true">
            <IconSearch size={18} />
          </span>
        </div>

        <button className="btn btnDark btnIcon" onClick={() => navigate('/courses/create/1')}>
          <IconPlus size={18} />
          Create Subject
        </button>
      </div>

      <div className="cardGrid">
        {filtered.length === 0 ? (
          <div className="card cardPad courseListEmptyState">
            No courses found.
          </div>
        ) : (
          filtered.map((c) => (
            <div className="courseCard courseCardClickable" key={c.id} onClick={() => navigate(`/courses/${c.id}/edit/1`)}>
              <div className="courseTitle">{c.name || 'Untitled course'}</div>
              <div className="courseMeta">
                <span>{c.category ? `Category: ${c.category}` : 'Category: —'}</span>
                <span>{c.teacher ? `Teacher: ${c.teacher}` : 'Teacher: —'}</span>
              </div>
              <div className="courseActions" onClick={(e) => e.stopPropagation()}>
                <button className="iconBtn" aria-label="Edit" type="button" onClick={() => navigate(`/courses/${c.id}/edit/1`)}>
                  <IconPencil size={16} />
                </button>
                <button
                  className="iconBtn"
                  aria-label="Delete"
                  type="button"
                  onClick={() => {
                    const ok = window.confirm('Delete this course? This cannot be undone.');
                    if (!ok) return;
                    const next = removeById(courses, c.id);
                    saveList(coursesKey, next);
                    setCourses(next);
                  }}
                >
                  <IconTrash size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
