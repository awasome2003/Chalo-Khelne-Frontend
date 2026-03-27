import { FileText, Image as ImageIcon, Download } from "lucide-react";

export default function MessageBubble({ message, isOwn }) {
  const timeStr = new Date(message.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-3`}>
      <div className={`max-w-[75%] ${isOwn ? "items-end" : "items-start"}`}>
        {/* Sender name (not own) */}
        {!isOwn && (
          <div className="flex items-center gap-1.5 mb-1 px-1">
            <span className="text-xs font-bold text-gray-700">{message.senderName}</span>
            <span className="text-[9px] font-medium text-[#004E93] bg-[#004E93]/10 px-1 py-0.5 rounded">{message.senderRole}</span>
          </div>
        )}

        {/* Bubble */}
        <div className={`px-4 py-2.5 rounded-2xl ${
          isOwn
            ? "bg-[#004E93] text-white rounded-br-md"
            : "bg-white border border-gray-200 text-gray-800 rounded-bl-md"
        }`}>
          {/* Text */}
          {message.text && (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
          )}

          {/* Attachments */}
          {message.attachments?.length > 0 && (
            <div className={`${message.text ? "mt-2 pt-2 border-t" : ""} ${isOwn ? "border-white/20" : "border-gray-100"} space-y-1.5`}>
              {message.attachments.map((att, i) => (
                <AttachmentPreview key={i} attachment={att} isOwn={isOwn} />
              ))}
            </div>
          )}

          {/* Time */}
          <p className={`text-[10px] mt-1 ${isOwn ? "text-white/60" : "text-gray-400"} text-right`}>
            {timeStr}
          </p>
        </div>
      </div>
    </div>
  );
}

function AttachmentPreview({ attachment, isOwn }) {
  const isImage = attachment.type === "image";
  const isPdf = attachment.type === "pdf";
  const serverUrl = window.location.origin;

  if (isImage) {
    return (
      <a href={`${serverUrl}/${attachment.url}`} target="_blank" rel="noopener noreferrer">
        <img
          src={`${serverUrl}/${attachment.url}`}
          alt={attachment.name}
          className="max-w-[240px] rounded-xl object-cover cursor-pointer hover:opacity-90 transition"
        />
      </a>
    );
  }

  return (
    <a
      href={`${serverUrl}/${attachment.url}`}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-2 px-3 py-2 rounded-xl transition ${
        isOwn ? "bg-white/10 hover:bg-white/20" : "bg-gray-50 hover:bg-gray-100"
      }`}
    >
      {isPdf ? <FileText className="w-4 h-4 flex-shrink-0" /> : <Download className="w-4 h-4 flex-shrink-0" />}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium truncate">{attachment.name}</p>
        <p className={`text-[10px] ${isOwn ? "text-white/50" : "text-gray-400"}`}>
          {(attachment.size / 1024).toFixed(0)} KB
        </p>
      </div>
    </a>
  );
}
