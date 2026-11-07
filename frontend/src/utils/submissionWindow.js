export const formatSubmissionTime = (time) => {
  if (!time) return '';
  const [hours, minutes] = time.split(':').map(Number);
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${hour12}:${String(minutes).padStart(2, '0')} ${suffix}`;
};

export const formatSubmissionWindow = (window) => {
  if (!window) return '';
  return `${formatSubmissionTime(window.start)} – ${formatSubmissionTime(window.end)}`;
};
