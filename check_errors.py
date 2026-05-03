from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    
    def handle_console(msg):
        print(f"[{msg.type}] {msg.text}")
        
    def handle_page_error(exc):
        print(f"[PAGE ERROR] {exc}")
        
    page.on("console", handle_console)
    page.on("pageerror", handle_page_error)
    
    print("Navigating to http://localhost:5173")
    page.goto("http://localhost:5173", wait_until="networkidle")
    
    # Wait a bit just in case
    page.wait_for_timeout(2000)
    
    browser.close()
