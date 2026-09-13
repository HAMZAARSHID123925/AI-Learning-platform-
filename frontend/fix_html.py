import re

with open('user_html.html', 'r') as f:
    html = f.read()

# Extract just the <div class="min-h-screen..."> block
start_idx = html.find('<div class="min-h-screen')
end_idx = html.rfind('</div>') + 6
content = html[start_idx:end_idx]

# Basic React replacements
content = content.replace('class=', 'className=')
content = content.replace('for=', 'htmlFor=')
content = content.replace('stroke-width=', 'strokeWidth=')
content = content.replace('stroke-linecap=', 'strokeLinecap=')
content = content.replace('stroke-linejoin=', 'strokeLinejoin=')
content = content.replace('fill-rule=', 'fillRule=')
content = content.replace('clip-rule=', 'clipRule=')
content = content.replace('style="animation-duration: 8s;"', 'style={{ animationDuration: "8s" }}')
content = content.replace('onclick="const p = document.getElementById(\'password\'); p.type = p.type === \'password\' ? \'text\' : \'password\';"', 'onClick={() => { const p = document.getElementById("password") as HTMLInputElement; p.type = p.type === "password" ? "text" : "password"; }}')
content = content.replace('onsubmit="event.preventDefault();"', 'onSubmit={(e) => e.preventDefault()}')

# Self-closing tags fix
content = re.sub(r'(<input[^>]*?)(?<!/)>', r'\1 />', content)
content = re.sub(r'(<img[^>]*?)(?<!/)>', r'\1 />', content)

# Remove HTML comments
content = re.sub(r'<!--(.*?)-->', r'{/* \1 */}', content, flags=re.DOTALL)

# Handle <a> -> <Link> conversion properly
content = re.sub(r'<a href="(.*?)"(.*?)>', r'<Link href="\1"\2>', content)
content = content.replace('</a>', '</Link>')

# Fix checked -> defaultChecked
content = content.replace('checked', 'defaultChecked')

# Fix polygon empty body -> self-closing
content = re.sub(r'<polygon(.*?)(?<!/)>', r'<polygon\1 />', content)
content = content.replace('</polygon>', '')

# --- Login Page ---
login_page = f""""use client";
import Link from 'next/link';

export default function LoginPage() {{
  return (
    {content}
  );
}}
"""
with open('src/app/login/page.tsx', 'w') as f:
    f.write(login_page)

# --- Signup Page (Same left side, updated form) ---
signup_content = content.replace('Candidate &amp; Institutional Sign-In', 'Candidate &amp; Institutional Sign-Up')
signup_content = signup_content.replace('Welcome back', 'Create your account')
signup_content = signup_content.replace('Please enter your details to access your adaptive IELTS portal.', 'Start your journey to language mastery today.')
signup_content = signup_content.replace('Sign in to Assessment Portal', 'Create Assessment Account')
signup_content = signup_content.replace('Don\'t have an account?', 'Already have an account?')
signup_content = signup_content.replace('href="#signup"', 'href="/login"')
signup_content = signup_content.replace('href="/signup"', 'href="/login"')
signup_content = signup_content.replace('Start Free 7-Day Trial &rarr;', 'Sign In &rarr;')

# Insert First/Last name fields before Email
name_fields = """
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label htmlFor="first_name" className="block text-sm font-semibold text-slate-700 mb-1.5">First Name</label>
              <div className="relative rounded-xl shadow-sm">
                <input type="text" id="first_name" required placeholder="John" className="block w-full rounded-xl bg-slate-50 border border-slate-200 py-3.5 px-4 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-300 focus:bg-white focus:border-[#027FFF] focus:ring-4 focus:ring-[#027FFF]/15 focus-visible:outline-none" />
              </div>
            </div>
            <div>
              <label htmlFor="last_name" className="block text-sm font-semibold text-slate-700 mb-1.5">Last Name</label>
              <div className="relative rounded-xl shadow-sm">
                <input type="text" id="last_name" required placeholder="Doe" className="block w-full rounded-xl bg-slate-50 border border-slate-200 py-3.5 px-4 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-300 focus:bg-white focus:border-[#027FFF] focus:ring-4 focus:ring-[#027FFF]/15 focus-visible:outline-none" />
              </div>
            </div>
          </div>
"""
signup_content = signup_content.replace('{/*  Email Field  */}', '{/*  Name Fields  */}\n' + name_fields + '\n          {/*  Email Field  */}')

signup_page = f""""use client";
import Link from 'next/link';

export default function SignupPage() {{
  return (
    {signup_content}
  );
}}
"""
with open('src/app/signup/page.tsx', 'w') as f:
    f.write(signup_page)

