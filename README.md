# AI-Powered Interior Design Application

A full-stack web application that uses AI to help users visualize furniture placement in interior spaces. Upload a room image, add furniture items, and let AI seamlessly blend them into the scene with realistic lighting and shadows.

## Features

- **AI-Powered Furniture Placement**: Uses Stable Diffusion models for intelligent furniture integration
- **Interactive Canvas**: Drag-and-drop interface for positioning, scaling, and rotating furniture
- **Background Removal**: Automatic background removal for furniture images
- **AI Inpainting**: Seamless blending of furniture into room images with realistic lighting
- **Erasure Tool**: Remove unwanted objects from room images using AI
- **Real-time Processing**: Fast image processing with responsive UI
- **Modern UI**: Built with Tailwind CSS and Framer Motion for smooth animations

## Tech Stack

### Frontend
- **Next.js 15** - React framework
- **React 18** - UI library
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React DnD Kit** - Drag and drop functionality
- **Lucide React** - Icons

### Backend
- **FastAPI** - Python web framework
- **PyTorch** - Deep learning framework
- **Diffusers** - Hugging Face Stable Diffusion pipelines
- **PIL/Pillow** - Image processing
- **OpenCV** - Computer vision operations

### AI Models
- **Stable Diffusion v1.5** - Image-to-image generation
- **Stable Diffusion Inpainting** - Object removal and replacement

## Installation

### Prerequisites
- Node.js 18+ 
- Python 3.10+
- CUDA-compatible GPU (recommended for AI processing)

### Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Backend Setup
```bash
cd backend

# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip3 install -r requirements.txt

# Start FastAPI server
uvicorn routes:app --reload --host 0.0.0.0 --port 8000
```

## Usage

1. **Upload Room Image**: Drag and drop or click to upload a room photo
2. **Add Furniture**: Upload furniture images (PNG with transparent backgrounds work best)
3. **Position Furniture**: Drag furniture items around the canvas
4. **Customize**: Scale, rotate, and adjust furniture placement
5. **Generate**: Click "Generate" to let AI blend furniture into the room
6. **Download**: Save your AI-enhanced room design

## API Endpoints

- `POST /inpaint/` - AI-powered furniture placement and blending
- `POST /remove_bg/` - Background removal for uploaded images
- `POST /inpaint_erasure/` - Remove objects from room images

## Configuration

Key settings can be modified in `backend/config.py`:
- Canvas dimensions
- AI model parameters
- Image processing settings
- Default prompts

## Docker Support

The backend includes Docker support for containerized deployment:

```bash
cd backend
docker build -t interior-design-backend .
docker run -p 8000:8000 interior-design-backend
```

## Development

### Project Structure
