import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconPencil, IconPlus, IconSearch, IconTrash } from '../ui/Icons';
import { loadList, removeById, saveList, storageKey } from '../utils/storage';
import '../styles/admin/ui/Cards.css';
import '../styles/admin/ui/Controls.css';
import '../styles/admin/ui/Buttons.css';
import '../styles/admin/pages/CourseList.css';

const COURSES_STORAGE_KEY = storageKey('courses');
const EMPTY_TEXT = '—';

export default function CourseList() {
  const navigate = useNavigate();

  // Keep the storage key stable so we can safely use it in effects.
  const coursesKey = useMemo(() => COURSES_STORAGE_KEY, []);

  const [query, setQuery] = useState('');
  const [courses, setCourses] = useState(() => loadList(coursesKey));

  useEffect(() => {
    // WHY:
    // - Courses can be changed from another tab/window.
    // - The browser fires a `storage` event for those changes.
    // - We also refresh on `focus` so returning to the tab shows fresh data.
    const refreshFromStorage = () => {
      const latestCourses = loadList(coursesKey);
      setCourses(latestCourses);
    };

    const refresh = refreshFromStorage;
    window.addEventListener('storage', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, [coursesKey]);

  const filtered = useMemo(() => {
    const trimmedQuery = query.trim();
    const normalizedQuery = trimmedQuery.toLowerCase();

    if (normalizedQuery === '') {
      return courses;
    }

    return courses.filter((course) => {
      // WHY:
      // - We keep search "dumb" and predictable (substring match).
      // - Users can search by name, category, or teacher.
      const name = course.name || '';
      const category = course.category || '';
      const teacher = course.teacher || '';

      const combined = `${name} ${category} ${teacher}`;
      const searchable = combined.toLowerCase();

      return searchable.includes(normalizedQuery);
    });
  }, [courses, query]);

  function handleQueryChange(event) {
    const nextQuery = event.target.value;
    setQuery(nextQuery);
  }

  function goToCreateCourse() {
    // The create page redirects to step 1, so we link directly there.
    navigate('/courses/create/1');
  }

  function goToEditCourse(courseId) {
    navigate(`/courses/${courseId}/edit/1`);
  }

  function deleteCourse(courseId) {
    const userConfirmed = window.confirm('Delete this course? This cannot be undone.');
    if (!userConfirmed) {
      return;
    }

    const nextCourses = removeById(courses, courseId);
    saveList(coursesKey, nextCourses);
    setCourses(nextCourses);
  }

  function stopCardClick(event) {
    // WHY:
    // - The card itself is clickable to open the editor.
    // - The action buttons live inside the card; they should not trigger navigation.
    event.stopPropagation();
  }

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
          <input
            className="search"
            placeholder="Search"
            value={query}
            onChange={handleQueryChange}
          />
          <span className="searchIcon" aria-hidden="true">
            <IconSearch size={18} />
          </span>
        </div>

        <button className="btn btnDark btnIcon" onClick={goToCreateCourse}>
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
          filtered.map((course) => (
            <div
              className="courseCard courseCardClickable"
              key={course.id}
              onClick={() => goToEditCourse(course.id)}
            >
              <div className="courseTitle">{course.name || 'Untitled course'}</div>
              <div className="courseMeta">
                <span>{course.category ? `Category: ${course.category}` : `Category: ${EMPTY_TEXT}`}</span>
                <span>{course.teacher ? `Teacher: ${course.teacher}` : `Teacher: ${EMPTY_TEXT}`}</span>
              </div>
              <div className="courseActions" onClick={stopCardClick}>
                <button
                  className="iconBtn"
                  aria-label="Edit"
                  type="button"
                  onClick={() => goToEditCourse(course.id)}
                >
                  <IconPencil size={16} />
                </button>
                <button
                  className="iconBtn"
                  aria-label="Delete"
                  type="button"
                  onClick={() => deleteCourse(course.id)}
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
