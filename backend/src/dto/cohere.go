package dto

type CohereRequest struct {
	Model           string   `json:"model"`
	Texts           []string `json:"texts"`
	InputType       string   `json:"input_type"`
	EmbeddingTypes  []string `json:"embedding_types"`
	OutputDimension int      `json:"output_dimension,omitempty"`
}

type CohereEmbedding struct {
	Float []float32 `json:"float"`
}

type CohereResponse struct {
	Embeddings CohereEmbeddings `json:"embeddings"`
}

type CohereEmbeddings struct {
	Float [][]float64 `json:"float"`
}
