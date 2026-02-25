'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ===== Types =====
interface Submission {
    id: string;
    name: string;
    phone: string;
    email: string;
    business_name: string;
    passion: string;
    fun_fact: string;
    goals: string;
    connections: string;
    submitted_at: string;
}

interface PaginatedResponse {
    data: Submission[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
}

// ===== Component =====
export default function Dashboard() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [authError, setAuthError] = useState('');
    const [dashboardKey, setDashboardKey] = useState('');

    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const [pageSize] = useState(25);

    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const searchInputRef = useRef<HTMLInputElement>(null);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setCurrentPage(1); // Reset to page 1 on new search
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    // Fetch data
    const fetchSubmissions = useCallback(async () => {
        if (!dashboardKey) return;
        setIsLoading(true);

        try {
            const params = new URLSearchParams({
                page: String(currentPage),
                pageSize: String(pageSize),
            });
            if (debouncedSearch) params.set('search', debouncedSearch);

            const res = await fetch(`/api/dashboard?${params.toString()}`, {
                headers: { 'x-dashboard-key': dashboardKey },
            });

            if (res.status === 401) {
                setIsAuthenticated(false);
                setAuthError('Session expired. Please log in again.');
                return;
            }

            if (!res.ok) throw new Error('Failed to fetch');

            const data: PaginatedResponse = await res.json();
            setSubmissions(data.data || []);
            setTotalPages(data.total_pages || 1);
            setTotalResults(data.total || 0);
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setIsLoading(false);
        }
    }, [dashboardKey, currentPage, pageSize, debouncedSearch]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchSubmissions();
        }
    }, [isAuthenticated, fetchSubmissions]);

    // Keyboard: Escape closes modal, / focuses search
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setSelectedSubmission(null);
            if (e.key === '/' && !selectedSubmission && document.activeElement?.tagName !== 'INPUT') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [selectedSubmission]);

    // Format date
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });
    };

    // Highlight search matches
    const highlight = (text: string | null | undefined) => {
        if (!text) return '';
        if (!debouncedSearch) return text;
        const regex = new RegExp(`(${debouncedSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        const parts = text.split(regex);
        return parts.map((part, i) =>
            regex.test(part) ? `<mark>${part}</mark>` : part
        ).join('');
    };

    // Delete submission
    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this submission? This action cannot be undone.')) return;

        setIsDeleting(true);
        try {
            const res = await fetch(`/api/dashboard?id=${id}`, {
                method: 'DELETE',
                headers: { 'x-dashboard-key': dashboardKey },
            });

            if (!res.ok) throw new Error('Failed to delete');

            // Update local state
            setSubmissions(prev => prev.filter(sub => sub.id !== id));
            setTotalResults(prev => prev - 1);
            setSelectedSubmission(null);
        } catch (err) {
            console.error('Delete error:', err);
            alert('Failed to delete submission. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

    // ===== Login Screen =====
    if (!isAuthenticated) {
        return (
            <>
                <div className="bg-animated">
                    <div className="orb-1" />
                    <div className="orb-2" />
                    <div className="grid-overlay" />
                </div>

                <div className="dash-login-container">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="dash-login-card glass-card"
                    >
                        <div className="dash-login-icon">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#5C9DD7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                        </div>
                        <h1 className="dash-login-title">Dashboard Access</h1>
                        <p className="dash-login-subtitle">Enter your dashboard key to continue</p>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (password.trim()) {
                                    setDashboardKey(password.trim());
                                    setIsAuthenticated(true);
                                    setAuthError('');
                                } else {
                                    setAuthError('Please enter a key');
                                }
                            }}
                        >
                            <input
                                className="form-input"
                                type="password"
                                placeholder="Dashboard secret key..."
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setAuthError('');
                                }}
                                autoFocus
                            />
                            {authError && <p className="error-text" style={{ marginTop: '0.5rem' }}>{authError}</p>}
                            <button className="btn-primary" type="submit" style={{ width: '100%', marginTop: '1rem' }}>
                                Access Dashboard
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
                                </svg>
                            </button>
                        </form>
                    </motion.div>
                </div>
            </>
        );
    }

    // ===== Dashboard =====
    return (
        <>
            <div className="bg-animated">
                <div className="orb-1" />
                <div className="orb-2" />
                <div className="grid-overlay" />
            </div>

            <div className="dash-container">
                {/* Header */}
                <header
                    className="dash-header"
                >
                    <div
                        className="dash-header-left"
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        style={{ cursor: 'pointer' }}
                    >
                        <h1 className="dash-title">Submissions</h1>
                        <span className="dash-count">
                            {totalResults.toLocaleString()} {totalResults === 1 ? 'person' : 'people'}
                        </span>
                    </div>
                    <div className="dash-header-right">
                        <div className="dash-search-wrapper">
                            <svg className="dash-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                            </svg>
                            <input
                                ref={searchInputRef}
                                className="dash-search-input"
                                type="text"
                                placeholder="Search name, business, goals, connections..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            {search && (
                                <button
                                    className="dash-search-clear"
                                    onClick={() => setSearch('')}
                                    aria-label="Clear search"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M18 6L6 18" /><path d="M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                            <span className="dash-search-hint">/</span>
                        </div>
                    </div>
                </header>

                {/* Loading */}
                {isLoading && (
                    <div className="dash-loading">
                        <div className="spinner" style={{ width: 28, height: 28 }} />
                    </div>
                )}

                {/* Cards Grid */}
                {!isLoading && submissions.length === 0 && (
                    <div className="dash-empty">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1rem' }}>
                            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                        </svg>
                        <p className="dash-empty-text">
                            {debouncedSearch ? `No results for "${debouncedSearch}"` : 'No submissions yet'}
                        </p>
                    </div>
                )}

                <div className="dash-grid">
                    <AnimatePresence mode="popLayout">
                        {submissions.map((sub, idx) => (
                            <motion.div
                                key={sub.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3, delay: idx * 0.03 }}
                                className="dash-card glass-card"
                                onClick={() => setSelectedSubmission(sub)}
                                tabIndex={0}
                                role="button"
                                onKeyDown={(e) => e.key === 'Enter' && setSelectedSubmission(sub)}
                            >
                                {/* Card Header */}
                                <div className="dash-card-header">
                                    <div className="dash-card-avatar">
                                        {sub.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="dash-card-identity">
                                        <h3
                                            className="dash-card-name"
                                            dangerouslySetInnerHTML={{ __html: highlight(sub.name) }}
                                        />
                                        <p
                                            className="dash-card-business"
                                            dangerouslySetInnerHTML={{ __html: highlight(sub.business_name) }}
                                        />
                                    </div>
                                </div>

                                {/* Intro-relevant info */}
                                {sub.connections && (
                                    <div className="dash-card-section">
                                        <span className="dash-card-label">Looking to meet</span>
                                        <p
                                            className="dash-card-value"
                                            dangerouslySetInnerHTML={{ __html: highlight(sub.connections) }}
                                        />
                                    </div>
                                )}

                                {sub.passion && (
                                    <div className="dash-card-section">
                                        <span className="dash-card-label">Passionate about</span>
                                        <p
                                            className="dash-card-value"
                                            dangerouslySetInnerHTML={{ __html: highlight(sub.passion) }}
                                        />
                                    </div>
                                )}

                                {/* Footer */}
<div className="dash-card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span className="dash-card-date">{formatDate(sub.submitted_at)}</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <button
                                            className="dash-card-delete-icon"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(sub.id);
                                            }}
                                            disabled={isDeleting}
                                            title="Delete"
                                            style={{ opacity: isDeleting ? 0.5 : 1 }}
                                        >
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                            </svg>
                                        </button>
                                        <span className="dash-card-view">View →</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="dash-pagination">
                        <button
                            className="btn-secondary"
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage <= 1}
                            style={{ opacity: currentPage <= 1 ? 0.3 : 1 }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
                            </svg>
                            Previous
                        </button>

                        <div className="dash-pagination-info">
                            <span className="dash-pagination-current">Page {currentPage}</span>
                            <span className="dash-pagination-total">of {totalPages}</span>
                        </div>

                        <button
                            className="btn-secondary"
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage >= totalPages}
                            style={{ opacity: currentPage >= totalPages ? 0.3 : 1 }}
                        >
                            Next
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedSubmission && (
                    <motion.div
                        className="dash-modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedSubmission(null)}
                    >
                        <motion.div
                            className="dash-modal glass-card-elevated"
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Close */}
                            <button
                                className="dash-modal-close"
                                onClick={() => setSelectedSubmission(null)}
                                aria-label="Close"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 6L6 18" /><path d="M6 6l12 12" />
                                </svg>
                            </button>

                            {/* Modal Header */}
                            <div className="dash-modal-header">
                                <div className="dash-modal-avatar">
                                    {selectedSubmission.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h2 className="dash-modal-name">{selectedSubmission.name}</h2>
                                    <p className="dash-modal-business">{selectedSubmission.business_name}</p>
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="dash-modal-contact">
                                <a href={`tel:${selectedSubmission.phone}`} className="dash-modal-contact-item">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                                    </svg>
                                    {selectedSubmission.phone}
                                </a>
                                <a href={`mailto:${selectedSubmission.email}`} className="dash-modal-contact-item">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 7l-10 6L2 7" />
                                    </svg>
                                    {selectedSubmission.email}
                                </a>
                            </div>

                            {/* Discovery Answers */}
                            <div className="dash-modal-sections">
                                <div className="dash-modal-section">
                                    <h4 className="dash-modal-section-label">🔥 Passionate About</h4>
                                    <p className="dash-modal-section-text">{selectedSubmission.passion || '—'}</p>
                                </div>

                                <div className="dash-modal-section">
                                    <h4 className="dash-modal-section-label">🏆 Fun Fact / Proud Of</h4>
                                    <p className="dash-modal-section-text">{selectedSubmission.fun_fact || '—'}</p>
                                </div>

                                <div className="dash-modal-section">
                                    <h4 className="dash-modal-section-label">🎯 Goals</h4>
                                    <p className="dash-modal-section-text">{selectedSubmission.goals || '—'}</p>
                                </div>

                                <div className="dash-modal-section dash-modal-section-highlight">
                                    <h4 className="dash-modal-section-label">🤝 Looking to Connect With</h4>
                                    <p className="dash-modal-section-text">{selectedSubmission.connections || '—'}</p>
                                </div>
                            </div>

                            <div className="dash-modal-footer">
                                <span className="dash-card-date">Submitted {formatDate(selectedSubmission.submitted_at)}</span>
                                <button
                                    className="dash-delete-btn"
                                    onClick={() => handleDelete(selectedSubmission.id)}
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? (
                                        <div className="spinner" style={{ width: 14, height: 14, borderLeftColor: 'white' }} />
                                    ) : (
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                        </svg>
                                    )}
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
