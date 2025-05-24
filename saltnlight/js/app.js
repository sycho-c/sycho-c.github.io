// PWA 관련 변수
let deferredPrompt;

const resourcesData = [
    {
        title: '생각의 전쟁과 전신갑주',
        url: './data/1',
    }
];

// 앱 초기화
function initApp() {
    // 데이터 로드 및 표시
    displayResources(resourcesData);

    // PWA 설치 이벤트 리스너
    setupPWAInstall();
}

// 자원 목록 표시
function displayResources(resources) {
    const resourcesContainer = document.querySelector('.resources');

    // 정적 HTML에 이미 예시 항목이 있으면 지웁니다
    resourcesContainer.innerHTML = '';

    resources.forEach(resource => {
        const resourceItem = document.createElement('a');
        resourceItem.href = resource.url;
        resourceItem.target = '_blank';
        resourceItem.classList.add('resource-item');
        resourceItem.innerHTML = `<div><h3>${resource.title}</h3></div> `;
        resourcesContainer.appendChild(resourceItem);
    });
}

// 자원 상세 정보 표시 (모달 또는 새 페이지로 구현 가능)
function showResourceDetail(resource) {
    alert(`${resource.title}\n\n${resource.content}`);
    // 실제 구현에서는 모달이나 상세 페이지로 구현
}

// PWA 설치 기능 설정
function setupPWAInstall() {
    // 앱 설치 프롬프트 이벤트 캡처
    window.addEventListener('beforeinstallprompt', (e) => {
        // 기본 동작 방지
        e.preventDefault();
        // 이벤트 저장
        deferredPrompt = e;
    });

    // 이미 설치된 경우
    window.addEventListener('appinstalled', () => {
        console.log('앱이 이미 설치되어 있습니다');
        deferredPrompt = null;
        installButton.classList.remove('show');
    });
}

// 앱 초기화 실행
document.addEventListener('DOMContentLoaded', initApp);
