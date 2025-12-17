import React, { useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import Stepper from '../components/ui/Stepper';
import { IconUpload } from '../components/ui/Icons';

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
  const { step } = useParams();

  // Keep the form local (mock-only) but stable per render.
  const [form] = useState(() => ({
    name: '',
    type: '',
    trademark: '',
    gst: '',
    contact: '',
    email: '',
    adminName: '',
    adminContact: '',
    adminEmail: '',
  }));

  const current = useMemo(() => clampStep(step ?? '1'), [step]);
  if (!step) return <Navigate to="/institutes/create/1" replace />;

  const activeIndex = current - 1;

  const goNext = () => navigate(`/institutes/create/${Math.min(4, current + 1)}`);
  const goPrev = () => navigate(`/institutes/create/${Math.max(1, current - 1)}`);

  return (
    <div>
      <div className="pageTitle">Create Institute</div>

      <Stepper steps={steps} activeIndex={activeIndex} />

      <div className="card cardPad">
        {current === 1 ? (
          <>
            <div className="sectionTitle">Basic Details</div>
            <div className="formGrid2" style={{ marginTop: 12 }}>
              <div className="field">
                <div className="label">Name of Institute*</div>
                <input className="input" defaultValue={form.name} />
              </div>
              <div className="field">
                <div className="label">Institute Type</div>
                <select className="select" defaultValue={form.type}>
                  <option value=""> </option>
                  <option value="private">Private</option>
                  <option value="public">Public</option>
                </select>
              </div>
              <div className="field">
                <div className="label">Trademark*</div>
                <input className="input" defaultValue={form.trademark} />
              </div>
              <div className="field">
                <div className="label">GST*</div>
                <input className="input" defaultValue={form.gst} />
              </div>
              <div className="field">
                <div className="label">Contact Number*</div>
                <input className="input" defaultValue={form.contact} />
              </div>
              <div className="field">
                <div className="label">Email</div>
                <input className="input" defaultValue={form.email} />
              </div>
              <div className="field" style={{ gridColumn: '1 / -1' }}>
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
              <button className="btn" type="button">
                Save as draft
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
                <input className="input" defaultValue={form.adminName} />
              </div>
              <div className="field">
                <div className="label">Contact No.</div>
                <input className="input" defaultValue={form.adminContact} />
              </div>
              <div className="field">
                <div className="label">Email ID</div>
                <input className="input" defaultValue={form.adminEmail} />
              </div>
              <div />
            </div>

            <div className="footerActions">
              <button className="btn" type="button" onClick={goPrev}>
                Save as draft
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
              <button className="btn" type="button" onClick={goPrev}>
                Save as draft
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
                <input className="input" defaultValue={form.name} />
              </div>
              <div className="field">
                <div className="label">Institute Type</div>
                <select className="select" defaultValue={form.type}>
                  <option value=""> </option>
                  <option value="private">Private</option>
                  <option value="public">Public</option>
                </select>
              </div>
              <div className="field">
                <div className="label">Trademark*</div>
                <input className="input" defaultValue={form.trademark} />
              </div>
              <div className="field">
                <div className="label">GST*</div>
                <input className="input" defaultValue={form.gst} />
              </div>
              <div className="field">
                <div className="label">Contact Number*</div>
                <input className="input" defaultValue={form.contact} />
              </div>
              <div className="field">
                <div className="label">Email</div>
                <input className="input" defaultValue={form.email} />
              </div>
              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <div className="label">Company logo*</div>
                <div className="fileRow">
                  <div className="fileMeta">No file uploaded</div>
                  <button className="btn btnSmall btnIcon" type="button">
                    Upload file <IconUpload size={16} />
                  </button>
                </div>
              </div>
            </div>

            <div className="sectionTitle" style={{ marginTop: 18 }}>
              Institute Administration Details
            </div>
            <div className="formGrid2" style={{ marginTop: 12 }}>
              <div className="field">
                <div className="label">Name</div>
                <input className="input" defaultValue={form.adminName} />
              </div>
              <div className="field">
                <div className="label">Contact No.</div>
                <input className="input" defaultValue={form.adminContact} />
              </div>
              <div className="field">
                <div className="label">Email ID</div>
                <input className="input" defaultValue={form.adminEmail} />
              </div>
              <div />
            </div>

            <div className="sectionTitle" style={{ marginTop: 18 }}>
              Permissions
            </div>
            <div style={{ height: 140 }} />

            <div className="footerActions">
              <button className="btn" type="button" onClick={() => navigate('/institutes')}>
                Save as draft
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
