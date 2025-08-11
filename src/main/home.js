const hamMenu = document.querySelector('.ham-menu');
var navSlide = document.querySelector('.container .nav-class');

hamMenu.addEventListener('click',() => {
  if(navSlide.style.transform === 'translateY(100%) translateX(0px)'){
    return navSlide.style.transform = 'translateY(100%) translateX(100%)'
  }
  navSlide.style.transform = 'translateY(100%) translateX(0)'
})