package utils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
)

type OllamaEmbeddingRequest struct {
	Model  string `json:"model"`
	Prompt string `json:"prompt"`
}

type OllamaEmbeddingResponse struct {
	Embedding []float32 `json:"embedding"`
}

func GenerateTextEmbedding(text string) ([]float32, error) {
	reqBody := OllamaEmbeddingRequest{
		Model:  "mxbai-embed-large",
		Prompt: text,
	}

	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return nil, fmt.Errorf("error serializando: %w", err)
	}

	resp, err := http.Post("http://localhost:11434/api/embeddings", "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("ollama error: %w", err)
	}
	defer resp.Body.Close()

	var ollamaResp OllamaEmbeddingResponse
	if err := json.NewDecoder(resp.Body).Decode(&ollamaResp); err != nil {
		return nil, err
	}

	return ollamaResp.Embedding, nil
}
