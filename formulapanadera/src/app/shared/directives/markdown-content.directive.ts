import { Directive, ElementRef, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appMarkdownContent]'
})
export class MarkdownContentDirective {

  @Input() appMarkdownContent;

  constructor(private element: ElementRef, private renderer: Renderer2) {
  }

  ngOnInit() {

    this.renderer.setProperty(this.element.nativeElement, 'innerHTML', this.appMarkdownContent);
  }

}
