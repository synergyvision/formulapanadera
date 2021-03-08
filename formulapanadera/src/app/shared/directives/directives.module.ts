import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MarkdownContentDirective } from './markdown-content.directive';

@NgModule({
  declarations: [
		MarkdownContentDirective
	],
	imports: [CommonModule],
	exports: [MarkdownContentDirective]
})
export class DirectivesModule {}