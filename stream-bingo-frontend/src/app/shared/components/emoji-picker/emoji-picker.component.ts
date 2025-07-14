import { Component, CUSTOM_ELEMENTS_SCHEMA, effect, ElementRef, output, signal, viewChild } from '@angular/core'
import { ButtonModule } from 'primeng/button'
import { PopoverModule, Popover } from 'primeng/popover'

import { EmojiPickerElement } from 'unicode-emoji-picker'

const randomEmojis = [
  '😀', '😂', '😍', '🥳', '😎', '🤔', '😢', '😡', '👍', '👋',
  '🎉', '🎈', '🌟', '💖', '🔥', '🌈', '🍕', '🍔', '🍩', '🍦',
];

@Component({
  selector: 'app-emoji-picker',
  imports: [
    ButtonModule, PopoverModule, 
  ],
  templateUrl: './emoji-picker.component.html',
  styleUrl: './emoji-picker.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA ],
})
export class EmojiPickerComponent  {
  readonly emojiSelected = output<string>()

  
  readonly opRef = viewChild<Popover>('op')

  readonly emojiListRef = viewChild<ElementRef<EmojiPickerElement>>('emojiList')
  readonly randomEmoji = signal<string>(randomEmojis[Math.floor(Math.random() * randomEmojis.length)])


  constructor() {
    effect(() => {
      const emojiList = this.emojiListRef()?.nativeElement;
      if (emojiList) {
        emojiList.addEventListener('emoji-pick', (event: CustomEvent) => {
          this.emojiSelected.emit(event.detail.emoji)
          this.opRef()?.hide()
        });
      } else {
        console.error('Emoji picker not found');
      }
    })
  }
}
