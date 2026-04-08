import SidebarItem from "./SidebarItem";

export default function SidebarSection({ section, collapsed }) {
  const SectionIcon = section.icon;

  return (
    <div className="mb-1.5">
      {/* Section header — expanded */}
      {section.label && !collapsed && (
        <div className="px-4 pt-5 pb-1.5 flex items-center gap-2">
          {SectionIcon && <SectionIcon className="w-3.5 h-3.5 text-gray-300" />}
          <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.12em]">
            {section.label}
          </span>
        </div>
      )}

      {/* Section divider — collapsed */}
      {section.label && collapsed && (
        <div className="mx-3 my-3 border-t border-gray-100" />
      )}

      <div className="space-y-0.5 px-2">
        {section.items.map((item) => (
          <SidebarItem key={item.key + item.path} item={item} collapsed={collapsed} />
        ))}
      </div>
    </div>
  );
}
