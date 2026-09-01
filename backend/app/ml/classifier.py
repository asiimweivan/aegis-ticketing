import re
import os
import json
import joblib
import numpy as np
from pathlib import Path
from typing import List, Tuple

from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

from app.models.models import TicketCategory, TicketPriority

MODEL_DIR = Path(__file__).parent / "saved_models"
MODEL_DIR.mkdir(exist_ok=True)

CATEGORY_MODEL_PATH = MODEL_DIR / "category_model.joblib"
PRIORITY_MODEL_PATH = MODEL_DIR / "priority_model.joblib"


CATEGORY_KEYWORDS = {
    TicketCategory.TECHNICAL: [
        "server", "network", "software", "hardware", "bug", "error", "crash",
        "system", "computer", "laptop", "internet", "wifi", "database", "application",
        "install", "update", "reboot", "code", "api", "website", "printer", "device"
    ],
    TicketCategory.ADMINISTRATIVE: [
        "document", "form", "approval", "request", "procedure", "policy",
        "office", "meeting", "schedule", "permit", "certificate", "registration",
        "contract", "signature", "report", "admin", "management"
    ],
    TicketCategory.BILLING: [
        "invoice", "payment", "billing", "charge", "fee", "refund", "receipt",
        "subscription", "cost", "price", "salary", "payroll", "budget", "finance",
        "transaction", "account", "money", "bank"
    ],
    TicketCategory.INFRASTRUCTURE: [
        "building", "electricity", "power", "water", "elevator", "air conditioning",
        "hvac", "generator", "maintenance", "facility", "room", "floor", "cable",
        "infrastructure", "plumbing", "door", "light", "cleaning"
    ],
    TicketCategory.HR: [
        "leave", "vacation", "sick", "employee", "hiring", "resignation", "contract",
        "performance", "training", "onboarding", "hr", "human resources", "complaint",
        "promotion", "salary", "benefit", "attendance", "workforce"
    ],
    TicketCategory.SECURITY: [
        "security", "access", "password", "login", "breach", "hack", "unauthorized",
        "permission", "firewall", "vpn", "authentication", "threat", "malware",
        "phishing", "vulnerability", "account locked", "suspicious"
    ],
}

PRIORITY_KEYWORDS = {
    TicketPriority.CRITICAL: [
        "urgent", "critical", "emergency", "immediately", "system down", "outage",
        "breach", "data loss", "production", "cannot work", "blocked", "asap",
        "all users affected", "entire", "completely", "failure"
    ],
    TicketPriority.HIGH: [
        "important", "high priority", "significant", "major", "affecting", "multiple",
        "cannot", "unable", "not working", "broken", "serious", "deadline", "escalate"
    ],
    TicketPriority.MEDIUM: [
        "moderate", "sometimes", "intermittent", "slow", "delayed", "occasional",
        "a few", "some", "partial", "workaround", "when possible"
    ],
    TicketPriority.LOW: [
        "minor", "low", "whenever", "small", "trivial", "suggestion", "enhancement",
        "nice to have", "cosmetic", "eventually", "no rush", "low priority"
    ],
}

SLA_HOURS = {
    TicketPriority.CRITICAL: 4,
    TicketPriority.HIGH: 12,
    TicketPriority.MEDIUM: 48,
    TicketPriority.LOW: 120,
}


def preprocess_text(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def extract_tags(text: str) -> List[str]:
    text_lower = text.lower()
    tags = []
    for category, keywords in CATEGORY_KEYWORDS.items():
        for kw in keywords:
            if kw in text_lower:
                tags.append(kw)
    return list(set(tags))[:8]


def generate_summary(title: str, description: str) -> str:
    combined = f"{title}. {description}"
    sentences = re.split(r"[.!?]", combined)
    sentences = [s.strip() for s in sentences if len(s.strip()) > 20]
    if not sentences:
        return description[:150] + "..." if len(description) > 150 else description
    return sentences[0][:200]


def rule_based_category(text: str) -> Tuple[TicketCategory, float]:
    text_lower = text.lower()
    scores = {cat: 0 for cat in TicketCategory}
    for category, keywords in CATEGORY_KEYWORDS.items():
        for keyword in keywords:
            if keyword in text_lower:
                scores[category] += 1
    best = max(scores, key=scores.get)
    total = sum(scores.values())
    confidence = scores[best] / total if total > 0 else 0.3
    if scores[best] == 0:
        return TicketCategory.GENERAL, 0.3
    return best, min(confidence, 0.85)


def rule_based_priority(text: str) -> Tuple[TicketPriority, float]:
    text_lower = text.lower()
    scores = {pri: 0 for pri in TicketPriority}
    for priority, keywords in PRIORITY_KEYWORDS.items():
        for keyword in keywords:
            if keyword in text_lower:
                scores[priority] += 1
    best = max(scores, key=scores.get)
    total = sum(scores.values())
    confidence = scores[best] / total if total > 0 else 0.3
    if scores[best] == 0:
        return TicketPriority.MEDIUM, 0.4
    return best, min(confidence, 0.85)


class TicketClassifier:
    def __init__(self):
        self.category_pipeline = None
        self.priority_pipeline = None
        self.is_trained = False
        self._load_models()

    def _load_models(self):
        if CATEGORY_MODEL_PATH.exists() and PRIORITY_MODEL_PATH.exists():
            try:
                self.category_pipeline = joblib.load(CATEGORY_MODEL_PATH)
                self.priority_pipeline = joblib.load(PRIORITY_MODEL_PATH)
                self.is_trained = True
            except Exception:
                self.is_trained = False

    def train(self, texts: List[str], categories: List[str], priorities: List[str]):
        if len(texts) < 20:
            return False

        self.category_pipeline = Pipeline([
            ("tfidf", TfidfVectorizer(ngram_range=(1, 2), max_features=5000, stop_words="english")),
            ("clf", LogisticRegression(max_iter=500, C=1.0, multi_class="ovr"))
        ])
        self.category_pipeline.fit(texts, categories)

        self.priority_pipeline = Pipeline([
            ("tfidf", TfidfVectorizer(ngram_range=(1, 2), max_features=3000, stop_words="english")),
            ("clf", LogisticRegression(max_iter=500, C=1.0, multi_class="ovr"))
        ])
        self.priority_pipeline.fit(texts, priorities)

        joblib.dump(self.category_pipeline, CATEGORY_MODEL_PATH)
        joblib.dump(self.priority_pipeline, PRIORITY_MODEL_PATH)
        self.is_trained = True
        return True

    def classify(self, title: str, description: str) -> dict:
        combined_text = preprocess_text(f"{title} {description}")

        if self.is_trained:
            cat_proba = self.category_pipeline.predict_proba([combined_text])[0]
            cat_classes = self.category_pipeline.classes_
            cat_idx = np.argmax(cat_proba)
            predicted_category = TicketCategory(cat_classes[cat_idx])
            cat_confidence = float(cat_proba[cat_idx])

            pri_proba = self.priority_pipeline.predict_proba([combined_text])[0]
            pri_classes = self.priority_pipeline.classes_
            pri_idx = np.argmax(pri_proba)
            predicted_priority = TicketPriority(pri_classes[pri_idx])
            pri_confidence = float(pri_proba[pri_idx])

            confidence = round((cat_confidence + pri_confidence) / 2, 3)
        else:
            predicted_category, cat_conf = rule_based_category(combined_text)
            predicted_priority, pri_conf = rule_based_priority(combined_text)
            confidence = round((cat_conf + pri_conf) / 2, 3)

        return {
            "category": predicted_category,
            "priority": predicted_priority,
            "confidence": confidence,
            "summary": generate_summary(title, description),
            "tags": extract_tags(f"{title} {description}"),
            "sla_hours": SLA_HOURS[predicted_priority],
        }


def detect_recurring_issues(tickets: list) -> List[dict]:
    from collections import Counter
    if not tickets:
        return []

    category_counts = Counter()
    tag_counts = Counter()

    for ticket in tickets:
        category_counts[ticket.get("category", "general")] += 1
        for tag in (ticket.get("ai_tags") or []):
            tag_counts[tag] += 1

    recurring = []
    for tag, count in tag_counts.most_common(10):
        if count >= 2:
            recurring.append({"issue": tag, "frequency": count, "type": "keyword"})

    for category, count in category_counts.most_common(5):
        if count >= 3:
            recurring.append({"issue": f"Recurring {category} issues", "frequency": count, "type": "category"})

    return recurring[:8]


classifier = TicketClassifier()