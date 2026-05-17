"use client";

import { useState, useEffect } from 'react';

// === 초기 데이터 세팅 ===
const CURRENT_USER = { id: 'user_01', name: '테스트유저' };

const initialQuestions = [
    {
        id: 1,
        authorId: 'user_02',
        authorName: '김학생',
        content: '수학 2단원 미적분에서 치환적분법이 너무 헷갈려요. 혹시 쉽게 이해하는 방법 아시는 분 있나요?',
        keywords: ['#수학', '#미적분', '#어려움'],
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        comments: [
            { id: 101, authorId: 'user_03', authorName: '박천재', content: '공식을 무작정 외우기보다는 덩어리 전체를 하나의 문자로 두는 연습을 해보세요!' }
        ]
    },
    {
        id: 2,
        authorId: 'user_01',
        authorName: '테스트유저',
        content: '내일 국어 수행평가 범위가 어디서부터 어디까지인지 아시는 분? 선생님께서 말씀해주신 걸 까먹었어요ㅠㅠ',
        keywords: ['#국어', '#수행평가'],
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        comments: []
    }
];

export default function Home() {
    const [questions, setQuestions] = useState([]);
    const [sidebarState, setSidebarState] = useState(null); // 'left' | 'right' | null
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedQId, setSelectedQId] = useState(null);

    // 새 질문 폼 상태
    const [newQContent, setNewQContent] = useState('');
    const [newQKeyword, setNewQKeyword] = useState('');

    // 새 댓글 폼 상태
    const [commentInput, setCommentInput] = useState('');

    // 첫 렌더링 시 로컬스토리지에서 데이터 불러오기
    useEffect(() => {
        const saved = localStorage.getItem('qa_data_nextjs');
        if (saved) {
            setQuestions(JSON.parse(saved));
        } else {
            setQuestions(initialQuestions);
            localStorage.setItem('qa_data_nextjs', JSON.stringify(initialQuestions));
        }
    }, []);

    // questions가 바뀔 때마다 로컬스토리지 저장
    useEffect(() => {
        if (questions.length > 0) {
            localStorage.setItem('qa_data_nextjs', JSON.stringify(questions));
        }
    }, [questions]);

    // 키워드 목록 추출
    const allKeywords = Array.from(new Set(questions.flatMap(q => q.keywords)));

    // 날짜 포맷 함수 (예: 14:05)
    const formatTime = (isoString) => {
        const date = new Date(isoString);
        return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
    };

    // 새 질문 추가 핸들러
    const handleSubmitQuestion = () => {
        if (!newQContent.trim()) {
            alert('질문 내용을 입력해주세요!');
            return;
        }
        let keywords = [];
        if (newQKeyword.trim()) {
            keywords = newQKeyword.split(' ').filter(k => k.trim() !== '').map(k => k.startsWith('#') ? k : `#${k}`);
        }
        const newQuestion = {
            id: Date.now(),
            authorId: CURRENT_USER.id,
            authorName: CURRENT_USER.name,
            content: newQContent.trim(),
            keywords: keywords,
            createdAt: new Date().toISOString(),
            comments: []
        };
        setQuestions([newQuestion, ...questions]);
        setNewQContent('');
        setNewQKeyword('');
        setIsModalOpen(false);
    };

    // 새 댓글 추가 핸들러
    const handleSubmitComment = () => {
        if (!commentInput.trim() || !selectedQId) return;
        
        setQuestions(prev => prev.map(q => {
            if (q.id === selectedQId) {
                return {
                    ...q,
                    comments: [...q.comments, {
                        id: Date.now(),
                        authorId: CURRENT_USER.id,
                        authorName: CURRENT_USER.name,
                        content: commentInput.trim()
                    }]
                };
            }
            return q;
        }));
        setCommentInput('');
    };

    const selectedQuestion = questions.find(q => q.id === selectedQId);

    return (
        <div className="app-container">
            {/* 왼쪽 사이드바 (키워드) */}
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

            {/* 메인 콘텐츠 (질문 게시판) */}
            <main className="main-content">
                <header className="main-header">
                    <button className="icon-btn" id="menu-btn" onClick={() => setSidebarState('left')}>
                        <i className="ph ph-list"></i>
                    </button>
                    <h1>질문 게시판</h1>
                    <button className="icon-btn" id="notice-btn" onClick={() => setSidebarState('right')}>
                        <i className="ph ph-bell"></i>
                    </button>
                </header>

                <div className="feed-container">
                    {/* 이미지 배경을 활용한 멋진 상단 배너 */}
                    <div style={{
                        position: 'relative',
                        width: '100%',
                        height: '240px', // 적당히 큰 높이
                        marginBottom: '24px',
                        borderRadius: 'var(--radius)',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#fff',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                    }}>
                        <img 
                            src="/hero.png" 
                            alt="열심히 공부하는 학생들" 
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover', // 이미지 비율 유지하며 꽉 채움
                                position: 'absolute',
                                top: 0,
                                left: 0
                            }} 
                        />
                        {/* 이미지 중앙에 배치될 앱 제목 */}
                        <h2 style={{
                            position: 'relative',
                            zIndex: 10,
                            color: '#1a1b1e', // 짙은 색으로 또렷하게
                            fontSize: '2.2rem',
                            fontWeight: '800',
                            textAlign: 'center',
                            // 글씨가 잘 보이도록 주변에 하얀빛 그림자 효과
                            textShadow: '0 2px 15px rgba(255,255,255,0.9), 0 0 5px rgba(255,255,255,0.8)',
                            padding: '10px 20px'
                        }}>
                            질문이 자라는 공간<br/>Q&A Space
                        </h2>
                    </div>

                    <div className="question-list">
                        {questions.length === 0 && (
                            <p style={{textAlign:'center', color:'var(--text-secondary)', marginTop:'20px'}}>아직 등록된 질문이 없습니다.<br/>첫 질문을 남겨보세요!</p>
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
                                        {q.keywords.map(kw => <span key={kw} className="keyword-tag">{kw}</span>)}
                                    </div>
                                    <div className="comment-count">
                                        <i className="ph ph-chat-circle"></i> {q.comments.length}
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

            {/* 오른쪽 사이드바 (공지사항) */}
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
                            <span className="notice-badge">필독</span>
                            <p>질문 작성 시 예의를 지켜주세요!</p>
                        </li>
                        <li className="notice-item">
                            <span className="notice-badge">안내</span>
                            <p>모르는 수학 문제는 #수학 태그를 달아보세요.</p>
                        </li>
                    </ul>
                </div>
            </aside>

            {/* 모바일 오버레이 */}
            <div 
                className={`overlay ${sidebarState ? 'show' : ''}`} 
                onClick={() => setSidebarState(null)}
            ></div>

            {/* 질문 작성 모달 */}
            <div className={`modal ${isModalOpen ? 'show' : ''}`}>
                <div className="modal-content">
                    <div className="modal-header">
                        <h3>새 질문 작성</h3>
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
                        <button className="btn primary-btn" onClick={handleSubmitQuestion}>질문 올리기</button>
                    </div>
                </div>
            </div>

            {/* 상세 화면 (댓글) */}
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
                                {selectedQuestion.keywords.map(kw => <span key={kw} className="keyword-tag">{kw}</span>)}
                            </div>
                        </div>
                        <div className="comment-section">
                            <div className="comment-list">
                                {selectedQuestion.comments.length === 0 && (
                                    <p style={{textAlign:'center', color:'var(--text-secondary)', fontSize: '0.9rem'}}>아직 답변이 없습니다. 첫 답변을 달아주세요!</p>
                                )}
                                {selectedQuestion.comments.map(c => (
                                    <div key={c.id} className="comment-item">
                                        <div className="comment-avatar">{c.authorName.charAt(0)}</div>
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
                                placeholder="답변을 입력해주세요..."
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
