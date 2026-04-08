import { FileText, Download, Eye } from "lucide-react";

export default function MessageBubble({ message, isOwn }) {
  const timeStr = new Date(message.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-3`}>
      <div className={`max-w-[75%] ${isOwn ? "items-end" : "items-start"}`}>
        {/* Sender name (not own) */}
        {!isOwn && (
          <div className="flex items-center gap-1.5 mb-1 px-1">
            <span className="text-xs font-bold text-gray-700">{message.senderName}</span>
            <span className="text-[9px] font-medium text-orange-500 bg-orange-500/10 px-1 py-0.5 rounded">{message.senderRole}</span>
          </div>
        )}

        {/* Bubble */}
        <div className={`px-4 py-2.5 rounded-2xl ${
          isOwn
            ? "bg-orange-500 text-white rounded-br-md"
            : "bg-white border border-gray-200 text-gray-800 rounded-bl-md"
        }`}>
          {message.text && (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
          )}

          {message.attachments?.length > 0 && (
            <div className={`${message.text ? "mt-2 pt-2 border-t" : ""} ${isOwn ? "border-white/20" : "border-gray-100"} space-y-1.5`}>
              {message.attachments.map((att, i) => (
                <AttachmentPreview key={i} attachment={att} isOwn={isOwn} />
              ))}
            </div>
          )}

          <p className={`text-[10px] mt-1 ${isOwn ? "text-white/60" : "text-gray-400"} text-right`}>
            {timeStr}
          </p>
        </div>
      </div>
    </div>
  );
}

function AttachmentPreview({ attachment, isOwn }) {
  const mimeType = (attachment.type || "").toLowerCase();
  const isImage = mimeType.startsWith("image") || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(attachment.name || "");
  const isPdf = mimeType.includes("pdf") || /\.pdf$/i.test(attachment.name || "");
  const fileUrl = attachment.url?.startsWith("http") ? attachment.url : `${window.location.origin}/${attachment.url}`;

  const handleDownload = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = attachment.name || "download";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      window.open(fileUrl, "_blank");
    }
  };

  if (isImage) {
    return (
      <div className="relative group">
        <img
          src={fileUrl}
          alt={attachment.name}
          className="max-w-[240px] rounded-xl object-cover"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 rounded-xl transition flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
          <a href={fileUrl} target="_blank" rel="noopener noreferrer"
            className="p-2 bg-white/90 rounded-full hover:bg-white transition w-auto" title="View">
            <Eye className="w-4 h-4 text-gray-700" />
          </a>
          <button onClick={handleDownload}
            className="p-2 bg-white/90 rounded-full hover:bg-white transition w-auto" title="Download">
            <Download className="w-4 h-4 text-gray-700" />
          </button>
        </div>
        {attachment.name && (
          <p className={`text-[10px] mt-1 truncate ${isOwn ? "text-white/50" : "text-gray-400"}`}>{attachment.name}</p>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${
      isOwn ? "bg-white/10" : "bg-gray-50"
    }`}>
      {isPdf ? <FileText className="w-5 h-5 flex-shrink-0 text-red-400" /> : <FileText className="w-5 h-5 flex-shrink-0 text-blue-400" />}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium truncate">{attachment.name || "File"}</p>
        {attachment.size > 0 && (
          <p className={`text-[10px] ${isOwn ? "text-white/50" : "text-gray-400"}`}>
            {attachment.size > 1048576 ? `${(attachment.size / 1048576).toFixed(1)} MB` : `${(attachment.size / 1024).toFixed(0)} KB`}
          </p>
        )}
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <a href={fileUrl} target="_blank" rel="noopener noreferrer"
          className={`p-1.5 rounded-lg transition w-auto ${isOwn ? "hover:bg-white/20" : "hover:bg-gray-200"}`} title="View">
          <Eye className="w-3.5 h-3.5" />
        </a>
        <button onClick={handleDownload}
          className={`p-1.5 rounded-lg transition w-auto ${isOwn ? "hover:bg-white/20" : "hover:bg-gray-200"}`} title="Download">
          <Download className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
