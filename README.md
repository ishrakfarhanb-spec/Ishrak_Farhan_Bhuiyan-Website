# Ishrak_Farhan_Bhuiyan-Website
Designed and developed to showcase my skills, projects, and professional experience. The website is a simple yet elegant portfolio built with HTML, CSS, and JavaScript, highlighting my work in data analysis, web development, and other areas of expertise. It includes sections like About Me, Projects, Resume, and Contact.

## Deployment (GitHub Pages + Custom Domain)

This site is deployed via GitHub Pages from the `main` branch.

### Branch settings
- Settings → Pages → Source: `Deploy from a branch`
- Branch: `main` and Folder: `/ (root)`

### Custom domain
- Domain: `www.ishrakfarhan-b.com`
- Root file `CNAME` contains the domain (required by GitHub Pages).
- `.nojekyll` is present to prevent Jekyll processing and serve files/folders starting with underscores.

### DNS records (at registrar)
- CNAME: host `www` → `ishrakfarhanb-spec.github.io`
- Optional: Redirect apex `ishrakfarhan-b.com` → `https://www.ishrakfarhan-b.com`

### HTTPS
- After Pages recognizes the domain, enable "Enforce HTTPS" in Settings → Pages.

### Verify
- Visit `https://www.ishrakfarhan-b.com` after DNS propagates (5–30 minutes, up to 24h).
