import SidebarItem from "./SidebarItem";

export default function SidebarSection({ section, collapsed }) {
  return (
    <div className="mb-1">
      {/* Section label — hidden when collapsed */}
      {section.label && !collapsed && (
        <div className="px-3 pt-4 pb-1.5">
          <span className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.15em]">
            {section.label}
          </span>
        </div>
      )}

      {section.label && collapsed && (
        <div className="mx-3 my-2 border-t border-[#1E2D4A]" />
      )}

      <div className="space-y-0.5 px-2">
        {section.items.map((item) => (
          <SidebarItem key={item.key + item.path} item={item} collapsed={collapsed} />
        ))}
      </div>
    </div>
  );
}
