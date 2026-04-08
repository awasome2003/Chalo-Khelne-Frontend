import { useState, useRef } from "react";
import { Send, Paperclip, X, Image as ImageIcon, FileText } from "lucide-react";

export default function MessageInput({ onSend, sending }) {
  const [text, setText] = useState("");
  const [files, setFiles] = useState([]);
  const fileRef = useRef(null);

  const handleSend = () => {
    if (!text.trim() && files.length === 0) return;
    onSend({ text: text.trim(), files: files.length > 0 ? files : undefined });
    setText("");
    setFiles([]);
  };

  const removeFile = (idx) => setFiles(files.filter((_, i) => i !== idx));

  return (
    <div className="border-t border-gray-200 bg-white px-4 py-3">
      {/* File previews */}
      {files.length > 0 && (
        <div className="flex gap-2 mb-2 overflow-x-auto pb-1">
          {files.map((file, i) => (
            <div key={i} className="relative flex-shrink-0">
              {file.type.startsWith("image") ? (
                <img src={URL.createObjectURL(file)} alt="" className="w-16 h-16 rounded-xl object-cover border border-gray-200" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-gray-100 border border-gray-200 flex flex-col items-center justify-center">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <span className="text-[8px] text-gray-400 mt-0.5 truncate w-14 text-center">{file.name}</span>
                </div>
              )}
              <button
                onClick={() => removeFile(i)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center w-auto"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input row */}
      <div className="flex items-end gap-2">
        <button
          onClick={() => fileRef.current?.click()}
          className="p-2.5 hover:bg-gray-100 rounded-xl transition text-gray-500 w-auto flex-shrink-0"
        >
          <Paperclip className="w-5 h-5" />
        </button>
        <input
          ref={fileRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
          onChange={(e) => setFiles([...files, ...Array.from(e.target.files)])}
          className="hidden"
        />

        <div className="flex-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Type a message..."
            rows={1}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
          />
        </div>

        <button
          onClick={handleSend}
          disabled={(!text.trim() && files.length === 0) || sending}
          className="p-2.5 bg-orange-500 hover:bg-orange-700 text-white rounded-xl transition disabled:opacity-50 w-auto flex-shrink-0 active:scale-[0.95]"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
