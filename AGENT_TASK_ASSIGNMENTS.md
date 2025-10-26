# Quick Agent Task Assignment Reference

## 🎯 Agent 1: Frontend & UX Specialist

### Immediate Tasks (Week 1)
- [ ] Fix TypeScript error in `tournament-leaderboard.tsx:174`
- [ ] Remove all DEBUG console.log statements from:
  - `battle-arena.tsx` (20+ instances)
  - `simple-audio-player.tsx`
- [ ] Implement production-safe logging utility
- [ ] Test audio playback across Chrome, Firefox, Safari
- [ ] Add error boundaries to main pages

### High Priority Tasks
- [ ] Refactor `battle-arena.tsx` (1,237 lines → break into smaller components)
- [ ] Optimize audio autoplay handling
- [ ] Implement code splitting for large components
- [ ] Add loading states to all async operations
- [ ] Fix mobile scroll prevention

### Files to Own
```
client/src/pages/ (17 files)
client/src/components/ (29 files)
client/src/hooks/
client/src/lib/
client/public/sw.js
```

---

## 🔧 Agent 2: Backend & Services Specialist

### Immediate Tasks (Week 1)
- [ ] Remove debug comment from `server/routes.ts`
- [ ] Add comprehensive error handling to all 28 services
- [ ] Implement request validation middleware
- [ ] Add rate limiting to authentication endpoints
- [ ] Review database queries for N+1 problems

### High Priority Tasks
- [ ] Split `routes.ts` into feature-based route files
- [ ] Add retry logic for external API calls (Groq, OpenAI, ElevenLabs)
- [ ] Implement circuit breakers for AI services
- [ ] Add caching layer for repeated TTS requests
- [ ] Optimize database indexes
- [ ] Test Stripe webhook handling
- [ ] Add input validation to all API endpoints

### Services to Audit & Optimize (Priority Order)
1. `groq.ts` / `groq-tts.ts` - Main AI service
2. `openai-tts.ts` - TTS service
3. `elevenlabs-tts.ts` - TTS service
4. `user-tts-manager.ts` - TTS orchestration
5. `battleEngine.ts` - Core game logic
6. `scoring.ts` - Battle scoring
7. `matchmaking.ts` - Player matching
8. `fine-tuning.ts` - Model fine-tuning
9. All rhyme services (6 files)
10. All other services

### Files to Own
```
server/routes.ts
server/services/ (28 files)
server/db.ts
server/storage.ts
server/objectStorage.ts
server/replitAuth.ts
shared/schema.ts
```

---

## 🚀 Agent 3: Infrastructure & Performance Specialist

### Immediate Tasks (Week 1)
- [ ] Run `npm audit fix` to address 8 vulnerabilities
- [ ] Review deprecated dependencies
- [ ] Test production build process
- [ ] Verify all environment variables in production
- [ ] Set up error tracking (Sentry or similar)
- [ ] Implement health check improvements

### High Priority Tasks
- [ ] Set up CI/CD pipeline (GitHub Actions)
- [ ] Implement automated testing in pipeline
- [ ] Test ML model initialization (Bark, ARTalk, MuseTalk)
- [ ] Optimize ML model loading times
- [ ] Implement Redis caching
- [ ] Set up performance monitoring (APM)
- [ ] Configure CDN for static assets
- [ ] Add automated temp file cleanup
- [ ] Optimize Vite build configuration

### ML Services to Test & Optimize
- [ ] `setup_bark_env.py` - Bark setup
- [ ] `optimize_bark_cpu.py` - Bark optimization
- [ ] `setup_musetalk.sh` - MuseTalk setup
- [ ] `install_musetalk.py` - MuseTalk installation
- [ ] `artalk_integration.py` - ARTalk service
- [ ] `musetalk_integration.py` - MuseTalk service
- [ ] `musetalk.py` - MuseTalk core

### Files to Own
```
package.json
package.prod.json
vite.config.ts
tsconfig.json
Dockerfile.production
deploy.sh
build-production.sh
optimize-for-cloud.sh
cleanup-deployment.sh
drizzle.config.ts
All ML setup scripts (*.py, *.sh)
```

---

## 🔄 Daily Coordination

### Morning Standup (15 min)
Each agent reports:
1. What I completed yesterday
2. What I'm working on today
3. Any blockers or dependencies

### Evening Sync (15 min)
Each agent shares:
1. Code ready for review
2. Integration points needed
3. Tomorrow's plan

---

## 🎯 Week 1 Sprint Goals

### Agent 1 (Frontend)
✅ Zero TypeScript errors
✅ All debug logs removed
✅ Audio playback working on all browsers
✅ Error boundaries added

### Agent 2 (Backend)
✅ All services have error handling
✅ Rate limiting implemented
✅ Input validation on all endpoints
✅ Database queries optimized

### Agent 3 (Infrastructure)
✅ No dependency vulnerabilities
✅ CI/CD pipeline functional
✅ ML services tested and documented
✅ Error tracking operational

---

## 📞 Who to Ask For What

### Need frontend help?
→ **Agent 1**
- Component not rendering?
- Audio not playing?
- Mobile layout broken?
- TypeScript type errors?
- UI/UX questions?

### Need backend help?
→ **Agent 2**
- API endpoint not working?
- Database query slow?
- Service integration failing?
- Authentication issues?
- Data validation questions?

### Need infrastructure help?
→ **Agent 3**
- Build failing?
- Deployment issues?
- ML model not loading?
- Performance degradation?
- Environment config questions?

---

## 🚨 Escalation Path

### Blocker Resolution
1. Try to resolve within 30 minutes
2. Ask relevant agent for help
3. Bring to daily standup if not resolved
4. Escalate to all agents if critical

### Critical Issues (P0)
- Notify all agents immediately
- Create incident channel
- Assign owner
- Track to resolution

---

## 📊 Success Criteria by Agent

### Agent 1
- [ ] All components type-safe
- [ ] Bundle size < 500KB gzipped
- [ ] Lighthouse score > 90
- [ ] Zero console errors in production

### Agent 2
- [ ] API response time < 100ms (p95)
- [ ] 95%+ service test coverage
- [ ] All external APIs have retries
- [ ] Zero unhandled exceptions

### Agent 3
- [ ] Build time < 2 minutes
- [ ] Zero security vulnerabilities
- [ ] 99.9% uptime
- [ ] ML models load < 5 seconds

---

## 🔑 Access & Permissions Needed

### All Agents
- GitHub repository write access
- Development environment access
- Staging environment access

### Agent 2 (Backend)
- Database admin access
- API key management access
- Stripe dashboard access (read-only for testing)

### Agent 3 (Infrastructure)
- Production environment access (read-only initially)
- CI/CD pipeline configuration access
- Cloud provider admin access
- DNS/CDN configuration access

---

## 📚 Required Reading

### Agent 1
- `COMPLETE_SYSTEM_DOCUMENTATION.md`
- `VISUAL_MOCKUP.md`
- React + TypeScript best practices

### Agent 2
- `COMPLETE_SYSTEM_DOCUMENTATION.md`
- `ML_API_REFERENCE.md`
- `STRIPE_OPTIONAL_IMPLEMENTATION.md`
- API design guidelines

### Agent 3
- `PRODUCTION_DEPLOYMENT_GUIDE.md`
- `DEPLOYMENT_SUMMARY.md`
- `ML_QUICKSTART.md`
- Infrastructure security guidelines

---

## 🎉 Definition of Done

### For Each Task
- [ ] Code written and tested
- [ ] Tests added/updated
- [ ] Code reviewed by another agent
- [ ] Documentation updated
- [ ] Merged to main branch
- [ ] Deployed to staging
- [ ] Verified in staging
- [ ] Ready for production

### For Each Sprint
- [ ] All P0 and P1 tasks complete
- [ ] Integration tests passing
- [ ] Performance benchmarks met
- [ ] Security scan clean
- [ ] Documentation complete
- [ ] Stakeholder demo completed
