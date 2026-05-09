import os

filepath = 'src/context/AuthContext.jsx'
with open(filepath, 'r') as f:
    content = f.read()

import re

# We need to replace the activity tracking useEffect.
# It starts at `// Activity tracking for session timeout` and ends before `useEffect(() => { // Fetch current session and setup listener`

old_code_pattern = r"// Activity tracking for session timeout.*?    useEffect\(\(\) => \{\n        // Fetch current session and setup listener"

new_code = """// Activity tracking for session timeout
    useEffect(() => {
        // Update activity immediately
        localStorage.setItem('iota_last_activity', Date.now().toString());

        // Continuously update activity every 1 minute as long as the app is open.
        // This ensures the user is NEVER logged out while the browser tab is open.
        const activityIntervalId = setInterval(() => {
            localStorage.setItem('iota_last_activity', Date.now().toString());
        }, 60000);

        return () => {
            clearInterval(activityIntervalId);
        };
    }, []);

    useEffect(() => {
        // Fetch current session and setup listener"""

content = re.sub(old_code_pattern, new_code, content, flags=re.DOTALL)

with open(filepath, 'w') as f:
    f.write(content)

