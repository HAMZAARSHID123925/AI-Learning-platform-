# 01-PROJECT-OVERVIEW.md

> **Document Type:** Base System Design Document (Base SDD)
> **Project:** AI-Powered Learning Management System with AI Assessment and Adaptive Learning
> **Status:** Base SDD — High-Level Project Context

---

## 1. Document Purpose

This is the **Base System Design Document (Base SDD)** for the AI-Powered Learning Management System (LMS) with AI Assessment and Adaptive Learning capabilities.

Its purpose is to establish shared, high-level project context before development teams move into individual module specifications, system architecture, or technical implementation documentation.

This document:

- Defines what the platform is and what problem it solves.
- Identifies the platform's target users and primary goals.
- Establishes the **six modules** as the primary structural backbone of the project.
- Describes how the six modules work together as one integrated platform.
- Defines the high-level student lifecycle.
- Establishes shared project terminology.
- Clarifies module ownership boundaries.
- Positions this document within the broader project documentation hierarchy.

The six modules are **not suggestions**. They are the approved product and architectural structure. They must not be renamed, merged, split, or replaced with an alternative domain structure.

**This is not an implementation document.** Database schemas, API contracts, endpoint specifications, infrastructure details, class/function design, and code examples belong in module specifications, API documentation, and engineering documents — not here.

When a high-level summary in this document conflicts with or is less specific than an approved detailed module specification, **the module specification takes precedence**.

---

## 2. Project Overview

This platform is a unified, AI-powered learning ecosystem that integrates structured course delivery, live online learning, student experience, AI-driven assessment and evaluation, and adaptive remediation into a single, cohesive product.

It is not:

- A conventional LMS with static course delivery only.
- A standalone AI test or quiz generator.
- An isolated AI tutoring tool.
- A live classroom tool without a broader learning context.

It is **one integrated platform** organized around six defined modules, each with clear responsibility boundaries, designed to support the full learning lifecycle — from content delivery and live classes, through assessment and evaluation, to adaptive remediation and reassessment.

The six modules that form this platform are:

| # | Module | Core Responsibility |
|---|--------|---------------------|
| 1 | User & Access Management | Identity, authentication, authorization, roles, and access control |
| 2 | Course & Content Management | LMS learning structure, content lifecycle, publishing |
| 3 | Live Online Classes | Live learning experience, scheduling, session management |
| 4 | Student Experience & Dashboard | Student-facing product experience, visibility, progress |
| 5 | AI Assessment & Evaluation | AI-powered assessment generation, evaluation, performance evidence |
| 6 | Adaptive Learning & Remediation | Weakness-driven remediation, personalized learning paths, reassessment |

Together, these modules cover the complete arc of a student's learning journey on the platform.

---

## 3. Problem Context

The platform is designed to address the following high-level learning and assessment problems:

**Disconnected learning and assessment experiences.**
In many learning systems, course delivery and assessment exist as separate, loosely related activities. Students move through content without a structured, connected evaluation cycle that feeds back into their learning.

**Limited visibility into student performance.**
Without a coherent performance visibility layer, students and instructors lack meaningful insight into how students are progressing, where they are succeeding, and where they are struggling.

**Difficulty identifying weaknesses from assessment results.**
Raw scores alone do not reveal which specific skills or knowledge areas a student has not mastered. Translating assessment results into actionable weakness identification requires structured evaluation.

**Static or insufficiently personalized follow-up learning.**
Traditional LMS platforms deliver the same content to all students regardless of performance. Students who fail an assessment often receive no targeted, personalized guidance on what to study next.

**Lack of a continuous feedback loop.**
Without a closed loop connecting performance evidence → weakness identification → remediation → reassessment, student improvement depends entirely on manual instructor intervention rather than a structured, platform-supported process.

This platform is designed to close these gaps by connecting structured learning, live classes, AI-powered assessment and evaluation, and adaptive remediation into one integrated system.

---

## 4. Project Goals

The platform's primary goals, organized around its six modules:

**Secure and controlled access** *(Module 1)*
Provide a robust user, identity, authentication, and role-based access control foundation that all other modules depend on.

**Structured course and content delivery** *(Module 2)*
Enable instructors and administrators to organize, manage, and publish structured learning content — courses, modules, lessons — in a coherent, maintainable way.

**Support for live online learning** *(Module 3)*
Provide a live class component within the platform so that scheduled, real-time instruction is integrated with the broader learning experience rather than operating outside it.

**Coherent student experience** *(Module 4)*
Give students a unified, clear product experience that surfaces their courses, progress, assessments, results, and adaptive recommendations in one place.

**Meaningful AI-powered assessment and evaluation** *(Module 5)*
Generate or support assessments, evaluate student responses, produce structured performance evidence, and identify skill-level strengths and weaknesses.

**Adaptive remediation and focused reassessment** *(Module 6)*
Use performance evidence and identified weaknesses to guide students toward targeted remediation content, personalized learning paths, focused practice, and subsequent reassessment.

**A continuous, closed improvement loop**
Connect evaluation outcomes to adaptive learning actions so that student improvement is a structured, platform-supported process rather than an ad hoc one.

---

## 5. Target Users

The platform serves the following primary user groups. Detailed roles, permissions, and access rules are defined in **Module 1 — User & Access Management**.

### Students

Students are the primary end users of the learning experience. They access courses and content, attend live classes, take assessments, receive evaluation results, and follow adaptive learning paths and remediation guidance. The student-facing product experience is the responsibility of **Module 4**.

### Instructors / Teachers

Instructors create, manage, and publish learning content. They may schedule and conduct live classes, author or configure assessments, and review student performance. Their capabilities span **Modules 2, 3, and 5** at a high level.

### Administrators

Administrators manage the platform's operational and access configuration. They oversee user management, roles, access control, and platform-level settings. Their responsibilities are centered in **Module 1** with visibility across the platform as appropriate.

---

## 6. The Six-Module Project Structure

### 6.1 Module 1 — User & Access Management

**Why this module exists:**
Every action on the platform is performed by a user. Before any course can be accessed, any assessment taken, or any live class attended, the platform must know who the user is, what role they hold, and what they are permitted to do.

**Role in the platform:**
Module 1 provides the identity, authentication, authorization, role, and access control foundation on which every other module depends. It is the first layer of the platform that must be in place before any other module can function correctly.

**Platform foundation it provides:**

- User identity and authentication.
- Role definition and assignment.
- Permission and access control enforcement.
- The foundation for all user-specific behavior across the platform.

**Module dependencies:**
All five other modules depend on Module 1. Any module that needs to identify the current user, enforce access rules, or check permissions relies on the foundation established here.

---

### 6.2 Module 2 — Course & Content Management

**Role as the structured LMS/content foundation:**
Module 2 is the LMS backbone of the platform. It defines the learning structure — how courses are organized, how modules and lessons are composed, and how learning content is managed through its lifecycle from creation to publication.

**How learning content supports students:**
Students access courses and learning materials through what Module 2 makes available. Without structured, published content, there is nothing for students to engage with, no assessments to be generated from, and no adaptive learning materials to recommend.

**Cross-module connections:**

- **Module 4 (Student Experience):** Students discover, access, and navigate courses through the student-facing experience, which surfaces content that Module 2 manages and publishes.
- **Module 5 (AI Assessment):** Assessments may be connected to or generated in the context of courses and content managed by Module 2.
- **Module 6 (Adaptive Learning):** Remediation and adaptive learning recommendations reference or draw from the course and content library that Module 2 owns.

---

### 6.3 Module 3 — Live Online Classes

**Role in the learning ecosystem:**
Module 3 provides the live learning component of the platform. It ensures that scheduled, real-time class sessions are not a disconnected external activity but an integrated part of the student's learning experience on the platform.

**How live learning fits alongside structured learning:**
Structured course and content learning (Module 2) and live online classes (Module 3) are complementary learning modalities. Students may engage with asynchronous course content and also attend live sessions, with both forming part of the overall learning experience.

**Connections with user and student experience flows:**

- **Module 1:** Live class access and participation is subject to access control and role-based rules established in Module 1.
- **Module 4 (Student Experience):** Students interact with live class schedules, session access, and participation through the student-facing experience that Module 4 presents.

---

### 6.4 Module 4 — Student Experience & Dashboard

**Role as the primary student-facing experience:**
Module 4 is the layer through which students interact with the platform. It is responsible for the student dashboard and the overall student-facing product experience — how students see their courses, track their progress, access assessments, view results, and receive adaptive learning guidance.

**How it brings together information from other modules:**
Module 4 is a presentation and experience layer. It surfaces information and capabilities that originate in other modules:

- Course and content access from Module 2.
- Live class schedules and session access from Module 3.
- Assessment availability, submission, and results visibility from Module 5.
- Adaptive recommendations and remediation guidance from Module 6.

**Important boundary:**
Module 4 presents and facilitates the student experience. It does not own the underlying business logic for course management, assessment evaluation, or adaptive learning decisions. Those responsibilities remain with their respective modules.

---

### 6.5 Module 5 — AI Assessment & Evaluation

**Role in generating or supporting assessments:**
Module 5 is responsible for the assessment and evaluation cycle on the platform. This includes the creation or generation of assessments, the delivery of those assessments to students, the evaluation of student responses using AI-powered evaluation capabilities, and the production of structured performance and skill-related evidence.

**Assessment-to-evaluation lifecycle (high level):**
An assessment is created or generated → made available to the student → the student completes it → responses are evaluated → structured performance evidence and skill-level results are produced.

**How evaluation produces useful performance and skill-related evidence:**
Module 5's evaluation is not limited to producing a raw score. Its output includes structured evidence about student performance at a skill or knowledge-area level — identifying where a student demonstrated mastery and where gaps exist.

**How its outputs become inputs for Module 6:**
The performance evidence and identified weaknesses produced by Module 5 are the primary inputs that Module 6 uses to determine remediation needs, construct adaptive learning paths, and decide when a focused reassessment is appropriate.

---

### 6.6 Module 6 — Adaptive Learning & Remediation

**How this module uses performance and weakness information:**
Module 6 consumes the performance evidence and weakness identification produced by Module 5. Based on this data, it determines what remediation or adaptive learning actions are appropriate for the student.

**How remediation and adaptive learning conceptually work:**
Where a student has demonstrated gaps in specific skills or knowledge areas, Module 6 is responsible for supporting a structured, personalized response — directing the student toward relevant remediation content, constructing or recommending a focused learning path, and facilitating practice activities targeted at identified weaknesses.

**How focused learning and reassessment fit into the adaptive loop:**
After a student has engaged with remediation or adaptive learning content, Module 6 supports reassessment to evaluate whether identified weaknesses have been addressed. This creates a structured feedback loop: evaluate → identify weaknesses → remediate → reassess → evaluate again.

**How this module closes the learning feedback cycle:**
Module 6 is the mechanism through which the platform moves from passive content delivery to an active, improvement-oriented learning experience. It ensures that assessment results are not a terminal event but the beginning of a structured learning and improvement cycle.

**Boundary with Module 5:**
Module 5 is responsible for assessment generation, evaluation, and producing performance evidence. Module 6 is responsible for what happens *after* that evidence is produced — using it to drive remediation, adaptive learning, and focused reassessment. These are separate, distinct responsibilities.

---

## 7. How the Modules Work Together

The six modules are separate responsibility boundaries, but they form one integrated product. No module is a standalone mini-application.

The high-level integration flow:

```
Module 1 — User & Access Management
    ↓
    Provides identity, authentication, and access control to all modules.
    Every platform action is subject to the access rules Module 1 establishes.

Module 2 — Course & Content Management
    ↓
    Provides the structured learning content that students access through Module 4,
    that assessments in Module 5 may relate to, and that remediation in Module 6
    draws from.

Module 3 — Live Online Classes
    ↓
    Provides the live learning component, surfaced to students through Module 4,
    subject to access control from Module 1.

Module 4 — Student Experience & Dashboard
    ↓
    Presents the student-facing experience, surfacing content from Module 2,
    live class information from Module 3, assessment access and results from
    Module 5, and adaptive guidance from Module 6.

Module 5 — AI Assessment & Evaluation
    ↓
    Generates or supports assessments, evaluates student responses, and
    produces structured performance evidence and skill-level results.
    These outputs are the primary input to Module 6.

Module 6 — Adaptive Learning & Remediation
    ↓
    Uses performance evidence from Module 5 to identify weaknesses,
    drive remediation, construct personalized learning paths, support
    focused practice, and trigger reassessment — closing the learning
    feedback loop.
```

Each module owns its defined responsibilities. Cross-module dependencies are intentional and expected, but **ownership boundaries must remain clear**. One module must not silently absorb the responsibilities of another.

---

## 8. High-Level Student Lifecycle

The following describes a conceptual end-to-end student journey through the platform. Exact flows, rules, and system behaviors are defined in the individual module specifications.

```
1. ACCESS THE PLATFORM
   The student authenticates and is granted access according to their role
   and permissions (Module 1).

2. STUDENT EXPERIENCE
   The student lands on their dashboard and navigates their learning experience
   (Module 4) — viewing enrolled courses, upcoming live classes, pending
   assessments, and any active adaptive recommendations.

3. ENGAGE WITH COURSES AND CONTENT
   The student accesses structured course content — courses, modules, lessons —
   published and managed by Module 2, surfaced through Module 4.

4. ATTEND LIVE CLASSES (WHERE APPLICABLE)
   The student participates in scheduled live online sessions (Module 3),
   accessed through their student experience (Module 4).

5. TAKE AN ASSESSMENT
   The student is presented with an assessment (Module 5), accessible through
   their student experience (Module 4).

6. EVALUATION AND PERFORMANCE EVIDENCE
   The student's responses are evaluated (Module 5). Structured performance
   evidence and skill-level results are produced, including identification of
   any knowledge gaps or weaknesses.

7. RESULTS VISIBILITY
   The student views their evaluation results and performance evidence through
   their student experience (Module 4), drawing on data produced by Module 5.

8. WEAKNESS IDENTIFICATION
   Based on the performance evidence from Module 5, Module 6 identifies the
   specific skill or knowledge areas where the student has demonstrated gaps.

9. REMEDIATION AND ADAPTIVE LEARNING GUIDANCE
   Module 6 determines and surfaces remediation content, a personalized learning
   path, or focused practice activities. The student sees these recommendations
   through their student experience (Module 4) and engages with the relevant
   content from Module 2.

10. FOCUSED LEARNING AND PRACTICE
    The student works through the recommended remediation materials and practice
    activities as defined by Module 6.

11. REASSESSMENT
    The student takes a focused or subsequent assessment (Module 5), targeting
    the areas previously identified as weak.

12. NEW PERFORMANCE EVIDENCE
    New evaluation results and performance evidence are generated (Module 5),
    which may trigger further adaptive learning cycles (Module 6) or confirm
    that weaknesses have been addressed.
```

This lifecycle is cyclical, not linear. A student may pass through the assessment → evaluation → remediation → reassessment loop multiple times as part of their learning journey.

---

## 9. Core Project Concepts

The following concepts are used consistently throughout the project. They are defined here at a high level. Module specifications provide more detailed definitions where required.

| Concept | Definition |
|---|---|
| **User** | Any individual with an account on the platform, identified and managed by Module 1. |
| **Role** | A named category of user (e.g., Student, Instructor, Administrator) that determines what access and capabilities a user has. Defined in Module 1. |
| **Course** | A top-level structured learning unit containing modules and lessons. Managed by Module 2. |
| **Content** | The learning materials within a course — including lessons, resources, and media — managed through Module 2. |
| **Live Class** | A scheduled, real-time online learning session. Managed by Module 3. |
| **Student Experience** | The student-facing product layer — the dashboard, navigation, and visibility the student has into their learning, assessments, and recommendations. Owned by Module 4. |
| **Assessment** | A structured evaluation activity presented to the student. Generated, managed, and evaluated by Module 5. |
| **Evaluation** | The process of assessing and scoring student responses, producing structured performance evidence. Handled by Module 5. |
| **Performance Evidence** | The structured output of evaluation, capturing how a student performed at a skill or knowledge-area level. Produced by Module 5. |
| **Skill** | A defined area of knowledge or competency that assessments and evaluations are mapped to. Used in Modules 5 and 6. |
| **Weakness** | A skill or knowledge area where a student's performance evidence indicates insufficient mastery. Identified by Module 6. |
| **Remediation** | Targeted learning activity or content prescribed to address an identified weakness. Managed by Module 6. |
| **Adaptive Learning** | The process of adjusting the student's learning path based on performance evidence and identified needs. Managed by Module 6. |
| **Learning Path** | A structured sequence of learning activities (content, practice, or assessment) tailored to the student's needs. Constructed by Module 6. |
| **Reassessment** | A subsequent assessment designed to evaluate whether a previously identified weakness has been addressed. Triggered by Module 6, executed by Module 5. |

---

## 10. Module Boundaries and Ownership

Each module owns its defined responsibilities. No module should silently absorb the responsibilities of another module.

Cross-module communication and dependencies are expected and intentional — but ownership must remain clear.

The high-level ownership boundaries are:

| Module | Owns |
|---|---|
| **Module 1** | User identity, authentication, authorization, roles, permissions, and access control. |
| **Module 2** | The course and content structure, the content lifecycle, and the publishing of learning materials. |
| **Module 3** | The live online class experience, including session scheduling, access, and participation. |
| **Module 4** | The student-facing product experience, the dashboard, and the student's visibility into their learning, assessments, results, and recommendations. Does not own the underlying logic of the modules it surfaces. |
| **Module 5** | Assessment generation and delivery, student response evaluation, and the production of performance evidence and skill-level results. |
| **Module 6** | The use of performance evidence to identify weaknesses, drive remediation, construct adaptive learning paths, support focused practice, and trigger reassessment. |

**Critical ownership distinctions:**

- **Module 2** manages learning content. **Module 4** presents access to that content for students. Module 4 does not own or manage the content itself.
- **Module 5** evaluates student performance and produces structured evidence. **Module 6** uses that evidence to drive adaptive actions. Module 6 does not own the evaluation process.
- **Module 4** provides the student experience layer. It does not own the business logic of courses, assessments, evaluations, or adaptive learning decisions. It surfaces what other modules produce.

Detailed technical contracts, integration interfaces, and data exchange definitions are defined in module specifications and API documentation, not in this document.

---

## 11. Project Boundaries

This platform is **one integrated, AI-powered learning management system** organized around six defined modules.

It should not be treated as:

- **A static LMS only.** The platform includes AI-powered assessment, evaluation, and adaptive learning capabilities that go well beyond traditional content delivery.
- **An AI chatbot or AI tutor only.** The AI capabilities are structured around assessment, evaluation, and adaptive learning within a defined module architecture — not a general-purpose conversational AI interface.
- **A standalone test or quiz generator.** AI assessment generation is one capability within Module 5, which is part of a broader, integrated system.
- **Six disconnected applications.** The six modules are separate responsibility boundaries within one integrated platform. They share a common user foundation, interact through defined interfaces, and collectively support the full learning lifecycle.

The platform is defined by the combination of all six modules working together as one product.

---

## 12. Document Relationship to the Rest of the Project Documentation

This Base SDD is the starting point of the project documentation hierarchy. It provides shared project context. It does not replace or override the more detailed documentation that follows.

The documentation hierarchy is:

```
Base SDD (this document)
    → Provides overall project context, module structure, goals, user groups,
      shared concepts, and ownership boundaries.

System Architecture
    → Explains how the major system components and modules connect at a
      technical and structural level.

Technical Foundation
    → Defines approved technology decisions, frameworks, and infrastructure
      choices for the project.

System Flows
    → Describes major end-to-end platform flows, cross-module interactions,
      and key user journeys in detail.

Engineering Principles
    → Defines shared engineering standards, development practices, and
      conventions that apply across all modules.

Module Specifications
    → Define the detailed responsibilities, behavior, rules, and
      implementation requirements for each of the six modules.

API and Data Documentation
    → Defines detailed integration contracts, API endpoint specifications,
      request/response payloads, and data models.
```

**When to use this document:**
Use this Base SDD to understand the project at a high level — what it is, what it solves, who it serves, how the modules are structured, and how they interact conceptually.

**When to consult other documents:**
For detailed module behavior, system flows, technical decisions, or API contracts, consult the appropriate document in the hierarchy above. When a high-level description in this document conflicts with a more specific and approved module specification or architecture document, **the more detailed document takes precedence**.

---

## 13. Key Takeaways

- **One integrated platform.** This project is a single, AI-powered learning platform — not a collection of independent tools.
- **Six modules are the backbone.** The six modules are the approved product and architectural structure. They define what the platform is and how it is organized.
- **Clear ownership boundaries.** Each module owns defined responsibilities. Modules may interact but must not absorb each other's ownership.
- **Modules form a connected system.** The six modules work together to support the complete learning lifecycle — from access and content delivery through assessment, evaluation, and adaptive remediation.
- **Assessment and evaluation feed adaptive learning.** Module 5 produces performance evidence; Module 6 uses it. This distinction is fundamental to the platform's architecture.
- **The student lifecycle is a loop.** Assessment → evaluation → weakness identification → remediation → reassessment is a repeating cycle, not a one-time event.
- **This document provides context; module specs provide detail.** This Base SDD establishes shared understanding. Detailed implementation decisions, behavior rules, and technical contracts live in the module specifications and supporting documentation.