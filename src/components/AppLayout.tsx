import type { ReactNode } from "react";
import { Navbar } from "./Navbar";

type AppLayoutProps = {
  children: ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="site-layout">
      <Navbar />
      <main className="site-main">{children}</main>
      <footer className="site-footer">
        <div className="site-footer__inner">
          <div className="site-footer__block">
            <span className="site-footer__title">Incrementality Lab</span>
            <p>A set of tools for understanding real marketing impact</p>
          </div>
          <div className="site-footer__block">
            <p>
              Built by{" "}
              <a
                className="site-footer__link"
                href="https://www.linkedin.com/in/maksim-zhirnov"
                rel="noreferrer"
                target="_blank"
              >
                Maksim Zhirnov
              </a>
            </p>
            <p>Follow for more tools and insights</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
