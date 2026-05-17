"use client";

import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, doc, arrayUnion, serverTimestamp } from 'firebase/firestore';

export default function Home() {
    const [view, setView] = useState('landing'); // 'landing' (대문) 또는 'board' (게시판)
    const [questions, setQuestions] = useState([]);
    
    // UI 상태
    const [sidebarState, setSidebarState] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedQId, setSelectedQId] = useState(null);

    const [newQContent, setNewQContent] = useState('');
    const [newQKeyword, setNewQKeyword] = useState('');
    const [commentInput, setCommentInput] = useState('');

    // 파이어베이스(Firestore) 실시간 데이터 구독 (이제 누구나 볼 수 있습니다)
    useEffect(() => {
        const q = query(collection(db, 'questions'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const qs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setQuestions(qs);
        });
        return () => unsubscribe();
    }, []);

    // 새 질문 작성 후 Firestore에 저장 (무조건 '익명 학생'으로 고정)
    const handleSubmitQuestion = async () => {
        if (!newQContent.trim()) return alert('질문 내용을 입력해주세요!');
        let keywords = [];
        if (newQKeyword.trim()) {
            keywords = newQKeyword.split(' ').filter(k => k.trim() !== '').map(k => k.startsWith('#') ? k : `#${k}`);
        }
        
        try {
            await addDoc(collection(db, 'questions'), {
                authorName: '익명 학생',
                content: newQContent.trim(),
                keywords: keywords,
                createdAt: serverTimestamp(),
                comments: []
            });
            setNewQContent('');
            setNewQKeyword('');
            setIsModalOpen(false);
        } catch (error) {
            console.error('질문 등록 에러:', error);
            alert('질문 등록에 실패했습니다.');
        }
    };

    // 새 댓글 작성 후 Firestore에 저장 (무조건 '익명 학생'으로 고정)
    const handleSubmitComment = async () => {
        if (!commentInput.trim() || !selectedQId) return;
        
        try {
            const qRef = doc(db, 'questions', selectedQId);
            await updateDoc(qRef, {
                comments: arrayUnion({
                    id: Date.now().toString(), // 임시 아이디
                    authorName: '익명 학생',
                    content: commentInput.trim(),
                    createdAt: new Date().toISOString()
                })
            });
            setCommentInput('');
        } catch (error) {
            console.error('댓글 등록 에러:', error);
            alert('댓글 등록에 실패했습니다.');
        }
    };

    const allKeywords = Array.from(new Set(questions.flatMap(q => q.keywords || [])));
    const selectedQuestion = questions.find(q => q.id === selectedQId);

    const formatTime = (ts) => {
        if (!ts) return '방금 전';
        const date = ts.toDate ? ts.toDate() : new Date(ts);
        return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
    };

    // ==========================================
    // 1. 대문 (랜딩 페이지) 뷰 렌더링
    // ==========================================
    if (view === 'landing') {
        return (
            <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', position: 'relative', overflow: 'hidden' }}>
                <img src="/hero.png" alt="대문 배경" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }} />
                
                <div style={{ 
                    zIndex: 10, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    backgroundColor: 'rgba(255,255,255,0.9)', 
                    padding: '50px 70px', 
                    borderRadius: '24px', 
                    boxShadow: '0 10px 40px rgba(0,0,0,0.2)' 
                }}>
                    <h1 style={{ color: '#1a1b1e', fontSize: '2.5rem', fontWeight: '900', marginBottom: '10px', textAlign: 'center' }}>
                        질문이 자라는 공간<br/><span style={{color: 'var(--primary-color)'}}>Q&A Space</span>
                    </h1>
                    <p style={{ color: '#495057', fontSize: '1.1rem', marginBottom: '40px', fontWeight: '500' }}>
                        학생들을 위한 자유롭고 따뜻한 익명 질문답변 플랫폼
                    </p>
                    
                    <button onClick={() => setView('board')} className="btn primary-btn" style={{ padding: '16px 60px', fontSize: '1.3rem', borderRadius: '30px', boxShadow: '0 4px 15px rgba(92,124,250,0.4)', fontWeight: 'bold' }}>
                        입장하기
                    </button>
                </div>
            </div>
        );
    }

    // ==========================================
    // 2. 메인 게시판 뷰 렌더링
    // ==========================================
    return (
        <div className="app-container">
            {/* 좌측 사이드바 */}
            <aside className={`sidebar left-sidebar ${sidebarState === 'left' ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <h2>키워드</h2>
                    <button className="close-btn" onClick={() => setSidebarState(null)}>
                        <i className="ph ph-x"></i>
                    </button>
                </div>
                <div className="sidebar-content">
                    <ul className="keyword-list">
                        {allKeywords.map(kw => <li key={kw}>{kw}</li>)}
                    </ul>
                </div>
            </aside>

            <main className="main-content">
                <header className="main-header">
                    <button className="icon-btn" onClick={() => setSidebarState('left')}>
                        <i className="ph ph-list"></i>
                    </button>
                    <h1>Q&A Space</h1>
                    <button className="icon-btn" onClick={() => setSidebarState('right')}>
                        <i className="ph ph-bell"></i>
                    </button>
                </header>

                <div className="feed-container">
                    <div className="question-list">
                        {questions.length === 0 && (
                            <div style={{textAlign:'center', color:'var(--text-secondary)', marginTop:'40px', padding: '20px', background: 'var(--card-bg)', borderRadius: '12px'}}>
                                <h3>첫 익명 질문의 주인공이 되어보세요!</h3>
                                <p style={{marginTop: '10px', fontSize: '0.9rem'}}>오른쪽 아래 <b>+</b> 버튼을 눌러 새 질문을 등록할 수 있습니다.</p>
                            </div>
                        )}
                        {questions.map(q => (
                            <div key={q.id} className="question-card" onClick={() => setSelectedQId(q.id)}>
                                <div className="card-header">
                                    <span className="card-author">{q.authorName}</span>
                                    <span>{formatTime(q.createdAt)}</span>
                                </div>
                                <div className="card-content">{q.content}</div>
                                <div className="card-footer">
                                    <div className="keywords">
                                        {(q.keywords || []).map(kw => <span key={kw} className="keyword-tag">{kw}</span>)}
                                    </div>
                                    <div className="comment-count">
                                        <i className="ph ph-chat-circle"></i> {(q.comments || []).length}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <button className="fab" onClick={() => setIsModalOpen(true)}>
                    <i className="ph ph-plus"></i>
                </button>
            </main>

            {/* 우측 공지사항 사이드바 */}
            <aside className={`sidebar right-sidebar ${sidebarState === 'right' ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <button className="close-btn" onClick={() => setSidebarState(null)}>
                        <i className="ph ph-x"></i>
                    </button>
                    <h2>공지사항</h2>
                </div>
                <div className="sidebar-content">
                    <ul className="notice-list">
                        <li className="notice-item">
                            <span className="notice-badge">안내</span>
                            <p>오픈형 익명 게시판입니다! 비밀번호나 로그인 없이 자유롭게 활동해 보세요.</p>
                        </li>
                    </ul>
                </div>
            </aside>

            {/* 뒷배경 어둡게 */}
            <div className={`overlay ${sidebarState ? 'show' : ''}`} onClick={() => setSidebarState(null)}></div>

            {/* 새 질문 모달 */}
            <div className={`modal ${isModalOpen ? 'show' : ''}`}>
                <div className="modal-content">
                    <div className="modal-header">
                        <h3>새 질문 작성 (익명)</h3>
                        <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                            <i className="ph ph-x"></i>
                        </button>
                    </div>
                    <div className="modal-body">
                        <textarea 
                            placeholder="수업 중 헷갈렸던 부분이나 궁금한 점을 자유롭게 적어주세요!" 
                            rows="4"
                            value={newQContent}
                            onChange={e => setNewQContent(e.target.value)}
                        />
                        <input 
                            type="text" 
                            placeholder="관련 키워드를 입력하세요 (예: #국어 #모의고사)"
                            value={newQKeyword}
                            onChange={e => setNewQKeyword(e.target.value)}
                        />
                    </div>
                    <div className="modal-footer">
                        <button className="btn primary-btn" onClick={handleSubmitQuestion}>익명으로 올리기</button>
                    </div>
                </div>
            </div>

            {/* 상세(댓글) 창 */}
            <div className={`detail-view ${selectedQId ? 'open' : ''}`}>
                <div className="detail-header">
                    <button className="icon-btn" onClick={() => setSelectedQId(null)}>
                        <i className="ph ph-arrow-left"></i>
                    </button>
                    <h2>질문 상세</h2>
                    <div style={{width: 24}}></div>
                </div>
                {selectedQuestion && (
                    <>
                        <div className="detail-content">
                            <div className="q-author">{selectedQuestion.authorName}의 질문</div>
                            <div className="q-text">{selectedQuestion.content}</div>
                            <div className="keywords">
                                {(selectedQuestion.keywords || []).map(kw => <span key={kw} className="keyword-tag">{kw}</span>)}
                            </div>
                        </div>
                        <div className="comment-section">
                            <div className="comment-list">
                                {(!selectedQuestion.comments || selectedQuestion.comments.length === 0) && (
                                    <p style={{textAlign:'center', color:'var(--text-secondary)', fontSize: '0.9rem', marginTop: '20px'}}>아직 답변이 없습니다. 첫 답변을 달아주세요!</p>
                                )}
                                {(selectedQuestion.comments || []).map(c => (
                                    <div key={c.id} className="comment-item">
                                        <div className="comment-avatar">익</div>
                                        <div className="comment-body">
                                            <div className="comment-author">{c.authorName}</div>
                                            <div className="comment-text">{c.content}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="comment-input-area">
                            <input 
                                type="text" 
                                placeholder="익명 답변을 입력해주세요..."
                                value={commentInput}
                                onChange={e => setCommentInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSubmitComment()}
                            />
                            <button className="icon-btn send-btn" onClick={handleSubmitComment}>
                                <i className="ph ph-paper-plane-right"></i>
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
