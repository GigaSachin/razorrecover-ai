# Razorpay /buildathon Track 03: AI Revenue Recovery
## Official Project Submission Guide & Pitch Pack

---

## 📋 The 12 Application Form Questions & Answers

### 1. Full Name
*(Your Name)*

### 2. College
*(Your College / University)*

### 3. Graduation Year
*(Your Graduation Year)*

### 4. In-person from September: yes / no
`yes`

### 5. 6 or 12 months: your pick
`12 months` (or `6 months`)

### 6. Resume file
*(Upload your resume)*

---

### 7. Track
`Track 03: AI Revenue Recovery`

---

### 8. Project Name / Title
**RazorRecover AI: Autonomous Multi-Channel Revenue Recovery & Compliant Dunning Engine for Razorpay**

---

### 9. Project Objectives: What does it solve?
> **Answer to paste in form:**
> 
> RazorRecover AI is an autonomous, full-stack revenue recovery platform designed specifically for the dynamics of the Indian payments ecosystem. In India, billions of rupees in GMV slip away due to payment timeouts, salary-cycle mandate failures, 3DS OTP drop-offs, and overdue B2B receivables. 
>
> RazorRecover AI closes the loop autonomously:
> 1. **Root-Cause Triage**: Ingests failed transactions (UPI, e-Mandates/NACH, Subscriptions, Cards, Invoices) and performs automated root-cause diagnosis.
> 2. **Context-Aware Strategy Optimization**: Selects the optimal recovery vector — from 1-click UPI Intent recovery links and salary-cycle-aligned mandate retry sequencing to multi-tier B2B invoice escalation.
> 3. **Hinglish Conversational Recovery & Promise-to-Pay (PTP) Tracker**: Engages customers in natural, empathetic Hinglish across WhatsApp and Voice bots, automatically extracting and locking in Promise-to-Pay commitments to pause unnecessary dunning.
> 4. **Strict Compliance Guardrails ("The Bar")**: Implements deterministic RBI dunning contact windows (8 AM – 7 PM IST), maximum 3-attempt contact caps, high-value human-in-the-loop escalation (> ₹50,000), and non-retryable error circuit breakers.
> 5. **Measured Money Won Back**: Measures and reconciles exact rupees recovered across batches with a cryptographically verifiable, immutable audit trail.

---

### 10. GitHub Repository URL (Public)
`https://github.com/your-username/razorrecover-ai`

---

### 11. 5-Minute Pitch Video Link (Unlisted YouTube / Loom)
*(Paste your Loom or YouTube video link)*

---

### 12. Build Challenges & Technical Obstacles
> **Question: What issues did you face while building, and how did you solve them?**
>
> **Answer to paste in form:**
> 
> 1. **Hallucination Risk & Over-Dunning in Financial Workflows**:
>    - *Challenge*: Giving an LLM direct control over payment retries or customer communication risks hallucinating payment policies, spamming customers after hours, or retrying permanently dead accounts (e.g., `ACCOUNT_CLOSED`, `USER_REVOKED_MANDATE`).
>    - *Solution*: We separated the system into a **Dual Architecture**: an AI Reasoning Agent for fuzzy diagnosis, Hinglish NLP, and message formulation, bounded by a **Deterministic Guardrail Engine** that strictly enforces RBI collection hours (8 AM – 7 PM IST), maximum 3-contact stopping rules, and automatic human analyst escalation for transactions over ₹50,000.
>
> 2. **Salary-Cycle Timing for Mandate Failures (NACH / e-Mandate)**:
>    - *Challenge*: Standard naive retry systems retry failed subscriptions every 24 hours. For insufficient balance failures, retrying before the customer's salary date causes repeated bounce charges and frustrates users.
>    - *Solution*: We built a **Smart Mandate Retry Sequencer** that identifies salary patterns (1st–5th of month) and bank low-load processing windows (08:30 AM IST), scheduling auto-debits when balance probability is statistically highest.
>
> 3. **Promise-to-Pay (PTP) State Machine in Hinglish**:
>    - *Challenge*: Indian consumers frequently respond in mixed Hindi-English (e.g. *"Bhaiya 5 tarikh ko salary aayegi tab pay karunga"*). Extracting structured payment intent and scheduling follow-ups was non-trivial.
>    - *Solution*: We implemented an NLP extraction pipeline that detects payment intent, extracts dates (e.g. "5th of month", "kal", "day after tomorrow"), updates the case status to `in_progress`, and sets a temporary dunning lock until the promised date.
>
> 4. **Proving "The Bar" with Measured Batch Recovery**:
>    - *Challenge*: Most hackathon projects only show isolated single-transaction mocks without proving financial ROI or stopping rule efficacy across scale.
>    - *Solution*: We built an interactive **Batch Recovery Engine** that executes across 50+ diverse transaction scenarios simultaneously, calculating exact rupees won back, recovery rate percentages, and generating timestamped immutable audit logs.

---

## 🎬 5-Minute Pitch Video Script & Screenplay

| Timestamp | Screen / Visual | Speaker Script |
|---|---|---|
| **0:00 - 0:45** | **Executive Dashboard (`/`)** showing total revenue at risk, recovered ticker, and failure breakdown | *"Hi everyone, this is RazorRecover AI — an autonomous revenue recovery engine built for Track 03 of the Razorpay Buildathon. In the Indian payments landscape, revenue loss rarely happens in a single clean step. A UPI payment times out, a debit card mandate fails due to salary timing, or a customer drops off at 3DS OTP. RazorRecover AI closes the loop from detection to diagnosis, compliant intervention, and verified money won back."* |
| **0:45 - 1:45** | **Batch Recovery Runner (`/batch-recovery`)** clicking *Run Batch Recovery* | *"Let's immediately address 'The Bar' set by Razorpay: showing measured money recovered across a batch with stopping rules. Here in our Batch Recovery Runner, we have 50 live failed transactions totaling over ₹12 Lakhs at risk. When I click 'Run Batch Recovery', our agent processes each case. Notice how ₹7.8 Lakhs is immediately recovered at a 62% win rate. But look closer at our stopping rules in action: fatal errors like revoked mandates were blocked, high-value transactions above ₹50,000 were safely escalated to human analysts, and salary-cycle retries were scheduled."* |
| **1:45 - 2:45** | **AI Case Inspector (`/recovery-center`)** inspecting a case | *"Let's dive into an individual case. Here we see a failed UPI transaction from Rahul Sharma. Our AI diagnostic engine identifies transient bank gateway degradation, generates a 1-click recovery link, runs RBI compliance checks, and creates a tailored Hinglish customer message. With one click, the recovery intervention is dispatched and reconciled."* |
| **2:45 - 3:45** | **Hinglish Recovery Bot (`/hinglish-chat`)** interacting in WhatsApp simulator | *"One of our flagship capabilities is conversational recovery in the Indian context. Let's test the Hinglish bot simulator. When a customer replies 'Bhaiya abhi balance nahi hai, 5 tarikh ko salary aane par dunga', our NLP engine detects a Promise-to-Pay commitment, pauses automated dunning until the 5th, and confirms politely with the customer. If they ask for a discount, it dynamically offers an authorized 10% recovery incentive."* |
| **3:45 - 4:30** | **Audit Trail (`/audit`) & Guardrails (`/settings`)** | *"Crucially, all operations are backed by an immutable Audit Trail. Every AI decision, policy check, and rupee recovered is recorded with full actor accountability. Under Guardrail Settings, compliance officers can adjust RBI dunning hours, cooling-off periods, and human escalation thresholds."* |
| **4:30 - 5:00** | **Closing Summary** | *"RazorRecover AI is interview-ready, production-tested with Pytest, and built to turn failed transactions into recovered revenue for Razorpay merchants. Thank you!"* |
