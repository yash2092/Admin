import React, { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

import Stepper from '../ui/Stepper';
import { IconUpload } from '../ui/Icons';
import {
  loadList,
  makeId,
  saveList,
  storageKey,
  upsertById,
  withTimestamps,
} from '../utils/storage';
import { validateInstitute } from '../utils/validators';

import '../styles/admin/ui/Cards.css';
import '../styles/admin/ui/Forms.css';
import '../styles/admin/ui/Buttons.css';
import '../styles/admin/pages/CreateInstitute.css';

/**
 * This page handles BOTH:
 * - Creating a new institute
 * - Editing an existing institute
 *
 * WHY a single page:
 * - The UI is a multi-step wizard.
 * - Using one component reduces duplication between create/edit flows.
 */

const INSTITUTES_STORAGE_KEY = storageKey('institutes');

const INSTITUTE_STEPS = [
  { key: '1', label: 'Basic\nDetails' },
  { key: '2', label: 'Institute Administration\nDetails' },
  { key: '3', label: 'Permissions' },
  { key: '4', label: 'Preview' },
];

const FIRST_STEP_NUMBER = 1;
const LAST_STEP_NUMBER = 4;

function getClampedInstituteStepNumber(stepParam) {
  const parsed = Number(stepParam);

  if (!Number.isFinite(parsed)) {
    return FIRST_STEP_NUMBER;
  }

  if (parsed < FIRST_STEP_NUMBER) {
    return FIRST_STEP_NUMBER;
  }

  if (parsed > LAST_STEP_NUMBER) {
    return LAST_STEP_NUMBER;
  }

  return parsed;
}

function createEmptyInstituteForm() {
  return {
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
  };
}

export default function CreateInstitute() {
  const navigate = useNavigate();
  const params = useParams();

  const stepParam = params.step;
  const routeInstituteId = params.id;

  const [form, setForm] = useState(createEmptyInstituteForm);
  const [errors, setErrors] = useState({});

  const currentStepNumber = useMemo(() => {
    const fallbackStep = String(FIRST_STEP_NUMBER);
    const stepValue = stepParam == null ? fallbackStep : stepParam;
    return getClampedInstituteStepNumber(stepValue);
  }, [stepParam]);

  const shouldRedirectToStepOne = stepParam == null;
  const redirectTo = routeInstituteId
    ? `/institutes/${routeInstituteId}/edit/1`
    : '/institutes/create/1';

  const activeStepIndex = currentStepNumber - 1;

  // When creating a new record, `routeInstituteId` is undefined until the first save.
  // We still track the id in state so later saves update the same record.
  const effectiveInstituteId = routeInstituteId || form.id;

  useEffect(() => {
    // If there is no id in the URL, this is a create flow.
    if (!routeInstituteId) {
      return;
    }

    // Load the existing record so the form fields are populated for editing.
    const institutes = loadList(INSTITUTES_STORAGE_KEY);
    const existingInstitute = institutes.find((institute) => institute.id === routeInstituteId);

    if (!existingInstitute) {
      // If the record cannot be found, we keep the empty form.
      // (In a real app we'd show a 404 or error state.)
      return;
    }

    // Merge to preserve any local defaults that might not exist in old stored data.
    setForm((previousForm) => {
      return {
        ...previousForm,
        ...existingInstitute,
      };
    });
  }, [routeInstituteId]);

  function clearErrorForField(fieldName) {
    setErrors((previousErrors) => {
      const hasError = Boolean(previousErrors && previousErrors[fieldName]);
      if (!hasError) {
        return previousErrors;
      }

      const nextErrors = { ...previousErrors };
      delete nextErrors[fieldName];
      return nextErrors;
    });
  }

  function setFieldValue(fieldName, nextValue) {
    setForm((previousForm) => {
      return {
        ...previousForm,
        [fieldName]: nextValue,
      };
    });

    // WHY:
    // - As the user fixes a field, we remove the old error message.
    // - This keeps feedback timely and reduces visual noise.
    clearErrorForField(fieldName);
  }

  // Field handlers are intentionally explicit.
  // WHY:
  // - It avoids hiding logic inside inline anonymous functions.
  // - It makes each input easier to search for and debug.
  function handleInstituteNameChange(event) {
    setFieldValue('name', event.target.value);
  }

  function handleInstituteTypeChange(event) {
    setFieldValue('type', event.target.value);
  }

  function handleTrademarkChange(event) {
    setFieldValue('trademark', event.target.value);
  }

  function handleGstChange(event) {
    const raw = event.target.value;
    const uppercased = String(raw).toUpperCase();
    setFieldValue('gst', uppercased);
  }

  function handleContactChange(event) {
    setFieldValue('contact', event.target.value);
  }

  function handleEmailChange(event) {
    setFieldValue('email', event.target.value);
  }

  function handleAdminNameChange(event) {
    setFieldValue('adminName', event.target.value);
  }

  function handleAdminContactChange(event) {
    setFieldValue('adminContact', event.target.value);
  }

  function handleAdminEmailChange(event) {
    setFieldValue('adminEmail', event.target.value);
  }

  function validateStep(stepNumber) {
    const stepErrors = validateInstitute(form, stepNumber);
    setErrors(stepErrors);

    const errorCount = Object.keys(stepErrors).length;
    return errorCount === 0;
  }

  function saveInstituteToStorage(options) {
    const nextStatus = options && options.status ? options.status : form.status || 'draft';

    const institutes = loadList(INSTITUTES_STORAGE_KEY);

    const existingInstitute = effectiveInstituteId
      ? institutes.find((institute) => institute.id === effectiveInstituteId)
      : undefined;

    const isNew = !existingInstitute;

    const nextId = existingInstitute && existingInstitute.id
      ? existingInstitute.id
      : effectiveInstituteId || makeId('inst');

    const createdBy = existingInstitute && existingInstitute.createdBy
      ? existingInstitute.createdBy
      : 'ADMIN USER';

    const nextInstituteRecord = withTimestamps(
      existingInstitute,
      {
        ...form,
        id: nextId,
        status: nextStatus,
        createdBy,
      },
      { isNew }
    );

    const nextList = upsertById(institutes, nextInstituteRecord);
    saveList(INSTITUTES_STORAGE_KEY, nextList);

    // Keep local state in sync with what we saved.
    setForm((previousForm) => {
      return {
        ...previousForm,
        id: nextId,
        status: nextInstituteRecord.status,
      };
    });

    return nextInstituteRecord;
  }

  function goToInstitutesList() {
    navigate('/institutes');
  }

  function goToEditStep(instituteId, stepNumber, options) {
    const safeStep = getClampedInstituteStepNumber(stepNumber);
    const shouldReplaceHistory = Boolean(options && options.replace);

    navigate(`/institutes/${instituteId}/edit/${safeStep}`, { replace: shouldReplaceHistory });
  }

  function handleStep1SaveDraftAndExit() {
    saveInstituteToStorage({ status: 'draft' });
    goToInstitutesList();
  }

  function handleStep1SaveAndProceed() {
    const isValid = validateStep(1);
    if (!isValid) {
      return;
    }

    const saved = saveInstituteToStorage({ status: 'draft' });

    // WHY replace:
    // - After the first save we now have an id.
    // - Replacing avoids leaving a "create" URL in the back-button history.
    goToEditStep(saved.id, Math.min(LAST_STEP_NUMBER, currentStepNumber + 1), { replace: true });
  }

  function handleStep2Back() {
    const saved = saveInstituteToStorage({ status: 'draft' });
    goToEditStep(saved.id, Math.max(FIRST_STEP_NUMBER, currentStepNumber - 1));
  }

  function handleStep2SaveAndProceed() {
    const isValid = validateStep(2);
    if (!isValid) {
      return;
    }

    const saved = saveInstituteToStorage({ status: 'draft' });
    goToEditStep(saved.id, Math.min(LAST_STEP_NUMBER, currentStepNumber + 1));
  }

  function handleStep3Back() {
    const saved = saveInstituteToStorage({ status: 'draft' });
    goToEditStep(saved.id, Math.max(FIRST_STEP_NUMBER, currentStepNumber - 1));
  }

  function handleStep3SaveAndProceed() {
    const saved = saveInstituteToStorage({ status: 'draft' });
    goToEditStep(saved.id, Math.min(LAST_STEP_NUMBER, currentStepNumber + 1));
  }

  function handleStep4SaveDraftAndExit() {
    saveInstituteToStorage({ status: 'draft' });
    goToInstitutesList();
  }

  function handleStep4SaveAndProceed() {
    // Final submit validates all steps.
    const allErrors = validateInstitute(form, null);
    setErrors(allErrors);

    const errorCount = Object.keys(allErrors).length;
    if (errorCount > 0) {
      return;
    }

    saveInstituteToStorage({ status: 'active' });
    goToInstitutesList();
  }

  if (shouldRedirectToStepOne) {
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <div>
      <div className="pageTitle">{routeInstituteId ? 'Edit Institute' : 'Create Institute'}</div>

      <Stepper steps={INSTITUTE_STEPS} activeIndex={activeStepIndex} />

      <div className="card cardPad">
        {currentStepNumber === 1 ? (
          <>
            <div className="sectionTitle">Basic Details</div>
            <div className="formGrid2 createInstituteGrid">
              <div className="field">
                <div className="label">Name of Institute*</div>
                <input
                  className={errors.name ? 'input inputError' : 'input'}
                  value={form.name}
                  onChange={handleInstituteNameChange}
                />
                {errors.name ? <div className="errorText">{errors.name}</div> : null}
              </div>
              <div className="field">
                <div className="label">Institute Type</div>
                <select
                  className="select"
                  value={form.type}
                  onChange={handleInstituteTypeChange}
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
                  onChange={handleTrademarkChange}
                />
                {errors.trademark ? <div className="errorText">{errors.trademark}</div> : null}
              </div>
              <div className="field">
                <div className="label">GST*</div>
                <input
                  className={errors.gst ? 'input inputError' : 'input'}
                  value={form.gst}
                  onChange={handleGstChange}
                  placeholder="15 character GSTIN"
                />
                {errors.gst ? <div className="errorText">{errors.gst}</div> : null}
              </div>
              <div className="field">
                <div className="label">Contact Number*</div>
                <input
                  className={errors.contact ? 'input inputError' : 'input'}
                  value={form.contact}
                  onChange={handleContactChange}
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
                  onChange={handleEmailChange}
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
              <button className="btn" type="button" onClick={handleStep1SaveDraftAndExit}>
                Save as draft
              </button>
              <button className="btn btnAccent" type="button" onClick={handleStep1SaveAndProceed}>
                Save and Proceed
              </button>
            </div>
          </>
        ) : null}

        {currentStepNumber === 2 ? (
          <>
            <div className="sectionTitle">Institute Administration Details</div>
            <div className="formGrid2 createInstituteGrid">
              <div className="field">
                <div className="label">Name</div>
                <input
                  className={errors.adminName ? 'input inputError' : 'input'}
                  value={form.adminName}
                  onChange={handleAdminNameChange}
                />
                {errors.adminName ? <div className="errorText">{errors.adminName}</div> : null}
              </div>
              <div className="field">
                <div className="label">Contact No.</div>
                <input
                  className={errors.adminContact ? 'input inputError' : 'input'}
                  value={form.adminContact}
                  onChange={handleAdminContactChange}
                  inputMode="tel"
                />
                {errors.adminContact ? <div className="errorText">{errors.adminContact}</div> : null}
              </div>
              <div className="field">
                <div className="label">Email ID</div>
                <input
                  className={errors.adminEmail ? 'input inputError' : 'input'}
                  value={form.adminEmail}
                  onChange={handleAdminEmailChange}
                  type="email"
                />
                {errors.adminEmail ? <div className="errorText">{errors.adminEmail}</div> : null}
              </div>
              <div />
            </div>

            <div className="footerActions">
              <button className="btn" type="button" onClick={handleStep2Back}>
                Back
              </button>
              <button className="btn btnAccent" type="button" onClick={handleStep2SaveAndProceed}>
                Save and Proceed
              </button>
            </div>
          </>
        ) : null}

        {currentStepNumber === 3 ? (
          <>
            <div className="sectionTitle">Permissions</div>
            <div className="subTitle"> </div>
            <div className="createInstituteSpacer220" />

            <div className="footerActions">
              <button className="btn" type="button" onClick={handleStep3Back}>
                Back
              </button>
              <button className="btn btnAccent" type="button" onClick={handleStep3SaveAndProceed}>
                Save and Proceed
              </button>
            </div>
          </>
        ) : null}

        {currentStepNumber === 4 ? (
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

            <div className="sectionTitle createInstituteSectionTop">Institute Administration Details</div>
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

            <div className="sectionTitle createInstituteSectionTop">Permissions</div>
            <div className="createInstituteSpacer140" />

            <div className="footerActions">
              <button className="btn" type="button" onClick={handleStep4SaveDraftAndExit}>
                Save as draft
              </button>
              <button className="btn btnAccent" type="button" onClick={handleStep4SaveAndProceed}>
                Save and Proceed
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
