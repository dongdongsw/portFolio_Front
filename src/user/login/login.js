const hamMenu = document.querySelector('.ham-menu');
const navSlide = document.querySelector('.container .nav-class');

if (hamMenu && navSlide) {
  // 접근성: 토글 상태 알려주기
  if (!navSlide.id) navSlide.id = 'nav-slide';
  hamMenu.setAttribute('aria-controls', navSlide.id);
  hamMenu.setAttribute('aria-expanded', 'false');

  const toggleNav = () => {
    const isOpen = navSlide.classList.toggle('is-open');
    hamMenu.setAttribute('aria-expanded', String(isOpen));
  };

  hamMenu.addEventListener('click', toggleNav);

  // 선택: ESC로 닫기
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navSlide.classList.contains('is-open')) {
      navSlide.classList.remove('is-open');
      hamMenu.setAttribute('aria-expanded', 'false');
      hamMenu.focus();
    }
  });

  // 선택: 바깥 클릭 시 닫기
  document.addEventListener('click', (e) => {
    if (
      navSlide.classList.contains('is-open') &&
      !navSlide.contains(e.target) &&
      !hamMenu.contains(e.target)
    ) {
      navSlide.classList.remove('is-open');
      hamMenu.setAttribute('aria-expanded', 'false');
    }
  });
} else {
  console.warn('hamMenu 또는 navSlide를 찾지 못했어. 선택자 확인 ㄱㄱ');
}