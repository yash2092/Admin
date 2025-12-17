import React, { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import Stepper from '../components/ui/Stepper';
import { IconUpload } from '../components/ui/Icons';
import { loadList, makeId, saveList, storageKey, upsertById, withTimestamps } from '../utils/storage';
import { validateInstitute } from '../utils/validators';
import '../styles/admin/ui/Cards.css';
import '../styles/admin/ui/Forms.css';
import '../styles/admin/ui/Buttons.css';
import '../styles/admin/pages/CreateInstitute.css';

const steps = [
  { key: '1', label: 'Basic\nDetails' },
  { key: '2', label: 'Institute Administration\nDetails' },
  { key: '3', label: 'Permissions' },
  { key: '4', label: 'Preview' },
];

function clampStep(s) {
  const n = Number(s);
  if (!Number.isFinite(n) || n < 1) return 1;
  if (n > 4) return 4;
  return n;
}

export default function CreateInstitute() {
  const navigate = useNavigate();
  const { step, id } = useParams();

  const [form, setForm] = useState(() => ({
    id: '',
    name: '',
    type: '',
    trademark: '',
    gst: '',
    contact: '',
    email: '',
    adminName: '',
    adminContact: '',
    adminEmail: '',
    status: 'draft',
  }));
  const [errors, setErrors] = useState({});

  const current = useMemo(() => clampStep(step ?? '1'), [step]);
  const shouldRedirect = !step;
  const redirectTo = id ? `/institutes/${id}/edit/1` : '/institutes/create/1';

  const activeIndex = current - 1;
  const effectiveId = id || form.id;

  const institutesKey = useMemo(() => storageKey('institutes'), []);

  useEffect(() => {
    if (!id) return;
    const list = loadList(institutesKey);
    const existing = list.find((x) => x.id === id);
    if (!existing) return;
    setForm((prev) => ({
      ...prev,
      ...existing,
    }));
  }, [id, institutesKey]);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const persist = ({ status } = {}) => {
    const list = loadList(institutesKey);
    const existing = effectiveId ? list.find((x) => x.id === effectiveId) : undefined;
    const isNew = !existing;
    const nextId = existing?.id || effectiveId || makeId('inst');

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

    saveList(institutesKey, upsertById(list, record));
    setForm((prev) => ({ ...prev, id: nextId, status: record.status }));

    return record;
  };

  const validateStep = (s) => {
    const stepErrors = validateInstitute(form, s);
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  if (shouldRedirect) return <Navigate to={redirectTo} replace />;

  return (
    <div>
      <div className="pageTitle">{id ? 'Edit Institute' : 'Create Institute'}</div>

      <Stepper steps={steps} activeIndex={activeIndex} />

      <div className="card cardPad">
        {current === 1 ? (
          <>
            <div className="sectionTitle">Basic Details</div>
            <div className="formGrid2 createInstituteGrid">
              <div className="field">
                <div className="label">Name of Institute*</div>
                <input
                  className={errors.name ? 'input inputError' : 'input'}
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                />
                {errors.name ? <div className="errorText">{errors.name}</div> : null}
              </div>
              <div className="field">
                <div className="label">Institute Type</div>
                <select
                  className="select"
                  value={form.type}
                  onChange={(e) => updateField('type', e.target.value)}
                >
                  <option value=""> </option>
                  <option value="private">Private</option>
                  <option value="public">Public</option>
                </select>
              </div>
              <div className="field">
                <div className="label">Trademark*</div>
                <input
                  className={errors.trademark ? 'input inputError' : 'input'}
                  value={form.trademark}
                  onChange={(e) => updateField('trademark', e.target.value)}
                />
                {errors.trademark ? <div className="errorText">{errors.trademark}</div> : null}
              </div>
              <div className="field">
                <div className="label">GST*</div>
                <input
                  className={errors.gst ? 'input inputError' : 'input'}
                  value={form.gst}
                  onChange={(e) => updateField('gst', e.target.value.toUpperCase())}
                  placeholder="15 character GSTIN"
                />
                {errors.gst ? <div className="errorText">{errors.gst}</div> : null}
              </div>
              <div className="field">
                <div className="label">Contact Number*</div>
                <input
                  className={errors.contact ? 'input inputError' : 'input'}
                  value={form.contact}
                  onChange={(e) => updateField('contact', e.target.value)}
                  inputMode="tel"
                  placeholder="Phone number"
                />
                {errors.contact ? <div className="errorText">{errors.contact}</div> : null}
              </div>
              <div className="field">
                <div className="label">Email</div>
                <input
                  className={errors.email ? 'input inputError' : 'input'}
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  type="email"
                  placeholder="name@company.com"
                />
                {errors.email ? <div className="errorText">{errors.email}</div> : null}
              </div>
              <div className="field createInstituteFieldFull">
                <div className="label">Company logo*</div>
                <div className="fileRow">
                  <div className="fileMeta">No file uploaded</div>
                  <button className="btn btnSmall btnIcon" type="button">
                    Upload file <IconUpload size={16} />
                  </button>
                </div>
              </div>
            </div>

            <div className="footerActions">
              <button
                className="btn"
                type="button"
                onClick={() => {
                  persist({ status: 'draft' });
                  navigate('/institutes');
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
                  navigate(`/institutes/${saved.id}/edit/${Math.min(4, current + 1)}`, { replace: true });
                }}
              >
                Save and Proceed
              </button>
            </div>
          </>
        ) : null}

        {current === 2 ? (
          <>
            <div className="sectionTitle">Institute Administration Details</div>
            <div className="formGrid2 createInstituteGrid">
              <div className="field">
                <div className="label">Name</div>
                <input
                  className={errors.adminName ? 'input inputError' : 'input'}
                  value={form.adminName}
                  onChange={(e) => updateField('adminName', e.target.value)}
                />
                {errors.adminName ? <div className="errorText">{errors.adminName}</div> : null}
              </div>
              <div className="field">
                <div className="label">Contact No.</div>
                <input
                  className={errors.adminContact ? 'input inputError' : 'input'}
                  value={form.adminContact}
                  onChange={(e) => updateField('adminContact', e.target.value)}
                  inputMode="tel"
                />
                {errors.adminContact ? <div className="errorText">{errors.adminContact}</div> : null}
              </div>
              <div className="field">
                <div className="label">Email ID</div>
                <input
                  className={errors.adminEmail ? 'input inputError' : 'input'}
                  value={form.adminEmail}
                  onChange={(e) => updateField('adminEmail', e.target.value)}
                  type="email"
                />
                {errors.adminEmail ? <div className="errorText">{errors.adminEmail}</div> : null}
              </div>
              <div />
            </div>

            <div className="footerActions">
              <button
                className="btn"
                type="button"
                onClick={() => {
                  const saved = persist({ status: 'draft' });
                  navigate(`/institutes/${saved.id}/edit/${Math.max(1, current - 1)}`);
                }}
              >
                Back
              </button>
              <button
                className="btn btnAccent"
                type="button"
                onClick={() => {
                  if (!validateStep(2)) return;
                  const saved = persist({ status: 'draft' });
                  navigate(`/institutes/${saved.id}/edit/${Math.min(4, current + 1)}`);
                }}
              >
                Save and Proceed
              </button>
            </div>
          </>
        ) : null}

        {current === 3 ? (
          <>
            <div className="sectionTitle">Permissions</div>
            <div className="subTitle"> </div>
            <div className="createInstituteSpacer220" />

            <div className="footerActions">
              <button
                className="btn"
                type="button"
                onClick={() => {
                  const saved = persist({ status: 'draft' });
                  navigate(`/institutes/${saved.id}/edit/${Math.max(1, current - 1)}`);
                }}
              >
                Back
              </button>
              <button
                className="btn btnAccent"
                type="button"
                onClick={() => {
                  const saved = persist({ status: 'draft' });
                  navigate(`/institutes/${saved.id}/edit/${Math.min(4, current + 1)}`);
                }}
              >
                Save and Proceed
              </button>
            </div>
          </>
        ) : null}

        {current === 4 ? (
          <>
            <div className="sectionTitle">Basic Details</div>
            <div className="formGrid2 createInstituteGrid">
              <div className="field">
                <div className="label">Name of Institute*</div>
                <input className="input" value={form.name} readOnly />
              </div>
              <div className="field">
                <div className="label">Institute Type</div>
                <select className="select" value={form.type} disabled>
                  <option value=""> </option>
                  <option value="private">Private</option>
                  <option value="public">Public</option>
                </select>
              </div>
              <div className="field">
                <div className="label">Trademark*</div>
                <input className="input" value={form.trademark} readOnly />
              </div>
              <div className="field">
                <div className="label">GST*</div>
                <input className="input" value={form.gst} readOnly />
              </div>
              <div className="field">
                <div className="label">Contact Number*</div>
                <input className="input" value={form.contact} readOnly />
              </div>
              <div className="field">
                <div className="label">Email</div>
                <input className="input" value={form.email} readOnly />
              </div>
              <div className="field createInstituteFieldFull">
                <div className="label">Company logo*</div>
                <div className="fileRow">
                  <div className="fileMeta">No file uploaded</div>
                  <button className="btn btnSmall btnIcon" type="button">
                    Upload file <IconUpload size={16} />
                  </button>
                </div>
              </div>
            </div>

            <div className="sectionTitle createInstituteSectionTop">
              Institute Administration Details
            </div>
            <div className="formGrid2 createInstituteGrid">
              <div className="field">
                <div className="label">Name</div>
                <input className="input" value={form.adminName} readOnly />
              </div>
              <div className="field">
                <div className="label">Contact No.</div>
                <input className="input" value={form.adminContact} readOnly />
              </div>
              <div className="field">
                <div className="label">Email ID</div>
                <input className="input" value={form.adminEmail} readOnly />
              </div>
              <div />
            </div>

            <div className="sectionTitle createInstituteSectionTop">
              Permissions
            </div>
            <div className="createInstituteSpacer140" />

            <div className="footerActions">
              <button
                className="btn"
                type="button"
                onClick={() => {
                  persist({ status: 'draft' });
                  navigate('/institutes');
                }}
              >
                Save as draft
              </button>
              <button
                className="btn btnAccent"
                type="button"
                onClick={() => {
                  const allErrors = validateInstitute(form, null);
                  setErrors(allErrors);
                  if (Object.keys(allErrors).length > 0) return;
                  persist({ status: 'active' });
                  navigate('/institutes');
                }}
              >
                Save and Proceed
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
