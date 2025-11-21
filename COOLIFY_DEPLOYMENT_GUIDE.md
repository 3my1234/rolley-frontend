# 🚀 Rolley Frontend - Coolify Deployment Guide

This guide will help you deploy the Rolley Vite frontend to Coolify alongside your backend and Football AI services.

## 📋 Prerequisites

- ✅ Backend deployed on Coolify (rolley-backend)
- ✅ Football AI deployed on Coolify (football-safe-ai)
- ✅ Frontend code in GitHub repository
- ✅ Access to Coolify dashboard

## 🎯 Deployment Steps

### 1. Push Code to GitHub

Make sure all changes are committed and pushed:

```bash
cd rolley-vite
git add .
git commit -m "Add Coolify deployment configuration"
git push origin main
```

### 2. Create New Application in Coolify

1. Go to your **Rolley** project in Coolify
2. Click **Resources** → **New** → **Clone**
3. Select **GitHub** as source
4. Enter your repository URL: `https://github.com/YOUR_USERNAME/rolley-vite`
5. Select branch: `main`
6. Click **Check repository**

### 3. Configure Build Settings

Coolify should auto-detect the Dockerfile. Verify:

- **Build Pack**: Dockerfile (or Docker Image)
- **Base Directory**: `/` (root)
- **Port**: `5173` (or leave default)
- **Is it a static site?**: No (we're using Docker with nginx)

### 4. Set Environment Variables

In Coolify, add these environment variables:

#### Required Variables:

```
VITE_API_URL=https://your-backend-domain.com
```

**Important**: Replace with your actual backend URL from Coolify:
- If using Coolify's internal network: `http://rolley-backend:3003`
- If using public domain: `https://rolley-backend.your-domain.com`

#### Optional Variables:

```
VITE_FOOTBALL_AI_URL=https://your-football-ai-domain.com
VITE_PRIVY_APP_ID=your_privy_app_id
```

### 5. Configure CORS on Backend

Update your backend's `FRONTEND_URL` environment variable in Coolify:

```
FRONTEND_URL=https://your-frontend-domain.com
```

The backend will automatically allow CORS requests from this URL.

### 6. Deploy

1. Click **Deploy** (or **Redeploy** if updating)
2. Wait for the build to complete
3. Check the logs to ensure the build succeeded

## 🔧 Configuration Details

### Port Configuration

- **Container Port**: `5173` (nginx listens on this port)
- **Coolify Mapping**: Coolify will automatically map a public port

### Health Check

The health check endpoint is available at `/health` and returns `200 OK` with "healthy".

### Build Process

1. **Stage 1 (Builder)**: 
   - Installs Node.js dependencies
   - Builds the Vite app with environment variables
   - Outputs to `/app/dist`

2. **Stage 2 (Production)**:
   - Copies built files to nginx
   - Serves static files on port 5173
   - Handles client-side routing

### Environment Variables at Build Time

**Important**: `VITE_*` environment variables are embedded at **build time**, not runtime!

If you change `VITE_API_URL`:
1. Update the environment variable in Coolify
2. **Redeploy** the application (rebuild required)

## 🌐 Internal Service Communication

If all services are on the same Coolify network, they can communicate using service names:

```
# Frontend can reach backend via:
VITE_API_URL=http://rolley-backend:3003

# Frontend can reach Football AI via:
VITE_FOOTBALL_AI_URL=http://football-safe-ai:8000
```

However, if the frontend needs to make requests from the browser:
- Use **public URLs** (Coolify-generated domains or custom domains)
- Browser can't resolve internal Docker service names

## 🔒 Security Headers

The nginx configuration includes security headers:
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: no-referrer-when-downgrade`

## 📦 Caching Strategy

- **Static assets** (JS, CSS, images): Cached for 1 year
- **HTML files**: No cache (always fresh)

## 🐛 Troubleshooting

### Build Fails

- Check build logs in Coolify
- Verify Node.js dependencies install correctly
- Ensure `package.json` is valid

### Frontend Can't Connect to Backend

1. Check `VITE_API_URL` is set correctly
2. Verify backend CORS includes frontend domain
3. Check backend is running and accessible
4. Try accessing backend URL directly in browser

### 404 Errors on Routes

- This is normal for SPAs (Single Page Applications)
- nginx should serve `index.html` for all routes
- Verify `nginx.conf` has `try_files $uri $uri/ /index.html;`

### Port Conflicts

If port 5173 conflicts with another service:
1. Update `nginx.conf` to use different port
2. Update `Dockerfile` EXPOSE directive
3. Update `coolify.yml` ports configuration

## 🔄 Updating the Frontend

After making changes:

1. Commit and push to GitHub
2. In Coolify, click **Redeploy**
3. Coolify will:
   - Pull latest code
   - Rebuild Docker image
   - Update container

## 📝 Next Steps

After successful deployment:

1. ✅ Test frontend is accessible
2. ✅ Verify API connections work
3. ✅ Test authentication flow
4. ✅ Configure custom domain (optional)
5. ✅ Set up SSL (automatic with Coolify)

## 🆘 Support

If you encounter issues:

1. Check Coolify logs for errors
2. Verify all environment variables are set
3. Test backend and Football AI services independently
4. Check CORS configuration matches frontend domain

---

**Ready to deploy?** Follow the steps above and your frontend will be live on Coolify! 🚀

