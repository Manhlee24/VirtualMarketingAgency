import os
import base64
import logging
from models.schemas import ImageGenerationResponse
from typing import Optional
from io import BytesIO
from core.ai_clients import get_gemini_client, get_openai_client, OPENAI_API_KEY, GEMINI_API_KEY

# setup basic logger
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)

try:
    from PIL import Image
except Exception:
    Image = None

try:
    import cloudinary
    import cloudinary.uploader
    import time
except Exception as e:
    logger.info("Optional module import failed: %s", e)

gemini_client = get_gemini_client()
openai_client = get_openai_client()


cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"), 
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

# Log availability of keys/clients
logger.info("GEMINI_API_KEY present: %s", bool(GEMINI_API_KEY))
logger.info("gemini_client available: %s", bool(gemini_client))
logger.info("OPENAI_API_KEY present: %s", bool(OPENAI_API_KEY))
logger.info("openai_client available: %s", bool(openai_client))
logger.info("Cloudinary configured: %s", bool(os.getenv("CLOUDINARY_CLOUD_NAME")))

# Known limitations for vision/editing models
IMAGE_LIMITATIONS = [
    "Medical images: Not suitable for interpreting specialized medical images or medical advice.",
    "Non-English: May not perform optimally with non-Latin text (e.g., Japanese, Korean).",
    "Small text: Prefer enlarging text to improve readability; avoid cropping important details.",
    "Rotation: May misinterpret rotated or upside-down text and images.",
    "Visual elements: May struggle with graphs or styles like solid/dashed/dotted lines.",
    "Spatial reasoning: Struggles with precise localization tasks (e.g., chess positions).",
    "Accuracy: May generate incorrect descriptions or captions.",
    "Image shape: Struggles with panoramic and fisheye images.",
    "Metadata and resizing: Ignores original filenames/metadata; images may be resized.",
    "Counting: Provides approximate object counts only.",
    "CAPTCHAS: Submission of CAPTCHAs is blocked for safety reasons.",
]

# Cập nhật model response
 

def _expand_style_with_gemini(style_short: str) -> Optional[str]:
    """
    Gọi Gemini để mở rộng yêu cầu chỉnh sửa/thay đổi ngắn thành prompt chi tiết (cho editing/inpainting).
    """
    if not style_short:
        return None

    instruction = (
        "You are an expert prompt engineer for image editing (inpainting). The user wants to edit an existing image.\n"
        "Expand the short style request below into a detailed, concise prompt (limit 100 words) describing the exact new content and style to be rendered in the edited image.\n"
        "Focus on the desired output's composition, camera angle, lighting, color palette, and textures, relative to the existing image.\n\n"
        f"Short style request/desired change: {style_short}\n\n"
        "Output only the detailed editing prompt, limited to 100 words."
    )

    if not style_short:
        return None

    if not gemini_client:
        logger.info("No gemini_client available; skipping Gemini expansion.")
        return None

    # Try several possible method names and response shapes because different
    # versions of the google-genai package expose different client APIs.
    candidates = [
        "generate_content",
        "generate",
        "generate_text",
        "text_generation",
        "create",
    ]

    last_exc = None
    for method_name in candidates:
        try:
            if hasattr(gemini_client, method_name):
                method = getattr(gemini_client, method_name)
                logger.info("Calling gemini_client.%s(...) for style expansion", method_name)
                resp = method(instruction)

                # Try to extract text from common response shapes
                if resp is None:
                    logger.warning("Gemini method %s returned None", method_name)
                    continue

                # Common attribute: text
                if hasattr(resp, "text"):
                    text = getattr(resp, "text")
                    if text:
                        return text.strip()

                # Some clients return a dict-like or object with 'candidates' or 'output'
                try:
                    # dict-like
                    if isinstance(resp, dict):
                        # e.g. {'candidates': [{'text': '...'}]}
                        if "candidates" in resp and resp["candidates"]:
                            c0 = resp["candidates"][0]
                            if isinstance(c0, dict) and c0.get("text"):
                                return c0.get("text").strip()
                        if "output" in resp and isinstance(resp["output"], str):
                            return resp["output"].strip()

                    # object with attributes
                    if hasattr(resp, "candidates") and getattr(resp, "candidates"):
                        c0 = getattr(resp, "candidates")[0]
                        if hasattr(c0, "text"):
                            return getattr(c0, "text").strip()
                    if hasattr(resp, "output") and isinstance(getattr(resp, "output"), str):
                        return getattr(resp, "output").strip()
                except Exception:
                    # ignore extraction errors and continue trying other methods
                    pass

                # As a last resort, try str(resp) and use it if non-empty and not huge
                try:
                    s = str(resp)
                    if s and len(s) < 2000:
                        # clean up common wrappers
                        return s.strip()
                except Exception:
                    pass

        except AttributeError as ae:
            # method not present or bound method failing
            last_exc = ae
            logger.debug("AttributeError calling gemini.%s: %s", method_name, ae)
        except Exception as e:
            last_exc = e
            logger.warning("gemini_client.%s failed: %s", method_name, e)

    # If we reach here, none of the methods produced usable text. Log diagnostic info.
    try:
        client_type = type(gemini_client)
        client_dir = dir(gemini_client)
        logger.warning("Gemini expansion not available. gemini_client type=%s; attrs=%s", client_type, client_dir)
        if last_exc:
            logger.warning("Last Gemini exception: %s", last_exc)
    except Exception as e:
        logger.warning("Failed to introspect gemini_client: %s", e)

    logger.info("Gemini expansion not available. Skipping style expansion.")
    return None

def generate_marketing_poster(
    product_name: str,
    style_short: Optional[str] = None,
    reference_image_bytes: Optional[bytes] = None,
    size: str = "1024x1024",
    n_images: int = 1
) -> Optional[ImageGenerationResponse]:
    try:
        # Upload ảnh tham khảo lên Cloudinary nếu có
        reference_url = None
        if reference_image_bytes:
            reference_url = upload_to_cloudinary(reference_image_bytes)
            print(f"Đã upload ảnh tham khảo lên Cloudinary: {reference_url}")
        base_prompt = f"""
Create a premium, high-quality product advertising image for {product_name}.

Requirements:
- Modern, minimalist, cinematic lighting.
- Product centered, realistic materials and reflections.
- Do NOT add text overlays in the image itself (UI/text will be added separately).
""".strip()

        detailed_style = None
        if style_short:
            detailed_style = _expand_style_with_gemini(style_short)

        # Chọn prompt chính
        if style_short and detailed_style:
            final_prompt = detailed_style.strip()
            final_prompt = final_prompt + f"\n\nProduct context: {product_name}."
        else:
            final_prompt = base_prompt

        # Thêm reference image URL vào prompt nếu upload thành công
        if reference_url:
            final_prompt += (
                f"\n\nReference image URL: {reference_url}\n"
                "IMPORTANT: Use the EXACT product shown in the reference image as the main subject. "
                "Match the product's shape, proportions, colors, materials and any visible labels or branding. "
                "Do not replace or invent a different product. You may change background, lighting, camera angle and styling to match the requested style."
            )

        # Gọi OpenAI API
        if openai_client:
            try:
                print("Calling OpenAI Images API (gpt-image-1)...")
                allowed_sizes = {"1024x1024", "1024x1536", "1536x1024"}
                if size not in allowed_sizes:
                    size = "1024x1024"

                resp = openai_client.images.generate(
                    model="gpt-image-1",
                    prompt=final_prompt,
                    size=size,
                    n=n_images,
                )
                if resp and getattr(resp, "data", None) and len(resp.data) > 0:
                    result_data = resp.data[0]
                    url = getattr(result_data, "url", None)
                    if url:
                        return ImageGenerationResponse(
                            image_url=url, 
                            prompt_used=final_prompt,
                            reference_url=reference_url
                        )

                    # Nếu engine trả base64 (b64_json / b64) -> decode và upload lên Cloudinary
                    b64 = getattr(result_data, "b64_json", None) or getattr(result_data, "b64", None)
                    if b64:
                        try:
                            img_bytes = base64.b64decode(b64)
                            uploaded_url = upload_to_cloudinary(img_bytes, public_id_prefix="generated_poster")
                            if uploaded_url:
                                return ImageGenerationResponse(
                                    image_url=uploaded_url,
                                    prompt_used=final_prompt,
                                    reference_url=reference_url
                                )
                            # nếu upload thất bại -> fallback trả data URL
                            data_url = f"data:image/png;base64,{b64}"
                            return ImageGenerationResponse(
                                image_url=data_url,
                                prompt_used=final_prompt,
                                reference_url=reference_url
                            )
                        except Exception as e:
                            print(f"Warning: failed to upload generated image to Cloudinary: {e}")
                            data_url = f"data:image/png;base64,{b64}"
                            return ImageGenerationResponse(
                                image_url=data_url,
                                prompt_used=final_prompt,
                                reference_url=reference_url
                            )

                raise Exception("Image API returned no usable image data.")
            except Exception as e:
                print(f"OpenAI Images error: {e}")

        # Fallback to mock
        placeholder = "https://via.placeholder.com/1024x1024.png?text=Generated+Poster+Mock"
        return ImageGenerationResponse(
            image_url=placeholder, 
            prompt_used=final_prompt,
            reference_url=reference_url 
        )
    except Exception as e:
        err = str(e)
        print(f"Error in generate_marketing_poster: {err}")
        placeholder = "https://via.placeholder.com/1024x1024.png?text=ERROR"
        return ImageGenerationResponse(
            image_url=placeholder, 
            prompt_used=f"ERROR: {err}",
            reference_url=None
        )

# Thêm hàm upload Cloudinary

def upload_to_cloudinary(image_bytes: bytes, public_id_prefix: str = "ref") -> Optional[str]:
    """Upload ảnh lên Cloudinary và trả về public URL."""
    try:
        with BytesIO(image_bytes) as img_buffer:
            response = cloudinary.uploader.upload(
                img_buffer,
                folder="marketing_agency/references", 
                public_id=f"{public_id_prefix}_{int(time.time())}", 
                resource_type="auto"
            )
            url = response.get('secure_url')
            logger.info("Uploaded to Cloudinary: %s", url)
            return url
    except Exception as e:
        logger.warning("Cloudinary upload failed: %s", e)
        return None

def generate_marketing_poster(
    product_name: str,
    style_short: Optional[str] = None,
    # Thêm ảnh gốc và tùy chọn mask
    original_image_bytes: Optional[bytes] = None,
    original_image_path: Optional[str] = None,
    mask_image_bytes: Optional[bytes] = None, 
    size: str = "1024x1024",
    n_images: int = 1
) -> Optional[ImageGenerationResponse]:
    try:
        # Kiểm tra ảnh gốc (bắt buộc cho Edit)
        if not original_image_bytes:
            # Enforce requirement: editing requires a reference/original image
            raise Exception("Reference image is required for editing.")

        # Xử lý detailed style (prompt mô tả thay đổi)
        detailed_style = _expand_style_with_gemini(style_short or "")

        # Chọn prompt chính
        if detailed_style:
            final_prompt = detailed_style.strip()
        elif style_short:
            final_prompt = style_short.strip()
        else:
            final_prompt = f"Edit the image to better showcase the product: {product_name}."

        # Thêm thông tin context vào prompt cuối cùng
        final_prompt = f"{final_prompt}. Product context: {product_name}."

        # Add safety and known limitations hints to avoid violating edit constraints
        limitations = (
            "\n\nSafety and Limits:\n"
            "- Do not interpret or generate medical diagnostic content.\n"
            "- Avoid reading or relying on non-Latin text in the image.\n"
            "- Prefer enlarging small text but do not crop important details.\n"
            "- Assume rotated/upside-down text may be misread; do not rely on it.\n"
            "- Avoid generating charts/graphs deciphering color-coded styles.\n"
            "- Do not perform precise spatial reasoning (e.g., chess positions).\n"
            "- Descriptions may be inaccurate; avoid hallucinated captions.\n"
            "- Do not expect panoramic/fisheye geometric accuracy.\n"
            "- Original filenames/metadata are ignored; resizing may occur.\n"
            "- Do not count objects precisely; avoid approximate counting tasks.\n"
            "- Do NOT attempt to solve CAPTCHA-like images.\n"
            "- Do NOT add text overlays to the image."
        )
        final_prompt += limitations

        # Gọi OpenAI Images Edit API
        if openai_client:
            try:
                edit_model = "gpt-image-1"
                logger.info("Calling OpenAI Images Edit API (%s)...", edit_model)

                allowed_sizes = {"256x256", "512x512", "1024x1024"}
                if size not in allowed_sizes:
                    size = "1024x1024"

                # Prepare image input: prefer path if provided (saved on disk), else use bytes
                opened_file = None
                try:
                    if original_image_path:
                        opened_file = open(original_image_path, "rb")
                        image_input = opened_file
                        logger.info("Using saved image path for OpenAI request: %s", original_image_path)
                    else:
                        image_input = BytesIO(original_image_bytes)

                    mask_file = BytesIO(mask_image_bytes) if mask_image_bytes else None

                    resp = openai_client.images.edit(
                        model=edit_model,
                        image=image_input,
                        prompt=final_prompt,
                        size=size,
                        n=n_images,
                        quality="medium",
                    )

                    if resp and getattr(resp, "data", None) and len(resp.data) > 0:
                        result_data = resp.data[0]
                        b64 = getattr(result_data, "b64_json", None)
                        if b64:
                            img_bytes = base64.b64decode(b64)
                            uploaded_url = upload_to_cloudinary(img_bytes, public_id_prefix="edited_poster")
                            if uploaded_url:
                                return ImageGenerationResponse(
                                    image_url=uploaded_url,
                                    prompt_used=final_prompt,
                                    reference_url=None,
                                )
                            data_url = f"data:image/png;base64,{b64}"
                            return ImageGenerationResponse(
                                image_url=data_url,
                                prompt_used=final_prompt,
                                reference_url=None,
                            )

                    raise Exception("Image API returned no usable image data.")
                finally:
                    if opened_file:
                        opened_file.close()
            except Exception as e:
                logger.error("OpenAI Images Edit error: %s", e)
                
        # Fallback to mock (khi API client không khả dụng hoặc lỗi)
        placeholder = "https://via.placeholder.com/1024x1024.png?text=EDIT+FAIL+MOCK"
        return ImageGenerationResponse(
            image_url=placeholder, 
            prompt_used=final_prompt,
            reference_url=None
        )
        
    except Exception as e:
        err = str(e)
        logger.error("Error in generate_marketing_poster: %s", err)
        placeholder = "https://via.placeholder.com/1024x1024.png?text=CRITICAL+ERROR"
        return ImageGenerationResponse(
            image_url=placeholder, 
            prompt_used=f"CRITICAL ERROR: {err}",
            reference_url=None
        )