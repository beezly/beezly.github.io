import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const postsDir = path.join(__dirname, '..', '_posts');
const outputDir = path.join(__dirname, '..', 'src', 'content', 'blog');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Parse YAML frontmatter
function parseFrontmatter(yamlStr) {
  const lines = yamlStr.trim().split('\n');
  const frontmatter = {};

  for (const line of lines) {
    const match = line.match(/^(\w+):\s*(.*)$/);
    if (match) {
      const [, key, value] = match;

      // Handle arrays like tags: [tag1, tag2]
      if (value.startsWith('[') && value.endsWith(']')) {
        const arrayContent = value.slice(1, -1);
        frontmatter[key] = arrayContent
          .split(',')
          .map(item => item.trim())
          .filter(item => item.length > 0);
      } else if (value.startsWith('"') && value.endsWith('"')) {
        frontmatter[key] = value.slice(1, -1);
      } else {
        frontmatter[key] = value || '';
      }
    }
  }

  return frontmatter;
}

// Stringify frontmatter to YAML
function stringifyFrontmatter(obj) {
  const lines = [];
  for (const [key, value] of Object.entries(obj)) {
    if (Array.isArray(value)) {
      if (value.length > 0) {
        lines.push(`${key}: [${value.join(', ')}]`);
      }
    } else if (value instanceof Date) {
      lines.push(`${key}: ${value.toISOString().split('T')[0]}`);
    } else if (typeof value === 'string' && value.includes(':')) {
      lines.push(`${key}: "${value}"`);
    } else {
      lines.push(`${key}: ${value}`);
    }
  }
  return lines.join('\n');
}

// Migrate posts
const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));

console.log(`Found ${files.length} posts to migrate`);

for (const filename of files) {
  console.log(`\nMigrating: ${filename}`);

  const content = fs.readFileSync(path.join(postsDir, filename), 'utf-8');

  // Extract date from filename: YYYY-MM-DD-title.md
  const dateMatch = filename.match(/^(\d{4})-(\d{2})-(\d{2})-(.+)\.md$/);
  if (!dateMatch) {
    console.log(`  ⚠ Skipping - invalid filename format`);
    continue;
  }

  const [, year, month, day, slug] = dateMatch;
  const pubDate = `${year}-${month}-${day}`;

  // Parse frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]+?)\n---/);
  if (!frontmatterMatch) {
    console.log(`  ⚠ Skipping - no frontmatter found`);
    continue;
  }

  const frontmatter = parseFrontmatter(frontmatterMatch[1]);

  // Transform content
  let body = content.replace(/^---\n[\s\S]+?\n---\n/, '');

  // Transform Jekyll highlight tags to markdown code blocks
  body = body.replace(/{%\s*highlight\s+(\w+)\s*%}/g, '```$1');
  body = body.replace(/{%\s*endhighlight\s*%}/g, '```');

  // Build new frontmatter
  const newFrontmatter = {
    title: frontmatter.title || '',
    description: frontmatter.description || '',
    pubDate: new Date(pubDate),
    tags: frontmatter.tags || [],
  };

  // Write to new location
  const output = `---\n${stringifyFrontmatter(newFrontmatter)}\n---\n${body}`;
  const outputPath = path.join(outputDir, filename);

  fs.writeFileSync(outputPath, output);
  console.log(`  ✓ Migrated to ${path.relative(path.join(__dirname, '..'), outputPath)}`);
}

console.log(`\n✓ Migration complete! Migrated ${files.length} posts.`);
