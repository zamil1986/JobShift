# Research: AI API choice and the official IASC reporting channel

All sources were checked on **2026-11-26**. Only primary sources were used: provider docs, pricing and limit pages, terms, and ojk.go.id. ToS text is paraphrased, with only short operative phrases quoted. The full clauses are at the linked URLs.

## TL;DR

**Q1. AI API**
- **Use Groq.** Call `openai/gpt-oss-120b` on Groq's Free plan, with strict `json_schema` structured output.
  - Groq's agreement says it may not train on inputs or outputs.
  - By default it does not retain inference data. The exception is abuse and reliability logs, kept for up to 30 days in the US, and those can be turned off with Zero Data Retention (ZDR).
  - Strict mode uses constrained decoding, so the output always matches the schema.
- **The binding limit is tokens, not requests.** Free plan limits per model are 30 RPM, 1K RPD, **8K TPM** and **200K TPD**.
  - That works out to roughly 3–5 checks per minute and roughly 85–130 checks per day per model (estimate below).
  - The rules engine has to carry traffic beyond that, which the PRD already requires.
- **Fallback: Cloudflare Workers AI.** It has the strongest documented privacy commitment of the free options: no training and zero data retention for standard inference.
  - It gives 10,000 free Neurons per day, about 85–120 checks per day (estimate).
  - JSON-schema output is best-effort only, so our own schema validation still decides.
- **Do not use Gemini's free tier.** Its terms let Google use free-tier prompts to improve products, allow human review, and tell developers not to submit personal information. That conflicts with the privacy requirement.
- **Dropped as having no usable free API tier:** Mistral (Free mode excludes the API), Cerebras (30-day trial credit only), GitHub Models (retired), OpenAI and Anthropic (no documented renewing free allowance). OpenRouter `:free` models are capped at 50 requests a day without a $10 credit purchase.

**Q2. IASC**
- **Official reporting site:** **https://iasc.ojk.go.id/**. The report form is at https://iasc.ojk.go.id/Guest/LaporanV2.
- **Where OJK confirms it:** OJK's notice of 28 March 2025 says IASC reports can only be made through the official website iasc.ojk.go.id. The notice is at https://ojk.go.id/id/berita-dan-kegiatan/info-terkini/Pages/Waspada-Penipuan-Website-Mengatasnamakan-Indonesia-Anti-Scam-Centre-IASC.aspx.
- **No IASC-specific phone or WhatsApp number was found on the pages checked.** The numbers OJK gives are its general consumer channel, Kontak OJK: phone **157**, WhatsApp **081 157 157 157**, email konsumen@ojk.go.id. The IASC email is iasc@ojk.go.id.

---

## Question 1: Which AI API should Legitly use?

### Comparison table (free tiers only, checked 2026-11-26)

| Provider / model | RPM | RPD | TPM | TPD | Credit card for free use? | Structured output | Published speed / latency | Indonesian documented? | Free-tier data use | Indonesia availability |
|---|---|---|---|---|---|---|---|---|---|---|
| **Groq**, `openai/gpt-oss-120b` (same limits for `gpt-oss-20b`) [G1] | 30 | 1K | 8K | 200K | Not stated. Billing FAQ asks for a payment method only to upgrade to Developer [G5]. | **Native JSON Schema, `strict: true` (constrained decoding)** [G3] | Throughput ~500 tok/s (120B), ~1000 tok/s (20B). Not end-to-end latency [G6]. | Not by name. Model page claims "81+ languages", MMMLU 81.3% [G7]. | No training (contract). No retention by default. Abuse/reliability logs up to 30 days unless ZDR [G2][G4]. | No country list found. Agreement bars breach of US export-control laws [G4]. |
| **Cloudflare Workers AI**, e.g. `@cf/openai/gpt-oss-120b` or `@cf/meta/llama-3.3-70b-instruct-fp8-fast` [C1] | 300 (text generation) [C2] | Bounded by Neurons | n/a | 10,000 Neurons/day, all models [C1] | Not stated. Workers Free plan is the default [C6]. | JSON Schema via `response_format`, **best effort, not guaranteed**. Official list is limited and includes Llama 3.3 70B but not gpt-oss [C3]. | Not published | Not documented. Llama 3.3 officially supports 8 languages, not Indonesian [M1]. SEA-LION v4 is described as tuned for Southeast Asia [C7]. | **No training. Zero data retention** for standard inference [C4]. | No restriction found in pages checked |
| **Google Gemini API (AI Studio)**, e.g. `gemini-3.5-flash-lite`, `gemini-3.8-flash` [GM2] | Shown only in the AI Studio console [GM1] | Console only | Console only | Console only | Not stated. New accounts start on the Free Tier; billing is set up to upgrade [GM6]. | **Native JSON Schema** (`responseJsonSchema`) [GM5] | Not published | Not documented on pages checked | **Used to improve Google products; human review possible** [GM3] | **Indonesia is on the available-regions list** [GM4] |
| **OpenRouter** `:free` models [O1] | 20 | **50** (under $10 credits ever bought); 1,000 (at least $10 bought) | Not stated | Not stated | Not needed for 50 RPD | JSON Schema on "select models", per provider endpoint [O4] | Not published | Depends on model | Varies by upstream provider; separate opt-out setting for free models [O2][O3] | Not checked |
| **Vercel AI Gateway** free credit [V1] | Lower per-model limits; numbers not published [V2] | — | — | $5/month credit | Not stated | Depends on model | — | — | **ZDR not available on free credits** [V1] | Not checked |

Notes on the table:
- **Groq.** Limits apply per organization and per model. Cached prompt tokens do not count toward rate limits [G1][G8].
- **Gemini.** The rate-limits page publishes free-tier numbers only for niche models such as Gemini Decision 1, not for the Flash or Flash-Lite text models [GM1]. Those limits are not verified here.
  - Free-tier Flash and Flash-Lite models are listed as "Free of charge" on the pricing page [GM2].
  - `gemini-2.5-flash` and `gemini-2.5-pro` are deprecated. From **1 Dec 2026** their requests are rerouted to `gemini-3.5-flash-lite` and `gemini-3.8-flash` [GM2][GM7].
- **Groq Free plan models.** The remaining large text models are `gpt-oss-120b`, `gpt-oss-20b` and `qwen/qwen3.8-27b`. `llama-3.3-70b-versatile` and `llama-3.1-8b-instant` shut down on free and developer tiers on 16 Aug 2026 [G9].
  - The deprecations page lists no shutdown for `gpt-oss-120b` or `gpt-oss-20b` [G9].

### Dropped candidates (no genuinely free, server-usable tier)

| Provider | Finding | Source |
|---|---|---|
| Mistral (La Plateforme / AI Studio) | Free mode includes a monthly budget for Vibe and Studio but does not include API access. API keys require billing activation and pay-as-you-go. | [MI1] |
| Cerebras | No permanent free tier. New accounts get $5 of trial credit after adding a verified payment method, and it expires after 30 days. | [CE1] |
| GitHub Models | Fully retired as of 30 July 2026. | [GH1] |
| OpenAI | The "Free" usage tier only means "user must be in an allowed geography", with a $100/month usage cap. The standard rate-limit table lists models only for the paid tiers (Build, Launch, Grow). No free token allowance is documented. | [OA1] |
| Anthropic | The pricing FAQ says new users receive free credits to test the API. No amount, renewal or free rate tier is documented, so it can't be relied on through 10 Dec. | [AN1][AN2] |

### Data use on the free tier (privacy requirement)

The PRD says user text must never be stored or logged. Below is what each provider does with prompts sent on its free tier.

- **Groq**
  - **Training.** Under §4.2 of the Groq Services Agreement (last modified 22 June 2026), Groq accesses inputs and outputs only to provide the service, follow customer instructions, comply with law, keep the service reliable, or check AUP compliance. It also says: "Groq is not permitted to use Inputs or Outputs for training" unless the customer permits it [G4].
  - **Retention.** Groq's *Your Data* page says: "By default, Groq does not retain customer data for inference requests." It may temporarily log inputs and outputs to troubleshoot reliability problems or investigate suspected abuse. Those logs are kept for up to 30 days and stored in GCP in the US [G2].
  - **Turning logging off.** *Your Data* says all customers can enable Zero Data Retention in Console → Data Controls, which stops even those logs [G2]. The Agreement says "Eligible Customers" can enable it [G4].
  - **Open point: Free-plan ZDR.** Whether the Free plan counts as eligible is **unverified**. Check the Data Controls page after signing up.
  - **Inference endpoints.** Chat completions are "ZDR eligible" [G2].
- **Cloudflare Workers AI**
  - **Retention.** The *Data usage* page (updated 16 Oct 2026) says inputs and outputs of standard inference are not retained once the request is processed. It applies a zero-data-retention commitment, with exceptions only for stateful features the developer turns on, and for legal or safety needs [C4].
  - **Training.** It says: "Cloudflare does not use Customer Content processed by Workers AI to train AI models." [C4]
  - **Logging.** Content is stored if AI Gateway logging or caching is enabled, or if the app writes it to its own logs. The page does not say what the AI Gateway default is [C4].
- **Google Gemini API, free ("Unpaid Services")**
  - **Training and review.** Google uses submitted content and responses "to provide, improve, and develop" its products and ML technologies. Human reviewers may read and annotate API inputs and outputs [GM3].
  - **Explicit warning.** The terms say: "Do not submit sensitive, confidential, or personal information to the Unpaid Services." [GM3]
  - **Retention.** No retention period is stated for the free tier.
  - **Paid tier, for contrast.** On paid services Google does not use prompts to improve products. It logs them for a limited period for abuse detection only. The terms are effective 23 March 2026 [GM3].
  - **Conclusion.** Job-offer messages routinely contain names, phone numbers and bank account numbers. The free Gemini tier is therefore incompatible with the PRD.
- **OpenRouter `:free`**
  - **Policy depends on the upstream provider.** There is an account setting to avoid providers that may train, with separate settings for paid and free models [O2].
  - **OpenRouter itself.** It stores prompts only if you opt in, or for CSAM review [O3].
  - **Open point.** Free endpoints may be served by providers that retain or train on data. Each endpoint would need checking.
- **Vercel AI Gateway**
  - **ZDR routing needs paid credits.** ZDR routing is available only with Pro, Enterprise or purchased credits; "Free credits don't count" [V1].

### Latency (published figures only)

- **Groq** publishes throughput on its model pages: ~500 tokens/s for `gpt-oss-120b` and ~1000 tokens/s for `gpt-oss-20b` [G6][G7].
  - At ~500 tok/s, generating ~300–500 output and reasoning tokens takes about 1 s, before network and queueing time. That is an inference from the throughput figure, not a published latency.
  - Groq publishes no time-to-first-token or end-to-end latency.
- **Cloudflare, Gemini, OpenRouter:** no latency figures are published on the pages checked.
- **Next step:** measure p95 latency against the 6 s budget in the evaluation script.

### Indonesian language quality (documented only)

- **Groq gpt-oss-120b:** Groq claims "strong performance across 81+ languages" and an MMMLU average of 81.3% [G7]. Indonesian is not named.
- **Llama 3.3 (Cloudflare):** Meta's model card lists 8 supported languages, and **Indonesian is not one of them** [M1]. Meta discourages using it in unsupported languages without extra controls.
- **SEA-LION v4 27B (Cloudflare):** Cloudflare describes it as pretrained and instruct-tuned for the Southeast Asia region [C7]. Indonesian is not named on that page, and it is not on Cloudflare's JSON Mode list.
- **Gemini:** no Indonesian-specific claim was found on the pages checked.
- **Bottom line:** no provider documents Indonesian quality for the recommended models. The 60–100 labelled examples are the only real evidence and should decide between `gpt-oss-120b` and `gpt-oss-20b`.

### Capacity estimate (my estimate, not a provider figure)

Assumptions, to be replaced with `usage` numbers from real calls:

| Part of a request | Worst case | Typical |
|---|---|---|
| User message | 3,000 chars ≈ 750–1,000 tokens | ~800 chars ≈ 250 tokens |
| System prompt + schema | ~700 tokens | ~700 tokens |
| JSON output | ~300 tokens | ~300 tokens |
| Reasoning at `reasoning_effort: "low"` | ~300 tokens | ~200 tokens |
| **Total** | **≈ 2,300 tokens** | **≈ 1,450 tokens** |

**Groq Free (per model)**
- **Per minute:** 8K TPM allows about 3 worst-case or 5 typical requests per minute. The 30 RPM cap never binds first.
- **Per day:** 200K TPD allows about 85 worst-case or 135 typical requests per day.
- **Caching helps.** Cached prefix tokens don't count toward rate limits, and caching is automatic for gpt-oss [G8]. A stable system prompt placed first could raise these numbers, but hits are not guaranteed.
- **Evaluation runs.** 100 examples × ~1.5–2.3K tokens = ~150–230K tokens. That is **about one full evaluation pass per model per day**.
  - Limits are per model, so day-to-day prompt work can run on `gpt-oss-20b` while saving the `gpt-oss-120b` budget for the scored evaluation run.
  - `npm run eval` (FR-12) reports "AI only" and "combined" results. Call the AI once per example and reuse that response for both, so a run doesn't spend the daily budget twice. This is safe because the evaluation set is the team's own labelled data, not user text.
  - Do not create extra organizations to multiply quota. The Agreement bars use "in a manner intended to avoid incurring Fees", and Groq lists rate-limit circumvention as abuse [G4][G2].

**Cloudflare Free**
- **Llama 3.3 70B:** worst case ≈ 2,000 × 26,668/1M + 300 × 204,805/1M ≈ 115 Neurons, so ~87 checks per day. Typical (~1,250 in / 250 out) ≈ 85 Neurons, so ~118 checks per day [C1].
- **gpt-oss-120b:** worst case ≈ 2,000 × 31,818/1M + 600 × 68,182/1M ≈ 105 Neurons, so ~95 checks per day [C1].

**What this means for judging**
- Neither free tier will cover a burst of judges. A request that gets a 429, times out after 6 s, or fails schema validation must fall back to rules-only output, which the PRD already requires.
- Optionally, if Groq returns 429, call Cloudflare next within the same 6 s budget. Only do this if time remains.

### Recommendation

**Primary: Groq Free plan, `openai/gpt-oss-120b`, strict `json_schema`.** Run the evaluation on `gpt-oss-20b` as well and pick the better one.

Why:
1. **Privacy terms fit the PRD best among usable free tiers.**
   - No training, per the contract [G4].
   - No default retention of inference data, and a ZDR switch for the abuse logs [G2].
2. **Guaranteed schema adherence, unlike the fallback.** Strict mode uses constrained decoding and is supported on gpt-oss [G3]. Cloudflare's JSON mode is best-effort. Gemini and OpenRouter guarantees were not checked. Validation still runs on our side, as the PRD requires.
3. **Fast published throughput**, which suits the hard 6 s timeout [G6].
4. **Free plan works through 10 Dec 2026.** No payment method is needed by the billing FAQ's wording, and no gpt-oss deprecation is announced [G5][G9].

**Fallback: Cloudflare Workers AI, `@cf/openai/gpt-oss-120b`** (same model, so prompts carry over), or `@cf/meta/llama-3.3-70b-instruct-fp8-fast`.
- `gpt-oss-120b` is **not** on Cloudflare's JSON Mode list. Its model page only shows a `response_format` input, so `json_schema` support on it is **unverified** and must be tested.
- Llama 3.3 70B **is** on the JSON Mode list but does not officially support Indonesian [M1].

Why Cloudflare as the fallback:
1. **Strongest documented privacy:** zero data retention and no training [C4].
2. **Independent daily quota** of 10K Neurons [C1].
3. **OpenAI-compatible endpoint** at `https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/v1/chat/completions`, callable from Vercel with an account API token [C5].
4. **Cost of choosing it:** JSON-schema output is best-effort only and may return a "JSON Mode couldn't be met" error [C3].

Actions before launch:
- **Enable ZDR.** Turn on ZDR in Groq Console → Data Controls. If the Free plan doesn't offer it, note in the privacy statement that Groq may keep abuse logs for up to 30 days in the US [G2].
- **Keep request text out of logs.**
  - Keep the Groq SDK `logLevel` at `'warn'` or `'off'` and never use `'debug'`, which logs request and response bodies [G10].
  - Never log the user text or SDK error objects that might echo it.
- **Keep AI Gateway logging off** if Cloudflare is used through AI Gateway [C4].

### Minimal server-side example (Groq, strict JSON Schema, 6 s timeout)

**This snippet was assembled from the docs and has not been run.** It follows Groq's Structured Outputs docs [G3], the SDK README timeout and retry options [G10], and the `reasoning_effort` and `max_completion_tokens` parameters in Groq's reasoning docs and API reference [G11][G12].

Use it only in a Next.js Route Handler or Server Action, never in client code.

**The schema is a placeholder.** PRD.md says the AI prompt and its details live in the "Spesifikasi MVP" tab, which was not available. Replace it with the real AI output shape (FR-05, FR-06: explanation of at most 3 sentences, plus flags). In strict mode every property must be listed in `required`, so an optional field has to be expressed as a nullable type.

```ts
// lib/ai/groq.ts — server only
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY, // server env var only
  timeout: 6_000,                   // hard 6 s cap (SDK default is 60 s)
  maxRetries: 0,                    // SDK retries timeouts twice by default; disable so 6 s is the real ceiling
  logLevel: "warn",                 // never "debug": it logs request/response bodies
});

// Strict mode: every property listed in `required`, `additionalProperties: false`, no streaming.
const aiResultSchema = {
  type: "object",
  properties: {
    penjelasan: { type: "string" },
    flags: {
      type: "array",
      items: {
        type: "string",
        enum: ["biaya_di_muka", "gaji_tidak_wajar", "kontak_pribadi", "data_sensitif", "urgensi_palsu", "lainnya"],
      },
    },
  },
  required: ["penjelasan", "flags"],
  additionalProperties: false,
} as const;

const SYSTEM_PROMPT = "…"; // keep byte-identical across calls so Groq's prefix cache can hit

export async function explainWithAI(text: string): Promise<unknown | null> {
  try {
    const res = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: text },
      ],
      response_format: {
        type: "json_schema",
        json_schema: { name: "legitly_ai_result", strict: true, schema: aiResultSchema },
      },
      reasoning_effort: "low",
      max_completion_tokens: 800,
    });
    const raw = res.choices[0]?.message?.content;
    return raw ? JSON.parse(raw) : null; // then validate against the app's own JSON schema (PRD requirement)
  } catch {
    // Timeout (APIConnectionTimeoutError), 429 rate limit, 5xx, parse error → rules-only result.
    // Do NOT log `text` or the error object.
    return null;
  }
}
```

---

## Question 2: Official IASC reporting channel

### Finding

| Item | Value | Confirmed on (ojk.go.id or IASC domain) |
|---|---|---|
| Official IASC reporting website | **https://iasc.ojk.go.id/** | OJK / Satgas PASTI notice SP 3/STPASTI/III/2025, dated 28 March 2025: IASC reports can **only** be made through the official IASC website, iasc.ojk.go.id. https://ojk.go.id/id/berita-dan-kegiatan/info-terkini/Pages/Waspada-Penipuan-Website-Mengatasnamakan-Indonesia-Anti-Scam-Centre-IASC.aspx [J1] |
| Same address, launch announcement | `http://iasc.ojk.go.id` (the http form no longer loads; see Domain check) | OJK page on the IASC soft launch (posted 25 Nov 2024): victims report financial-sector fraud through the IASC website, attaching evidence. https://ojk.go.id/id/berita-dan-kegiatan/info-terkini/Pages/Tingkatkan-Pelindungan-Konsumen-Satgas-PASTI-Lakukan-Soft-Launching-IASC.aspx [J2] |
| Report form ("Lapor Sekarang") | https://iasc.ojk.go.id/Guest/LaporanV2. There is also "Cek Laporan" at `/Guest/CekLaporan`. | IASC site home page [J3] |
| Phone | **157**. This is OJK's general consumer contact line, not an IASC-only hotline. | J1 (to verify IASC information), J2, and the IASC site's "Hubungi Kami" section [J3] |
| WhatsApp | **081 157 157 157**. This is OJK's general consumer line, not IASC-specific. | J1 tells the public to check IASC information through Kontak OJK at this number. The same number is in ojk.go.id's site footer. |
| Email | iasc@ojk.go.id (IASC) and konsumen@ojk.go.id (OJK consumer services) | J2 and the IASC privacy policy give iasc@ojk.go.id. J1 and the IASC site footer give konsumen@ojk.go.id [J3]. |

### Domain check

- **It is an OJK subdomain.** `iasc.ojk.go.id` sits under OJK's own `ojk.go.id`, so it is not a separate domain.
- **No off-domain redirect** (2026-11-26):
  - `https://iasc.ojk.go.id/` returned HTTP 200 with no redirect, footer "© 2025 Otoritas Jasa Keuangan".
  - `https://iasc.ojk.go.id/Guest/LaporanV2` returned HTTP 200.
  - The plain `http://` URL quoted in the 2024 OJK article returned HTTP 504 from here. **Link to the `https://` URL.**

### Caveats for Legitly's copy

- **IASC's scope.** IASC handles *financial-transaction* fraud. Its form needs data on one victim account and one reported account, and uploading **proof of a transaction is mandatory** [J3].
  - For a job-scam message where the user has *not yet paid*, IASC may not be the right channel.
  - In that case, suggest Kontak OJK 157 or the platform's own report feature instead.
- **Impersonation warning.** OJK warns about fake websites that impersonate IASC [J1]. Legitly should show the exact domain `iasc.ojk.go.id`.

---

## Open points (not verified from a primary source)

1. **Gemini free limits.** Free-tier RPM, RPD and TPM for Gemini Flash and Flash-Lite models are shown only in the logged-in AI Studio console [GM1].
2. **Groq ZDR on the Free plan.** The docs say "all customers" [G2] while the Agreement says "Eligible Customers" [G4]. Confirm in Console → Data Controls.
3. **Credit card requirements.** Whether a card is needed is not stated outright for Groq, Gemini or Cloudflare. "Not needed" is inferred from billing pages that only ask for payment details when upgrading [G5][GM6][C6].
4. **Regional restrictions.**
   - Groq: no Indonesia-specific restriction was found; only general US export-control language [G4].
   - Cloudflare Workers AI: no restriction found in the pages checked.
   - OpenRouter: availability not checked.
5. **Speed and language quality.** End-to-end latency and Indonesian quality are not published for any recommended model. Both must be measured with the evaluation set.
6. **Token estimates.** The capacity estimate depends on my token-count assumptions for Indonesian text.
7. **Vercel AI Gateway.** Free-tier per-model limits and the list of free-eligible models were not retrieved [V1][V2].
8. **Cloudflare JSON schema on gpt-oss.** Whether `json_schema` works on `@cf/openai/gpt-oss-120b` is unverified; the model is not on the JSON Mode list [C3].
9. **Example code.** The Groq example has not been run.

---

## Sources (all accessed 2026-11-26)

**Groq**
- [G1] Rate limits: https://console.groq.com/docs/rate-limits
- [G2] Your Data in GroqCloud: https://console.groq.com/docs/your-data
- [G3] Structured Outputs: https://console.groq.com/docs/structured-outputs
- [G4] Groq Services Agreement (last modified 22 June 2026), §4.2 (Inputs and Outputs), use restrictions (avoiding Fees, Export Control Laws), §2 (age 18+): https://console.groq.com/docs/legal/services-agreement
- [G5] Billing FAQs: https://console.groq.com/docs/billing-faqs
- [G6] Models: https://console.groq.com/docs/models
- [G7] GPT-OSS 120B model page: https://console.groq.com/docs/model/openai/gpt-oss-120b
- [G8] Prompt Caching: https://console.groq.com/docs/prompt-caching
- [G9] Deprecations: https://console.groq.com/docs/deprecations
- [G10] groq-typescript SDK README (official repo), timeouts, retries, logging: https://github.com/groq/groq-typescript/blob/main/README.md
- [G11] Reasoning (`reasoning_effort` for GPT-OSS): https://console.groq.com/docs/reasoning
- [G12] API reference (`max_completion_tokens`, `reasoning_effort`): https://console.groq.com/docs/api-reference

**Cloudflare**
- [C1] Workers AI pricing: https://developers.cloudflare.com/workers-ai/platform/pricing/
- [C2] Workers AI limits (updated 17 Sep 2026): https://developers.cloudflare.com/workers-ai/platform/limits/
- [C3] JSON Mode (updated 14 Sep 2026): https://developers.cloudflare.com/workers-ai/features/json-mode/
- [C4] Data usage (updated 16 Oct 2026): https://developers.cloudflare.com/workers-ai/platform/data-usage/
- [C5] OpenAI-compatible endpoints: https://developers.cloudflare.com/workers-ai/configuration/open-ai-compatibility/
- [C6] Workers pricing (Free plan default): https://developers.cloudflare.com/workers/platform/pricing/
- [C7] gemma-sea-lion-v4-27b-it model page: https://developers.cloudflare.com/workers-ai/models/gemma-sea-lion-v4-27b-it/
- gpt-oss-120b model page: https://developers.cloudflare.com/workers-ai/models/gpt-oss-120b/
- llama-3.3-70b-instruct-fp8-fast model page: https://developers.cloudflare.com/workers-ai/models/llama-3.3-70b-instruct-fp8-fast/

**Google Gemini API** (ai.google.dev/gemini-api/docs/* now 301-redirects to aistudio.google.com/docs/*)
- [GM1] Rate limits: https://aistudio.google.com/docs/rate-limits
- [GM2] Pricing: https://aistudio.google.com/docs/pricing
- [GM3] Gemini API Additional Terms of Service (effective 23 March 2026), Unpaid and Paid Services: https://aistudio.google.com/docs/terms
- [GM4] Available regions: https://aistudio.google.com/docs/available-regions
- [GM5] Structured outputs: https://aistudio.google.com/docs/structured-output
- [GM6] Billing: https://aistudio.google.com/docs/billing
- [GM7] Deprecations: https://aistudio.google.com/docs/deprecations
- Data logging and sharing: https://aistudio.google.com/docs/logs-policy

**Others**
- [O1] OpenRouter API limits (free-model RPM/RPD): https://openrouter.ai/docs/api-reference/limits
- [O2] OpenRouter provider logging: https://openrouter.ai/docs/features/privacy-and-logging
- [O3] OpenRouter data collection: https://openrouter.ai/docs/guides/privacy/data-collection
- [O4] OpenRouter structured outputs: https://openrouter.ai/docs/guides/features/structured-outputs
- [V1] Vercel AI Gateway pricing: https://vercel.com/docs/ai-gateway/pricing
- [V2] Vercel AI Gateway rate limits: https://vercel.com/docs/ai-gateway/rate-limits
- [MI1] Mistral usage and limits (redirect target of /deployment/laplateforme/tier): https://docs.mistral.ai/admin/billing-usage/usage-limits
- [CE1] Cerebras rate limits and Free Trial FAQ: https://inference-docs.cerebras.ai/support/rate-limits
- [GH1] GitHub Models retirement notice: https://docs.github.com/en/github-models/use-github-models/prototyping-with-ai-models
- [OA1] OpenAI rate limits and usage tiers: https://developers.openai.com/api/docs/guides/rate-limits
- [AN1] Anthropic pricing FAQ: https://platform.claude.com/docs/en/about-claude/pricing
- [AN2] Anthropic rate limits: https://platform.claude.com/docs/en/api/rate-limits
- [M1] Meta Llama 3.3 model card (official repo): https://github.com/meta-llama/llama-models/blob/main/models/llama3_3/MODEL_CARD.md

**IASC / OJK**
- [J1] OJK (Satgas PASTI), "Waspada Penipuan Website Mengatasnamakan Indonesia Anti-Scam Centre (IASC)", 28 March 2025: https://ojk.go.id/id/berita-dan-kegiatan/info-terkini/Pages/Waspada-Penipuan-Website-Mengatasnamakan-Indonesia-Anti-Scam-Centre-IASC.aspx
- [J2] OJK, "Tingkatkan Pelindungan Konsumen Satgas PASTI Lakukan Soft Launching IASC", posted 25 Nov 2024: https://ojk.go.id/id/berita-dan-kegiatan/info-terkini/Pages/Tingkatkan-Pelindungan-Konsumen-Satgas-PASTI-Lakukan-Soft-Launching-IASC.aspx
- [J3] IASC official site (OJK subdomain): https://iasc.ojk.go.id/ (form: https://iasc.ojk.go.id/Guest/LaporanV2)
