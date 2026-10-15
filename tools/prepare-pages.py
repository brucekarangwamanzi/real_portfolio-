"""Copy the static portfolio into the GitHub Pages publication directory."""
from pathlib import Path
import shutil

root = Path(__file__).resolve().parents[1]
source = root / 'dist'
destination = root / 'docs'
if destination.is_symlink():
    raise SystemExit('Refusing to overwrite a symlink at docs/')
shutil.copytree(source, destination, dirs_exist_ok=True)
(destination / '.nojekyll').write_text('')
print('Prepared docs/ for GitHub Pages from dist/.')
