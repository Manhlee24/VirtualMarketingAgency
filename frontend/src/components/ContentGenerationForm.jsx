// src/components/ContentGenerationForm.jsx

import React, { useState, useCallback } from "react";
import axios from "axios";
import { ToneOptions, FormatOptions } from "../utils/constants.jsx";

// Import các component con
import Phase1Input from "./Phase1Input";
import Phase1Result from "./Phase1Result";
import ContentForm from "./ContentForm";
import PosterGeneration from "./PosterGeneration";

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

  const BASE_URL = "http://127.0.0.1:8000/api/v1";

  // --- LOGIC XỬ LÝ API CALLS ---

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
				<Phase1Input 
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
				<Phase1Result
					analysisData={analysisData}
					goToStep3={() => setCurrentStep(3)}
					goToPoster={() => setCurrentStep(4)}
					goToStep1={() => {
						// Reset all downstream states when returning to step 1
						setGeneratedContent(null);
						setAdCopy("");
						setGeneratedPoster(null);
						setStyleShort("");
						setReferenceImageFile(null);
						setReferenceImagePreview(null);
						setCurrentStep(1);
					}}
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