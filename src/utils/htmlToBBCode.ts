
export function htmlToBBCode(element: Element | null): string {
    if (!element) return '';
    return walkDOM(element);
}

function walkDOM(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent || '';
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
        return '';
    }

    const el = node as HTMLElement;
    let content = '';

    // Process children
    Array.from(el.childNodes).forEach(child => {
        content += walkDOM(child);
    });

    const tagName = el.tagName.toLowerCase();

    switch (tagName) {
        case 'b':
        case 'strong':
            return `[b]${content}[/b]`;
        case 'i':
        case 'em':
            return `[i]${content}[/i]`;
        case 'u':
            return `[u]${content}[/u]`;
        case 's':
        case 'strike':
            return `[s]${content}[/s]`;
        case 'img':
            const src = el.getAttribute('src');
            return src ? `[img]${src}[/img]` : content;
        case 'a':
            const href = el.getAttribute('href');
            return href ? `[url=${href}]${content}[/url]` : content;
        case 'blockquote':
            return `[quote]${content}[/quote]`;
        case 'code':
        case 'pre':
            return `[code]${content}[/code]`;
        case 'br':
            return '\n';
        case 'p':
        case 'div':
            return `\n${content}\n`;
        case 'li':
            return `[*]${content}\n`;
        case 'ul':
        case 'ol':
            return `\n${content}\n`;
        default:
            // Handle styles
            if (el.style.fontWeight === 'bold' || Number(el.style.fontWeight) >= 700) {
                content = `[b]${content}[/b]`;
            }
            if (el.style.fontStyle === 'italic') {
                content = `[i]${content}[/i]`;
            }
            if (el.style.textDecoration === 'underline') {
                content = `[u]${content}[/u]`;
            }
            if (el.style.color) {
                content = `[color=${el.style.color}]${content}[/color]`;
            }
            return content;
    }
}
