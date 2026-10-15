from pathlib import Path
from html.parser import HTMLParser
import base64
import re
import zipfile
import argparse

root = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description='Export a self-contained portfolio and ZIP.')
parser.add_argument('--output-dir', type=Path, default=root / 'exports')
options = parser.parse_args()
output = options.output_dir.resolve()
output.mkdir(parents=True, exist_ok=True)
dist = root / 'dist'
html = (dist / 'index.html').read_text()

def embed_style(match):
    css = (dist / match.group(1)).read_text()
    css = re.sub(r'@import url\([^;]+;\s*', '', css)
    return '<style>\n' + css + '\n</style>'

html = re.sub(r'<link rel="stylesheet" href="([^"]+)">', embed_style, html)
html = html.replace('<script src="theme-init.js"></script>', '<script>\n' + (dist / 'theme-init.js').read_text() + '\n</script>')
html = html.replace('<script src="script.js" defer></script>', '')
html = html.replace('</body>', '<script>\n' + (dist / 'script.js').read_text() + '\n</script>\n</body>')
favicon = base64.b64encode((dist / 'favicon.svg').read_bytes()).decode()
html = html.replace('href="favicon.svg"', f'href="data:image/svg+xml;base64,{favicon}"')

class Check(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids, self.anchors, self.resources = [], [], []
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            self.ids.append(attrs['id'])
        href = attrs.get('href', '')
        if href.startswith('#'):
            self.anchors.append(href[1:])
        if tag in ['script', 'img', 'link']:
            value = attrs.get('src', href)
            if value and not value.startswith('data:'):
                self.resources.append(value)

check = Check()
check.feed(html)
assert len(check.ids) == len(set(check.ids)), 'Duplicate element id'
assert all(value in check.ids for value in check.anchors), 'Broken section link'
assert not check.resources, check.resources
assert '@import' not in html

preview = output / 'portfolio-preview.html'
preview.write_text(html)
with zipfile.ZipFile(output / 'bruce-portfolio.zip', 'w', zipfile.ZIP_DEFLATED) as archive:
    archive.writestr('bruce-portfolio/index.html', html)
    archive.writestr('bruce-portfolio/README.txt', 'Open index.html in your browser. Use the light/dark mode button in the header to change themes. Your preference is remembered when browser storage is available. The initial theme follows your device setting. This is an offline portfolio draft; it is not hosted.\n')
print('Created updated offline preview and ZIP; asset and anchor checks passed.')
