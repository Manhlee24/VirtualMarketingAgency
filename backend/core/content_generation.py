import json
import re
import logging
from models.schemas import (
    ContentGenerationRequest,
    GeneratedContentResponse,
    Format,
    AdCopyStyle,
    CTAIntent,
    CopyIntensity,
)
from core.ai_clients import get_gemini_client, GEMINI_API_KEY


def _parse_required_keywords(request: ContentGenerationRequest) -> list:
    rk = getattr(request, "required_keywords", None)
    if not rk:
        return []
    parts = re.split(r"[,\n]", str(rk))
    cleaned = []
    seen = set()
    for p in parts:
        s = p.strip()
        if not s:
            continue
        key = s.lower()
        if key in seen:
            continue
        seen.add(key)
        cleaned.append(s)
    return cleaned

# ===================== FORMAT-SPECIFIC RULES =====================
FORMAT_RULES = {
    Format.FACEBOOK_POST: (
        "If format is Facebook Post: Start with a strong 1–2 sentence HOOK. "
        "Use emotional, relatable storytelling (Vietnamese social style). Use natural emojis where they enhance feeling (not every sentence). "
        "Paragraphs must be short (1–2 sentences each) for mobile readability. CTA should be soft or moderate and feel native to Facebook. "
        "Avoid sounding like a hard advertisement unless Persona clearly has buying intent. Maintain conversational flow seen in VN Facebook posts."
    ),
    Format.ADx_COPY: (
        "If format is Ad Copy: Be concise, sharp, high-impact. Automatically use the most fitting performance copy framework (AIDA, PAS, or FAB). "
        "Focus on ONE key insight or benefit. Use short, punchy sentences. Strong clear CTA at the end. "
        "Avoid long storytelling, avoid long paragraphs. Avoid excessive emojis unless tone explicitly requires them. Style must match Meta/Google ad style in Vietnamese."
    ),
    Format.VIDEO_SCRIPT: (
        "If format is Video Script (≤60s): Use a hook, quick scene/voice-over structure. Keep language vivid and action oriented. "
        "Indicate simple scene breaks with [Scene X] or [VO]. Finish with a memorable CTA supportive of tone."
    ),
}

# ===================== FRAMEWORK HINTS =====================
FRAMEWORK_HINTS = {
    Format.FACEBOOK_POST: (
        "For Facebook Post, optionally structure using one of: Before–After–Bridge, PAS Storytelling, or Relatable Journey."
    ),
    Format.ADx_COPY: (
        "For Ad Copy, choose best-performing structure (AIDA, PAS, or FAB) based on Persona & USP automatically."
    ),
    Format.VIDEO_SCRIPT: (
        "For Video Script, you may apply Hook → Problem → Micro-Solution → CTA or AIDA adapted to spoken format."
    ),
}
# NOTE: Angle selection logic removed per user request. We'll instead provide hashtag suggestions
# for Facebook posts to help distribution and discoverability.


# Hashtag generation removed per user request (Facebook hashtag suggestions were low-quality).


# ========== AD COPY TYPE RULES & CTA TEMPLATES ==========
AD_COPY_TYPE_RULES = {
    AdCopyStyle.HUMAN_INTEREST: (
        "Include a short emotional micro-story (1-2 sentences) that creates empathy. Use vivid sensory details and a relatable situation."
    ),
    AdCopyStyle.REASON_WHY: (
        "Provide 2–4 clear reasons why this product works. Use factual benefits and logical structure; avoid long narratives."
    ),
    AdCopyStyle.SOCIAL_PROOF: (
        "Start with credibility (testimonials, number of customers, rating). Use concise proof points and a trust-building CTA."
    ),
    AdCopyStyle.SAVINGS: (
        "Lead with the savings/discount. Emphasize the monetary benefit and urgency where appropriate."
    ),
    AdCopyStyle.US_VS_THEM: (
        "Contrast product vs competitors in short comparison bullets. Highlight unique advantages and prevent objections."
    ),
}

CTA_TEMPLATES = {
    CTAIntent.SALES: "Mua ngay tại {url} — ưu đãi giới hạn!",
    CTAIntent.LEAD: "Đăng ký nhận tư vấn miễn phí: {url}",
    CTAIntent.ENGAGEMENT: "Thả tim hoặc bình luận \"Tôi quan tâm\" để biết thêm!",
    CTAIntent.APP_INSTALL: "Tải app ngay: {url}",
    CTAIntent.AWARENESS: "Tìm hiểu thêm tại {url}",
}

def _get_selected_usps_list(request: ContentGenerationRequest) -> list[str]:
    usps_list = []
    try:
        if getattr(request, "selected_usps", None):
            # ensure strings and strip empties
            for u in request.selected_usps:
                s = (u or "").strip()
                if s:
                    usps_list.append(s)
        elif getattr(request, "selected_usp", None):
            # fallback: split by common separators to allow multi via single field
            raw = str(request.selected_usp)
            parts = re.split(r"[\n,;|]", raw)
            for p in parts:
                s = p.strip()
                if s:
                    usps_list.append(s)
    except Exception:
        pass
    # de-duplicate preserving order
    seen = set()
    uniq = []
    for u in usps_list:
        key = u.lower()
        if key in seen:
            continue
        seen.add(key)
        uniq.append(u)
    return uniq


def generate_marketing_content(request: ContentGenerationRequest) -> GeneratedContentResponse | None:
    """Sinh nội dung Marketing với Prompt đa tầng + cải tiến theo format, framework, angle, localization & self-review."""

    format_rules = FORMAT_RULES.get(request.selected_format, "")
    framework_hint = FRAMEWORK_HINTS.get(request.selected_format, "")

    # =============== PROMPT LAYER 1: ENGINE LOGIC ===============
    # Language preferences and SEO flags
    lang = (getattr(request, "language", None) or "vi").strip().lower()
    lang_label = "Vietnamese" if lang in ("vi", "vi-vn", "vietnamese", "tiếng việt", "tieng viet") else lang
    required_keywords = _parse_required_keywords(request)
    seo_flag = bool(getattr(request, "seo_enabled", False))

    engine_layer = f"""
SYSTEM ROLE: You are an elite marketing copywriter who writes natively for the target language audience.

OBJECTIVE: Produce HIGH-QUALITY marketing content strictly following the requested Format & Tone while reflecting Persona and chosen USP.

FORMAT GUIDELINES:
{format_rules}

FRAMEWORK GUIDANCE:
{framework_hint}

LANGUAGE:
Write only in {lang_label}. Ensure all output (title and content) is in this language.

HASHTAGS (Facebook only):
For Facebook Post format, also suggest 3–6 relevant hashtags based on Product, Persona, USP and Key Highlights in the selected language. Do not include hashtags for other formats.

LOCALIZATION:
Make wording natural for the selected language: friendly, concise, real-life phrasing. Avoid overly formal or machine-like translation artifacts.

SEO MODE:
If SEO is enabled, include the required keywords exactly (no spelling changes) where natural. Prefer placing at least one keyword in the title and the first 100 words. Avoid keyword stuffing; keep density reasonable. Use short paragraphs and clear structure.

SELF-REVIEW BEFORE OUTPUT:
Before returning final JSON, internally check:
- Title has a clear hook and respects any provided custom title.
- Format rules are followed (paragraph length, structure, CTA style).
- Tone matches requested tone description.
- Keywords (if provided) are included naturally when SEO mode is enabled.
- CTA fits the platform & format.
Refine once if any item is weak, then output only final JSON.

OUTPUT CONSTRAINTS:
Return ONLY a single valid JSON object (no surrounding text, no markdown fences). Keys required: "title", "content".
Title MUST include a clear hook.
DEFAULT LENGTH TARGETS (when user does NOT provide desired_length):
- Facebook Post: ~300 words (dễ đọc, vẫn giữ đoạn ngắn 1–3 câu).
- Ad Copy: ~200 words (theo yêu cầu; vẫn bảo đảm súc tích trong từng đoạn).
- Video Script: ~150 words (tương đương ~55–65 giây đọc thoại tự nhiên).
If user supplies desired_length, honor it (±15%) instead of defaults.
"""

    # =============== PROMPT LAYER 2: USER DATA ===============
    # Optional user-provided constraints
    category = getattr(request, "category", None) or ""
    desired_len = getattr(request, "desired_length", None)
    custom_title = (getattr(request, "custom_title", None) or "").strip()
    key_points = getattr(request, "key_points", None) or ""
    keywords_str = ", ".join(required_keywords) if required_keywords else ""

    selected_usps = _get_selected_usps_list(request)
    usps_text = "; ".join(selected_usps) if selected_usps else ""

    user_layer = f"""
USER DATA:
Product: {request.product_name}
Persona: {request.target_persona}
Chosen USPs: {usps_text}
Key Highlights: {request.infor}
Tone: {request.selected_tone.value}
Format: {request.selected_format.value}
Category: {category}
Desired Length (words): {desired_len}
Custom Title (if any): {custom_title}
Key Points / Requirements: {key_points}
Required Keywords: {keywords_str}
SEO Enabled: {seo_flag}
"""

    prompt = engine_layer + "\n" + user_layer

    try:
        client = get_gemini_client()
        if not client or not GEMINI_API_KEY:
            return None

        response = None
        if hasattr(client, "models") and hasattr(client.models, "generate_content"):
            response = client.models.generate_content(model="gemini-2.5-flash", contents=prompt)
        elif hasattr(client, "generate_content"):
            response = client.generate_content(prompt)
        if not response or not getattr(response, "text", None):
            return None

        raw_text = response.text.strip()
        # Remove markdown fences if present
        cleaned = raw_text.replace("```json", "").replace("```", "").strip()

        # Attempt direct JSON parse with robust fallbacks
        def _balanced_json_fragment(text: str):
            start = text.find('{')
            if start == -1:
                return None
            depth = 0
            in_string = False
            escape = False
            for i in range(start, len(text)):
                ch = text[i]
                if in_string:
                    if escape:
                        escape = False
                    elif ch == '\\':
                        escape = True
                    elif ch == '"':
                        in_string = False
                else:
                    if ch == '"':
                        in_string = True
                    elif ch == '{':
                        depth += 1
                    elif ch == '}':
                        depth -= 1
                        if depth == 0:
                            return text[start:i+1]
            return None

        def _extract_title_content(text: str):
            # Non-strict extraction if JSON malformed
            title_match = re.search(r'"title"\s*:\s*"([^"]*)"', text)
            content_match = re.search(r'"content"\s*:\s*"([\s\S]*?)"\s*(?:\n|$|,"|"content"|\})', text)
            title_val = title_match.group(1) if title_match else "Không có tiêu đề"
            content_val = content_match.group(1) if content_match else "Không có nội dung được tạo."
            # Unescape common escaped characters
            return {
                "title": title_val.replace('\\n', '\n').replace('\\"', '"'),
                "content": content_val.replace('\\n', '\n').replace('\\"', '"')
            }

        data = None
        try:
            data = json.loads(cleaned)
        except json.JSONDecodeError as e1:
            frag = _balanced_json_fragment(cleaned)
            if frag:
                try:
                    data = json.loads(frag)
                except json.JSONDecodeError as e2:
                    logging.warning(f"JSON fragment parse failed (balanced scan). e1={e1} e2={e2}. Using regex key extraction.")
                    data = _extract_title_content(cleaned)
            else:
                logging.warning(f"No balanced JSON fragment found. e1={e1}. Using regex key extraction.")
                data = _extract_title_content(cleaned)

        title = data.get("title", "Không có tiêu đề")
        content = data.get("content", "Không có nội dung được tạo.")

        # Favor custom title when provided
        if custom_title:
            title = custom_title

        # =========== LENGTH ENFORCEMENT (words) ===========
        def count_words(text: str) -> int:
            return len(re.findall(r"\w+", text, flags=re.UNICODE))

        def truncate_to_max_words(text: str, max_words: int) -> str:
            # Try to preserve sentence boundaries when truncating
            sentences = re.split(r'(?<=[.!?])\s+', text.strip())
            out = []
            total = 0
            for s in sentences:
                w = count_words(s)
                if total + w <= max_words:
                    out.append(s)
                    total += w
                else:
                    # partial sentence: take remaining words
                    remain = max_words - total
                    if remain <= 0:
                        break
                    parts = re.findall(r"\S+", s)
                    out.append(" ".join(parts[:remain]))
                    total = max_words
                    break
            return " ".join(out).strip()

        def expand_content_once(original: str, target_min: int) -> str:
            # Ask model once to expand the given content to reach the target_min words
            refine_prompt = engine_layer + "\n" + (
                "EXPANSION REQUEST: Please expand the CONTENT below to be at least "
                f"{target_min} words while preserving the same Tone and Format. "
                "Return ONLY the expanded content (no JSON, no explanation).\n\n"
            ) + f"EXISTING CONTENT:\n{original}\n"
            try:
                if hasattr(client, "models") and hasattr(client.models, "generate_content"):
                    r = client.models.generate_content(model="gemini-2.5-flash", contents=refine_prompt)
                elif hasattr(client, "generate_content"):
                    r = client.generate_content(refine_prompt)
                else:
                    return original
                if not r or not getattr(r, "text", None):
                    return original
                text = r.text.strip()
                # remove fences
                text = text.replace("```", "").strip()
                # if model returned JSON accidentally, extract plain text
                m = re.search(r"\{[\s\S]*\}", text)
                if m:
                    # prefer non-json content if there's any
                    before = text[:m.start()].strip()
                    if before:
                        text = before
                    else:
                        # fallback: extract a plausible content field
                        try:
                            js = json.loads(m.group(0))
                            return js.get("content", original)
                        except Exception:
                            pass
                return text
            except Exception:
                return original

        # New default length windows (min,max) used only if user did not specify desired_length.
        WORD_LIMITS = {
            Format.FACEBOOK_POST: (260, 340),  # ~300 words target
            Format.ADx_COPY: (170, 230),       # ~200 words target
            Format.VIDEO_SCRIPT: (120, 180),   # ~150 words target (~55–65s)
        }
        # Override by desired length if provided (±15%)
        if isinstance(desired_len, int) and desired_len > 0:
            min_w = max(10, int(desired_len * 0.85))
            max_w = int(desired_len * 1.15)
        else:
            min_w, max_w = WORD_LIMITS.get(request.selected_format, (20, 220))
        words = count_words(content)

        # If too long -> truncate
        if words > max_w:
            content = truncate_to_max_words(content, max_w)

        # If too short -> attempt one expansion call to the model
        elif words < min_w:
            expanded = expand_content_once(content, min_w)
            if count_words(expanded) >= min_w:
                content = expanded

        # Post-process: ensure hook in title (very simple heuristic)
        if request.selected_format == Format.FACEBOOK_POST and not re.search(r"!|\?|\b(đột phá|bí mật|mẹo|cảnh báo)\b", title, re.I):
            title = "🔥 " + title

        # ========== AD/CALL-TO-ACTION DETECTION & PROMPT ENHANCEMENTS ==========
        ad_style = choose_ad_copy_style(request)
        cta_intent = choose_cta_intent(request)
        copy_intensity = choose_copy_intensity(request)

        # If ad_style exists, append a short guideline to the prompt_used for traceability
        if ad_style:
            prompt += f"\nAD_STYLE_USED: {ad_style.value}"
        if cta_intent:
            prompt += f"\nCTA_INTENT: {cta_intent.value}"
        if copy_intensity:
            prompt += f"\nCOPY_INTENSITY: {copy_intensity.value}"

        # Facebook hashtag generation intentionally removed.

        return GeneratedContentResponse(
            title=title,
            content=content,
            prompt_used=prompt,
        )
    except Exception as e:
        print(f"Lỗi API Gemini hoặc lỗi phân tích JSON (nâng cấp) ở Giai đoạn 2: {e}")
        return None


def choose_ad_copy_style(request) -> AdCopyStyle | None:
    """Auto-detect an ad copy style when user didn't provide one.

    Simple heuristic: if the USP mentions price or discount -> SAVINGS; if persona mentions emotion -> HUMAN_INTEREST; else None.
    """
    if getattr(request, "ad_copy_style", None):
        return request.ad_copy_style
    usps_text = " ".join(_get_selected_usps_list(request))
    text = f"{request.target_persona} {usps_text} {request.infor}".lower()
    if any(k in text for k in ("giảm", "giảm giá", "khuyến mãi", "freeship", "ưu đãi", "giá")):
        return AdCopyStyle.SAVINGS
    if any(k in text for k in ("yêu", "lo lắng", "quan tâm", "muốn", "cần")):
        return AdCopyStyle.HUMAN_INTEREST
    # fallback: let model choose (None)
    return None


def choose_cta_intent(request) -> CTAIntent | None:
    if getattr(request, "cta_intent", None):
        return request.cta_intent
    # Heuristic: if copy includes booking/purchase cues -> SALES; if asks for contact -> LEAD
    usps_text = " ".join(_get_selected_usps_list(request))
    text = f"{usps_text} {request.infor} {request.target_persona}".lower()
    if any(k in text for k in ("mua ngay", "mua", "đặt", "giảm")):
        return CTAIntent.SALES
    if any(k in text for k in ("tư vấn", "liên hệ", "đăng ký")):
        return CTAIntent.LEAD
    return CTAIntent.AWARENESS


def choose_copy_intensity(request) -> CopyIntensity:
    if getattr(request, "copy_intensity", None):
        return request.copy_intensity
    # Heuristic: sales-oriented intents prefer harder intensity
    cta = choose_cta_intent(request)
    if cta == CTAIntent.SALES:
        return CopyIntensity.HARD
    if cta == CTAIntent.LEAD:
        return CopyIntensity.NEUTRAL
    return CopyIntensity.SOFT
