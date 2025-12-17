import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import Stepper from '../components/ui/Stepper';
import { IconUpload } from '../components/ui/Icons';

const DRAFT_KEY = 'draft:createInstitute:v1';

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

function safeParseJSON(s) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

function loadDraft() {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(DRAFT_KEY);
  if (!raw) return null;
  const parsed = safeParseJSON(raw);
  if (!parsed || typeof parsed !== 'object') return null;
  return parsed;
}

async function fileToDataUrl(file) {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

async function uploadFileWithFormData(file) {
  // Configure your backend endpoint using REACT_APP_UPLOAD_URL.
  // Expected: POST <UPLOAD_URL> with multipart/form-data.
  // Response: any JSON containing one of: url, fileUrl, location, path.
  const uploadUrl = process.env.REACT_APP_UPLOAD_URL;
  if (!uploadUrl) return { skipped: true };

  const fd = new FormData();
  fd.append('file', file);

  const res = await fetch(uploadUrl, { method: 'POST', body: fd });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Upload failed (${res.status})`);
  }

  const json = await res.json().catch(() => ({}));
  const url =
    (typeof json?.url === 'string' && json.url) ||
    (typeof json?.fileUrl === 'string' && json.fileUrl) ||
    (typeof json?.location === 'string' && json.location) ||
    (typeof json?.path === 'string' && json.path) ||
    '';
  return { ...json, url };
}

export default function CreateInstitute() {
  const navigate = useNavigate();
  const { step } = useParams();

  const fileInputRef = useRef(null);

  const defaults = useMemo(
    () => ({
      name: '',
      type: '',
      trademark: '',
      gst: '',
      contact: '',
      email: '',
      adminName: '',
      adminContact: '',
      adminEmail: '',

      // File (logo)
      logoFileName: '',
      logoFileType: '',
      logoFileSize: 0,
      // Persistable fallback (base64). Use only for small files.
      logoDataUrl: '',
      // Optional backend URL when upload endpoint exists.
      logoUploadedUrl: '',
      logoUploadError: '',
      logoUploadStatus: 'idle', // idle | uploading | uploaded | error | skipped
    }),
    []
  );

  const [form, setForm] = useState(() => {
    const draft = loadDraft();
    return { ...defaults, ...(draft || {}) };
  });

  // Persist draft on every change.
  useEffect(() => {
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
    } catch {
      // Ignore localStorage quota/security errors.
    }
  }, [form]);

  const setField = (key) => (e) => {
    const value = e?.target?.value ?? '';
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const clearDraft = () => {
    try {
      window.localStorage.removeItem(DRAFT_KEY);
    } catch {
      // ignore
    }
    setForm(defaults);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onPickLogo = () => fileInputRef.current?.click();

  const removeLogo = () => {
    setForm((prev) => ({
      ...prev,
      logoFileName: '',
      logoFileType: '',
      logoFileSize: 0,
      logoDataUrl: '',
      logoUploadedUrl: '',
      logoUploadError: '',
      logoUploadStatus: 'idle',
    }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onLogoChange = async (e) => {
    const file = e?.target?.files?.[0];
    if (!file) return;

    setForm((prev) => ({
      ...prev,
      logoFileName: file.name,
      logoFileType: file.type || '',
      logoFileSize: file.size || 0,
      logoUploadError: '',
      logoUploadStatus: 'uploading',
      // reset URLs; we will set them again below
      logoUploadedUrl: '',
    }));

    // Persist logo content (base64) only for small files (2MB).
    const MAX_BASE64_BYTES = 2 * 1024 * 1024;
    try {
      if ((file.size || 0) <= MAX_BASE64_BYTES) {
        const dataUrl = await fileToDataUrl(file);
        setForm((prev) => ({ ...prev, logoDataUrl: dataUrl }));
      } else {
        setForm((prev) => ({ ...prev, logoDataUrl: '' }));
      }
    } catch {
      setForm((prev) => ({ ...prev, logoDataUrl: '' }));
    }

    // Methodology to upload file using multipart/form-data
    try {
      const uploaded = await uploadFileWithFormData(file);
      if (uploaded?.skipped) {
        setForm((prev) => ({ ...prev, logoUploadStatus: 'skipped' }));
        return;
      }
      setForm((prev) => ({
        ...prev,
        logoUploadedUrl: uploaded?.url || '',
        logoUploadStatus: 'uploaded',
      }));
    } catch (err) {
      setForm((prev) => ({
        ...prev,
        logoUploadError: err instanceof Error ? err.message : 'Upload failed',
        logoUploadStatus: 'error',
      }));
    }
  };

  const current = useMemo(() => clampStep(step ?? '1'), [step]);
  if (!step) return <Navigate to="/institutes/create/1" replace />;

  const activeIndex = current - 1;

  const goNext = () => navigate(`/institutes/create/${Math.min(4, current + 1)}`);
  const goPrev = () => navigate(`/institutes/create/${Math.max(1, current - 1)}`);
  const saveDraftAndExit = () => navigate('/institutes');

  return (
    <div>
      <div className="pageTitle">Create Institute</div>

      <Stepper steps={steps} activeIndex={activeIndex} />

      <div className="card cardPad">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={onLogoChange}
        />

        {current === 1 ? (
          <>
            <div className="sectionTitle">Basic Details</div>
            <div className="formGrid2" style={{ marginTop: 12 }}>
              <div className="field">
                <div className="label">Name of Institute*</div>
                <input className="input" value={form.name} onChange={setField('name')} />
              </div>
              <div className="field">
                <div className="label">Institute Type</div>
                <select className="select" value={form.type} onChange={setField('type')}>
                  <option value=""> </option>
                  <option value="private">Private</option>
                  <option value="public">Public</option>
                </select>
              </div>
              <div className="field">
                <div className="label">Trademark*</div>
                <input className="input" value={form.trademark} onChange={setField('trademark')} />
              </div>
              <div className="field">
                <div className="label">GST*</div>
                <input className="input" value={form.gst} onChange={setField('gst')} />
              </div>
              <div className="field">
                <div className="label">Contact Number*</div>
                <input className="input" value={form.contact} onChange={setField('contact')} />
              </div>
              <div className="field">
                <div className="label">Email</div>
                <input className="input" value={form.email} onChange={setField('email')} />
              </div>
              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <div className="label">Company logo*</div>
                <div className="fileRow">
                  <div className="fileMeta">
                    {form.logoFileName ? form.logoFileName : 'No file uploaded'}
                    {form.logoUploadStatus === 'uploading' ? ' (uploading...)' : null}
                    {form.logoUploadStatus === 'skipped' ? ' (saved locally)' : null}
                    {form.logoUploadStatus === 'uploaded' ? ' (uploaded)' : null}
                    {form.logoUploadStatus === 'error' ? ' (upload failed)' : null}
                  </div>
                  {form.logoFileName ? (
                    <button className="btn btnSmall" type="button" onClick={removeLogo}>
                      Remove
                    </button>
                  ) : null}
                  <button className="btn btnSmall btnIcon" type="button" onClick={onPickLogo}>
                    Upload file <IconUpload size={16} />
                  </button>
                </div>
                {form.logoUploadError ? (
                  <div className="subTitle" style={{ marginTop: 8, color: '#b42318' }}>
                    {form.logoUploadError}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="footerActions">
              <button className="btn" type="button" onClick={saveDraftAndExit}>
                Save as draft
              </button>
              <button className="btn" type="button" onClick={clearDraft}>
                Clear saved draft
              </button>
              <button className="btn btnAccent" type="button" onClick={goNext}>
                Save and Proceed
              </button>
            </div>
          </>
        ) : null}

        {current === 2 ? (
          <>
            <div className="sectionTitle">Institute Administration Details</div>
            <div className="formGrid2" style={{ marginTop: 12 }}>
              <div className="field">
                <div className="label">Name</div>
                <input className="input" value={form.adminName} onChange={setField('adminName')} />
              </div>
              <div className="field">
                <div className="label">Contact No.</div>
                <input
                  className="input"
                  value={form.adminContact}
                  onChange={setField('adminContact')}
                />
              </div>
              <div className="field">
                <div className="label">Email ID</div>
                <input className="input" value={form.adminEmail} onChange={setField('adminEmail')} />
              </div>
              <div />
            </div>

            <div className="footerActions">
              <button className="btn" type="button" onClick={saveDraftAndExit}>
                Save as draft
              </button>
              <button className="btn" type="button" onClick={clearDraft}>
                Clear saved draft
              </button>
              <button className="btn" type="button" onClick={goPrev}>
                Back
              </button>
              <button className="btn btnAccent" type="button" onClick={goNext}>
                Save and Proceed
              </button>
            </div>
          </>
        ) : null}

        {current === 3 ? (
          <>
            <div className="sectionTitle">Permissions</div>
            <div className="subTitle"> </div>
            <div style={{ height: 220 }} />

            <div className="footerActions">
              <button className="btn" type="button" onClick={saveDraftAndExit}>
                Save as draft
              </button>
              <button className="btn" type="button" onClick={clearDraft}>
                Clear saved draft
              </button>
              <button className="btn" type="button" onClick={goPrev}>
                Back
              </button>
              <button className="btn btnAccent" type="button" onClick={goNext}>
                Save and Proceed
              </button>
            </div>
          </>
        ) : null}

        {current === 4 ? (
          <>
            <div className="sectionTitle">Basic Details</div>
            <div className="formGrid2" style={{ marginTop: 12 }}>
              <div className="field">
                <div className="label">Name of Institute*</div>
                <input className="input" value={form.name} onChange={setField('name')} />
              </div>
              <div className="field">
                <div className="label">Institute Type</div>
                <select className="select" value={form.type} onChange={setField('type')}>
                  <option value=""> </option>
                  <option value="private">Private</option>
                  <option value="public">Public</option>
                </select>
              </div>
              <div className="field">
                <div className="label">Trademark*</div>
                <input className="input" value={form.trademark} onChange={setField('trademark')} />
              </div>
              <div className="field">
                <div className="label">GST*</div>
                <input className="input" value={form.gst} onChange={setField('gst')} />
              </div>
              <div className="field">
                <div className="label">Contact Number*</div>
                <input className="input" value={form.contact} onChange={setField('contact')} />
              </div>
              <div className="field">
                <div className="label">Email</div>
                <input className="input" value={form.email} onChange={setField('email')} />
              </div>
              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <div className="label">Company logo*</div>
                <div className="fileRow">
                  <div className="fileMeta">
                    {form.logoFileName ? form.logoFileName : 'No file uploaded'}
                    {form.logoUploadStatus === 'uploading' ? ' (uploading...)' : null}
                    {form.logoUploadStatus === 'skipped' ? ' (saved locally)' : null}
                    {form.logoUploadStatus === 'uploaded' ? ' (uploaded)' : null}
                    {form.logoUploadStatus === 'error' ? ' (upload failed)' : null}
                  </div>
                  {form.logoFileName ? (
                    <button className="btn btnSmall" type="button" onClick={removeLogo}>
                      Remove
                    </button>
                  ) : null}
                  <button className="btn btnSmall btnIcon" type="button" onClick={onPickLogo}>
                    Upload file <IconUpload size={16} />
                  </button>
                </div>
                {form.logoUploadError ? (
                  <div className="subTitle" style={{ marginTop: 8, color: '#b42318' }}>
                    {form.logoUploadError}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="sectionTitle" style={{ marginTop: 18 }}>
              Institute Administration Details
            </div>
            <div className="formGrid2" style={{ marginTop: 12 }}>
              <div className="field">
                <div className="label">Name</div>
                <input className="input" value={form.adminName} onChange={setField('adminName')} />
              </div>
              <div className="field">
                <div className="label">Contact No.</div>
                <input
                  className="input"
                  value={form.adminContact}
                  onChange={setField('adminContact')}
                />
              </div>
              <div className="field">
                <div className="label">Email ID</div>
                <input className="input" value={form.adminEmail} onChange={setField('adminEmail')} />
              </div>
              <div />
            </div>

            <div className="sectionTitle" style={{ marginTop: 18 }}>
              Permissions
            </div>
            <div style={{ height: 140 }} />

            <div className="footerActions">
              <button className="btn" type="button" onClick={saveDraftAndExit}>
                Save as draft
              </button>
              <button className="btn" type="button" onClick={clearDraft}>
                Clear saved draft
              </button>
              <button className="btn" type="button" onClick={goPrev}>
                Back
              </button>
              <button className="btn btnAccent" type="button" onClick={() => navigate('/institutes')}>
                Save and Proceed
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
