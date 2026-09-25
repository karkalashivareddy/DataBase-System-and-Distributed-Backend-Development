import mongoose from "mongoose";
import { badRequest } from "./errors.js";

const isEmpty = (value) => value === undefined || value === null || value === "";

export function requiredString(value, field, { min = 1, max = 500 } = {}) {
  if (isEmpty(value) || typeof value !== "string" || value.trim().length < min) {
    throw badRequest(`${field} is required`, { field });
  }
  if (value.trim().length > max) throw badRequest(`${field} is too long`, { field });
  return value.trim();
}

export function optionalString(value, field, { max = 500 } = {}) {
  if (isEmpty(value)) return undefined;
  if (typeof value !== "string") throw badRequest(`${field} must be a string`, { field });
  const result = value.trim();
  if (result.length > max) throw badRequest(`${field} is too long`, { field });
  return result;
}

export function validEmail(value, field = "email", { required = true } = {}) {
  if (isEmpty(value)) {
    if (required) throw badRequest(`${field} is required`, { field });
    return undefined;
  }
  if (typeof value !== "string" || !/^\S+@\S+\.\S+$/.test(value.trim())) {
    throw badRequest(`${field} must be a valid email`, { field });
  }
  return value.trim().toLowerCase();
}

export function numberValue(value, field, { min = -Infinity, max = Infinity, integer = false, required = true } = {}) {
  if (isEmpty(value)) {
    if (required) throw badRequest(`${field} is required`, { field });
    return undefined;
  }
  const result = Number(value);
  if (!Number.isFinite(result) || result < min || result > max || (integer && !Number.isInteger(result))) {
    throw badRequest(`${field} must be a valid number`, { field });
  }
  return result;
}

export function objectId(value, field, { required = true } = {}) {
  if (isEmpty(value)) {
    if (required) throw badRequest(`${field} is required`, { field });
    return undefined;
  }
  if (!mongoose.isValidObjectId(value)) throw badRequest(`${field} must be a valid id`, { field });
  return String(value);
}

export function enumValue(value, field, values, { required = true } = {}) {
  if (isEmpty(value)) {
    if (required) throw badRequest(`${field} is required`, { field });
    return undefined;
  }
  if (!values.includes(value)) throw badRequest(`${field} must be one of: ${values.join(", ")}`, { field });
  return value;
}

export function dateValue(value, field, { required = true } = {}) {
  if (isEmpty(value)) {
    if (required) throw badRequest(`${field} is required`, { field });
    return undefined;
  }
  const result = new Date(value);
  if (Number.isNaN(result.getTime())) throw badRequest(`${field} must be a valid date`, { field });
  return result;
}

export function validateBody(schema) {
  return function validateRequestBody(req, res, next) {
    try {
      const body = req.body && typeof req.body === "object" ? req.body : {};
      const result = {};
      for (const [field, rules] of Object.entries(schema)) {
        for (const rule of rules) result[field] = rule(body[field], field, body);
      }
      req.body = { ...body, ...result };
      next();
    } catch (error) {
      next(error);
    }
  };
}
