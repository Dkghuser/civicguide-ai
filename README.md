# civicguide-ai

Multi-Agent Civic Education platform designed to help users confidently navigate the voting process.

The app pairs a conversational **Lead Agent** (your guide) with a dedicated **Fact‑Checker Agent** (your verifier) to produce a dynamic, real-time **Voter Roadmap** while reducing AI hallucinations by validating high‑impact details like registration deadlines, ID requirements, and polling rules.

---

## Why this project exists

Voting rules can be confusing, time-sensitive, and vary by location. A typical chat assistant can give helpful guidance—but if it hallucinates a deadline or eligibility rule, the impact is serious.

**civicguide-ai** is built to:
- Turn “What do I need to do to vote?” into a clear, personalized checklist.
- Keep critical civic information trustworthy by verifying it before presenting it as fact.
- Provide an accessible, user-friendly experience for first-time and returning voters.

---

## Core Features

### Lead Agent (Conversational Guide)
- Chats with the user to understand goals and context (e.g., where they live, what election they’re preparing for).
- Builds and updates a **Voter Roadmap** (step-by-step plan) in real time.
- Explains steps in plain language and suggests next actions.

### Fact‑Checker Agent (Verification Behind the Scenes)
- Runs independently of the main conversation flow.
- Validates high-risk claims such as:
  - voter registration deadlines
  - absentee/mail ballot rules
  - in-person voting requirements
  - identification requirements
- Returns citations and confidence notes to the Lead Agent so the UI can display “verified” information clearly.

### Voter Roadmap (Dynamic Checklist)
- A structured “to-do list” users can follow from start to finish.
- Updates as the user provides more info or when verification results arrive.
- Designed to be easy to scan, track, and complete.

---

## High-Level Architecture (Multi-Agent)

This project evolves the current prototype into a robust multi-agent system with:

- **Frontend UI**: responsive, accessible interface for chat + roadmap
- **Node.js Backend**: orchestrates sessions, agent calls, tools, and data flow
- **Multi-Agent Layer**:
  - Lead Agent: conversation + roadmap planning
  - Fact-Checker Agent: verify claims using trusted sources/tools
- **Data & Observability**:
  - structured roadmap state
  - logging/telemetry hooks for debugging and auditability

### Typical Flow
1. User asks a question (e.g., “When is the registration deadline?”)
2. Lead Agent drafts an answer + updates the roadmap
3. Fact‑Checker Agent verifies the specific claim(s)
4. Backend merges results and returns:
   - user-friendly response
   - verified facts + citations (when available)
   - updated roadmap state

---

## Tech Stack

> Update this section if your stack changes—this README is written to match the architecture you described.

### Backend
- **Node.js** (orchestrator for agent runs, sessions, APIs)
- **REST API** (recommended) for chat/roadmap endpoints

### AI / Agents
- **Multi-agent orchestration**: Lead Agent + Fact‑Checker Agent
- **Fact-checking skill/tooling**: designed to validate claims against trusted sources and return citations

### Frontend (UI)
- **Responsive, accessible web UI**
- Conversational interface + roadmap panel layout

---

## Project Status

- ✅ Prototype concept established
- 🚧 Architecture evolution in progress:
  - dedicated backend
  - multi-agent orchestration
  - fact-checking skill integration
  - accessible, responsive UI

---

## Glimpse

<img width="1322" height="901" alt="Screenshot 2026-05-04 005132" src="https://github.com/user-attachments/assets/94aca31d-ab1d-4617-afe5-4ef10b2f3f73" />

---

## Principles

- **Safety & Accuracy first**: anything time-sensitive or eligibility-related should be verified.
- **Transparency**: show when something is verified vs. unverified.
- **Accessibility**: clear language, readable roadmap structure, and inclusive UX.
- **User agency**: empower people to decide and act—not tell them what to think.

---

## Roadmap (Planned)

- [ ] Node.js backend service for sessions + agent orchestration
- [ ] Lead Agent: roadmap generation + structured state
- [ ] Fact‑Checker Agent: verification pipeline + citations
- [ ] UI: chat + roadmap view with verification badges
- [ ] Guardrails: “no-claim” policy for unverified critical facts
- [ ] Tests: unit/integration for agent workflows + verification
- [ ] Deployment: staging + production environments

---

## Contributing

Contributions are welcome once the repository has:
- a stable project structure
- development scripts
- environment configuration

If you’d like, open an issue describing what you want to add or improve.

---

## Disclaimer

This project is for civic education and guidance. It does **not** provide legal advice, and requirements may change. Always verify final details with official election sources in your jurisdiction—this app’s Fact‑Checker Agent is explicitly designed to help with that verification step.
