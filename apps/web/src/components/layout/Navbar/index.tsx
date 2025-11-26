const Navbar = ({ children }: { children: React.ReactNode }) => {
  return (
    <nav className="z-10 flex h-16 shrink-0 items-center justify-between bg-white pr-4">
      {children}
    </nav>
  );
};

export default Navbar;
