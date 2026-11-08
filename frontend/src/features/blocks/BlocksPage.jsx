import { useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Table from '../../components/ui/Table.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Loader from '../../components/ui/Loader.jsx';
import BlockForm from './BlockForm.jsx';
import * as api from './blocks.api.js';
import toast from 'react-hot-toast';

export default function BlocksPage() {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.listBlocks();
      setBlocks(data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load blocks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void Promise.resolve().then(load); }, []);

  const columns = [
    { header: 'Name', key: 'name' },
    { header: 'Code', key: 'code' },
    { header: 'District', key: 'district' },
    { header: 'State', key: 'state' },
    { header: 'Status', render: (r) => <Badge variant={r.status === 'ACTIVE' ? 'success' : 'danger'}>{r.status}</Badge> },
  ];

  return (
    <>
      <PageHeader title="Blocks" actions={<Button onClick={() => setOpenForm(true)}>+ Create Block</Button>} />
      {loading ? <Loader /> : <Table columns={columns} data={blocks} />}
      <Modal open={openForm} onClose={() => setOpenForm(false)} title="Create Block">
        <BlockForm onCreated={() => { setOpenForm(false); load(); }} />
      </Modal>
    </>
  );
}