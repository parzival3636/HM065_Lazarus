# 📁 File Placement Visual Guide

## Your Downloaded Files (from Colab)

```
📦 applicant_scoring_package.zip
├── 📁 fine_tuned_model/
│   ├── config.json
│   ├── config_sentence_transformers.json
│   ├── model.safetensors
│   ├── modules.json
│   ├── sentence_bert_config.json
│   ├── special_tokens_map.json
│   ├── tokenizer.json
│   ├── tokenizer_config.json
│   └── vocab.txt
├── 📄 requirements (text file)
└── 🐍 scorer.py
```

## Where to Place Them

### 1. Fine-tuned Model Folder
**Drag the entire `fine_tuned_model` folder to:**
```
HM065_Lazarus/backend/fine_tuned_model/
```

### 2. Scorer File
**Drag `scorer.py` to:**
```
HM065_Lazarus/backend/scorer.py
```

### 3. Requirements File (Optional)
**Rename and place as:**
```
HM065_Lazarus/backend/requirements_finetuned.txt
```

## Final Directory Structure

```
HM065_Lazarus/
├── backend/
│   ├── 📁 fine_tuned_model/        ← Your model goes here
│   │   ├── config.json
│   │   ├── config_sentence_transformers.json
│   │   ├── model.safetensors
│   │   ├── modules.json
│   │   ├── sentence_bert_config.json
│   │   ├── special_tokens_map.json
│   │   ├── tokenizer.json
│   │   ├── tokenizer_config.json
│   │   └── vocab.txt
│   ├── 🐍 scorer.py                ← Your scorer goes here
│   ├── 📄 requirements_finetuned.txt ← Your requirements (renamed)
│   ├── projects/
│   │   ├── fine_tuned_matcher.py   ✅ Already created
│   │   └── ...
│   ├── manage.py
│   └── ...
└── frontend/
    └── ...
```

## Quick Steps

1. **Extract** your zip file
2. **Drag** `fine_tuned_model` folder → `backend/fine_tuned_model/`
3. **Drag** `scorer.py` → `backend/scorer.py`
4. **Restart** the Django server
5. **Test** with `python test_fine_tuned_matcher.py`

## What NOT to Touch

❌ Don't modify these files:
- `projects/fine_tuned_matcher.py` (already configured)
- `projects/api_views.py` (already updated)
- `projects/utils.py` (already updated)

✅ These are ready to use your model automatically!