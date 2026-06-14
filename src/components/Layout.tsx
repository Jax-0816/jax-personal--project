import { NavLink, Outlet } from 'react-router-dom';
import avatarImage from '../assets/avatar.jpg';

const navItems = [
  { to: '/', label: '首页' },
  { to: '/about', label: '关于我' },
  { to: '/projects', label: '项目' },
  { to: '/documents', label: '技能' },
  { to: '/notes', label: '笔记' },
  { to: '/contact', label: '联系' },
];

export default function Layout() {
  return (
    <div className="site-shell">
      <header className="site-header">
        <NavLink to="/" className="brand" aria-label="回到首页">
          <span className="brand-mark"><img src={avatarImage} alt="" /></span>
          <span className="brand-copy">
            <strong>Jax</strong>
            <small>Portfolio</small>
          </span>
        </NavLink>
        <div className="brand-center">
          <span>霍洋洲的个人作品集</span>
          <small>Projects, notes, skills and contact</small>
        </div>
        <nav className="site-nav" aria-label="主导航">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? 'active' : undefined)}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="site-main">
        <Outlet />
      </main>
    </div>
  );
}
