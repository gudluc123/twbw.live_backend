// Check Function for empty field
const isValid = (value) => {
  if (typeof value === "undefined" || value === null) return false;
  if (typeof value === "string" && value.trim().length === 0) return false;
  if (typeof value === "number" && value.toString().trim().length === 0) return false;
  return true;
};

// Check Function for empty request body
const isValidRequestBody = (requestBody) => {
  if (Object.keys(requestBody).length) return true;
  return false;
};

module.exports = { isValid, isValidRequestBody, isValidObjectId };
