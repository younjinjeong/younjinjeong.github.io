// 터미널 커서 깜빡임 효과
document.addEventListener('DOMContentLoaded', function() {
    const cursor = document.querySelector('.terminal-cursor');
    if (cursor) {
        setInterval(function() {
            cursor.style.opacity = cursor.style.opacity === '0' ? '1' : '0';
        }, 500);  // 500ms 간격으로 깜빡임
    }
}); 