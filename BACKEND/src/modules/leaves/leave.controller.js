import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Leave } from './leave.model.js';
import { Employee } from '../employees/employee.model.js';
import { Attendance } from '../attendance/attendance.model.js';
import { CLF } from '../clfs/clf.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { logger } from '../../utils/logger.js';
import { getISTDateString } from '../../utils/security.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getFontPath = (fontName) => {
  const possiblePaths = [
    path.join(process.cwd(), 'assets', 'fonts', fontName),
    path.join(process.cwd(), 'src', 'assets', 'fonts', fontName),
    path.join(__dirname, '..', '..', '..', 'assets', 'fonts', fontName),
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  return null;
};

const BUNDLED_FONT_REGULAR = getFontPath('NotoSansDevanagari-Regular.ttf');
const BUNDLED_FONT_BOLD = getFontPath('NotoSansDevanagari-Bold.ttf');

export const getLeaveTypes = async (req, res) => {
  const leaveTypes = Leave.schema.path('leaveType').enumValues.map((value) => ({
    value,
    label: value === 'Training' ? 'Training (प्रशिक्षण)' : value,
  }));

  res.status(200).json({
    success: true,
    data: leaveTypes,
  });
};

const SYSTEM_FONTS = {
  regular: [
    BUNDLED_FONT_REGULAR,
    'C:\\Windows\\Fonts\\Nirmala.ttf',
    'C:\\Windows\\Fonts\\mangal.ttf',
    'C:\\Windows\\Fonts\\arialuni.ttf',
    '/System/Library/Fonts/Supplemental/Devanagari Sangam MN.ttc',
    '/Library/Fonts/Arial Unicode.ttf',
    '/usr/share/fonts/truetype/noto/NotoSansDevanagari-Regular.ttf',
  ].filter(Boolean),
  bold: [
    BUNDLED_FONT_BOLD,
    'C:\\Windows\\Fonts\\NirmalaB.ttf',
    'C:\\Windows\\Fonts\\mangalb.ttf',
    'C:\\Windows\\Fonts\\arialunib.ttf',
    '/System/Library/Fonts/Supplemental/Devanagari Sangam MN Bold.ttc',
    '/Library/Fonts/Arial Unicode Bold.ttf',
    '/usr/share/fonts/truetype/noto/NotoSansDevanagari-Bold.ttf',
  ].filter(Boolean),
};

const findFont = (candidates) => {
  for (const p of candidates) {
    try { if (fs.existsSync(p)) return p; } catch {}
  }
  return null;
};

const registerFonts = (doc) => {
  const regular = findFont(SYSTEM_FONTS.regular);
  const bold = findFont(SYSTEM_FONTS.bold);
  doc.registerFont('Devanagari', regular || 'Helvetica');
  doc.registerFont('Devanagari-Bold', bold || regular || 'Helvetica-Bold');
};

export const applyLeave = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized - Please login again' });
    }

    const { leaveType, startDate, endDate, reason, startTime, endTime } = req.body;
    const user = req.user;
    const targetUserId = user.userId || user._id;

    const emp = await Employee.findOne({ userId: targetUserId });
    if (!emp) throw ApiError.notFound('Employee profile not found for this user');

    if (!leaveType || !startDate || !endDate || !reason) {
      throw ApiError.badRequest('Start Date, End Date, Type, and Reason are required');
    }

    if (leaveType === 'Half Day' && (!startTime || !endTime)) {
      throw ApiError.badRequest('Start Time and End Time are required for Half Day leave');
    }

    // ✅ TIMEZONE SAFE DATE PARSING (IST Safe)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      throw ApiError.badRequest('Dates must be in YYYY-MM-DD format');
    }

    const startParts = startDate.split('-').map(Number);
    const endParts = endDate.split('-').map(Number);

    const startObj = new Date(startParts[0], startParts[1] - 1, startParts[2]);
    const endObj = new Date(endParts[0], endParts[1] - 1, endParts[2]);

    if (endObj < startObj) {
      throw ApiError.badRequest('End date must be on or after start date');
    }

    let totalDays = Math.floor((endObj - startObj) / (1000 * 60 * 60 * 24)) + 1;
    if (leaveType === 'Half Day') totalDays = 0.5;

    const leave = await Leave.create({
      employeeId: emp._id,
      clfId: emp.clfId,
      blockId: emp.blockId,
      leaveType,
      startDate,
      endDate,
      startTime: leaveType === 'Half Day' ? startTime : null,
      endTime: leaveType === 'Half Day' ? endTime : null,
      totalDays,
      reason,
      appliedBy: targetUserId,
      status: 'PENDING',
    });

    res.status(201).json({
      success: true,
      message: 'Leave applied successfully',
      data: leave,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyLeaves = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const user = req.user;
    const targetUserId = user.userId || user._id;

    const emp = await Employee.findOne({ userId: targetUserId });
    if (!emp) throw ApiError.notFound('Employee profile not found');

    const leaves = await Leave.find({ employeeId: emp._id })
      .populate({
        path: 'employeeId',
        select: 'name employeeCode designation clfId',
        populate: { path: 'clfId', select: 'name letterhead' } 
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: leaves });
  } catch (error) {
    next(error);
  }
};

export const cancelLeave = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { id } = req.params;
    const user = req.user;
    const targetUserId = user.userId || user._id;

    const emp = await Employee.findOne({ userId: targetUserId });
    if (!emp) throw ApiError.notFound('Employee profile not found');

    const leave = await Leave.findById(id);
    if (!leave) throw ApiError.notFound('Leave application not found');

    if (String(leave.employeeId) !== String(emp._id)) {
      throw ApiError.forbidden('You can only cancel your own leave');
    }

    if (leave.status !== 'PENDING') {
      throw ApiError.badRequest('Only pending leaves can be cancelled');
    }

    await Leave.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Leave cancelled successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getAllLeavesForAdmin = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    let filter = {};
    if (user.role === 'CLF') {
      filter.clfId = user.clfId;
    } else if (user.role === 'BPM') {
      filter.blockId = user.blockId;
    }

    const leaves = await Leave.find(filter)
      .populate('employeeId', 'name employeeCode designation')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: leaves });
  } catch (error) {
    next(error);
  }
};

export const updateLeaveStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, reviewRemarks } = req.body;
    const user = req.user;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const leave = await Leave.findById(id);
    if (!leave) return res.status(404).json({ success: false, message: 'Leave not found' });

    if (user.role === 'CLF' && String(leave.clfId) !== String(user.clfId)) {
      return res.status(403).json({ success: false, message: 'Not authorized to review this leave' });
    }
    if (user.role === 'BPM' && String(leave.blockId) !== String(user.blockId)) {
      return res.status(403).json({ success: false, message: 'Not authorized to review this leave' });
    }

    leave.status = status;
    leave.reviewRemarks = reviewRemarks || '';
    leave.reviewedBy = user._id || user.userId;
    await leave.save();

    if (status === 'APPROVED') {
      const isHalfDay = leave.leaveType === 'Half Day';
      const isTraining = leave.leaveType === 'Training';

      let attendanceStatus;
      if (isHalfDay) attendanceStatus = 'HALF_DAY';
      else if (isTraining) attendanceStatus = 'TRAINING';
      else attendanceStatus = 'LEAVE';

      const startParts = leave.startDate.split('-').map(Number);
      const endParts = leave.endDate.split('-').map(Number);
      const startObj = new Date(startParts[0], startParts[1] - 1, startParts[2]);
      const endObj = new Date(endParts[0], endParts[1] - 1, endParts[2]);

      const dates = [];
      if (isHalfDay) {
        dates.push(leave.startDate);
      } else {
        const temp = new Date(startObj);
        while (temp <= endObj) {
          const y = temp.getFullYear();
          const m = String(temp.getMonth() + 1).padStart(2, '0');
          const d = String(temp.getDate()).padStart(2, '0');
          dates.push(`${y}-${m}-${d}`);
          temp.setDate(temp.getDate() + 1);
        }
      }

      for (const dateStr of dates) {
        const existingAtt = await Attendance.findOne({
          employeeId: leave.employeeId,
          date: dateStr,
        });

        if (existingAtt) {
          if (existingAtt.source === 'WORK_DONE_APPROVAL' && existingAtt.status === 'PRESENT') {
            logger.warn(`Attendance already PRESENT via WorkDone on ${dateStr} — skipping leave mark`);
            continue;
          }
          existingAtt.status = attendanceStatus;
          existingAtt.remarks = `Leave Approved (${leave.leaveType})`;
          existingAtt.source = 'LEAVE_APPROVAL';
          await existingAtt.save();
        } else {
          await Attendance.create({
            employeeId: leave.employeeId,
            clfId: leave.clfId,
            blockId: leave.blockId,
            date: dateStr,
            status: attendanceStatus,
            source: 'LEAVE_APPROVAL',
            remarks: `Leave Approved (${leave.leaveType})`,
            markedBy: user._id || user.userId,
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      message: `Leave ${status.toLowerCase()} successfully`,
      data: leave,
    });
  } catch (error) {
    next(error);
  }
};

export const downloadLeavePDF = async (req, res, next) => {
  try {
    const { id } = req.params;
    const leave = await Leave.findById(id).populate('employeeId', 'name employeeCode designation userId');

    if (!leave) return res.status(404).json({ success: false, message: 'Leave not found' });

    const user = req.user;
    if (
      user.role === 'EMPLOYEE' &&
      String(leave.employeeId?.userId) !== String(user._id)
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (user.role === 'CLF' && String(leave.clfId) !== String(user.clfId)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (user.role === 'BPM' && String(leave.blockId) !== String(user.blockId)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const clf = await CLF.findById(leave.clfId);
    const clfName = clf?.name || 'CLF Name';
    const subTitle = clf?.letterhead?.subTitle || '';
    const addressLine = clf?.letterhead?.addressLine || '';

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    registerFonts(doc);

    const filename = `Leave-${leave.employeeId?.employeeCode || 'App'}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    doc.pipe(res);

    const pageWidth = 595.28;
    const formatDate = (d) => {
      if (!d) return '';
      const dateObj = new Date(d);
      const y = dateObj.getFullYear();
      const m = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      return `${day}/${m}/${y}`;
    };

    doc.font('Devanagari-Bold').fontSize(18).text(clfName, { align: 'center' });
    if (subTitle) {
      doc.font('Devanagari-Bold').fontSize(14).text(subTitle, { align: 'center' });
    }
    if (addressLine) {
      doc.font('Devanagari').fontSize(10).text(addressLine, { align: 'center' });
    }
    doc.moveDown(1);

    doc.moveTo(50, doc.y).lineTo(pageWidth - 50, doc.y).stroke();
    doc.moveDown(2);

    doc.font('Devanagari').fontSize(12);
    doc.text(`दिनांक: ${formatDate(leave.createdAt)}`, { align: 'right' });
    doc.moveDown(1);
    doc.text('प्रति,', { continued: true });
    doc.text('The Manager / Admin', { align: 'left' });
    
    doc.text(clfName);
    doc.moveDown(2);

    const isTraining = leave.leaveType === 'Training';
    const subjectText = isTraining ? 'विषय: प्रशिक्षण (Training) हेतु आवेदन' : 'विषय: अवकाश (Leave) हेतु आवेदन';
    const bodyLeaveText = isTraining ? 'प्रशिक्षण' : 'अवकाश';

    doc.font('Devanagari-Bold').fontSize(14).text(subjectText, { align: 'center', underline: true });
    doc.moveDown(2);

    doc.font('Devanagari').fontSize(12).text('महोदय/महोदया,', { align: 'left' });
    doc.moveDown(1);

    const bodyText = `सविनय निवेदन है कि मुझे ${leave.totalDays} दिनों का ${bodyLeaveText} चाहिए। मुझे दिनांक ${leave.startDate} से ${leave.endDate} तक ${bodyLeaveText} की आवश्यकता है${leave.leaveType === 'Half Day' ? ` (समय: ${leave.startTime} से ${leave.endTime} तक)` : ''}।`;

    doc.text(bodyText, { align: 'justify', lineGap: 4 });
    doc.moveDown(1);

    doc.text(`${bodyLeaveText} का कारण निम्नलिखित है:`, { align: 'left' });
    doc.moveDown(0.5);
    doc.font('Devanagari-Bold').text(`"${leave.reason}"`, { indent: 20, align: 'justify' });
    doc.font('Devanagari');
    doc.moveDown(1);

    doc.text(`अतः आपसे निवेदन है कि मेरे इस ${bodyLeaveText} आवेदन को स्वीकृत (Approve) करने की कृपा करें।`, { align: 'justify' });
    doc.moveDown(4);

    doc.text('धन्यवाद,', { align: 'left' });
    doc.moveDown(3);
    doc.font('Devanagari-Bold').text(leave.employeeId?.name || 'Employee Name', { align: 'right' });
    doc.font('Devanagari').text(leave.employeeId?.designation || 'Designation', { align: 'right' });
    doc.text(`Emp Code: ${leave.employeeId?.employeeCode || 'N/A'}`, { align: 'right' });

    doc.moveDown(3);
    if (leave.status === 'APPROVED') {
      doc.fillColor('green').text('Status: APPROVED', { align: 'center' });
    } else if (leave.status === 'REJECTED') {
      doc.fillColor('red').text('Status: REJECTED', { align: 'center' });
      if (leave.reviewRemarks) {
        doc.text(`Remark: ${leave.reviewRemarks}`, { align: 'center' });
      }
    } else {
      doc.fillColor('orange').text('Status: PENDING', { align: 'center' });
    }

    doc.end();
  } catch (error) {
    next(error);
  }
};