import { useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Table from '../../components/ui/Table.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import UserForm from './UserForm.jsx';
import { theme } from '../../config/theme.js';
import * as api from './users.api.js';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [tempPass, setTempPass] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.listUsers({ page: 1, limit: 50 });
      setUsers(data.data.users || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const columns = [
    { header: 'Username', key: 'username' },
    { header: 'Name', key: 'name' },
    { header: 'Role', render: (r) => <Badge variant="info">{r.role}</Badge> },
    {
      header: 'Block',
      render: (r) => r.blockId?.name || '—',
    },
    {
      header: 'Status',
      render: (r) => (
        <Badge variant={r.status === 'ACTIVE' ? 'success' : 'danger'}>{r.status}</Badge>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Users"
        subtitle="Manage BPM admins"
        actions={<Button onClick={() => setOpenForm(true)}>+ Create BPM</Button>}
      />
      <Table columns={columns} data={users} loading={loading} />

      <Modal open={openForm} onClose={() => setOpenForm(false)} title="Create BPM Admin">
        <UserForm
          onCreated={(tempPassword) => {
            setTempPass(tempPassword);
            setOpenForm(false);
            load();
          }}
        />
      </Modal>

      <Modal open={!!tempPass} onClose={() => setTempPass(null)} title="Temporary Password">
        <p style={{ fontSize: 14 }}>
          Please note this password — यह सिर्फ एक बार दिखेगा:
        </p>
        <code style={{ background: theme.colors.codeSurface, padding: 12, borderRadius: 8, display: 'block' }}>
          {tempPass}
        </code>
        <Button style={{ marginTop: 16 }} onClick={() => navigator.clipboard.writeText(tempPass)}>
          Copy
        </Button>
      </Modal>
    </>
  );
}