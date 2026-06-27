import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


def recommend_jobs(candidate_skills: str, jobs: list, top_n: int = 10) -> list:
    """
    Recommends jobs based on skill similarity using TF-IDF + Cosine Similarity.

    How it works:
      1. Build a text corpus: [candidate_skills, job1_skills, job2_skills, ...]
      2. TF-IDF converts each text into a numeric vector (rare skills get higher weight)
      3. Cosine Similarity measures the angle between the candidate vector and each job vector
      4. Jobs closest in angle = most relevant skills match

    Args:
        candidate_skills: Comma-separated string of candidate skills (e.g. "React, Python, Django")
        jobs: List of Job model instances (must have a .skills attribute)
        top_n: Maximum number of recommendations to return

    Returns:
        List of dicts sorted by score descending: [{'job': Job, 'score': float}, ...]
    """
    if not candidate_skills or not candidate_skills.strip() or not jobs:
        return []

    job_skills = [job.skills or '' for job in jobs]

    # Filter out jobs with no skills defined
    valid_pairs = [(job, skills) for job, skills in zip(jobs, job_skills) if skills.strip()]
    if not valid_pairs:
        return []

    valid_jobs, valid_skills = zip(*valid_pairs)

    # Build corpus: candidate skills first, then each job's skills
    corpus = [candidate_skills] + list(valid_skills)

    vectorizer = TfidfVectorizer(stop_words='english')
    tfidf_matrix = vectorizer.fit_transform(corpus)

    # Cosine similarity: compare candidate vector (row 0) against all job vectors
    similarities = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()

    # Sort descending, take top_n, exclude zero-score jobs
    top_indices = np.argsort(similarities)[::-1][:top_n]

    results = []
    for idx in top_indices:
        score = float(similarities[idx])
        if score > 0:
            results.append({'job': valid_jobs[idx], 'score': round(score, 3)})

    return results
