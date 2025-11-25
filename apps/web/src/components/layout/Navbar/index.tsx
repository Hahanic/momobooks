import { useLayoutStore } from "../../../store/layoutStore";

const Navbar = ({ children }: { children: React.ReactNode }) => {
  const isCollapsed = useLayoutStore((state) => state.isCollapsed);

  return (
    <nav
      className={`sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white pr-4 transition-[padding] duration-300 ease-in-out ${
        isCollapsed ? "pl-9" : "pl-4"
      }`}
    >
      {children}
    </nav>
  );
};

export default Navbar;
