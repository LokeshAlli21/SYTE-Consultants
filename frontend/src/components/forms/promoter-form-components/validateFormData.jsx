import { toast } from "react-toastify";

export function validateFormData(formData) {
  const errors = [];
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const aadharRegex = /^\d{12}$/;
  const contactRegex = /^\d{10}$/;

  const hasKey = (key) => Object.prototype.hasOwnProperty.call(formData, key);

  // General Validations
  if (hasKey("contact_number") && formData.contact_number && !contactRegex.test(formData.contact_number)) {
    errors.push("📞 Contact number must be exactly 10 digits.");
  }

  if (hasKey("email_id") && formData.email_id && !emailRegex.test(formData.email_id)) {
    errors.push("📧 Invalid email address.");
  }

  if (hasKey("aadhar_number") && formData.aadhar_number && !aadharRegex.test(formData.aadhar_number)) {
    errors.push("🆔 Aadhar number must be exactly 12 digits.");
  }

  // PAN Validations
  const panFields = Object.keys(formData).filter((key) => key.includes("pan_number"));
  for (const key of panFields) {
    const label = key
      .replace(/_/g, " ")
      .replace("pan", "PAN")
      .replace("number", "number");
    const value = formData[key];
    if (value && !panRegex.test(value)) {
      errors.push(`📝 Invalid ${label}.`);
    }
  }

  // GSTIN Validations
  const gstinFields = Object.keys(formData).filter((key) => key.includes("gstin"));
  for (const key of gstinFields) {
    const value = formData[key];
    if (value && value.length !== 15) {
      errors.push("🔢 GSTIN must be exactly 15 characters.");
    }
  }

  // Date of Birth Validation
  if (hasKey("dob") && formData.dob && formData.dob !== "" && isNaN(Date.parse(formData.dob))) {
    errors.push("📅 Invalid Date of Birth.");
  }

  // Required Field Validations (only check for fields that have a value)
  const requiredFields = Object.entries(formData).filter(([key, value]) => {
    const skipFields = ["individual_disclosure_of_interest", "proprietor_disclosure_of_interest"];
    return (
      typeof value === "string" &&
      value.trim() !== "" &&
      !skipFields.includes(key) &&
      !key.endsWith("_uploaded_url")
    );
  });

  for (const [key, value] of requiredFields) {
    if (!value.trim()) {
      const label = key.replace(/_/g, " ");
      errors.push(`❗ "${label}" is required.`);
    }
  }

  // Final Output
  if (errors.length > 0) {
    errors.forEach((msg) => toast.error(msg));
    return false;
  }

  return true;
}
