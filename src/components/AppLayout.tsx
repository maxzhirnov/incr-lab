import type { ReactNode } from "react";
import { Navbar } from "./Navbar";

type AppLayoutProps = {
  children: ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="site-layout">
      <Navbar />
      {children}
    </div>
  );
}
