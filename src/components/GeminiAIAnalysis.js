import React, { useState } from "react";
import { useWeather } from "../contexts/WeatherContext";
import { Sparkles, Loader2 } from "lucide-react";

const GeminiAIAnalysis = () => {
  const { weatherData } = useWeather();
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!weatherData) {
      setError("No weather data available. Please search for a place first.");
      return;
    }
    setLoading(true);
    setError("");
    setResult("");
    try {
      // Prepare a summary of the latest weather data for AI analysis
      const weatherSummary = `Analyze the following weather data for insights and recommendations.\nCity: ${weatherData.city}, Country: ${weatherData.country}, Temperature: ${weatherData.current.main.temp}°C, Humidity: ${weatherData.current.main.humidity}%, Weather: ${weatherData.current.weather[0].description}, Wind Speed: ${weatherData.current.wind.speed} m/s.`;
      // Read the Gemini/Google API key from environment variable. In CRA this must be prefixed with REACT_APP_
      const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
      if (!apiKey) {
        setError("Missing Gemini API key. Please set REACT_APP_GEMINI_API_KEY in your .env file.");
        setLoading(false);
        return;
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: weatherSummary }] }],
        }),
      });
      const data = await response.json();
      if (data.promptFeedback && data.promptFeedback.blockReason) {
        setError(`Prompt blocked: ${data.promptFeedback.blockReason}. Please rephrase your input.`);
      } else if (data.candidates && data.candidates.length > 0 && data.candidates[0]?.content?.parts[0]?.text) {
        setResult(data.candidates[0].content.parts[0].text);
      } else {
        setError("No analysis result returned. Please try a different place.");
      }
    } catch (err) {
      setError("Failed to analyze. Please try again.");
    }
    setLoading(false);
  };

  return (
    <section className="py-20 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 animate-fade-in-up">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-center gap-2 animate-bounce">
            <Sparkles className="h-8 w-8 text-purple-600 animate-spin" /> AI Analysis
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">Get instant insights and analysis powered by Gemini AI. Enter your weather data or question below!</p>
        </div>
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 animate-fade-in">
          <button
            className="btn-primary px-8 py-3 text-lg rounded-lg flex items-center gap-2 justify-center w-full animate-pulse"
            onClick={handleAnalyze}
            disabled={loading || !weatherData}
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />} Analyze Latest Search
          </button>
          {result && (
            <div className="mt-8 p-6 bg-purple-50 dark:bg-gray-900 rounded-lg shadow-inner animate-fade-in-up">
              <h3 className="text-2xl font-semibold text-purple-700 dark:text-purple-300 mb-2">AI Analysis Result</h3>
              <div className="text-gray-800 dark:text-gray-100 whitespace-pre-line">{result}</div>
            </div>
          )}
          {error && (
            <div className="mt-4 text-red-600 dark:text-red-400 animate-shake">{error}</div>
          )}
        </div>
      </div>
    </section>
  );
};

export default GeminiAIAnalysis;
