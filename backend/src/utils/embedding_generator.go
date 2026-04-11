package utils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"stellart/backend/src/dto"
)

func GenerateTextEmbedding(text string, apiKey string) ([]float32, error) {
	if apiKey == "" {
		return nil, fmt.Errorf("COHERE_API_KEY is not provided")
	}

	reqBody := dto.CohereRequest{
		Model:           "embed-english-v3.0",
		Texts:           []string{text},
		InputType:       "search_document",
		EmbeddingTypes:  []string{"float"},
		OutputDimension: 1024,
	}

	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return nil, fmt.Errorf("error serializing: %w", err)
	}

	req, err := http.NewRequest("POST", "https://api.cohere.com/v2/embed", bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("error creating request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Cohere-Version", "2022-12-06")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("cohere error: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("cohere API error (status %d): %s", resp.StatusCode, string(bodyBytes))
	}

	var cohereResp dto.CohereResponse
	if err := json.NewDecoder(resp.Body).Decode(&cohereResp); err != nil {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("error decoding response: %w, body: %s", err, string(bodyBytes))
	}

	if len(cohereResp.Embeddings.Float) == 0 || len(cohereResp.Embeddings.Float[0]) == 0 {
		return nil, fmt.Errorf("empty embedding returned from Cohere")
	}

	floatSlice := cohereResp.Embeddings.Float[0]
	result := make([]float32, len(floatSlice))
	for i, f := range floatSlice {
		result[i] = float32(f)
	}

	return result, nil
}
