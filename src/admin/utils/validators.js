/**
 * Validation helpers for the admin forms.
 *
 * WHY we keep these rules here:
 * - Pages stay focused on UI concerns.
 * - Rules remain consistent between "create", "edit", and "preview".
 */

/**
 * Treat null/undefined/whitespace-only as empty.
 */
function isBlank(value) {
  if (value == null) {
    return true;
  }

  const text = String(value);
  const trimmed = text.trim();
  return trimmed === '';
}

/**
 * Very small, practical email check for UI validation.
 *
 * WHY this is intentionally simple:
 * - Email RFC rules are complex.
 * - For UI, we want to catch obvious mistakes without rejecting valid but uncommon emails.
 */
export function isEmail(value) {
  if (isBlank(value)) {
    return false;
  }

  const email = String(value).trim();
  const simpleEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return simpleEmailRegex.test(email);
}

/**
 * Accept 10-15 digits. Users may type spaces, "+" or "-" so we strip non-digits.
 */
export function isPhone(value) {
  if (isBlank(value)) {
    return false;
  }

  const raw = String(value);
  const digitsOnly = raw.replace(/[^\d]/g, '');
  const length = digitsOnly.length;

  return length >= 10 && length <= 15;
}

/**
 * GSTIN (India) is 15 chars (A-Z and 0-9).
 * We normalize case before checking.
 */
export function isGst(value) {
  if (isBlank(value)) {
    return false;
  }

  const raw = String(value);
  const normalized = raw.trim().toUpperCase();
  const gstRegex = /^[0-9A-Z]{15}$/;

  return gstRegex.test(normalized);
}

/**
 * Count words in a string.
 *
 * WHY:
 * - Course description has a word limit.
 * - Word counting must be stable and understandable for users.
 */
export function wordCount(value) {
  if (value == null) {
    return 0;
  }

  const text = String(value).trim();
  if (text === '') {
    return 0;
  }

  // Split on one-or-more whitespace characters.
  const parts = text.split(/\s+/);

  // Filter out any accidental empty strings (defensive).
  const words = parts.filter((part) => Boolean(part));
  return words.length;
}

/**
 * Validate Institute form fields for a specific step.
 *
 * step values:
 * - 1: Basic details
 * - 2: Admin details
 * - null/undefined: Validate all steps (used before final submit)
 */
export function validateInstitute(form, step) {
  const errors = {};

  const shouldValidateStep1 = step === 1 || step == null;
  const shouldValidateStep2 = step === 2 || step == null;

  // Helper that adds an error for a required field.
  function requireField(fieldName, message) {
    if (!form) {
      errors[fieldName] = message;
      return;
    }

    const value = form[fieldName];
    if (isBlank(value)) {
      errors[fieldName] = message;
    }
  }

  if (shouldValidateStep1) {
    requireField('name', 'Institute name is required.');
    requireField('trademark', 'Trademark is required.');
    requireField('gst', 'GST is required.');
    requireField('contact', 'Contact number is required.');

    // Format validations (only if the user provided a value).
    if (form && !isBlank(form.email) && !isEmail(form.email)) {
      errors.email = 'Enter a valid email.';
    }

    if (form && !isBlank(form.contact) && !isPhone(form.contact)) {
      errors.contact = 'Enter a valid contact number.';
    }

    if (form && !isBlank(form.gst) && !isGst(form.gst)) {
      errors.gst = 'Enter a valid GSTIN (15 characters).';
    }
  }

  if (shouldValidateStep2) {
    requireField('adminName', 'Admin name is required.');
    requireField('adminContact', 'Admin contact is required.');
    requireField('adminEmail', 'Admin email is required.');

    if (form && !isBlank(form.adminEmail) && !isEmail(form.adminEmail)) {
      errors.adminEmail = 'Enter a valid email.';
    }

    if (form && !isBlank(form.adminContact) && !isPhone(form.adminContact)) {
      errors.adminContact = 'Enter a valid contact number.';
    }
  }

  return errors;
}

/**
 * Validate Course form fields for a specific step.
 *
 * step values:
 * - 1: Course details
 * - 2: Course material/modules
 * - null/undefined: Validate all steps (used before final submit)
 */
export function validateCourse(form, step) {
  const errors = {};

  const shouldValidateStep1 = step === 1 || step == null;
  const shouldValidateStep2 = step === 2 || step == null;

  function requireField(fieldName, message) {
    if (!form) {
      errors[fieldName] = message;
      return;
    }

    const value = form[fieldName];
    if (isBlank(value)) {
      errors[fieldName] = message;
    }
  }

  if (shouldValidateStep1) {
    requireField('name', 'Course name is required.');
    requireField('category', 'Course category is required.');
    requireField('teacher', 'Teacher name is required.');
    requireField('description', 'Description is required.');

    // Word count is a UX rule; we enforce it so the preview and listing stay clean.
    if (form && !isBlank(form.description)) {
      const descriptionWordCount = wordCount(form.description);
      if (descriptionWordCount > 500) {
        errors.description = 'Description must be 500 words or less.';
      }
    }
  }

  if (shouldValidateStep2) {
    const modules = form ? form.modules : null;

    if (!Array.isArray(modules) || modules.length === 0) {
      errors.modules = 'Add at least one module.';
    } else {
      modules.forEach((moduleItem, index) => {
        if (isBlank(moduleItem.title)) {
          errors[`modules.${index}.title`] = 'Module title is required.';
        }
      });
    }
  }

  return errors;
}

