import { useState, useEffect, useCallback } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AuthPage from "./pages/AuthPage";
import AuthCallback from "./pages/AuthCallback";
import Recorder from "./components/Recorder";
import NoteCard from "./components/NoteCard";
import NoteView from "./components/NoteView";

/* ─────────────────────────────── SVG ICONS ─────────────────────────────── */
const MicLogoIcon = () => (
  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
    <path d="M19 10v1a7 7 0 0 1-14 0v-1" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
    <line x1="12" y1="18" x2="12" y2="22" stroke="white" strokeWidth="2" strokeLinecap="round" />
    <line x1="8"  y1="22" x2="16" y2="22" stroke="white" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const HamburgerIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
  </svg>
);

/* ─────────────────────────────── SIDEBAR CONTENT ─────────────────────────────── */
function SidebarContent({ notes, loading, selectedNote, onNoteClick }) {
  return (
    <>
      {/* Header row */}
      <div className="flex items-center justify-between px-4 pt-5 pb-3 shrink-0">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Your Notes</h2>
        <span className="text-xs font-semibold bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full">
          {notes.length}
        </span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-2">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-slate-200 rounded-xl h-[72px]" />
          ))
        ) : notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <span className="text-3xl mb-2">🎙️</span>
            <p className="text-sm text-slate-400 leading-snug">
              No notes yet. Record your first voice note!
            </p>
          </div>
        ) : (
          notes.map((note) => (
            <NoteCard
              key={note._id}
              note={note}
              isSelected={selectedNote?._id === note._id}
              onClick={() => onNoteClick(note)}
            />
          ))
        )}
      </div>
    </>
  );
}

/* ─────────────────────────────── DASHBOARD ─────────────────────────────── */
function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  // On mobile: "list" shows recorder + note; when a note is tapped we push to "detail"
  const [mobileView, setMobileView] = useState("home"); // "home" | "detail"
  const { token, user, logout } = useAuth();

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  useEffect(() => {
    axios
      .get("https://voice-notes-app-rqja.onrender.com/api/notes", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setNotes(res.data);
        if (res.data.length > 0) setSelectedNote(res.data[0]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  // Close drawer on resize to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setDrawerOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
const handleNewNote = (note) => {
  console.log("New note received:", note);
  setNotes((prev) => [note, ...prev]);
  setSelectedNote(note);
  // Only push to detail view on mobile
  if (window.innerWidth < 1024) {
    setMobileView("detail");
  }
  setDrawerOpen(false);
};
  const handleNoteClick = useCallback((note) => {
  setSelectedNote(note);
  setDrawerOpen(false);
  if (window.innerWidth < 1024) {
    setMobileView("detail");
  }
}, []);
  const handleBackToHome = () => {
    setMobileView("home");
    setSelectedNote(null);
  };

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">

      {/* ═══════════ HEADER ═══════════ */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-100 bg-white z-20 shrink-0">
        <div className="flex items-center gap-2.5">
          {/* Hamburger — mobile/tablet only */}
          <button
            id="sidebar-toggle-btn"
            onClick={() => setDrawerOpen((o) => !o)}
            className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors mr-1"
            aria-label={drawerOpen ? "Close sidebar" : "Open sidebar"}
          >
            {drawerOpen ? <CloseIcon /> : <HamburgerIcon />}
          </button>

          {/* Logo */}
          <div className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-600 shadow-md shadow-blue-200">
            <MicLogoIcon />
          </div>
          <span className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
            AI Voice Notes
          </span>
          <span className="hidden sm:inline text-[10px] font-bold bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full uppercase tracking-widest">
            Beta
          </span>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="hidden md:inline text-sm text-slate-500 font-medium truncate max-w-[120px] lg:max-w-none">
            {user?.name || user?.email || "User"}
          </span>
          <div
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow shrink-0"
            aria-label="User avatar"
          >
            {initials}
          </div>
          <button
            id="logout-btn"
            onClick={logout}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-500 transition-colors px-2 py-1.5 rounded-lg hover:bg-red-50"
          >
            <LogoutIcon />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* ═══════════ BODY ═══════════ */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* ── Backdrop (mobile) ── */}
        {drawerOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/30 z-30 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* ── LEFT SIDEBAR ── */}
        <aside
          aria-label="Voice notes list"
          className={`
            bg-[#F8FAFC] border-r border-slate-100 flex flex-col overflow-hidden
            transition-transform duration-300 ease-in-out
            /* Mobile: fixed full-height drawer sliding in from left */
            fixed top-0 left-0 h-full z-40 w-[300px] pt-[57px]
            ${drawerOpen ? "translate-x-0" : "-translate-x-full"}
            /* Desktop: static sidebar, reset transforms */
            lg:static lg:translate-x-0 lg:z-auto lg:w-[280px] lg:shrink-0 lg:pt-0 lg:h-auto
          `}
        >
          <SidebarContent
            notes={notes}
            loading={loading}
            selectedNote={selectedNote}
            onNoteClick={handleNoteClick}
          />
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="flex-1 overflow-y-auto bg-white" aria-label="Main content">

          {/* Mobile: show note detail as a "pushed" view */}
          {mobileView === "detail" && selectedNote ? (
            <div className="lg:hidden px-4 py-6 space-y-6 max-w-2xl mx-auto">
              {/* Back button */}
              <button
                id="back-to-list-btn"
                onClick={handleBackToHome}
                className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
              >
                <ArrowLeftIcon />
                All Notes
              </button>
              <NoteView key={selectedNote._id} note={selectedNote} />
            </div>
          ) : (
            /* Default view (desktop always, mobile when mobileView === "home") */
            <div className={`${mobileView === "detail" ? "hidden lg:block" : ""} max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 sm:space-y-10`}>

              {/* ── Recording section ── */}
              <section
                className="bg-white rounded-2xl border border-slate-100 shadow-sm px-4 sm:px-6 pt-4 pb-2"
                aria-label="Recording section"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <h1 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                    New Recording
                  </h1>
                </div>
                <Recorder onNewNote={handleNewNote} token={token} />
              </section>

              {/* ── Notes list (mobile-only inline list) ── */}
              <div className="lg:hidden">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Your Notes</h2>
                  <span className="text-xs font-semibold bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full">
                    {notes.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="animate-pulse bg-slate-100 rounded-xl h-[72px]" />
                    ))
                  ) : notes.length === 0 ? (
                    <EmptyState />
                  ) : (
                    notes.map((note) => (
                      <NoteCard
                        key={note._id}
                        note={note}
                        isSelected={selectedNote?._id === note._id}
                        onClick={() => handleNoteClick(note)}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* ── Desktop: note detail inline ── */}
              <div className="hidden lg:block">
                {selectedNote ? (
                  <>
                    <div className="flex items-center gap-3 mb-8">
                      <div className="flex-1 h-px bg-slate-100" />
                      <span className="text-xs text-slate-400 font-medium uppercase tracking-widest shrink-0">
                        Selected Note
                      </span>
                      <div className="flex-1 h-px bg-slate-100" />
                    </div>
                    <NoteView key={selectedNote._id} note={selectedNote} />
                  </>
                ) : !loading && notes.length === 0 ? (
                  <EmptyState />
                ) : null}
              </div>

            </div>
          )}
        </main>
      </div>
    </div>
  );
}

/* ─────────────────────────────── EMPTY STATE ─────────────────────────────── */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center">
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-blue-50 flex items-center justify-center mb-4 sm:mb-5 shadow-sm">
        <svg className="w-8 h-8 sm:w-10 sm:h-10 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
          <path d="M19 10v1a7 7 0 0 1-14 0v-1" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
          <line x1="12" y1="18" x2="12" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="8"  y1="22" x2="16" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <h2 className="text-lg sm:text-xl font-bold text-slate-700 mb-2">Start recording</h2>
      <p className="text-sm text-slate-400 max-w-[260px] sm:max-w-xs leading-relaxed">
        Tap the mic button above to create your first AI-powered voice note. It will be transcribed and summarized automatically.
      </p>
    </div>
  );
}

/* ─────────────────────────────── PROTECTED ROUTE ─────────────────────────────── */
function ProtectedRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/auth" />;
}

/* ─────────────────────────────── APP ─────────────────────────────── */
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}