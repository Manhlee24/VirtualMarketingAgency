// src/components/ContentGenerationForm.jsx

import React, { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { ToneOptions, FormatOptions } from "../utils/constants.jsx";

// Import các component con
import AnalysisInput from "./AnalysisInput";
import AnalysisResult from "./AnalysisResult";
import ContentForm from "./ContentForm";
import PosterGeneration from "./PosterGeneration";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLocation } from "react-router-dom";

// --- HELPER FUNCTIONS (Có thể giữ lại hoặc chuyển sang utils) ---
const formatContent = (content) => {
  return content.split("\n").map((line, index) => (
    <React.Fragment key={index}>
      {line}
      <br />
    </React.Fragment>
  ));
};

const stringifyError = (err) => {
  if (!err) return "Unknown error";
  if (err.response && err.response.data) {
    const d = err.response.data;
    if (typeof d === "string") return d;
    try { return JSON.stringify(d); } catch { return String(d); }
  }
  if (err.message) return err.message;
  try { return JSON.stringify(err); } catch { return String(err); }
};

// --- MAIN COMPONENT ---
function ContentGenerationForm() {
  // --- STATE MANAGEMENT ---
  const [currentStep, setCurrentStep] = useState(1);
	const [productName, setProductName] = useState("");
	const [analysisMode, setAnalysisMode] = useState("name"); // 'name' | 'document'
	const [documentFile, setDocumentFile] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [selectedUsp, setSelectedUsp] = useState("");
  const [selectedTone, setSelectedTone] = useState(ToneOptions[0].value);
  const [selectedFormat, setSelectedFormat] = useState(FormatOptions[0].value);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [generatedPoster, setGeneratedPoster] = useState(null);
	const [adCopy, setAdCopy] = useState("");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageError, setImageError] = useState(null);
  const [styleShort, setStyleShort] = useState("");
  const [referenceImageFile, setReferenceImageFile] = useState(null);
  const [referenceImagePreview, setReferenceImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [successMessage, setSuccessMessage] = useState(null);
	const [savingAnalysis, setSavingAnalysis] = useState(false);
	const [savingContent, setSavingContent] = useState(false);
		const [savingImage, setSavingImage] = useState(false);
		const [savedAnalysis, setSavedAnalysis] = useState(false);
		const [savedContent, setSavedContent] = useState(false);
		const [savedImage, setSavedImage] = useState(false);

  const BASE_URL = "http://127.0.0.1:8000/api/v1";
	const { token } = useAuth();
	const location = useLocation();

  // --- LOGIC XỬ LÝ API CALLS ---
	// Resume flows from History pages
	useEffect(() => {
		const params = new URLSearchParams(location.search || "");
		const resume = params.get("resume");
		if (!resume) return;
		try {
			if (resume === "analysis") {
				const raw = localStorage.getItem("resumeAnalysis");
				if (!raw) return;
				const r = JSON.parse(raw);
				const preAnalysis = {
					product_name: r.product_name,
					usps: Array.isArray(r.usps) ? r.usps : [],
					pain_points: Array.isArray(r.pain_points) ? r.pain_points : [],
					target_persona: r.target_persona || "",
					infor: r.infor || "",
				};
				setAnalysisData(preAnalysis);
				if (preAnalysis.usps.length > 0) setSelectedUsp(preAnalysis.usps[0]);
				setGeneratedContent(null);
				setGeneratedPoster(null);
				setAdCopy("");
				setStyleShort("");
				setCurrentStep(2);
			} else if (resume === "content") {
				const raw = localStorage.getItem("resumeContent");
				if (!raw) return;
				const r = JSON.parse(raw);
				const preAnalysis = {
					product_name: r.product_name,
					usps: r.selected_usp ? [r.selected_usp] : [],
					pain_points: [],
					target_persona: r.target_persona || "",
					infor: r.infor || "",
				};
				setAnalysisData(preAnalysis);
				if (preAnalysis.usps.length > 0) setSelectedUsp(preAnalysis.usps[0]);
				const preContent = { title: r.title, content: r.content };
				setGeneratedContent(preContent);
				setAdCopy(r.content || "");
				setStyleShort("");
				// Jump to poster creation directly
				setCurrentStep(4);
			}
		} catch (e) {
			console.error("Resume failed:", e);
		} finally {
			try { localStorage.removeItem("resumeAnalysis"); } catch {}
			try { localStorage.removeItem("resumeContent"); } catch {}
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

		const handleAnalysis = async (e) => {
    e.preventDefault();
			if (analysisMode === "name" && !productName) return;
		if (analysisMode === "document" && !documentFile) {
			setError("Vui lòng chọn file PDF hoặc DOCX để phân tích tài liệu.");
			return;
		}
    setLoading(true);
    setAnalysisData(null);
    setError(null);

		try {
			let data;
			if (analysisMode === "name") {
				const response = await axios.post(`${BASE_URL}/analyze_product`, { product_name: productName });
				data = response.data;
					} else {
						const formData = new FormData();
						// In document mode, do NOT send product_name to avoid leaking previous input;
						// backend will infer the product name from the document content.
						formData.append("document", documentFile);
				const response = await axios.post(`${BASE_URL}/analyze_document`, formData, {
					headers: { "Content-Type": "multipart/form-data" },
				});
				data = response.data;
					}
					// Reset content/media states when a new analysis completes
					setGeneratedContent(null);
					setAdCopy("");
					setGeneratedPoster(null);
					setStyleShort("");
					setReferenceImageFile(null);
					setReferenceImagePreview(null);
					setAnalysisData(data);
			setCurrentStep(2);
			if (data.usps && data.usps.length > 0) {
				setSelectedUsp(data.usps[0]);
			}
    } catch (err) {
      console.error("Lỗi khi gọi API phân tích:", err);
      setError("Lỗi: Không thể phân tích sản phẩm. Kiểm tra Server Backend.");
    } finally {
      setLoading(false);
    }
  };

	// Save handlers
	const saveAnalysis = async () => {
		if (!analysisData || !token) return;
		setSavingAnalysis(true);
			try {
			await axios.post(`${BASE_URL}/save_analysis`, analysisData, {
				headers: { Authorization: `Bearer ${token}` },
			});
				setSavedAnalysis(true);
				setSuccessMessage("Đã lưu kết quả phân tích.");
				setTimeout(() => setSuccessMessage(null), 2500);
		} catch (err) {
			console.error("Save analysis failed:", err);
			setError("Lưu kết quả phân tích thất bại.");
			} finally {
			setSavingAnalysis(false);
		}
	};

	const saveContent = async () => {
		if (!generatedContent || !analysisData || !token) return;
		setSavingContent(true);
			try {
			const payload = {
				product_name: analysisData.product_name,
				target_persona: analysisData.target_persona,
				selected_usp: selectedUsp,
				selected_tone: selectedTone,
				selected_format: selectedFormat,
				infor: analysisData.infor,
				title: generatedContent.title,
				content: generatedContent.content,
			};
			await axios.post(`${BASE_URL}/save_content`, payload, {
				headers: { Authorization: `Bearer ${token}` },
			});
				setSavedContent(true);
				setSuccessMessage("Đã lưu nội dung.");
				setTimeout(() => setSuccessMessage(null), 2500);
		} catch (err) {
			console.error("Save content failed:", err);
			setError("Lưu nội dung thất bại.");
		} finally {
			setSavingContent(false);
		}
	};

	const saveImage = async () => {
		if (!generatedPoster || !analysisData || !token) return;
		setSavingImage(true);
			try {
			const payload = {
				product_name: analysisData.product_name,
				ad_copy: adCopy,
				usp: selectedUsp,
				infor: analysisData.infor,
				style_short: styleShort,
				image_url: generatedPoster.image_url,
				prompt_used: generatedPoster.prompt_used,
				reference_url: generatedPoster.reference_url || null,
			};
			await axios.post(`${BASE_URL}/save_image`, payload, {
				headers: { Authorization: `Bearer ${token}` },
			});
				setSavedImage(true);
				setSuccessMessage("Đã lưu poster.");
				setTimeout(() => setSuccessMessage(null), 2500);
		} catch (err) {
			console.error("Save image failed:", err);
			setError("Lưu poster thất bại.");
		} finally {
			setSavingImage(false);
		}
	};

  const handleContentGeneration = async (e) => {
    e.preventDefault();
    if (!selectedUsp || !analysisData) { setError("Thiếu dữ liệu để tạo nội dung."); return; }

    setLoading(true);
    setGeneratedContent(null);
	setGeneratedPoster(null);
    setError(null);
    setImageError(null);

    try {
      const requestData = {
        product_name: analysisData.product_name,
        target_persona: analysisData.target_persona,
        selected_usp: selectedUsp,
        selected_tone: selectedTone,
        selected_format: selectedFormat,
        infor: analysisData.infor,
      };

      const response = await axios.post(`${BASE_URL}/generate_content`, requestData);
			setGeneratedContent(response.data);
			// Prefill ad copy for poster if content was generated
			if (response.data?.content) {
				setAdCopy(response.data.content);
			}
      // Sau khi tạo content thành công, chuyển sang Giai đoạn 3 (hiển thị Form Poster)
      setCurrentStep(3); 
    } catch (err) {
      console.error("Lỗi khi gọi API tạo nội dung:", err);
      setError("Lỗi: Không thể tạo nội dung. Vui lòng kiểm tra Server Python.");
    } finally {
      setLoading(false);
    }
  };


	const handlePosterGeneration = async () => {
		if (isGeneratingImage) return;

    setIsGeneratingImage(true);
    setImageError(null);
    setGeneratedPoster(null);

    try {
			if (!adCopy || adCopy.trim().length < 10) {
				setImageError("Vui lòng nhập Ad Copy (ít nhất 10 ký tự) trước khi tạo Poster.");
				return;
			}
			const formData = new FormData();
			formData.append("product_name", analysisData.product_name);
			formData.append("ad_copy", adCopy);
			formData.append("persona", analysisData.target_persona);
			formData.append("usp", selectedUsp);
			formData.append("infor", analysisData.infor);
			if (styleShort) formData.append("style_short", styleShort);
			if (referenceImageFile) formData.append("reference_image", referenceImageFile);

			const response = await axios.post(`${BASE_URL}/generate_poster`, formData, {
				headers: { "Content-Type": "multipart/form-data" },
			});
			setGeneratedPoster(response.data);
    } catch (err) {
      console.error("Lỗi khi gọi API tạo Poster:", err);
      setImageError(stringifyError(err));
    } finally {
      setIsGeneratingImage(false);
    }
  };
  
  // --- RENDER CHÍNH ---


  const renderContent = () => {
    if (currentStep === 1) {
      return (
				<AnalysisInput 
					productName={productName}
					setProductName={setProductName}
					analysisMode={analysisMode}
					setAnalysisMode={setAnalysisMode}
					documentFile={documentFile}
					setDocumentFile={setDocumentFile}
					handleAnalysis={handleAnalysis}
					loading={loading}
				/>
      );
    } 
    
    if (currentStep === 2 && analysisData) {
      return (
				<AnalysisResult
					analysisData={analysisData}
					goToContent={() => setCurrentStep(3)}
					goToPoster={() => setCurrentStep(4)}
					goBackToInput={() => {
						// Reset all downstream states when returning to step 1
						setGeneratedContent(null);
						setAdCopy("");
						setGeneratedPoster(null);
						setStyleShort("");
						setReferenceImageFile(null);
						setReferenceImagePreview(null);
						setCurrentStep(1);
					}}
								onSaveAnalysis={saveAnalysis}
								saving={savingAnalysis}
								saved={savedAnalysis}
				/>
      );
    } 
    
		if (currentStep === 3 && analysisData) {
			return (
				<ContentForm
					analysisData={analysisData}
					selectedUsp={selectedUsp}
					setSelectedUsp={setSelectedUsp}
					selectedFormat={selectedFormat}
					setSelectedFormat={setSelectedFormat}
					selectedTone={selectedTone}
					setSelectedTone={setSelectedTone}
					handleContentGeneration={handleContentGeneration}
					generatedContent={generatedContent}
					formatContent={formatContent}
					loading={loading}
					goBack={() => { setCurrentStep(2); }}
					goToPoster={() => setCurrentStep(4)}
							onSaveContent={saveContent}
							savingContent={savingContent}
							savedContent={savedContent}
				/>
			);
		}

		if (currentStep === 4 && analysisData) {
			return (
				<PosterGeneration
					analysisData={analysisData}
					adCopy={adCopy}
					setAdCopy={setAdCopy}
					styleShort={styleShort}
					setStyleShort={setStyleShort}
					setReferenceImageFile={setReferenceImageFile}
					referenceImagePreview={referenceImagePreview}
					setReferenceImagePreview={setReferenceImagePreview}
					handlePosterGeneration={handlePosterGeneration}
					generatedPoster={generatedPoster}
					isGeneratingImage={isGeneratingImage}
					imageError={imageError}
					goBack={() => setCurrentStep(2)}
							onSaveImage={saveImage}
							savingImage={savingImage}
							savedImage={savedImage}
				/>
			);
		}

    return null;
  };

  return (
    <div className="max-w-4xl mx-auto my-12 p-10 bg-white shadow-3xl rounded-3xl border border-indigo-100">
      <header className="text-center mb-10">
        <div className="inline-block tracking-widest text-indigo-700 bg-indigo-100 px-4 py-1 rounded-full text-xs font-bold uppercase mb-3">
          VIRTUAL MARKETING AGENCY
        </div>
        <h2 className="text-4xl font-extrabold text-gray-900 leading-tight">
          QUY TRÌNH MARKETING TỰ ĐỘNG VỚI AI
        </h2>
      </header>

			{successMessage && (
				<div className="mb-6 p-4 bg-green-50 text-green-800 rounded-lg border border-green-300 font-medium">
					{successMessage}
				</div>
			)}

			{renderContent()}

      {error && (
        <div className="mt-8 p-4 bg-red-50 text-red-800 rounded-lg border border-red-300 font-medium">
          LỖI: {error}
        </div>
      )}
    </div>
  );
}

export default ContentGenerationForm;