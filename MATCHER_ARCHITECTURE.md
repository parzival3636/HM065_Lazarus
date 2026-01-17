# Freelancer Matching Engine - Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                          │
│  - Project Listing                                              │
│  - Freelancer Applications                                      │
│  - Ranking Display                                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ HTTP/REST
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Django REST API                               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ ProjectViewSet                                           │  │
│  │ - ranked_freelancers()      → Top 5 freelancers        │  │
│  │ - match_analysis()          → Detailed analysis        │  │
│  │ - shortlist_freelancer()    → Update status            │  │
│  │ - reject_freelancer()       → Update status            │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Freelancer Matcher Engine                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ FreelancerMatcher Class                                  │  │
│  │                                                          │  │
│  │ 1. rank_freelancers(project, top_n=5)                  │  │
│  │    └─ Ranks all applicants for a project               │  │
│  │                                                          │  │
│  │ 2. get_match_details(application)                      │  │
│  │    └─ Detailed analysis for single application         │  │
│  │                                                          │  │
│  │ 3. _extract_features(project, developer, app)          │  │
│  │    └─ Extracts 114 features                            │  │
│  │                                                          │  │
│  │ 4. _predict_match_score(features)                      │  │
│  │    └─ Ensemble prediction (0-100)                      │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ BERT Model   │  │ ML Models    │  │ Feature      │
│              │  │              │  │ Scaler       │
│ Embeddings   │  │ - GB         │  │              │
│ (384 dims)   │  │ - RF         │  │ Normalizes   │
│              │  │              │  │ features     │
│ all-MiniLM   │  │ Ensemble     │  │              │
│ -L6-v2       │  │ Prediction   │  │ StandardScaler
└──────────────┘  └──────────────┘  └──────────────┘
```

## Data Flow

```
Project Application
        │
        ▼
┌─────────────────────────────────────────┐
│ Extract Features (114 dims)             │
├─────────────────────────────────────────┤
│ 1. BERT Embeddings (100 dims)          │
│    - Project text embedding             │
│    - Developer text embedding           │
│    - Proposal text embedding            │
│    - Portfolio text embedding           │
│                                         │
│ 2. Similarity Scores (3 features)      │
│    - Project-Developer similarity       │
│    - Project-Proposal similarity        │
│    - Project-Portfolio similarity       │
│                                         │
│ 3. Skill Metrics (3 features)          │
│    - Skill overlap ratio                │
│    - Missing skills ratio               │
│    - Extra skills ratio                 │
│                                         │
│ 4. Experience (2 features)             │
│    - Years of experience                │
│    - Experience fit score               │
│                                         │
│ 5. Proposal Quality (3 features)       │
│    - Proposal length                    │
│    - Proposal detail flag               │
│    - Proposal quality score             │
│                                         │
│ 6. Performance (2 features)            │
│    - Developer rating                   │
│    - Success rate                       │
│                                         │
│ 7. Rate Fit (1 feature)                │
│    - Budget alignment score             │
└─────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────┐
│ Feature Scaling                         │
│ StandardScaler.transform()              │
└─────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────┐
│ Ensemble Prediction                     │
├─────────────────────────────────────────┤
│ Gradient Boosting Classifier            │
│ └─ Predicts bin (0-3)                  │
│    └─ Maps to score (25, 50, 75, 95)   │
│                                         │
│ Random Forest Classifier                │
│ └─ Predicts bin (0-3)                  │
│    └─ Maps to score (25, 50, 75, 95)   │
│                                         │
│ Average: (GB_score + RF_score) / 2     │
└─────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────┐
│ Component Scores (0-100%)               │
├─────────────────────────────────────────┤
│ - Skill Match: 95%                      │
│ - Experience Fit: 88%                   │
│ - Portfolio Quality: 90%                │
│ - Proposal Quality: 85%                 │
│ - Rate Fit: 92%                         │
└─────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────┐
│ Final Result                            │
├─────────────────────────────────────────┤
│ Overall Score: 92/100                   │
│ Rank: 1st out of 12 applicants         │
│ Recommendation: HIGHLY QUALIFIED        │
└─────────────────────────────────────────┘
```

## Feature Extraction Pipeline

```
Input Data
    │
    ├─ Project
    │  ├─ title
    │  ├─ description
    │  ├─ tech_stack
    │  ├─ category
    │  ├─ complexity
    │  ├─ budget_min/max
    │  └─ deliverables
    │
    ├─ Developer Profile
    │  ├─ title
    │  ├─ bio
    │  ├─ skills
    │  ├─ years_experience
    │  ├─ rating
    │  ├─ success_rate
    │  └─ past_projects
    │
    └─ Application
       ├─ cover_letter
       ├─ proposed_rate
       └─ estimated_duration
            │
            ▼
    ┌──────────────────────────────────┐
    │ Text Preprocessing               │
    ├──────────────────────────────────┤
    │ Combine texts:                   │
    │ - project_text                   │
    │ - developer_text                 │
    │ - proposal_text                  │
    │ - past_projects_text             │
    └──────────────────────────────────┘
            │
            ▼
    ┌──────────────────────────────────┐
    │ BERT Encoding                    │
    ├──────────────────────────────────┤
    │ SentenceTransformer.encode()     │
    │ Output: 384-dim embeddings       │
    │ (reduced to 50 dims per text)    │
    └──────────────────────────────────┘
            │
            ▼
    ┌──────────────────────────────────┐
    │ Similarity Calculation           │
    ├──────────────────────────────────┤
    │ Cosine Similarity:               │
    │ - project vs developer           │
    │ - project vs proposal            │
    │ - project vs portfolio           │
    └──────────────────────────────────┘
            │
            ▼
    ┌──────────────────────────────────┐
    │ Skill Analysis                   │
    ├──────────────────────────────────┤
    │ Set operations:                  │
    │ - intersection (matching)        │
    │ - difference (missing/extra)     │
    │ - ratios (normalized)            │
    └──────────────────────────────────┘
            │
            ▼
    ┌──────────────────────────────────┐
    │ Metadata Extraction              │
    ├──────────────────────────────────┤
    │ - Experience years               │
    │ - Proposal length                │
    │ - Rating/success rate            │
    │ - Rate fit calculation           │
    └──────────────────────────────────┘
            │
            ▼
    ┌──────────────────────────────────┐
    │ Feature Vector (114 dims)        │
    ├──────────────────────────────────┤
    │ [sim1, sim2, sim3, skill_overlap,│
    │  missing_ratio, extra_ratio,     │
    │  years_exp, exp_score, prop_len, │
    │  prop_detail, prop_quality,      │
    │  rating, success_rate, rate_fit, │
    │  proj_emb[50], dev_emb[50]]      │
    └──────────────────────────────────┘
```

## Scoring Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Overall Score (0-100)                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Skill Match (25% weight)                             │  │
│  │ ├─ Required skills: [React, Node.js, MongoDB]       │  │
│  │ ├─ Developer skills: [React, Node.js, Express]      │  │
│  │ ├─ Matching: [React, Node.js]                       │  │
│  │ ├─ Missing: [MongoDB]                               │  │
│  │ └─ Score: 2/3 = 67% → 95/100 (weighted)            │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Experience Fit (20% weight)                          │  │
│  │ ├─ Years: 5 years                                    │  │
│  │ ├─ Level: Intermediate                              │  │
│  │ ├─ Project needs: 3-5 years                         │  │
│  │ └─ Score: 88/100 (weighted)                         │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Portfolio Quality (20% weight)                       │  │
│  │ ├─ Rating: 4.8/5.0                                  │  │
│  │ ├─ Success rate: 96%                                │  │
│  │ ├─ Past projects: 15 completed                      │  │
│  │ ├─ Similarity to current: 0.82 (BERT)              │  │
│  │ └─ Score: 90/100 (weighted)                         │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Proposal Quality (20% weight)                        │  │
│  │ ├─ Length: 250 words                                │  │
│  │ ├─ Detail level: High                               │  │
│  │ ├─ Relevance: 0.79 (BERT)                           │  │
│  │ └─ Score: 85/100 (weighted)                         │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Rate Fit (15% weight)                               │  │
│  │ ├─ Proposed: $75/hr                                 │  │
│  │ ├─ Budget: $50-100/hr                               │  │
│  │ ├─ Fit: Within budget                               │  │
│  │ └─ Score: 92/100 (weighted)                         │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  FINAL SCORE: (95×0.25 + 88×0.20 + 90×0.20 + 85×0.20 +   │
│               92×0.15) = 90.1 ≈ 90/100                    │
└─────────────────────────────────────────────────────────────┘
```

## Model Ensemble

```
┌─────────────────────────────────────────────────────────────┐
│                    Feature Vector (114 dims)                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
                ┌────────────────────┐
                │ Feature Scaler     │
                │ StandardScaler     │
                └────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
┌──────────────────┐ ┌──────────────────┐
│ Gradient Boosting│ │ Random Forest    │
│ Classifier       │ │ Classifier       │
├──────────────────┤ ├──────────────────┤
│ n_estimators: 100│ │ n_estimators: 100│
│ max_depth: 5     │ │ max_depth: 10    │
│ learning_rate: 0.1
│                  │ │                  │
│ Output: Bin 0-3  │ │ Output: Bin 0-3  │
│ (0→25, 1→50,    │ │ (0→25, 1→50,    │
│  2→75, 3→95)    │ │  2→75, 3→95)    │
└────────┬─────────┘ └────────┬─────────┘
         │                    │
         │ GB_score=75        │ RF_score=95
         │                    │
         └────────┬───────────┘
                  │
                  ▼
         ┌────────────────────┐
         │ Ensemble Average   │
         │ (75 + 95) / 2 = 85 │
         └────────────────────┘
                  │
                  ▼
         ┌────────────────────┐
         │ Final Score: 85/100│
         └────────────────────┘
```

## Integration Points

```
┌─────────────────────────────────────────────────────────────┐
│                    Django Application                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ REST API Layer (api_views.py)                        │  │
│  │ ├─ ProjectViewSet                                    │  │
│  │ │  ├─ ranked_freelancers()                          │  │
│  │ │  ├─ match_analysis()                              │  │
│  │ │  ├─ shortlist_freelancer()                        │  │
│  │ │  └─ reject_freelancer()                           │  │
│  │ └─ ProjectApplicationViewSet                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                         │                                   │
│                         ▼                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Utility Functions (utils.py)                         │  │
│  │ ├─ get_top_freelancers()                            │  │
│  │ ├─ analyze_application()                            │  │
│  │ ├─ shortlist_freelancer()                           │  │
│  │ ├─ reject_freelancer()                              │  │
│  │ ├─ get_freelancer_score_breakdown()                 │  │
│  │ ├─ batch_rank_projects()                            │  │
│  │ └─ get_freelancer_stats()                           │  │
│  └──────────────────────────────────────────────────────┘  │
│                         │                                   │
│                         ▼                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Matcher Engine (matcher.py)                          │  │
│  │ ├─ FreelancerMatcher class                          │  │
│  │ ├─ rank_freelancers()                               │  │
│  │ ├─ get_match_details()                              │  │
│  │ ├─ _extract_features()                              │  │
│  │ ├─ _predict_match_score()                           │  │
│  │ └─ _calculate_component_scores()                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                         │                                   │
│                         ▼                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ ML Models & BERT                                     │  │
│  │ ├─ SentenceTransformer (BERT)                       │  │
│  │ ├─ GradientBoostingClassifier                       │  │
│  │ ├─ RandomForestClassifier                           │  │
│  │ └─ StandardScaler                                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                         │                                   │
│                         ▼                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Database Models                                      │  │
│  │ ├─ Project                                           │  │
│  │ ├─ ProjectApplication                               │  │
│  │ ├─ DeveloperProfile                                 │  │
│  │ └─ User                                              │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Production Environment                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Frontend (React)                                     │  │
│  │ - Displays ranked freelancers                        │  │
│  │ - Shows component scores                            │  │
│  │ - Allows shortlisting/rejection                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                         │                                   │
│                    HTTP/REST                                │
│                         │                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Django Application Server                            │  │
│  │ - Gunicorn/uWSGI                                     │  │
│  │ - REST API endpoints                                │  │
│  │ - Request handling                                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                         │                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Matcher Service                                      │  │
│  │ - Loads models on startup                           │  │
│  │ - Caches BERT embeddings                            │  │
│  │ - Processes ranking requests                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                         │                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ ML Models (Cached in Memory)                         │  │
│  │ - gb_classifier.pkl (~166 MB)                       │  │
│  │ - rf_classifier.pkl (~86 MB)                        │  │
│  │ - feature_scaler.pkl (~3 KB)                        │  │
│  │ - BERT model (~400 MB)                              │  │
│  └──────────────────────────────────────────────────────┘  │
│                         │                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ PostgreSQL Database                                  │  │
│  │ - Projects                                           │  │
│  │ - Applications                                       │  │
│  │ - Developer Profiles                                │  │
│  │ - User Data                                          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Performance Characteristics

```
Operation                    Time        Memory
─────────────────────────────────────────────────
Load Models (first time)     ~2-3s       ~600 MB
Load Models (cached)         <100ms      ~600 MB
BERT Encoding (first)        ~500ms      ~200 MB
BERT Encoding (cached)       ~50ms       ~200 MB
Feature Extraction           ~100ms      ~50 MB
Model Prediction             ~10ms       ~10 MB
Rank 50 Freelancers          ~5-10s      ~800 MB
─────────────────────────────────────────────────
```

## Scalability Considerations

1. **Caching**: Models loaded once, reused for all requests
2. **Batch Processing**: Can rank multiple projects in parallel
3. **Async Tasks**: Consider Celery for long-running rankings
4. **Database Indexing**: Index on project_id, developer_id, status
5. **API Rate Limiting**: Prevent abuse of ranking endpoint
6. **Model Versioning**: Support multiple model versions

## Security Considerations

1. **Authentication**: All endpoints require user authentication
2. **Authorization**: Companies can only see their own projects
3. **Data Privacy**: Developer profiles protected
4. **Model Security**: Models stored securely, not exposed
5. **Input Validation**: All inputs validated before processing
