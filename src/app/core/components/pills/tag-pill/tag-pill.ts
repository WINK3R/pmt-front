import {Component, Input} from '@angular/core';
import {labelOf, Tag} from '../../../models/enum/tag';
import {NgClass} from '@angular/common';

@Component({
  selector: 'app-tag-pill',
  imports: [
    NgClass
  ],
  templateUrl: './tag-pill.html',
  styleUrl: './tag-pill.css'
})
export class TagPill {
  @Input({ required: true }) tag!: Tag;

  classesOf(tag: Tag): string {
    const map: Partial<Record<Tag, string>> = {
      [Tag.Development]: 'bg-indigo-100 text-indigo-700',
      [Tag.Frontend]: 'bg-orange-100 text-orange-700',
      [Tag.Backend]: 'bg-slate-100 text-slate-800',
      [Tag.DevOps]: 'bg-emerald-100 text-emerald-700',
      [Tag.DataScience]: 'bg-fuchsia-100 text-fuchsia-700',
      [Tag.AI]: 'bg-purple-100 text-purple-700',
      [Tag.Security]: 'bg-red-100 text-red-700',
      [Tag.Cloud]: 'bg-sky-100 text-sky-700',
      [Tag.Design]: 'bg-pink-100 text-pink-700',
      [Tag.Product]: 'bg-blue-100 text-blue-700',
      [Tag.Marketing]: 'bg-amber-100 text-amber-700',
      [Tag.Sport]: 'bg-green-100 text-green-700',
      [Tag.Music]: 'bg-violet-100 text-violet-700',
      [Tag.Travel]: 'bg-cyan-100 text-cyan-700',
    };
    return map[tag] ?? 'bg-gray-100 text-gray-800';
  }

  protected readonly labelOf = labelOf;
}
