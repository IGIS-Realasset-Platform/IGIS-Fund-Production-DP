import re
import sys

def parse_util_prefix(cls):
    # e.g., 'text-[#1D1D1F]' -> 'text'
    # 'bg-gray-200' -> 'bg'
    # 'border-black/10' -> 'border'
    # 'hover:bg-gray-200' -> 'hover:bg'
    if ':' in cls:
        if cls.startswith('hover:'):
            cls = cls[6:]
            return 'hover:' + cls.split('-')[0]
        return None
    return cls.split('-')[0]

def process_classes(m):
    original = m.group(1)
    tokens = original.split()
    dark_tokens = [t for t in tokens if t.startswith('dark:')]
    
    # Mappings of prefixes we want to handle
    for dt in dark_tokens:
        clean_dt = dt[5:] # remove 'dark:'
        
        # Determine prefix
        prefix = ''
        if clean_dt.startswith('hover:bg-'): prefix = 'hover:bg'
        elif clean_dt.startswith('hover:text-'): prefix = 'hover:text'
        elif clean_dt.startswith('bg-'): prefix = 'bg'
        elif clean_dt.startswith('text-'): prefix = 'text'
        elif clean_dt.startswith('border-'): prefix = 'border'
        elif clean_dt.startswith('placeholder-'): prefix = 'placeholder'
        elif clean_dt.startswith('shadow-'): prefix = 'shadow'
        elif clean_dt.startswith('focus:border-'): prefix = 'focus:border'
        
        if prefix:
            # find corresponding light class
            to_remove = []
            for t in tokens:
                if not t.startswith('dark:') and t.startswith(prefix + '-'):
                    to_remove.append(t)
            for t in to_remove:
                if t in tokens:
                    tokens.remove(t)
        
        # replace dark:X with X
        tokens[tokens.index(dt)] = clean_dt
        
    # remove transitions explicitly
    for rm in ['transition-colors', 'transition-all', 'duration-300', 'duration-200']:
        if rm in tokens:
            tokens.remove(rm)
            
    # However we don't want to remove 'transition-all' if it's used for layout,
    # wait the task says "transition-colors duration-300 will be removed since colors will no longer transition natively".
    # I will specifically only wipe transition-colors, duration-300, duration-200
            
    final_tokens = ' '.join(tokens)
    return f'className="{final_tokens}"'

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # process standard className="..."
    # Custom regex to carefully replace
    def repl_standard(m):
        return process_classes(m)
        
    content = re.sub(r'className="([^"]+)"', repl_standard, content)
    
    # Process className={`...`}
    def repl_template(m):
        # We only want to process literal string parts, but it's simpler to just process the whole template 
        # and ignore JS expression parts if they don't look like tailwind classes, but wait..
        # Let's just do standard regex on the template content for words
        text = m.group(1)
        tokens = text.split()
        dark_tokens = [t for t in tokens if t.startswith('dark:')]
        for dt in dark_tokens:
            clean_dt = dt[5:]
            prefix = ''
            if clean_dt.startswith('hover:bg-'): prefix = 'hover:bg'
            elif clean_dt.startswith('hover:text-'): prefix = 'hover:text'
            elif clean_dt.startswith('bg-'): prefix = 'bg'
            elif clean_dt.startswith('text-'): prefix = 'text'
            elif clean_dt.startswith('border-'): prefix = 'border'
            elif clean_dt.startswith('placeholder-'): prefix = 'placeholder'
            elif clean_dt.startswith('shadow-'): prefix = 'shadow'
            elif clean_dt.startswith('focus:border-'): prefix = 'focus:border'
            
            if prefix:
                to_remove = []
                for t in tokens:
                    if not t.startswith('dark:') and not t.startswith('${') and t.startswith(prefix + '-'):
                        to_remove.append(t)
                for t in to_remove:
                    if t in tokens:
                        tokens.remove(t)
            tokens[tokens.index(dt)] = clean_dt
            
        for rm in ['transition-colors', 'duration-300', 'duration-200']:
            if rm in tokens:
                tokens.remove(rm)
        return f'className={{`{" ".join(tokens)}`}}'
        
    content = re.sub(r'className=\{\`([^\`]+)\`\}', repl_template, content)
    
    with open(filepath, 'w') as f:
        f.write(content)
    print(f"Processed {filepath}")

for arg in sys.argv[1:]:
    process_file(arg)
