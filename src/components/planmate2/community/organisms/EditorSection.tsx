import { BlockNoteView } from "@blocknote/mantine";

interface EditorSectionProps {
  editor: any;
}

export const EditorSection = ({ editor }: EditorSectionProps) => {
  return (
    <div className="px-2 py-4 bg-white min-h-[400px]">
      <BlockNoteView 
        editor={editor} 
        theme="light"
        className="min-h-[380px]"
      />
    </div>
  );
};
