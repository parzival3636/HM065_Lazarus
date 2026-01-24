---
tags:
- sentence-transformers
- sentence-similarity
- feature-extraction
- dense
- generated_from_trainer
- dataset_size:273
- loss:MultipleNegativesRankingLoss
base_model: sentence-transformers/all-mpnet-base-v2
widget:
- source_sentence: Build dashboard to analyze social media metrics across Facebook,
    Twitter, Instagram with sentiment analysis and engagement tracking
  sentences:
  - Kotlin, Java, Android SDK, REST API, Firebase, Material Design
  - I have 4 years Django development experience with 3 social media integration projects.
    I'll implement Django backend with Celery for async tasks (data fetching), React
    frontend for interactive charts, and sentiment analysis using NLTK/TextBlob. I
    have experience with Facebook Graph API and Twitter API integration.
  - AWS, Docker, Kubernetes, Jenkins, Terraform, Ansible, CI/CD, Linux, Bash
- source_sentence: Develop 3D modeling software for architectural visualization with
    VR support and realistic rendering
  sentences:
  - I am a database specialist. I can design the database schema for storing 3D models
    and user data. For the 3D rendering part, I would need to collaborate with a graphics
    programmer.
  - Table booking app with 20k monthly bookings PWA news app working fully offline
    Progressive web app for food delivery Progressive web app for restaurant reservations
    with offline support and 20k monthly users Offline-first news reading application
    with push notifications
  - Fitness app with exercise logging Mindfulness and meditation mobile app Food recipe
    sharing platform Fitness tracking app with exercise database and progress charts
- source_sentence: Develop comprehensive LMS with course creation, student progress
    tracking, assessments, and certificate generation
  sentences:
  - Booking system for international airline Integration with Amadeus/Sabre GDS Online
    and mobile check-in platform Complete airline reservation and management system
    for international carrier
  - Enterprise risk platform for bank VaR and stress testing system Basel III/IV compliance
    reporting Enterprise financial risk management system with Monte Carlo simulations
    and regulatory compliance
  - 'LMS specialist with 5 years experience. I have built 3 learning management systems.
    My approach: Laravel backend with MySQL, Vue.js frontend for interactive learning,
    AWS S3 for course content storage, assessment engine with various question types,
    progress tracking, certificate generation, and SCORM compliance for course import/export.'
- source_sentence: Build platform to collect, process, and visualize data from IoT
    sensors with real-time alerts and historical analysis
  sentences:
  - Full CI/CD pipeline for 50+ microservices Terraform setup for cloud infrastructure
    Prometheus/Grafana monitoring setup Complete CI/CD and infrastructure automation
    for SaaS company
  - Python tool for business data analysis REST API for data collection Python scripts
    for business automation REST API for collecting and processing sensor data
  - Project management tool for teams System for tracking tasks and deadlines App
    for tracking project time Comprehensive project management tool with task tracking
    and team collaboration
- source_sentence: Develop a decentralized voting system using smart contracts with
    voter verification, result transparency, and audit trails
  sentences:
  - React, Node.js, MongoDB, Express, Stripe API, AWS, Docker, Redux, TypeScript
  - Decentralized voting system for DAO with 10k members Marketplace for NFT trading
    with $10M volume Yield farming platform with smart contract audits Blockchain-based
    voting system with zero-knowledge proofs for privacy
  - PHP, JavaScript, Form Building, Survey Tools, Data Collection, Reporting
pipeline_tag: sentence-similarity
library_name: sentence-transformers
metrics:
- pearson_cosine
- spearman_cosine
model-index:
- name: SentenceTransformer based on sentence-transformers/all-mpnet-base-v2
  results:
  - task:
      type: semantic-similarity
      name: Semantic Similarity
    dataset:
      name: applicant eval
      type: applicant-eval
    metrics:
    - type: pearson_cosine
      value: 0.17074456929753593
      name: Pearson Cosine
    - type: spearman_cosine
      value: 0.16700973812039555
      name: Spearman Cosine
---

# SentenceTransformer based on sentence-transformers/all-mpnet-base-v2

This is a [sentence-transformers](https://www.SBERT.net) model finetuned from [sentence-transformers/all-mpnet-base-v2](https://huggingface.co/sentence-transformers/all-mpnet-base-v2). It maps sentences & paragraphs to a 768-dimensional dense vector space and can be used for semantic textual similarity, semantic search, paraphrase mining, text classification, clustering, and more.

## Model Details

### Model Description
- **Model Type:** Sentence Transformer
- **Base model:** [sentence-transformers/all-mpnet-base-v2](https://huggingface.co/sentence-transformers/all-mpnet-base-v2) <!-- at revision e8c3b32edf5434bc2275fc9bab85f82640a19130 -->
- **Maximum Sequence Length:** 384 tokens
- **Output Dimensionality:** 768 dimensions
- **Similarity Function:** Cosine Similarity
<!-- - **Training Dataset:** Unknown -->
<!-- - **Language:** Unknown -->
<!-- - **License:** Unknown -->

### Model Sources

- **Documentation:** [Sentence Transformers Documentation](https://sbert.net)
- **Repository:** [Sentence Transformers on GitHub](https://github.com/huggingface/sentence-transformers)
- **Hugging Face:** [Sentence Transformers on Hugging Face](https://huggingface.co/models?library=sentence-transformers)

### Full Model Architecture

```
SentenceTransformer(
  (0): Transformer({'max_seq_length': 384, 'do_lower_case': False, 'architecture': 'MPNetModel'})
  (1): Pooling({'word_embedding_dimension': 768, 'pooling_mode_cls_token': False, 'pooling_mode_mean_tokens': True, 'pooling_mode_max_tokens': False, 'pooling_mode_mean_sqrt_len_tokens': False, 'pooling_mode_weightedmean_tokens': False, 'pooling_mode_lasttoken': False, 'include_prompt': True})
  (2): Normalize()
)
```

## Usage

### Direct Usage (Sentence Transformers)

First install the Sentence Transformers library:

```bash
pip install -U sentence-transformers
```

Then you can load this model and run inference.
```python
from sentence_transformers import SentenceTransformer

# Download from the 🤗 Hub
model = SentenceTransformer("sentence_transformers_model_id")
# Run inference
sentences = [
    'Develop a decentralized voting system using smart contracts with voter verification, result transparency, and audit trails',
    'Decentralized voting system for DAO with 10k members Marketplace for NFT trading with $10M volume Yield farming platform with smart contract audits Blockchain-based voting system with zero-knowledge proofs for privacy',
    'React, Node.js, MongoDB, Express, Stripe API, AWS, Docker, Redux, TypeScript',
]
embeddings = model.encode(sentences)
print(embeddings.shape)
# [3, 768]

# Get the similarity scores for the embeddings
similarities = model.similarity(embeddings, embeddings)
print(similarities)
# tensor([[ 1.0000,  0.5858, -0.0600],
#         [ 0.5858,  1.0000, -0.0609],
#         [-0.0600, -0.0609,  1.0000]])
```

<!--
### Direct Usage (Transformers)

<details><summary>Click to see the direct usage in Transformers</summary>

</details>
-->

<!--
### Downstream Usage (Sentence Transformers)

You can finetune this model on your own dataset.

<details><summary>Click to expand</summary>

</details>
-->

<!--
### Out-of-Scope Use

*List how the model may foreseeably be misused and address what users ought not to do with the model.*
-->

## Evaluation

### Metrics

#### Semantic Similarity

* Dataset: `applicant-eval`
* Evaluated with [<code>EmbeddingSimilarityEvaluator</code>](https://sbert.net/docs/package_reference/sentence_transformer/evaluation.html#sentence_transformers.evaluation.EmbeddingSimilarityEvaluator)

| Metric              | Value     |
|:--------------------|:----------|
| pearson_cosine      | 0.1707    |
| **spearman_cosine** | **0.167** |

<!--
## Bias, Risks and Limitations

*What are the known or foreseeable issues stemming from this model? You could also flag here known failure cases or weaknesses of the model.*
-->

<!--
### Recommendations

*What are recommendations with respect to the foreseeable issues? For example, filtering explicit content.*
-->

## Training Details

### Training Dataset

#### Unnamed Dataset

* Size: 273 training samples
* Columns: <code>sentence_0</code>, <code>sentence_1</code>, and <code>label</code>
* Approximate statistics based on the first 273 samples:
  |         | sentence_0                                                                         | sentence_1                                                                          | label                                                         |
  |:--------|:-----------------------------------------------------------------------------------|:------------------------------------------------------------------------------------|:--------------------------------------------------------------|
  | type    | string                                                                             | string                                                                              | float                                                         |
  | details | <ul><li>min: 14 tokens</li><li>mean: 20.71 tokens</li><li>max: 29 tokens</li></ul> | <ul><li>min: 16 tokens</li><li>mean: 40.95 tokens</li><li>max: 111 tokens</li></ul> | <ul><li>min: 0.7</li><li>mean: 0.8</li><li>max: 0.9</li></ul> |
* Samples:
  | sentence_0                                                               | sentence_1                                                                                                | label            |
  |:-------------------------------------------------------------------------|:----------------------------------------------------------------------------------------------------------|:-----------------|
  | <code>Python, TensorFlow, FastAPI, Docker, AWS, PostgreSQL</code>        | <code>WordPress, PHP, MySQL, jQuery, CSS, HTML</code>                                                     | <code>0.8</code> |
  | <code>Python, Django, React, PostgreSQL, Redis, Celery</code>            | <code>Python, Django, React, PostgreSQL, REST API, Celery, Redis, Data Analysis</code>                    | <code>0.8</code> |
  | <code>PHP, Laravel, Vue.js, MySQL, Membership, Payment Processing</code> | <code>PHP, Laravel, MySQL, JavaScript, Membership Systems, Association Management, Dues Collection</code> | <code>0.8</code> |
* Loss: [<code>MultipleNegativesRankingLoss</code>](https://sbert.net/docs/package_reference/sentence_transformer/losses.html#multiplenegativesrankingloss) with these parameters:
  ```json
  {
      "scale": 20.0,
      "similarity_fct": "cos_sim",
      "gather_across_devices": false
  }
  ```

### Training Hyperparameters
#### Non-Default Hyperparameters

- `eval_strategy`: steps
- `num_train_epochs`: 4
- `multi_dataset_batch_sampler`: round_robin

#### All Hyperparameters
<details><summary>Click to expand</summary>

- `overwrite_output_dir`: False
- `do_predict`: False
- `eval_strategy`: steps
- `prediction_loss_only`: True
- `per_device_train_batch_size`: 8
- `per_device_eval_batch_size`: 8
- `per_gpu_train_batch_size`: None
- `per_gpu_eval_batch_size`: None
- `gradient_accumulation_steps`: 1
- `eval_accumulation_steps`: None
- `torch_empty_cache_steps`: None
- `learning_rate`: 5e-05
- `weight_decay`: 0.0
- `adam_beta1`: 0.9
- `adam_beta2`: 0.999
- `adam_epsilon`: 1e-08
- `max_grad_norm`: 1
- `num_train_epochs`: 4
- `max_steps`: -1
- `lr_scheduler_type`: linear
- `lr_scheduler_kwargs`: None
- `warmup_ratio`: 0.0
- `warmup_steps`: 0
- `log_level`: passive
- `log_level_replica`: warning
- `log_on_each_node`: True
- `logging_nan_inf_filter`: True
- `save_safetensors`: True
- `save_on_each_node`: False
- `save_only_model`: False
- `restore_callback_states_from_checkpoint`: False
- `no_cuda`: False
- `use_cpu`: False
- `use_mps_device`: False
- `seed`: 42
- `data_seed`: None
- `jit_mode_eval`: False
- `bf16`: False
- `fp16`: False
- `fp16_opt_level`: O1
- `half_precision_backend`: auto
- `bf16_full_eval`: False
- `fp16_full_eval`: False
- `tf32`: None
- `local_rank`: 0
- `ddp_backend`: None
- `tpu_num_cores`: None
- `tpu_metrics_debug`: False
- `debug`: []
- `dataloader_drop_last`: False
- `dataloader_num_workers`: 0
- `dataloader_prefetch_factor`: None
- `past_index`: -1
- `disable_tqdm`: False
- `remove_unused_columns`: True
- `label_names`: None
- `load_best_model_at_end`: False
- `ignore_data_skip`: False
- `fsdp`: []
- `fsdp_min_num_params`: 0
- `fsdp_config`: {'min_num_params': 0, 'xla': False, 'xla_fsdp_v2': False, 'xla_fsdp_grad_ckpt': False}
- `fsdp_transformer_layer_cls_to_wrap`: None
- `accelerator_config`: {'split_batches': False, 'dispatch_batches': None, 'even_batches': True, 'use_seedable_sampler': True, 'non_blocking': False, 'gradient_accumulation_kwargs': None}
- `parallelism_config`: None
- `deepspeed`: None
- `label_smoothing_factor`: 0.0
- `optim`: adamw_torch_fused
- `optim_args`: None
- `adafactor`: False
- `group_by_length`: False
- `length_column_name`: length
- `project`: huggingface
- `trackio_space_id`: trackio
- `ddp_find_unused_parameters`: None
- `ddp_bucket_cap_mb`: None
- `ddp_broadcast_buffers`: False
- `dataloader_pin_memory`: True
- `dataloader_persistent_workers`: False
- `skip_memory_metrics`: True
- `use_legacy_prediction_loop`: False
- `push_to_hub`: False
- `resume_from_checkpoint`: None
- `hub_model_id`: None
- `hub_strategy`: every_save
- `hub_private_repo`: None
- `hub_always_push`: False
- `hub_revision`: None
- `gradient_checkpointing`: False
- `gradient_checkpointing_kwargs`: None
- `include_inputs_for_metrics`: False
- `include_for_metrics`: []
- `eval_do_concat_batches`: True
- `fp16_backend`: auto
- `push_to_hub_model_id`: None
- `push_to_hub_organization`: None
- `mp_parameters`: 
- `auto_find_batch_size`: False
- `full_determinism`: False
- `torchdynamo`: None
- `ray_scope`: last
- `ddp_timeout`: 1800
- `torch_compile`: False
- `torch_compile_backend`: None
- `torch_compile_mode`: None
- `include_tokens_per_second`: False
- `include_num_input_tokens_seen`: no
- `neftune_noise_alpha`: None
- `optim_target_modules`: None
- `batch_eval_metrics`: False
- `eval_on_start`: False
- `use_liger_kernel`: False
- `liger_kernel_config`: None
- `eval_use_gather_object`: False
- `average_tokens_across_devices`: True
- `prompts`: None
- `batch_sampler`: batch_sampler
- `multi_dataset_batch_sampler`: round_robin
- `router_mapping`: {}
- `learning_rate_mapping`: {}

</details>

### Training Logs
| Epoch  | Step | applicant-eval_spearman_cosine |
|:------:|:----:|:------------------------------:|
| 1.0    | 35   | 0.1075                         |
| 1.4286 | 50   | 0.0957                         |
| 2.0    | 70   | 0.0875                         |
| 2.8571 | 100  | 0.1629                         |
| 3.0    | 105  | 0.1524                         |
| 4.0    | 140  | 0.1670                         |


### Framework Versions
- Python: 3.12.12
- Sentence Transformers: 5.2.0
- Transformers: 4.57.6
- PyTorch: 2.9.0+cpu
- Accelerate: 1.12.0
- Datasets: 4.0.0
- Tokenizers: 0.22.2

## Citation

### BibTeX

#### Sentence Transformers
```bibtex
@inproceedings{reimers-2019-sentence-bert,
    title = "Sentence-BERT: Sentence Embeddings using Siamese BERT-Networks",
    author = "Reimers, Nils and Gurevych, Iryna",
    booktitle = "Proceedings of the 2019 Conference on Empirical Methods in Natural Language Processing",
    month = "11",
    year = "2019",
    publisher = "Association for Computational Linguistics",
    url = "https://arxiv.org/abs/1908.10084",
}
```

#### MultipleNegativesRankingLoss
```bibtex
@misc{henderson2017efficient,
    title={Efficient Natural Language Response Suggestion for Smart Reply},
    author={Matthew Henderson and Rami Al-Rfou and Brian Strope and Yun-hsuan Sung and Laszlo Lukacs and Ruiqi Guo and Sanjiv Kumar and Balint Miklos and Ray Kurzweil},
    year={2017},
    eprint={1705.00652},
    archivePrefix={arXiv},
    primaryClass={cs.CL}
}
```

<!--
## Glossary

*Clearly define terms in order to be accessible across audiences.*
-->

<!--
## Model Card Authors

*Lists the people who create the model card, providing recognition and accountability for the detailed work that goes into its construction.*
-->

<!--
## Model Card Contact

*Provides a way for people who have updates to the Model Card, suggestions, or questions, to contact the Model Card authors.*
-->