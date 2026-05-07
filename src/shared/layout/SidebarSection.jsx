import SidebarItem from "./SidebarItem";

export default function SidebarSection({ section, collapsed }) {
  return (
    <div className="mb-3">
      {section.label && !collapsed && (
        <div className="px-4 pt-3 pb-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-neutral-400">
            {section.label}
          </span>
        </div>
      )}

      {section.label && collapsed && (
        <div className="mx-3 my-2 border-t border-neutral-100" />
      )}

      <div className="space-y-px px-2">
        {section.items.map((item) => (
          <SidebarItem
            key={item.key + item.path}
            item={item}
            collapsed={collapsed}
          />
        ))}
      </div>
    </div>
  );
}
