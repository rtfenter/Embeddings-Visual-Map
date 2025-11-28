# Embeddings Visual Map  

[![Live Demo](https://img.shields.io/badge/Live%20Demo-000?style=for-the-badge)](https://rtfenter.github.io/Embeddings-Visual-Map/)

A compact interactive map that shows how short texts relate to each other in meaning — demonstrating semantic similarity, clustering, and the geometric intuition behind embeddings, retrieval, and semantic search.

This project is part of the **AI & ML UX Systems Series**, a set of UX-first prototypes built to demonstrate AI reasoning, model intuition, and ML-aware product design in a clean, recruiter-friendly way.

The Embeddings Visual Map turns a complex ML concept — **“meaning as geometry”** — into a tiny, intuitive interface.

---

## Purpose

Embeddings are the backbone of modern AI systems:

- semantic search  
- RAG context retrieval  
- deduplication  
- document similarity  
- clustering  
- recommendations  
- meaning comparison  

But embeddings are invisible. Interviewers often ask:

- “Explain embeddings to a non-technical audience.”  
- “How does semantic search actually work?”  
- “Why does RAG rely on cosine similarity?”  

This prototype makes the concept immediately understandable.

You enter several texts → the system computes simple embedding-like vectors → the points arrange themselves on a 2D map.  
Texts with similar meaning cluster together.  
Outliers separate naturally.

---

## Features (MVP)
This prototype includes:

- 3–6 text inputs  
- Lightweight vectorization  
- Cosine similarity matrix  
- Force-directed 2D layout  
- Color-coded points and labels  
- Similarity matrix table  
- Interpretation notes  
- High-signal UX for interviews  

---

## Demo Screenshot

<img width="2806" height="2022" alt="Screenshot 2025-11-28 at 15-31-21 Embeddings Visual Map" src="https://github.com/user-attachments/assets/278d0479-0773-40f2-a5f4-1ac1453f5594" />


---

## Embeddings Flow Diagram

```
    [User Inputs: Text 1–6]
                 |
                 v
        Lightweight Vectorizer
        (bag-of-words → frequencies)
                 |
                 v
        Cosine Similarity Matrix
     (numerical distance between texts)
                 |
                 v
        2D Force Layout Engine
   closer = more similar, farther = less
                 |
                 v
     [Interactive Embeddings Map]
       • color-coded points
       • labels
       • emergent clusters
                 |
                 v
         [Similarity Matrix]
     detailed pairwise comparison

Meaning → vectors → geometry → UX.
```

---

## Why This Matters for AI PM Roles

Embeddings inform:

- search ranking  
- retrieval  
- clustering  
- deduplication  
- semantic distance  
- vector database behavior  

This prototype demonstrates:

- a clear mental model of embeddings  
- ability to simplify deep ML concepts  
- practical understanding of semantic geometry  
- product instincts for interpretability  
- knowledge of how retrieval systems work  

---

## Recruiter Value

This prototype signals:

- ML reasoning  
- UX clarity  
- conceptual translation skill  
- understanding of meaning distance  
- fluency in RAG fundamentals  
- ability to visualize hidden AI systems  

Small, elegant, high-impact.

---

## Part of the AI & ML UX Systems Series

Main Hub:  
https://github.com/rtfenter/AI-ML-UX-Systems-Series 

---

## Status

MVP is implemented and active.  
Runs entirely client-side — no backend required.

---
## Local Use

1. Clone the repo  
2. Open `index.html`  
3. Everything runs client-side
