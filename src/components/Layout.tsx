import { Outlet } from "react-router-dom";
import { SiteFooter } from "./SiteFooter";
import { SiteNav } from "./SiteNav";
import styles from "./Layout.module.css";

export function MarketingLayout() {
  return (
    <div className={styles.shell}>
      <SiteNav />
      <div className={styles.content}>
        <Outlet />
      </div>
      <SiteFooter />
    </div>
  );
}
