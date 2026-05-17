import './globals.css';

export const metadata = {
  title: 'Q&A Space',
  description: '학생들을 위한 자유로운 질문답변 공간',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <script src="https://unpkg.com/@phosphor-icons/web" async></script>
      </head>
      <body>{children}</body>
    </html>
  )
}
