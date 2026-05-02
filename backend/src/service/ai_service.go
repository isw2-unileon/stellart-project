package service

import (
	"errors"
	"fmt"
	"image"
	_ "image/jpeg"
	_ "image/png"
	"log"
	"net/http"
	"path/filepath"

	"github.com/yalue/onnxruntime_go"
)

type AIDetectionService struct {
	modelPath string
}

func NewAIDetectionService() *AIDetectionService {
	// Forzamos a Windows a coger nuestra DLL local calculando su ruta absoluta
	dllPath, _ := filepath.Abs("./onnxruntime.dll")
	onnxruntime_go.SetSharedLibraryPath(dllPath)

	err := onnxruntime_go.InitializeEnvironment()
	if err != nil {
		log.Fatalf("Failed to initialize ONNX runtime: %v", err)
	}

	return &AIDetectionService{
		modelPath: "ai_detector.onnx",
	}
}

func (s *AIDetectionService) IsAIGenerated(imageURL string) (bool, error) {
	log.Printf("[AI Service] Analyzing real image from: %s\n", imageURL)

	resp, err := http.Get(imageURL)
	if err != nil {
		return false, fmt.Errorf("failed to download image: %v", err)
	}
	defer resp.Body.Close()

	img, _, err := image.Decode(resp.Body)
	if err != nil {
		return false, fmt.Errorf("failed to decode image: %v", err)
	}

	inputTensor, err := preprocessImage(img)
	if err != nil {
		return false, fmt.Errorf("failed to preprocess image: %v", err)
	}
	defer inputTensor.Destroy()

	outputTensor, err := onnxruntime_go.NewEmptyTensor[float32](onnxruntime_go.NewShape(1, 2))
	if err != nil {
		return false, fmt.Errorf("failed to create output tensor: %v", err)
	}
	defer outputTensor.Destroy()

	session, err := onnxruntime_go.NewAdvancedSession(
		s.modelPath,
		[]string{"input"},
		[]string{"output"},
		[]onnxruntime_go.Value{inputTensor},
		[]onnxruntime_go.Value{outputTensor},
		nil,
	)
	if err != nil {
		return false, fmt.Errorf("failed to create ONNX session: %v", err)
	}
	defer session.Destroy()

	err = session.Run()
	if err != nil {
		return false, fmt.Errorf("ONNX inference failed: %v", err)
	}

	outputData := outputTensor.GetData()
	if len(outputData) != 2 {
		return false, errors.New("unexpected output shape")
	}

	isAI := outputData[0] > outputData[1]

	if isAI {
		log.Println("[AI Service] ALERT! AI-generated image detected by Neural Network.")
	} else {
		log.Println("[AI Service] Image validated as human by Neural Network.")
	}

	return isAI, nil
}

func preprocessImage(img image.Image) (*onnxruntime_go.Tensor[float32], error) {
	const targetSize = 224
	tensorShape := onnxruntime_go.NewShape(1, 3, targetSize, targetSize)
	tensor, err := onnxruntime_go.NewEmptyTensor[float32](tensorShape)
	if err != nil {
		return nil, err
	}

	data := tensor.GetData()
	bounds := img.Bounds()

	scaleX := float64(bounds.Dx()) / float64(targetSize)
	scaleY := float64(bounds.Dy()) / float64(targetSize)

	mean := []float32{0.485, 0.456, 0.406}
	std := []float32{0.229, 0.224, 0.225}

	channelSize := targetSize * targetSize

	for y := 0; y < targetSize; y++ {
		for x := 0; x < targetSize; x++ {
			srcX := int(float64(x)*scaleX) + bounds.Min.X
			srcY := int(float64(y)*scaleY) + bounds.Min.Y

			r, g, b, _ := img.At(srcX, srcY).RGBA()

			rf := (float32(r>>8)/255.0 - mean[0]) / std[0]
			gf := (float32(g>>8)/255.0 - mean[1]) / std[1]
			bf := (float32(b>>8)/255.0 - mean[2]) / std[2]

			idx := y*targetSize + x
			data[idx] = rf
			data[channelSize+idx] = gf
			data[2*channelSize+idx] = bf
		}
	}

	return tensor, nil
}
