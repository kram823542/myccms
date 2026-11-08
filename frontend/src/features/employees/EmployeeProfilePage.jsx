import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader.jsx';
import EmployeeDetails from './EmployeeDetails.jsx';
import Loader from '../../components/ui/Loader.jsx';
import { theme } from '../../config/theme.js';
import * as api from './employees.api.js';
import { getAuthUser, setAuthUser } from '../../utils/authStorage.js'; //  Import for session sync

export default function EmployeeProfilePage() {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true; //  Prevent memory leaks on quick unmounts

    const fetchEmployee = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.getEmployee(id);
        
        if (isMounted) {
          setEmployee(data.data);

          //  CRITICAL FIX: If viewing own profile, update sessionStorage & trigger sidebar refresh
          const currentUser = getAuthUser();
          if (currentUser && String(currentUser.employeeId) === String(id)) {
            setAuthUser({ ...currentUser, name: data.data.name });
            // Dispatch event so Sidebar and other components re-read the updated name
            window.dispatchEvent(new Event('storage')); 
          }
        }
      } catch (err) {
        if (isMounted) setError(err.response?.data?.message || 'Failed to load employee');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchEmployee();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) return <Loader />;
  
  if (error) {
    return (
      <div style={{ padding: 20 }}>
        <p style={{ color: theme.colors.danger, fontSize: 14, fontWeight: 600 }}> {error}</p>
      </div>
    );
  }
  
  if (!employee) return <p>Employee not found</p>;

  return (
    <>
      <PageHeader title={employee.name} subtitle={`Code: ${employee.employeeCode}`} />
      <EmployeeDetails employee={employee} />
    </>
  );
}