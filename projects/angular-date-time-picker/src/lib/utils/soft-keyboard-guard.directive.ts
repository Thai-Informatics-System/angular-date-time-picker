import { Directive, ElementRef, HostListener, OnInit, inject } from '@angular/core';

/**
 * Stops the on-screen keyboard from opening when a text input is focused by code rather than
 * by the user, e.g. a parent MatDialog's autoFocus or focus restored after the picker dialog
 * closes. iOS opens the keyboard for any focused editable input, so on touch devices the
 * input stays readonly until the user taps it, and goes back to readonly on blur.
 */
@Directive({
  selector: 'input[libSoftKeyboardGuard]',
  standalone: false,
})
export class SoftKeyboardGuardDirective implements OnInit {
  private input: HTMLInputElement = inject(ElementRef).nativeElement;
  private enabled = typeof window !== 'undefined' && !!window.matchMedia?.('(pointer: coarse)').matches;
  private refocusOnClick = false;

  ngOnInit() {
    if (this.enabled) this.input.readOnly = true;
  }

  @HostListener('pointerdown')
  onPointerDown() {
    if (!this.enabled || !this.input.readOnly) return;
    // Already focused by code: the tap won't fire a new focus, so refocus on click (a user gesture).
    this.refocusOnClick = document.activeElement === this.input;
    this.input.readOnly = false;
  }

  @HostListener('click')
  onClick() {
    if (!this.refocusOnClick) return;
    this.refocusOnClick = false;
    this.input.blur();
    this.input.readOnly = false;
    this.input.focus();
  }

  /** The tap turned into a scroll, so the input was never focused. */
  @HostListener('pointercancel')
  onPointerCancel() {
    if (this.enabled && document.activeElement !== this.input) this.input.readOnly = true;
  }

  @HostListener('blur')
  onBlur() {
    if (this.enabled) this.input.readOnly = true;
  }
}
