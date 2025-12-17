import React, { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import Stepper from '../components/ui/Stepper';
import {
  IconChevronDown,
  IconChevronRight,
  IconPlus,
  IconTrash,
  IconUpload,
} from '../components/ui/Icons';
import { loadList, makeId, saveList, storageKey, upsertById, withTimestamps } from '../utils/storage';
import { validateCourse, wordCount } from '../utils/validators';
import '../styles/admin/ui/Cards.css';
import '../styles/admin/ui/Forms.css';
import '../styles/admin/ui/Buttons.css';
import '../styles/admin/pages/CreateCourse.css';

const steps = [
  { key: '1', label: 'Course Details' },
  { key: '2', label: 'Course Material' },
];

function clampStep(s) {
  const n = Number(s);
  if (!Number.isFinite(n) || n < 1) return 1;
  if (n > 2) return 2;
  return n;
}

export default function CreateCourse() {
  const navigate = useNavigate();
  const { step, id } = useParams();
  const current = useMemo(() => clampStep(step ?? '1'), [step]);
  const shouldRedirect = !step;
  const redirectTo = id ? `/courses/${id}/edit/1` : '/courses/create/1';

  const coursesKey = useMemo(() => storageKey('courses'), []);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState(() => ({
    id: '',
    name: '',
    category: '',
    teacher: '',
    description: '',
    demoVideoName: '',
    modules: [
      {
        title: '',
        videoTitle: '',
        videoFileName: '',
        studyTitle: '',
        studyFileName: '',
        expanded: true,
      },
    ],
    status: 'draft',
  }));

  const effectiveId = id || form.id;

  useEffect(() => {
    if (!id) return;
    const list = loadList(coursesKey);
    const existing = list.find((x) => x.id === id);
    if (!existing) return;
    setForm((prev) => ({ ...prev, ...existing }));
  }, [id, coursesKey]);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const updateModule = (idx, patch) => {
    setForm((prev) => ({
      ...prev,
      modules: prev.modules.map((m, i) => (i === idx ? { ...m, ...patch } : m)),
    }));
  };

  const addModule = () => {
    setForm((prev) => ({
      ...prev,
      modules: [
        ...prev.modules,
        {
          title: '',
          videoTitle: '',
          videoFileName: '',
          studyTitle: '',
          studyFileName: '',
          expanded: true,
        },
      ],
    }));
  };

  const deleteModule = (idx) => {
    setForm((prev) => ({ ...prev, modules: prev.modules.filter((_, i) => i !== idx) }));
  };

  const persist = ({ status } = {}) => {
    const list = loadList(coursesKey);
    const existing = effectiveId ? list.find((x) => x.id === effectiveId) : undefined;
    const isNew = !existing;
    const nextId = existing?.id || effectiveId || makeId('course');
    const record = withTimestamps(
      existing,
      {
        ...form,
        id: nextId,
        status: status || form.status || 'draft',
        createdBy: existing?.createdBy || 'ADMIN USER',
      },
      { isNew }
    );
    saveList(coursesKey, upsertById(list, record));
    setForm((prev) => ({ ...prev, id: nextId, status: record.status }));
    return record;
  };

  const validateStep = (s) => {
    const stepErrors = validateCourse(form, s);
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  if (shouldRedirect) return <Navigate to={redirectTo} replace />;

  return (
    <div>
      <div className="pageTitle">{id ? 'Edit Course' : 'Create Course'}</div>

      <Stepper steps={steps} activeIndex={current - 1} />

      {current === 1 ? (
        <div className="card cardPad">
          <div className="formGrid2 createCourseGrid">
            <div className="field createCourseFieldFull">
              <div className="label">Name of the Course</div>
              <input
                className={errors.name ? 'input inputError' : 'input'}
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
              />
              {errors.name ? <div className="errorText">{errors.name}</div> : null}
            </div>

            <div className="field">
              <div className="label">Demo Video</div>
              <div className="fileRow">
                <div className="fileMeta">{form.demoVideoName ? form.demoVideoName : 'No file uploaded'}</div>
                <button
                  className="btn btnSmall btnIcon"
                  type="button"
                  onClick={() => document.getElementById('demoVideoInput')?.click()}
                >
                  Upload file <IconUpload size={16} />
                </button>
                <input
                  id="demoVideoInput"
                  type="file"
                  accept="video/*"
                  className="hiddenFileInput"
                  onChange={(e) => updateField('demoVideoName', e.target.files?.[0]?.name || '')}
                />
              </div>
              <div className="helper">Allowed Formats: .mp4, .mov, .avi, .mkv</div>
            </div>

            <div className="field">
              <div className="label">Course category</div>
              <select
                className={errors.category ? 'select inputError' : 'select'}
                value={form.category}
                onChange={(e) => updateField('category', e.target.value)}
              >
                <option value=""> </option>
                <option value="finance">Finance</option>
                <option value="business">Business</option>
              </select>
              {errors.category ? <div className="errorText">{errors.category}</div> : null}
            </div>

            <div className="field createCourseFieldFull">
              <div className="label">Teacher name</div>
              <input
                className={errors.teacher ? 'input inputError' : 'input'}
                value={form.teacher}
                onChange={(e) => updateField('teacher', e.target.value)}
              />
              {errors.teacher ? <div className="errorText">{errors.teacher}</div> : null}
            </div>

            <div className="field createCourseFieldFull">
              <div className="label">Subject description</div>
              <textarea
                className={errors.description ? 'textarea inputError' : 'textarea'}
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
              />
              {errors.description ? <div className="errorText">{errors.description}</div> : null}
              <div className="createCourseWordCount">
                Word limit {wordCount(form.description)} / 500
              </div>
            </div>
          </div>

          <div className="footerActions">
            <button
              className="btn"
              type="button"
              onClick={() => {
                persist({ status: 'draft' });
                navigate('/courses');
              }}
            >
              Save as draft
            </button>
            <button
              className="btn btnAccent"
              type="button"
              onClick={() => {
                if (!validateStep(1)) return;
                const saved = persist({ status: 'draft' });
                navigate(`/courses/${saved.id}/edit/${Math.min(2, current + 1)}`, { replace: true });
              }}
            >
              Save and Proceed
            </button>
          </div>
        </div>
      ) : null}

      {current === 2 ? (
        <div className="card cardPad">
          <div className="createCourseNameHeader">{form.name || 'Course'}</div>

          {errors.modules ? <div className="errorText createCourseModulesError">{errors.modules}</div> : null}

          {form.modules.map((m, idx) => (
            <div className="card createCourseModuleCard" key={`module-${idx}`}>
              <div className="moduleCard">
                <div className="moduleHeader">
                  <div className="moduleHeaderLeft">
                    <span className="moduleBadge">{idx + 1}</span>
                    <div className="moduleTitle">{m.title || `Module ${idx + 1}`}</div>
                  </div>

                  <div className="actions createCourseModuleActions">
                    <button
                      className="iconBtn"
                      aria-label={m.expanded ? 'Collapse' : 'Expand'}
                      onClick={() => {
                        updateModule(idx, { expanded: !m.expanded });
                      }}
                      type="button"
                    >
                      {m.expanded ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
                    </button>
                    <button
                      className="iconBtn"
                      aria-label="Delete module"
                      type="button"
                      onClick={() => deleteModule(idx)}
                      disabled={form.modules.length === 1}
                      title={form.modules.length === 1 ? 'At least one module is required' : 'Delete module'}
                    >
                      <IconTrash size={16} />
                    </button>
                  </div>
                </div>

                {m.expanded ? (
                  <div>
                    <div className="formGrid2 createCourseModuleGrid">
                      <div className="field createCourseFieldFull">
                        <div className="label">Module Title</div>
                        <input
                          className={errors[`modules.${idx}.title`] ? 'input inputError' : 'input'}
                          value={m.title}
                          onChange={(e) => updateModule(idx, { title: e.target.value })}
                        />
                        {errors[`modules.${idx}.title`] ? (
                          <div className="errorText">{errors[`modules.${idx}.title`]}</div>
                        ) : null}
                      </div>
                      <div className="field createCourseFieldFull">
                        <div className="label">Video Title</div>
                        <div className="fileRow">
                          <input
                            className="input fileRowInlineInput"
                            value={m.videoTitle}
                            onChange={(e) => updateModule(idx, { videoTitle: e.target.value })}
                          />
                          <button
                            className="btn btnSmall"
                            type="button"
                            onClick={() => document.getElementById(`moduleVideo-${idx}`)?.click()}
                          >
                            Upload file
                          </button>
                          <input
                            id={`moduleVideo-${idx}`}
                            type="file"
                            accept="video/*"
                            className="hiddenFileInput"
                            onChange={(e) => updateModule(idx, { videoFileName: e.target.files?.[0]?.name || '' })}
                          />
                        </div>
                        {m.videoFileName ? <div className="helper createCourseFileName">{m.videoFileName}</div> : null}
                      </div>

                      <div className="field createCourseFieldFull">
                        <div className="label">Study Material Title</div>
                        <div className="fileRow">
                          <input
                            className="input fileRowInlineInput"
                            value={m.studyTitle}
                            onChange={(e) => updateModule(idx, { studyTitle: e.target.value })}
                          />
                          <button
                            className="btn btnSmall"
                            type="button"
                            onClick={() => document.getElementById(`moduleStudy-${idx}`)?.click()}
                          >
                            Upload file
                          </button>
                          <input
                            id={`moduleStudy-${idx}`}
                            type="file"
                            className="hiddenFileInput"
                            onChange={(e) => updateModule(idx, { studyFileName: e.target.files?.[0]?.name || '' })}
                          />
                        </div>
                        {m.studyFileName ? <div className="helper createCourseFileName">{m.studyFileName}</div> : null}
                      </div>
                    </div>

                    <div className="pills">
                      <span className="pill">
                        <IconPlus size={16} /> Video
                      </span>
                      <span className="pill">
                        <IconPlus size={16} /> Study Material
                      </span>
                      <span className="pill">
                        <IconPlus size={16} /> Assignment
                      </span>
                      <span className="pill">
                        <IconPlus size={16} /> Quiz
                      </span>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          ))}

          <button
            className="btn btnDark btnIcon"
            type="button"
            onClick={addModule}
          >
            <IconPlus size={18} />
            Add New Module
          </button>

          <div className="footerActions createCourseFooterTop">
            <button
              className="btn"
              type="button"
              onClick={() => {
                const saved = persist({ status: 'draft' });
                navigate(`/courses/${saved.id}/edit/${Math.max(1, current - 1)}`);
              }}
            >
              Back
            </button>
            <button
              className="btn btnAccent"
              type="button"
              onClick={() => {
                if (!validateStep(2)) return;
                persist({ status: 'active' });
                navigate('/courses');
              }}
            >
              Save and Proceed
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
