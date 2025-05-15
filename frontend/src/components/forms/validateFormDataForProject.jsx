import { toast } from "react-toastify";

export function validateFormDataForProject(formData) {
  const errors = [];

  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const contactRegex = /^\d{10}$/;
  const pincodeRegex = /^\d{6}$/;
  const reraRegex = /^[A-Z0-9\/-]{5,30}$/i; // Loose check: adjust if you have a specific format

  const hasKey = (key) => Object.prototype.hasOwnProperty.call(formData, key);

  if (hasKey("pan_number") && formData.pan_number && !panRegex.test(formData.pan_number)) {
    errors.push("📝 Invalid PAN number.");
  }

  if (hasKey("email_id") && formData.email_id && !emailRegex.test(formData.email_id)) {
    errors.push("📧 Invalid email address.");
  }

  if (hasKey("contact_number") && formData.contact_number && !contactRegex.test(formData.contact_number)) {
    errors.push("📞 Contact number must be exactly 10 digits.");
  }

  if (hasKey("project_pincode") && formData.project_pincode && !pincodeRegex.test(formData.project_pincode)) {
    errors.push("📍 Project pincode must be exactly 6 digits.");
  }

  if (hasKey("rera_number") && formData.rera_number && !reraRegex.test(formData.rera_number)) {
    errors.push("📄 Invalid RERA number.");
  }

  // Final Output
  if (errors.length > 0) {
    errors.forEach((msg) => toast.error(msg));
    return false;
  }

  return true;
}
