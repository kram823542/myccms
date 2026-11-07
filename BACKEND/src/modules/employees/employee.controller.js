import { asyncHandler } from '../../utils/asyncHandler.js';
import * as service from './employee.service.js';

export const create = asyncHandler(async (req, res) => {
  const result = await service.createEmployee(req, req.body);
  res.status(201).json({ success: true, data: result });
});

export const list = asyncHandler(async (req, res) => {
  const result = await service.listEmployees(req, req.query);
  res.json({ success: true, data: result });
});

export const getOne = asyncHandler(async (req, res) => {
  const emp = await service.getEmployee(req, req.params.id);
  res.json({ success: true, data: emp });
});

export const update = asyncHandler(async (req, res) => {
  const emp = await service.updateEmployee(req, req.params.id, req.body);
  res.json({ success: true, data: emp });
});

export const setStatus = asyncHandler(async (req, res) => {
  const emp = await service.setEmployeeStatus(req, req.params.id, req.body.status);
  res.json({ success: true, data: emp });
});

// ✅ FIX #4: req.body direct bhejo (service { username, password } expect karta hai)
export const resetPassword = asyncHandler(async (req, res) => {
  const result = await service.resetEmployeePassword(
    req,
    req.params.id,
    req.body
  );
  res.json({ success: true, data: result });
});

export const remove = asyncHandler(async (req, res) => {
  const result = await service.deleteEmployee(req, req.params.id);
  res.json({ success: true, data: result });
});


// ✅ NAYA: Credentials Fetch karo
export const getCredentials = asyncHandler(async (req, res) => {
  const result = await service.getEmployeeCredentials(req);
  res.json({ success: true, data: result });
});