import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import avatarImage from '../assets/avatar.jpg';
import SectionTitle from '../components/SectionTitle';
import { profile } from '../data/profile';

interface AboutContent {
  intro: string;
  education: string;
  experience: string;
  strengths: string;
}

type AboutPanel = 'history' | 'strengths' | null;
type EditPanel = 'history' | 'strengths' | null;

const aboutStorageKey = 'personal-universe-about-content';

const defaultAboutContent: AboutContent = {
  intro: '我关注电商运营、客户需求和产品转化，正在把国内电商、跨境运营和客户服务经历沉淀成一套更稳定的运营判断力。',
  education: [
    '河南牧业经济学院 | 全日制本科 | 2020-2024 | 2024 年 7 月毕业',
    '系统学习培养了严谨的逻辑思维和高效学习能力，为后续电商运营、数据分析和规则理解打下基础。',
    '在校期间参与学生会工作，担任办公室副部长，负责院系活动统筹、比赛组织和团队协作。',
    '主动学习电商贸易基础知识，建立市场分析、产品运营和平台规则理解的基础框架。',
  ].join('\n'),
  experience: [
    '郑州雪人科技有限公司 | 拼多多电商运营 | 2025.04-2026.01',
    '聚焦店铺业绩提升与客户体验优化，分析用户消费习惯和核心需求，优化产品选型与运营策略；入职 2 个月推动店铺转化率提升 3 个百分点，实现日出单 500+。',
    '',
    '深圳市嘉谷盛贸易有限公司 | 跨境电商运营助理 | 2024.08-2024.11',
    '负责商品上架、订单处理、库存查询等基础运营工作，熟悉跨境订单链路，注重细节和准确性，协助关注市场动态与海外客户需求。',
    '',
    '作业帮 | 初中课程顾问 | 2024.11-2025.02',
    '对接 200+ 名家长，分析客户需求并优化沟通方式，试用期内达成 1.1W GMV 目标，强化了目标导向和客户需求挖掘能力。',
  ].join('\n'),
  strengths: [
    '电商运营实操：熟悉商品上架、订单处理、客户服务、转化率提升和基础运营流程。',
    '客户服务能力：能从咨询、反馈和售后场景中捕捉需求，保持耐心沟通并推动问题解决。',
    '市场分析意识：关注消费习惯、平台规则和市场变化，能协助优化产品与运营策略。',
    '综合素养：学习快、抗压强、执行细致，具备团队协作和活动统筹经验。',
  ].join('\n'),
};

const getSavedAboutContent = () => {
  if (typeof window === 'undefined') return defaultAboutContent;

  try {
    const saved = window.localStorage.getItem(aboutStorageKey);
    if (!saved) return defaultAboutContent;
    return { ...defaultAboutContent, ...JSON.parse(saved) } as AboutContent;
  } catch {
    return defaultAboutContent;
  }
};

const toLines = (value: string) => value.split('\n').map((line) => line.trim()).filter(Boolean);

export default function AboutPage() {
  const [aboutContent, setAboutContent] = useState<AboutContent>(getSavedAboutContent);
  const [draftContent, setDraftContent] = useState<AboutContent>(aboutContent);
  const [editingPanel, setEditingPanel] = useState<EditPanel>(null);
  const [activePanel, setActivePanel] = useState<AboutPanel>(null);

  useEffect(() => {
    setDraftContent(aboutContent);
  }, [aboutContent]);

  const openEditor = (panel: EditPanel) => {
    setDraftContent(aboutContent);
    setEditingPanel(panel);
  };

  const saveContent = () => {
    setAboutContent(draftContent);
    window.localStorage.setItem(aboutStorageKey, JSON.stringify(draftContent));
    setEditingPanel(null);
  };

  const resetContent = () => {
    setDraftContent(defaultAboutContent);
  };

  const closePanel = () => setActivePanel(null);

  return (
    <section className="page-section inner-page">
      <SectionTitle eyebrow="About" title="关于我" />
      <div className="about-layout">
        <motion.div className="portrait-panel" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <span style={{ color: '#9fd8ff', fontSize: 22, fontWeight: 800 }}>Jax</span>
            <div className="portrait-symbol"><img src={avatarImage} alt="个人头像" /></div>
          </div>
        </motion.div>
        <div className="about-copy">
          <article className="about-entry-card">
            <button className="about-entry-main" type="button" onClick={() => setActivePanel('history')}>
              <span>PROFILE ARCHIVE</span>
              <strong>学历与经历</strong>
              <small>收纳学历背景、学生会统筹、电商运营和客户沟通经历。</small>
            </button>
            <button className="about-card-edit" type="button" onClick={() => openEditor('history')}>编辑</button>
          </article>
          <article className="about-entry-card">
            <button className="about-entry-main" type="button" onClick={() => setActivePanel('strengths')}>
              <span>CORE SKILLS</span>
              <strong>能力关键词</strong>
              <small>快速查看运营实操、客户服务、市场分析和综合素养。</small>
            </button>
            <button className="about-card-edit" type="button" onClick={() => openEditor('strengths')}>编辑</button>
          </article>
        </div>
      </div>
      {activePanel ? (
        <div className="editor-backdrop" role="dialog" aria-modal="true" aria-label={activePanel === 'history' ? '学历与经历' : '能力关键词'}>
          <div className="about-editor about-viewer">
            <div className="editor-heading">
              <div>
                <span>{activePanel === 'history' ? 'PROFILE ARCHIVE' : 'CORE SKILLS'}</span>
                <h2>{activePanel === 'history' ? '学历与经历' : '能力关键词'}</h2>
              </div>
              <button type="button" onClick={closePanel} aria-label="关闭查看面板">关闭</button>
            </div>
            {activePanel === 'history' ? (
              <div className="viewer-sections">
                <article>
                  <span>学历背景</span>
                  <ul>{toLines(aboutContent.education).map((item) => <li key={item}>{item}</li>)}</ul>
                </article>
                <article>
                  <span>工作经历</span>
                  <ul>{toLines(aboutContent.experience).map((item) => <li key={item}>{item}</li>)}</ul>
                </article>
              </div>
            ) : (
              <div className="viewer-sections">
                <article>
                  <span>能力关键词</span>
                  <ul>{toLines(aboutContent.strengths).map((item) => <li key={item}>{item}</li>)}</ul>
                </article>
              </div>
            )}
          </div>
        </div>
      ) : null}
      {editingPanel ? (
        <div className="editor-backdrop" role="dialog" aria-modal="true" aria-label="编辑关于我">
          <div className="about-editor">
            <div className="editor-heading">
              <div>
                <span>EDIT PROFILE</span>
                <h2>{editingPanel === 'history' ? '编辑学历与经历' : '编辑能力关键词'}</h2>
              </div>
              <button type="button" onClick={() => setEditingPanel(null)} aria-label="关闭编辑面板">关闭</button>
            </div>
            {editingPanel === 'history' ? (
              <>
                <label>
                  学历背景
                  <textarea value={draftContent.education} onChange={(event) => setDraftContent({ ...draftContent, education: event.target.value })} rows={7} />
                </label>
                <label>
                  工作经历
                  <textarea value={draftContent.experience} onChange={(event) => setDraftContent({ ...draftContent, experience: event.target.value })} rows={10} />
                </label>
              </>
            ) : (
              <label>
                能力关键词
                <textarea value={draftContent.strengths} onChange={(event) => setDraftContent({ ...draftContent, strengths: event.target.value })} rows={7} />
              </label>
            )}
            <div className="editor-actions">
              <button type="button" onClick={resetContent}>恢复默认</button>
              <button type="button" onClick={() => setEditingPanel(null)}>取消</button>
              <button type="button" onClick={saveContent}>保存修改</button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
