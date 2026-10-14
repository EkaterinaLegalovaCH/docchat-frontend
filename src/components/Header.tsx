import type { User } from "@supabase/supabase-js";

interface Props {
  user: User;
  onSignOut: () => void;
}

export function Header({ user, onSignOut }: Props) {
  return (
    <header className="header">
      <div className="header-inner">
        <div>
          <h1 className="header-title">DocChat</h1>
          <p className="header-subtitle">Upload PDFs &amp; ask questions — AI answers with citations</p>
        </div>
        <div className="header-account">
          <span className="header-email">{user.email}</span>
          <button className="btn-signout" type="button" onClick={onSignOut}>Sign out</button>
        </div>
      </div>
    </header>
  );
}