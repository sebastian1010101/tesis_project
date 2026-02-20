type AnswerEditorProps = {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  saving?: boolean;
};

export default function AnswerEditor(props: AnswerEditorProps) {
  const { value, onChange, onSave, saving } = props;

  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={6}
        style={{ width: "100%" }}
      />
      <div style={{ marginTop: 8 }}>
        <button type="button" onClick={onSave} disabled={!!saving}>
          {saving ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </div>
  );
}
