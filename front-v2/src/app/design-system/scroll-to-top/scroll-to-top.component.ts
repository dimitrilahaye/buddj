import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-scroll-to-top',
  standalone: false,
  templateUrl: './scroll-to-top.component.html',
  styleUrl: './scroll-to-top.component.scss',
})
export class ScrollToTopComponent {
  isVisible = false;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollPosition =
      document.documentElement.scrollTop || document.body.scrollTop;
    this.isVisible = scrollPosition > 100;

    const button = document.querySelector('.scroll-to-top') as HTMLElement;
    if (button) {
      if (this.isVisible) {
        button.classList.add('show');
      } else {
        button.classList.remove('show');
      }
    }
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
