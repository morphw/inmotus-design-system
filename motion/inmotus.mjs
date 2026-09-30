/** InMotus feedback. Times here are seconds unless explicitly marked ms. */
export const feedback = Object.freeze({
  press: Object.freeze({ scale: 1.06, settleScale: 1.012, settleAt: 0.7, downMs: 90, releaseMs: 360 }),
  capsule: Object.freeze({ leading: 0.32, trailing: 0.48, duration: 0.48, bounce: 0, scaleX: 1.04, scaleY: 1.08, peakAt: 0.35, ease: [0.32, 0.72, 0, 1] }),
  popup: Object.freeze({ open: 0.32, close: 0.18, openScale: 0.9, closeScale: 0.96, offset: 6, menuCloseOffset: 4, openEase: [0.32, 0.72, 0, 1], closeEase: [0.32, 0, 0.67, 0] }),
  actionSheet: Object.freeze({ duration: 0.4 }),
});

/** Full feedback is the visual reference; projects can select system or off. */
export function feedbackEnabled(element) {
  const mode = element.closest('[data-inmotus-feedback]')?.dataset.inmotusFeedback ?? 'full';
  return mode !== 'off' && (mode !== 'system' || !element.ownerDocument.defaultView.matchMedia('(prefers-reduced-motion: reduce)').matches);
}

/** Install once per document/container; includes controls mounted later and portals in that root. */
export function installPressFeedback(root = document) {
  const view = root.ownerDocument?.defaultView ?? root.defaultView;
  const releases = new Map();
  const pressed = new Map();
  const selector = "button:not([data-inmotus-press='none']):not([role='menuitem']), a[data-inmotus-press='button']";
  const find = (event) => event.composedPath().find((node) =>
    node instanceof view.HTMLElement && node.matches(selector)
    && (root.nodeType === 9 || root === node || root.contains(node))
    && (root.nodeType !== 9 || node.closest('.inmotus-theme, [data-inmotus-feedback]'))
    && !node.matches(":disabled, [aria-disabled='true']"));
  const cancel = (button) => { releases.get(button)?.cancel(); releases.delete(button); };
  const release = (button) => {
    cancel(button);
    if (button.matches(":disabled, [aria-disabled='true'], [data-inmotus-press='none']") || !feedbackEnabled(button) || !button.animate) return;
    const target = button.dataset.inmotusPress === 'content' && button.firstElementChild instanceof view.HTMLElement
      ? button.firstElementChild : button;
    // Individual scale preserves existing transforms and quick/keyboard taps.
    const animation = target.animate([
      { scale: feedback.press.scale, offset: 0, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
      { scale: feedback.press.settleScale, offset: feedback.press.settleAt, easing: 'ease-in-out' },
      { scale: 1, offset: 1 },
    ], { duration: feedback.press.releaseMs });
    releases.set(button, animation);
    animation.onfinish = animation.oncancel = () => {
      if (releases.get(button) === animation) releases.delete(button);
    };
  };
  const down = (event) => {
    if (event.button !== 0) return;
    const button = find(event);
    if (!button) return;
    cancel(button);
    pressed.set(event.pointerId, { button, bounds: button.getBoundingClientRect(), x: event.clientX, y: event.clientY });
  };
  const up = (event) => {
    const press = pressed.get(event.pointerId);
    pressed.delete(event.pointerId);
    if (!press?.button.isConnected) return;
    const { button, bounds, x, y } = press;
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) return;
    if (event.pointerType !== 'mouse' && Math.hypot(event.clientX - x, event.clientY - y) > 10) return;
    // Selects may open on pointerdown and suppress click; pointerup still gives feedback.
    release(button);
  };
  const pointerCancel = (event) => pressed.delete(event.pointerId);
  const click = (event) => {
    const button = find(event);
    if (button && !(event.detail > 0 && releases.has(button))) release(button);
  };
  const clear = () => pressed.clear();
  for (const [name, handler] of [['pointerdown', down], ['pointerup', up], ['pointercancel', pointerCancel], ['click', click]]) root.addEventListener(name, handler, true);
  view.addEventListener('blur', clear);
  return () => {
    for (const [name, handler] of [['pointerdown', down], ['pointerup', up], ['pointercancel', pointerCancel], ['click', click]]) root.removeEventListener(name, handler, true);
    view.removeEventListener('blur', clear);
    clear();
    for (const animation of releases.values()) animation.cancel();
    releases.clear();
  };
}

/** Pass { animate, motionValue } from motion (or an equivalent engine). No app/router imports. */
export function createElasticIndicator(element, { animate, motionValue }, { unit = 'px', minimumWidth = 0 } = {}) {
  const left = motionValue(0), right = motionValue(minimumWidth), expansion = motionValue(0);
  let initialized = false;
  let controls = [];
  const render = () => {
    const amount = expansion.get();
    element.style.width = `${Math.max(minimumWidth, right.get() - left.get())}${unit}`;
    element.style.transform = `translateX(${left.get()}${unit}) scale(${1 + amount * (feedback.capsule.scaleX - 1)}, ${1 + amount * (feedback.capsule.scaleY - 1)})`;
  };
  const unsubscribers = [left, right, expansion].map((value) => value.on('change', render));
  const stop = () => { controls.forEach((control) => control.stop()); controls = []; };
  const setBounds = (targetLeft, targetRight, { animate: shouldAnimate = true } = {}) => {
    if (!Number.isFinite(targetLeft) || !Number.isFinite(targetRight) || targetRight < targetLeft) throw new RangeError('Invalid indicator bounds');
    stop();
    const positioned = Math.abs(left.get() - targetLeft) < 0.001 && Math.abs(right.get() - targetRight) < 0.001;
    if (!initialized || !shouldAnimate || !feedbackEnabled(element) || positioned) {
      left.set(targetLeft); right.set(targetRight); expansion.set(0);
    } else {
      const movingRight = targetLeft + targetRight > left.get() + right.get();
      const c = feedback.capsule;
      controls = [
        animate(left, targetLeft, { type: 'spring', bounce: c.bounce, duration: movingRight ? c.trailing : c.leading }),
        animate(right, targetRight, { type: 'spring', bounce: c.bounce, duration: movingRight ? c.leading : c.trailing }),
        animate(expansion, [expansion.get(), 1, 0], { duration: c.duration, times: [0, c.peakAt, 1], ease: c.ease }),
      ];
    }
    initialized = true;
    element.style.opacity = '1';
    render();
  };
  return { setBounds, destroy() { stop(); unsubscribers.forEach((unsubscribe) => unsubscribe()); } };
}

/** Selection adapter: items and indicator share a position:relative offset parent. */
export function createElasticSelection(container, indicator, items, engine, { bleed = 0 } = {}) {
  const elastic = createElasticIndicator(indicator, engine);
  let selected = null;
  let measured = null;
  const measure = (shouldAnimate) => {
    if (!selected) return;
    const bounds = [selected.offsetLeft - bleed, selected.offsetLeft + selected.offsetWidth + bleed];
    if (!shouldAnimate && measured && bounds.every((value, index) => value === measured[index])) return;
    measured = bounds;
    elastic.setBounds(...bounds, { animate: shouldAnimate });
  };
  const observer = new container.ownerDocument.defaultView.ResizeObserver(() => measure(false));
  observer.observe(container);
  items.forEach((item) => observer.observe(item));
  return {
    select(item, { animate = true } = {}) {
      if (!items.includes(item)) throw new RangeError('Selected item is outside the group');
      selected = item; measure(animate);
    },
    destroy() { observer.disconnect(); elastic.destroy(); },
  };
}
