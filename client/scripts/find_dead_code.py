import os
import re

src_dir = os.path.abspath(r"d:\personal_projects\company\project\aaramly-home-showcase-main\client\src")

files_map = {}
for root, dirs, files in os.walk(src_dir):
    for f in files:
        if f.endswith(('.ts', '.tsx', '.js', '.jsx', '.css')):
            rel = os.path.relpath(os.path.join(root, f), src_dir).replace("\\", "/")
            full = os.path.join(root, f)
            with open(full, 'r', encoding='utf-8', errors='ignore') as fp:
                files_map[rel] = fp.read()

# Build direct adjacency list (file -> list of imported files)
adj = {f: set() for f in files_map}

for rel_path, content in files_map.items():
    matches = re.findall(r'(?:from|import)\s+[\'"]([^\'"]+)[\'"]', content)
    dyn_matches = re.findall(r'import\(\s*[\'"]([^\'"]+)[\'"]\s*\)', content)
    all_imports = matches + dyn_matches

    for imp in all_imports:
        if imp.startswith("@/"):
            target = imp[2:]
        elif imp.startswith("./") or imp.startswith("../"):
            cur_dir = os.path.dirname(rel_path)
            target = os.path.normpath(os.path.join(cur_dir, imp)).replace("\\", "/")
        else:
            continue

        candidates = [
            target,
            target + ".ts",
            target + ".tsx",
            target + ".js",
            target + ".jsx",
            target + ".css",
            target + "/index.ts",
            target + "/index.tsx"
        ]
        for c in candidates:
            if c in files_map:
                adj[rel_path].add(c)
                break

# Traverse from entry point (main.tsx + index.css)
visited = set()
queue = ["main.tsx", "index.css", "vite-env.d.ts"]

for q in queue:
    if q in files_map:
        visited.add(q)

idx = 0
while idx < len(queue):
    curr = queue[idx]
    idx += 1
    for neighbor in adj.get(curr, []):
        if neighbor not in visited:
            visited.add(neighbor)
            queue.append(neighbor)

unreachable = sorted(set(files_map.keys()) - visited)

print("=== UNREACHABLE FILES (Never imported directly or transitively from main.tsx) ===")
for u in unreachable:
    print(f"Unreachable: {u}")
print(f"Total unreachable files: {len(unreachable)}\n")

# Check JSX usage: For each component file, check if its default or named export is actually used in JSX (<Component)
component_usage = []
for rel_path, content in files_map.items():
    if rel_path.endswith(('.tsx', '.jsx')) and not rel_path.endswith('.d.ts'):
        base = os.path.splitext(os.path.basename(rel_path))[0]
        # Look for export default or export const <Base>
        is_component = False
        if re.search(rf'export\s+default\s+(?:function\s+)?{base}', content) or \
           re.search(rf'export\s+(?:default\s+)?(?:const|function)\s+{base}', content) or \
           re.search(r'export\s+default\s+', content):
            is_component = True

        if is_component:
            # Check how many times <Base is used across all visited files
            jsx_tags = [f"<{base} ", f"<{base}>", f"<{base}\n", f"<{base}/>", f"element={{<{base}"]
            rendered_in = []
            for vf in visited:
                if vf != rel_path:
                    v_content = files_map[vf]
                    # Check if rendered in active (non-commented) code
                    for tag in jsx_tags:
                        if tag in v_content:
                            rendered_in.append(vf)
                            break
            if len(rendered_in) == 0:
                component_usage.append((rel_path, base))

print("=== COMPONENTS IMPORTED BUT NEVER RENDERED IN JSX ANYWHERE ===")
for rel_path, base in component_usage:
    print(f"Unrendered component: {rel_path} ({base})")
print(f"Total unrendered components: {len(component_usage)}")
