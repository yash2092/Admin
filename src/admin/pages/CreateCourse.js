import React, { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

import Stepper from '../ui/Stepper';
import {
  IconChevronDown,
  IconChevronRight,
  IconPlus,
  IconTrash,
  IconUpload,
} from '../ui/Icons';
import {
  loadList,
  makeId,
  saveList,
  storageKey,
  upsertById,
  withTimestamps,
} from '../utils/storage';
import { validateCourse, wordCount } from '../utils/validators';

import '../styles/admin/ui/Cards.css';
import '../styles/admin/ui/Forms.css';
import '../styles/admin/ui/Buttons.css';
import '../styles/admin/pages/CreateCourse.css';

/**
 * This page handles BOTH:
 * - Creating a new course
 * - Editing an existing course
 *
 * WHY a single page:
 * - The user flow is a multi-step wizard.
 * - Create/edit share the same fields and validation.
 */

const COURSES_STORAGE_KEY = storageKey('courses');

const COURSE_STEPS = [
  { key: '1', label: 'Course Details' },
  { key: '2', label: 'Course Material' },
];

const FIRST_STEP_NUMBER = 1;
const LAST_STEP_NUMBER = 2;

function getClampedCourseStepNumber(stepParam) {
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

function createEmptyModule() {
  return {
    title: '',
    videoTitle: '',
    videoFileName: '',
    studyTitle: '',
    studyFileName: '',
    expanded: true,
  };
}

function createEmptyCourseForm() {
  return {
    id: '',
    name: '',
    category: '',
    teacher: '',
    description: '',
    demoVideoName: '',
    modules: [createEmptyModule()],
    status: 'draft',
  };
}

function clickElementById(elementId) {
  const element = document.getElementById(elementId);

  // If the element isn't present yet, do nothing.
  if (!element) {
    return;
  }

  element.click();
}

function getFirstSelectedFileName(fileInputEvent) {
  const input = fileInputEvent.target;
  const files = input.files;

  if (!files || files.length === 0) {
    return '';
  }

  const firstFile = files[0];
  return firstFile ? firstFile.name : '';
}

export default function CreateCourse() {
  const navigate = useNavigate();
  const params = useParams();

  const stepParam = params.step;
  const routeCourseId = params.id;

  const currentStepNumber = useMemo(() => {
    const fallbackStep = String(FIRST_STEP_NUMBER);
    const stepValue = stepParam == null ? fallbackStep : stepParam;
    return getClampedCourseStepNumber(stepValue);
  }, [stepParam]);

  const shouldRedirectToStepOne = stepParam == null;
  const redirectTo = routeCourseId ? `/courses/${routeCourseId}/edit/1` : '/courses/create/1';

  const [errors, setErrors] = useState({});
  const [form, setForm] = useState(createEmptyCourseForm);

  // When creating a new record, `routeCourseId` is undefined until the first save.
  // We track the id in state so later saves update the same course.
  const effectiveCourseId = routeCourseId || form.id;

  useEffect(() => {
    if (!routeCourseId) {
      return;
    }

    const courses = loadList(COURSES_STORAGE_KEY);
    const existingCourse = courses.find((course) => course.id === routeCourseId);

    if (!existingCourse) {
      return;
    }

    setForm((previousForm) => {
      return {
        ...previousForm,
        ...existingCourse,
      };
    });
  }, [routeCourseId]);

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

    clearErrorForField(fieldName);
  }

  function setModuleValue(moduleIndex, patch) {
    setForm((previousForm) => {
      const previousModules = Array.isArray(previousForm.modules) ? previousForm.modules : [];

      const nextModules = previousModules.map((moduleItem, index) => {
        if (index !== moduleIndex) {
          return moduleItem;
        }

        return {
          ...moduleItem,
          ...patch,
        };
      });

      return {
        ...previousForm,
        modules: nextModules,
      };
    });
  }

  function addModule() {
    setForm((previousForm) => {
      const previousModules = Array.isArray(previousForm.modules) ? previousForm.modules : [];
      const nextModules = [...previousModules, createEmptyModule()];

      return {
        ...previousForm,
        modules: nextModules,
      };
    });
  }

  function deleteModule(moduleIndex) {
    setForm((previousForm) => {
      const previousModules = Array.isArray(previousForm.modules) ? previousForm.modules : [];
      const nextModules = previousModules.filter((_, index) => index !== moduleIndex);

      return {
        ...previousForm,
        modules: nextModules,
      };
    });
  }

  function toggleModuleExpanded(moduleIndex) {
    const moduleItem = form.modules[moduleIndex];
    const isExpanded = Boolean(moduleItem && moduleItem.expanded);

    setModuleValue(moduleIndex, { expanded: !isExpanded });
  }

  function validateStep(stepNumber) {
    const stepErrors = validateCourse(form, stepNumber);
    setErrors(stepErrors);

    const errorCount = Object.keys(stepErrors).length;
    return errorCount === 0;
  }

  function saveCourseToStorage(options) {
    const nextStatus = options && options.status ? options.status : form.status || 'draft';

    const courses = loadList(COURSES_STORAGE_KEY);

    const existingCourse = effectiveCourseId
      ? courses.find((course) => course.id === effectiveCourseId)
      : undefined;

    const isNew = !existingCourse;

    const nextId = existingCourse && existingCourse.id
      ? existingCourse.id
      : effectiveCourseId || makeId('course');

    const createdBy = existingCourse && existingCourse.createdBy
      ? existingCourse.createdBy
      : 'ADMIN USER';

    const nextCourseRecord = withTimestamps(
      existingCourse,
      {
        ...form,
        id: nextId,
        status: nextStatus,
        createdBy,
      },
      { isNew }
    );

    const nextList = upsertById(courses, nextCourseRecord);
    saveList(COURSES_STORAGE_KEY, nextList);

    setForm((previousForm) => {
      return {
        ...previousForm,
        id: nextId,
        status: nextCourseRecord.status,
      };
    });

    return nextCourseRecord;
  }

  function goToCoursesList() {
    navigate('/courses');
  }

  function goToEditStep(courseId, stepNumber, options) {
    const safeStep = getClampedCourseStepNumber(stepNumber);
    const shouldReplaceHistory = Boolean(options && options.replace);

    navigate(`/courses/${courseId}/edit/${safeStep}`, { replace: shouldReplaceHistory });
  }

  // Step 1 handlers
  function handleCourseNameChange(event) {
    setFieldValue('name', event.target.value);
  }

  function handleCourseCategoryChange(event) {
    setFieldValue('category', event.target.value);
  }

  function handleTeacherNameChange(event) {
    setFieldValue('teacher', event.target.value);
  }

  function handleDescriptionChange(event) {
    setFieldValue('description', event.target.value);
  }

  function handleDemoVideoUploadClick() {
    clickElementById('demoVideoInput');
  }

  function handleDemoVideoFileChange(event) {
    const fileName = getFirstSelectedFileName(event);
    setFieldValue('demoVideoName', fileName);
  }

  function handleStep1SaveDraftAndExit() {
    saveCourseToStorage({ status: 'draft' });
    goToCoursesList();
  }

  function handleStep1SaveAndProceed() {
    const isValid = validateStep(1);
    if (!isValid) {
      return;
    }

    const saved = saveCourseToStorage({ status: 'draft' });

    // Replace so we don't leave a "create" URL in history after the first save.
    goToEditStep(saved.id, Math.min(LAST_STEP_NUMBER, currentStepNumber + 1), { replace: true });
  }

  // Step 2 handlers
  function handleStep2Back() {
    const saved = saveCourseToStorage({ status: 'draft' });
    goToEditStep(saved.id, Math.max(FIRST_STEP_NUMBER, currentStepNumber - 1));
  }

  function handleStep2SaveAndProceed() {
    const isValid = validateStep(2);
    if (!isValid) {
      return;
    }

    saveCourseToStorage({ status: 'active' });
    goToCoursesList();
  }

  function handleModuleTitleChange(moduleIndex, event) {
    const nextTitle = event.target.value;
    setModuleValue(moduleIndex, { title: nextTitle });
  }

  function handleModuleVideoTitleChange(moduleIndex, event) {
    const nextTitle = event.target.value;
    setModuleValue(moduleIndex, { videoTitle: nextTitle });
  }

  function handleModuleStudyTitleChange(moduleIndex, event) {
    const nextTitle = event.target.value;
    setModuleValue(moduleIndex, { studyTitle: nextTitle });
  }

  function handleModuleVideoUploadClick(moduleIndex) {
    clickElementById(`moduleVideo-${moduleIndex}`);
  }

  function handleModuleStudyUploadClick(moduleIndex) {
    clickElementById(`moduleStudy-${moduleIndex}`);
  }

  function handleModuleVideoFileChange(moduleIndex, event) {
    const fileName = getFirstSelectedFileName(event);
    setModuleValue(moduleIndex, { videoFileName: fileName });
  }

  function handleModuleStudyFileChange(moduleIndex, event) {
    const fileName = getFirstSelectedFileName(event);
    setModuleValue(moduleIndex, { studyFileName: fileName });
  }

  if (shouldRedirectToStepOne) {
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <div>
      <div className="pageTitle">{routeCourseId ? 'Edit Course' : 'Create Course'}</div>

      <Stepper steps={COURSE_STEPS} activeIndex={currentStepNumber - 1} />

      {currentStepNumber === 1 ? (
        <div className="card cardPad">
          <div className="formGrid2 createCourseGrid">
            <div className="field createCourseFieldFull">
              <div className="label">Name of the Course</div>
              <input
                className={errors.name ? 'input inputError' : 'input'}
                value={form.name}
                onChange={handleCourseNameChange}
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
                  onClick={handleDemoVideoUploadClick}
                >
                  Upload file <IconUpload size={16} />
                </button>
                <input
                  id="demoVideoInput"
                  type="file"
                  accept="video/*"
                  className="hiddenFileInput"
                  onChange={handleDemoVideoFileChange}
                />
              </div>
              <div className="helper">Allowed Formats: .mp4, .mov, .avi, .mkv</div>
            </div>

            <div className="field">
              <div className="label">Course category</div>
              <select
                className={errors.category ? 'select inputError' : 'select'}
                value={form.category}
                onChange={handleCourseCategoryChange}
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
                onChange={handleTeacherNameChange}
              />
              {errors.teacher ? <div className="errorText">{errors.teacher}</div> : null}
            </div>

            <div className="field createCourseFieldFull">
              <div className="label">Subject description</div>
              <textarea
                className={errors.description ? 'textarea inputError' : 'textarea'}
                value={form.description}
                onChange={handleDescriptionChange}
              />
              {errors.description ? <div className="errorText">{errors.description}</div> : null}
              <div className="createCourseWordCount">Word limit {wordCount(form.description)} / 500</div>
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
        </div>
      ) : null}

      {currentStepNumber === 2 ? (
        <div className="card cardPad">
          <div className="createCourseNameHeader">{form.name || 'Course'}</div>

          {errors.modules ? <div className="errorText createCourseModulesError">{errors.modules}</div> : null}

          {form.modules.map((moduleItem, index) => {
            const isExpanded = Boolean(moduleItem.expanded);
            const moduleTitle = moduleItem.title || `Module ${index + 1}`;
            const moduleTitleErrorKey = `modules.${index}.title`;
            const moduleTitleError = errors[moduleTitleErrorKey];

            const canDeleteModule = form.modules.length > 1;

            return (
              <div className="card createCourseModuleCard" key={`module-${index}`}>
                <div className="moduleCard">
                  <div className="moduleHeader">
                    <div className="moduleHeaderLeft">
                      <span className="moduleBadge">{index + 1}</span>
                      <div className="moduleTitle">{moduleTitle}</div>
                    </div>

                    <div className="actions createCourseModuleActions">
                      <button
                        className="iconBtn"
                        aria-label={isExpanded ? 'Collapse' : 'Expand'}
                        onClick={() => toggleModuleExpanded(index)}
                        type="button"
                      >
                        {isExpanded ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
                      </button>
                      <button
                        className="iconBtn"
                        aria-label="Delete module"
                        type="button"
                        onClick={() => deleteModule(index)}
                        disabled={!canDeleteModule}
                        title={
                          !canDeleteModule
                            ? 'At least one module is required'
                            : 'Delete module'
                        }
                      >
                        <IconTrash size={16} />
                      </button>
                    </div>
                  </div>

                  {isExpanded ? (
                    <div>
                      <div className="formGrid2 createCourseModuleGrid">
                        <div className="field createCourseFieldFull">
                          <div className="label">Module Title</div>
                          <input
                            className={moduleTitleError ? 'input inputError' : 'input'}
                            value={moduleItem.title}
                            onChange={(event) => handleModuleTitleChange(index, event)}
                          />
                          {moduleTitleError ? <div className="errorText">{moduleTitleError}</div> : null}
                        </div>

                        <div className="field createCourseFieldFull">
                          <div className="label">Video Title</div>
                          <div className="fileRow">
                            <input
                              className="input fileRowInlineInput"
                              value={moduleItem.videoTitle}
                              onChange={(event) => handleModuleVideoTitleChange(index, event)}
                            />
                            <button
                              className="btn btnSmall"
                              type="button"
                              onClick={() => handleModuleVideoUploadClick(index)}
                            >
                              Upload file
                            </button>
                            <input
                              id={`moduleVideo-${index}`}
                              type="file"
                              accept="video/*"
                              className="hiddenFileInput"
                              onChange={(event) => handleModuleVideoFileChange(index, event)}
                            />
                          </div>
                          {moduleItem.videoFileName ? (
                            <div className="helper createCourseFileName">{moduleItem.videoFileName}</div>
                          ) : null}
                        </div>

                        <div className="field createCourseFieldFull">
                          <div className="label">Study Material Title</div>
                          <div className="fileRow">
                            <input
                              className="input fileRowInlineInput"
                              value={moduleItem.studyTitle}
                              onChange={(event) => handleModuleStudyTitleChange(index, event)}
                            />
                            <button
                              className="btn btnSmall"
                              type="button"
                              onClick={() => handleModuleStudyUploadClick(index)}
                            >
                              Upload file
                            </button>
                            <input
                              id={`moduleStudy-${index}`}
                              type="file"
                              className="hiddenFileInput"
                              onChange={(event) => handleModuleStudyFileChange(index, event)}
                            />
                          </div>
                          {moduleItem.studyFileName ? (
                            <div className="helper createCourseFileName">{moduleItem.studyFileName}</div>
                          ) : null}
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
            );
          })}

          <button className="btn btnDark btnIcon" type="button" onClick={addModule}>
            <IconPlus size={18} />
            Add New Module
          </button>

          <div className="footerActions createCourseFooterTop">
            <button className="btn" type="button" onClick={handleStep2Back}>
              Back
            </button>
            <button className="btn btnAccent" type="button" onClick={handleStep2SaveAndProceed}>
              Save and Proceed
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
