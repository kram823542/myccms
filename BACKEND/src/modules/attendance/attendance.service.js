import { Attendance } from './attendance.model.js';
import { Employee } from '../employees/employee.model.js';

export const listAttendance = async (req, query) => {
  const user = req.user;
  const filter = {};

  if (user.role === 'EMPLOYEE') {
    const emp = await Employee.findOne({ userId: user._id });
    if (!emp) return { attendance: [], summary: null };
    filter.employeeId = emp._id;
  } else if (user.role === 'CLF') {
    filter.clfId = user.clfId;
  } else if (user.role === 'BPM') {
    filter.blockId = user.blockId;
  }

  if (query.employeeId) filter.employeeId = query.employeeId;
  if (query.date) filter.date = query.date;
  if (query.from || query.to) {
    filter.date = {};
    if (query.from) filter.date.$gte = query.from;
    if (query.to) filter.date.$lte = query.to;
  }

  const attendance = await Attendance.find(filter)
    .populate('employeeId', 'name employeeCode designation')
    .sort({ date: -1 });

  const summary = {
    present: attendance.filter((a) => a.status === 'PRESENT').length,
    absent: attendance.filter((a) => a.status === 'ABSENT').length,
    halfDay: attendance.filter((a) => a.status === 'HALF_DAY').length,
    leave: attendance.filter((a) => a.status === 'LEAVE').length,
      training: attendance.filter((a) => a.status === 'TRAINING').length, // ✅ NEW
    total: attendance.length,
  };

  return { attendance, summary };
};

export const exportCSV = async (req, query) => {
  const { attendance } = await listAttendance(req, query);
  const header = 'Date,Employee Code,Name,Designation,Status,Source\n';
  const rows = attendance
    .map((a) =>
      [
        a.date,
        a.employeeId?.employeeCode || '',
        a.employeeId?.name || '',
        a.employeeId?.designation || '',
        a.status,
        a.source,
      ].join(',')
    )
    .join('\n');
  return header + rows;
};