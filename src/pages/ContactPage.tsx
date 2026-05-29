import SectionTitle from '../components/SectionTitle';
import { profile } from '../data/profile';

export default function ContactPage() {
  const contacts = [
    { label: 'Email', value: profile.contact.email, href: 'mailto:' + profile.contact.email },
    { label: '微信', value: profile.contact.wechat, href: undefined },
    { label: 'GitHub', value: profile.contact.github, href: profile.contact.github },
  ];

  return (
    <section className="page-section inner-page contact-page">
      <SectionTitle eyebrow="Contact" title="联系我" description="这里先放占位联系方式，正式发布前再替换真实信息。" />
      <div className="contact-grid">
        {contacts.map((item) => (
          <article key={item.label} className="contact-card">
            <span>{item.label}</span>
            {item.href ? <a href={item.href}>{item.value}</a> : <strong>{item.value}</strong>}
          </article>
        ))}
      </div>
    </section>
  );
}
