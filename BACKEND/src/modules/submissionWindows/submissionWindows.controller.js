import { asyncHandler } from '../../utils/asyncHandler.js';
import { env } from '../../config/env.js';
import { isWithinTimeWindow } from '../../utils/security.js';

export const getSubmissionWindows = asyncHandler(async (_req, res) => {
  const { ACTION_PLAN, WORK_DONE, TIME_ZONE } = env.SUBMISSION_WINDOWS;
  res.json({
    success: true,
    data: {
      timezone: TIME_ZONE,
      actionPlan: {
        ...ACTION_PLAN,
        isOpen: isWithinTimeWindow(ACTION_PLAN.start, ACTION_PLAN.end),
      },
      workDone: {
        ...WORK_DONE,
        isOpen: isWithinTimeWindow(WORK_DONE.start, WORK_DONE.end),
      },
    },
  });
});
