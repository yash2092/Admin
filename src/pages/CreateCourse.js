import React, { useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import Stepper from '../components/ui/Stepper';
import {
  IconChevronDown,
  IconChevronRight,
  IconPlus,
  IconTrash,
  IconUpload,
} from '../components/ui/Icons';

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

function wordCount(str) {
  if (!str) return 0;
  return str.trim().split(/\s+/).filter(Boolean).length;
}

export default function CreateCourse() {
  const navigate = useNavigate();
  const { step } = useParams();
  const current = useMemo(() => clampStep(step ?? '1'), [step]);
  if (!step) return <Navigate to="/courses/create/1" replace />;

  const [desc, setDesc] = useState('');
  const [modules, setModules] = useState(() => [
    {
      title: 'Module 1 : Introduction to Finance',
      videoTitle: 'Budgeting and Financial Planning',
      studyTitle: '',
      expanded: true,
    },
  ]);

  const goNext = () => navigate(`/courses/create/${Math.min(2, current + 1)}`);
  const goPrev = () => navigate(`/courses/create/${Math.max(1, current - 1)}`);

  return (
    <div>
      <div className="pageTitle">Create Course</div>

      <Stepper steps={steps} activeIndex={current - 1} />

      {current === 1 ? (
        <div className="card cardPad">
          <div className="formGrid2" style={{ marginTop: 2 }}>
            <div className="field" style={{ gridColumn: '1 / -1' }}>
              <div className="label">Name of the Course</div>
              <input className="input" />
            </div>

            <div className="field">
              <div className="label">Demo Video</div>
              <div className="fileRow">
                <div className="fileMeta">No file uploaded</div>
                <button className="btn btnSmall btnIcon" type="button">
                  Upload file <IconUpload size={16} />
                </button>
              </div>
              <div className="helper">Allowed Formats: .mp4, .mov, .avi, .mkv</div>
            </div>

            <div className="field">
              <div className="label">Course category</div>
              <select className="select" defaultValue="">
                <option value=""> </option>
                <option value="finance">Finance</option>
                <option value="business">Business</option>
              </select>
            </div>

            <div className="field" style={{ gridColumn: '1 / -1' }}>
              <div className="label">Teacher name</div>
              <input className="input" />
            </div>

            <div className="field" style={{ gridColumn: '1 / -1' }}>
              <div className="label">Subject description</div>
              <textarea
                className="textarea"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', color: 'var(--muted)', fontSize: 11 }}>
                Word limit {wordCount(desc)} / 500
              </div>
            </div>
          </div>

          <div className="footerActions">
            <button className="btn" type="button">
              Save as draft
            </button>
            <button className="btn btnAccent" type="button" onClick={goNext}>
              Save and Proceed
            </button>
          </div>
        </div>
      ) : null}

      {current === 2 ? (
        <div className="card cardPad">
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>
            Understanding Basic Finance
          </div>

          {modules.map((m, idx) => (
            <div className="card" style={{ marginBottom: 14 }} key={`${idx}-${m.title}`}>
              <div className="moduleCard">
                <div className="moduleHeader">
                  <div className="moduleHeaderLeft">
                    <span className="moduleBadge">{idx + 1}</span>
                    <div className="moduleTitle">{m.title}</div>
                  </div>

                  <div className="actions" style={{ gap: 8 }}>
                    <button
                      className="iconBtn"
                      aria-label={m.expanded ? 'Collapse' : 'Expand'}
                      onClick={() => {
                        setModules((prev) =>
                          prev.map((x, i) => (i === idx ? { ...x, expanded: !x.expanded } : x))
                        );
                      }}
                      type="button"
                    >
                      {m.expanded ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
                    </button>
                    <button className="iconBtn" aria-label="Delete module" type="button">
                      <IconTrash size={16} />
                    </button>
                  </div>
                </div>

                {m.expanded ? (
                  <div>
                    <div className="formGrid2" style={{ gap: 10 }}>
                      <div className="field" style={{ gridColumn: '1 / -1' }}>
                        <div className="label">Video Title</div>
                        <div className="fileRow">
                          <input
                            className="input"
                            defaultValue={m.videoTitle}
                            style={{ border: 'none', background: 'transparent', padding: 0 }}
                          />
                          <button className="btn btnSmall" type="button">
                            Upload file
                          </button>
                        </div>
                      </div>

                      <div className="field" style={{ gridColumn: '1 / -1' }}>
                        <div className="label">Study Material Title</div>
                        <div className="fileRow">
                          <input className="input" style={{ border: 'none', background: 'transparent', padding: 0 }} />
                          <button className="btn btnSmall" type="button">
                            Upload file
                          </button>
                        </div>
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
            onClick={() =>
              setModules((prev) => [
                ...prev,
                {
                  title: `Module ${prev.length + 1} : New Module`,
                  videoTitle: '',
                  studyTitle: '',
                  expanded: true,
                },
              ])
            }
          >
            <IconPlus size={18} />
            Add New Module
          </button>

          <div className="footerActions" style={{ marginTop: 16 }}>
            <button className="btn" type="button" onClick={goPrev}>
              Save as draft
            </button>
            <button className="btn btnAccent" type="button" onClick={() => navigate('/courses')}>
              Save and Proceed
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
