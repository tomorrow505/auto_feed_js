export type FormValueElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

export function dispatchFormEvents(el: HTMLElement | null | undefined) {
    if (!el) return;
    try { el.dispatchEvent(new Event('input', { bubbles: true })); } catch {}
    try { el.dispatchEvent(new Event('change', { bubbles: true })); } catch {}
}

export function setFormValue(
    el: FormValueElement | null | undefined,
    value: string,
    options?: { force?: boolean }
): boolean {
    if (!el) return false;
    const force = options?.force ?? true;
    if (!force && (el as HTMLInputElement).value?.trim()) return false;
    (el as FormValueElement).value = value;
    dispatchFormEvents(el as unknown as HTMLElement);
    return true;
}

export function setChecked(el: HTMLInputElement | null | undefined, checked: boolean): boolean {
    if (!el) return false;
    if (el.checked === checked) return false;
    el.checked = checked;
    dispatchFormEvents(el);
    return true;
}

export function selectOptionByContains(select: HTMLSelectElement | null | undefined, candidates: string[]): boolean {
    if (!select || !candidates.length) return false;
    const values = candidates.map((x) => String(x || '').trim()).filter(Boolean);
    if (!values.length) return false;

    const opts = Array.from(select.options);
    for (const needleRaw of values) {
        const needle = needleRaw.toLowerCase();
        const hit = opts.find((opt) => (opt.textContent || '').trim().toLowerCase().includes(needle));
        if (!hit) continue;
        select.value = hit.value;
        dispatchFormEvents(select);
        return true;
    }
    return false;
}

export function selectFirstNonEmptyOption(select: HTMLSelectElement | null | undefined): boolean {
    if (!select) return false;
    const hit = Array.from(select.options).find((opt) => {
        const value = String(opt.value || '').trim();
        const text = String(opt.textContent || '').trim();
        if (!value || opt.disabled) return false;
        if (/select|choose|please|any/i.test(text)) return false;
        return true;
    });
    if (!hit) return false;
    select.value = hit.value;
    dispatchFormEvents(select);
    return true;
}
