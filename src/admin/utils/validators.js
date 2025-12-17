function isBlank(v) {
  return v == null || String(v).trim() === '';
}

export function isEmail(value) {
  if (isBlank(value)) return false;
  // Simple, practical email check for UI validation
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
}

export function isPhone(value) {
  if (isBlank(value)) return false;
  // Accept 10-15 digits, allow spaces/+/- in input
  const digits = String(value).replace(/[^\d]/g, '');
  return digits.length >= 10 && digits.length <= 15;
}

export function isGst(value) {
  if (isBlank(value)) return false;
  // GSTIN (India) is 15 chars; keep it lenient but helpful
  return /^[0-9A-Z]{15}$/.test(String(value).trim().toUpperCase());
}

export function validateInstitute(form, step) {
  const errors = {};

  const require = (key, msg) => {
    if (isBlank(form[key])) errors[key] = msg;
  };

  if (step === 1 || step == null) {
    require('name', 'Institute name is required.');
    require('trademark', 'Trademark is required.');
    require('gst', 'GST is required.');
    require('contact', 'Contact number is required.');

    if (!isBlank(form.email) && !isEmail(form.email)) errors.email = 'Enter a valid email.';
    if (!isBlank(form.contact) && !isPhone(form.contact)) errors.contact = 'Enter a valid contact number.';
    if (!isBlank(form.gst) && !isGst(form.gst)) errors.gst = 'Enter a valid GSTIN (15 characters).';
  }

  if (step === 2 || step == null) {
    require('adminName', 'Admin name is required.');
    require('adminContact', 'Admin contact is required.');
    require('adminEmail', 'Admin email is required.');
    if (!isBlank(form.adminEmail) && !isEmail(form.adminEmail)) errors.adminEmail = 'Enter a valid email.';
    if (!isBlank(form.adminContact) && !isPhone(form.adminContact))
      errors.adminContact = 'Enter a valid contact number.';
  }

  return errors;
}

export function validateCourse(form, step) {
  const errors = {};
  const require = (key, msg) => {
    if (isBlank(form[key])) errors[key] = msg;
  };

  if (step === 1 || step == null) {
    require('name', 'Course name is required.');
    require('category', 'Course category is required.');
    require('teacher', 'Teacher name is required.');
    require('description', 'Description is required.');
    if (!isBlank(form.description) && wordCount(form.description) > 500) {
      errors.description = 'Description must be 500 words or less.';
    }
  }

  if (step === 2 || step == null) {
    if (!Array.isArray(form.modules) || form.modules.length === 0) {
      errors.modules = 'Add at least one module.';
    } else {
      form.modules.forEach((m, idx) => {
        if (isBlank(m.title)) errors[`modules.${idx}.title`] = 'Module title is required.';
      });
    }
  }

  return errors;
}

export function wordCount(str) {
  if (!str) return 0;
  return String(str).trim().split(/\s+/).filter(Boolean).length;
}

