import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MarkdownContentDirective } from './markdown-content.directive';
import { HasPermissionDirective } from "./has-permission.directive";

@NgModule({
  declarations: [
		MarkdownContentDirective,
		HasPermissionDirective
	],
	imports: [CommonModule],
	exports: [MarkdownContentDirective, HasPermissionDirective]
})
export class DirectivesModule {}