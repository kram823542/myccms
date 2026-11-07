import { useEffect, useState } from 'react';
import { getSubmissionWindows } from '../features/submissionWindows/submissionWindows.api.js';

export function useSubmissionWindows() {
  const [windows, setWindows] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const { data } = await getSubmissionWindows();
        if (active) {
          setWindows(data.data);
          setError('');
        }
      } catch (err) {
        console.error('Failed to load submission windows:', err);
        const message = err.response?.status === 404
          ? 'समय की जानकारी के लिए BACKEND server restart करें।'
          : !err.response
            ? 'BACKEND server से कनेक्शन नहीं हो रहा।'
            : 'Submission का समय अभी लोड नहीं हो सका।';
        if (active) setError(message);
      }
    };

    load();
    const intervalId = window.setInterval(load, 60_000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, []);

  return { windows, error };
}
