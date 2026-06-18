import { useNavigate } from 'react-router-dom';
import NoteEditorForm from '../components/NoteEditorForm';
import SectionTitle from '../components/SectionTitle';
import { useNotes } from '../hooks/useNotes';

export default function NoteCreatePage() {
  const navigate = useNavigate();
  const { createNote } = useNotes();

  return (
    <section className="page-section inner-page note-editor-page">
      <SectionTitle eyebrow="Notes" title="新建灵感" description="先写标题，再把完整逻辑、推导和待办整理成 Markdown。" />
      <NoteEditorForm
        submitLabel="保存灵感"
        savingLabel="保存中..."
        onSubmit={async ({ title, content }) => {
          const note = await createNote(title, content);
          navigate(`/notes/${note.id}`);
        }}
        onCancel={() => navigate('/notes')}
      />
    </section>
  );
}
