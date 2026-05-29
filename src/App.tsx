import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';

const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const DocumentsPage = lazy(() => import('./pages/DocumentsPage'));
const NotesPage = lazy(() => import('./pages/NotesPage'));
const ProjectDetailPage = lazy(() => import('./pages/ProjectDetailPage'));
const ProjectSpacePage = lazy(() => import('./pages/ProjectSpacePage'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));

function PageLoading() {
  return <div className="page-loading" aria-hidden="true" />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/about"
          element={
            <Suspense fallback={<PageLoading />}>
              <AboutPage />
            </Suspense>
          }
        />
        <Route
          path="/projects"
          element={
            <Suspense fallback={<PageLoading />}>
              <ProjectsPage />
            </Suspense>
          }
        />
        <Route
          path="/projects/:id"
          element={
            <Suspense fallback={<PageLoading />}>
              <ProjectDetailPage />
            </Suspense>
          }
        />
        <Route
          path="/projects/:id/space"
          element={
            <Suspense fallback={<PageLoading />}>
              <ProjectSpacePage />
            </Suspense>
          }
        />
        <Route
          path="/notes"
          element={
            <Suspense fallback={<PageLoading />}>
              <NotesPage />
            </Suspense>
          }
        />
        <Route
          path="/documents"
          element={
            <Suspense fallback={<PageLoading />}>
              <DocumentsPage />
            </Suspense>
          }
        />
        <Route
          path="/contact"
          element={
            <Suspense fallback={<PageLoading />}>
              <ContactPage />
            </Suspense>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
