import { ActionPlan } from './actionPlan.model.js';
import { Employee } from '../employees/employee.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { isWithinTimeWindow, getISTDateString } from '../../utils/security.js';
import { env } from '../../config/env.js';

const submissionWindow = env.SUBMISSION_WINDOWS.ACTION_PLAN;

export const submitActionPlan = async (req, { plan }) => {
  if (req.user.role !== 'EMPLOYEE') throw ApiError.forbidden('Only employees submit');

  if (!isWithinTimeWindow(submissionWindow.start, submissionWindow.end)) {
    throw ApiError.forbidden('Action Plan submission window is closed');
  }

  const employee = await Employee.findOne({ userId: req.user._id });
  if (!employee) throw ApiError.notFound('Employee record not found');

  const date = getISTDateString();

  const existing = await ActionPlan.findOne({ employeeId: employee._id, date });
  if (existing) throw ApiError.conflict('Action Plan already submitted for today');

  const created = await ActionPlan.create({
    employeeId: employee._id,
    clfId: employee.clfId,
    blockId: employee.blockId,
    date,
    plan,
    submittedAt: new Date(),
  });

  return created;
};

export const listActionPlans = async (req, query) => {
  const user = req.user;
  const filter = {};

  if (user.role === 'EMPLOYEE') {
    const emp = await Employee.findOne({ userId: user._id });
    if (!emp) return { actionPlans: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } };
    filter.employeeId = emp._id;
  } else if (user.role === 'CLF') {
    filter.clfId = user.clfId;
  } else if (user.role === 'BPM') {
    filter.blockId = user.blockId;
  } else if (query.blockId || query.clfId) {
    if (query.blockId) filter.blockId = query.blockId;
    if (query.clfId) filter.clfId = query.clfId;
  }

  if (query.employeeId && user.role !== 'EMPLOYEE') filter.employeeId = query.employeeId;
  if (query.date) filter.date = query.date;
  if (query.from || query.to) {
    filter.date = {};
    if (query.from) filter.date.$gte = query.from;
    if (query.to) filter.date.$lte = query.to;
  }

  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, parseInt(query.limit) || 50);

  const [plans, total] = await Promise.all([
    ActionPlan.find(filter)
      .populate('employeeId', 'name employeeCode designation')
      .populate('clfId', 'name code')
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    ActionPlan.countDocuments(filter),
  ]);

  return { actionPlans: plans, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
};

export const getTodayPlan = async (req) => {
  if (req.user.role !== 'EMPLOYEE') throw ApiError.forbidden();
  const emp = await Employee.findOne({ userId: req.user._id });
  if (!emp) throw ApiError.notFound();
  const today = getISTDateString();
  return ActionPlan.findOne({ employeeId: emp._id, date: today });
};