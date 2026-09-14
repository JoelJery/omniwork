# OmniWork

**Know before you interrupt. Stay informed when you’re not.**

OmniWork is a privacy-first coordination layer for remote and hybrid teams. It helps teams understand when someone is available, whether an interruption is appropriate, and what important work was missed while they were away or focused.

Built for **REVIVE NIGHT 2026 – A Start-Up Revival Hackathon**.

---

## The Problem

Remote teams do not struggle because they cannot communicate.

They struggle because they communicate constantly.

Employees often do not know:

- whether a teammate is available
- whether an interruption is appropriate
- what important updates they missed while focusing or away

Existing tools can also create pressure to remain continuously available, while passive activity tracking can feel like surveillance.

---

## Our Revival

The original OmniWork attempted to recreate the physical office digitally through persistent virtual presence.

Our revival takes a different approach.

Instead of asking:

> Where is everyone?

OmniWork asks:

> Can I contact them right now, and what do I need to know?

Our core principle is:

**Awareness without surveillance.**

---

## Core Features

### Intelligent Availability

Users explicitly control their status:

- Available
- Focus
- Away

They can also declare:

- what they are working on
- how long they will be unavailable
- what situations justify an interruption

OmniWork relies on user-declared context instead of hidden activity tracking.

### Smart Interruption

Before contacting someone, OmniWork checks their status and interruption preferences.

Simple cases are handled using deterministic rules.

AI is only used when the meaning of a request is ambiguous.

The user always remains in control.

### Smart Catch-Up

When a user returns from Focus or Away mode, OmniWork filters relevant workplace events and generates a concise catch-up briefing.

The system prioritizes:

- blockers
- decisions
- actions requiring attention
- relevant updates

Users can also inspect the context behind important decisions.

### Privacy-First Design

OmniWork does not monitor:

- keyboard activity
- mouse activity
- webcam
- microphone
- screen activity
- hidden productivity metrics

Only authorized workplace information and user-declared context are used.

---

## Architecture

OmniWork follows a retrieval-first architecture:

```text
User-declared work context
        +
Integration / workplace events
        ↓
Permission-aware event store
        ↓
Database queries + deterministic rules
        ↓
Small relevant context set
        ↓
Selective AI
        ↓
Interruption recommendation / Catch-Up / Explanation
