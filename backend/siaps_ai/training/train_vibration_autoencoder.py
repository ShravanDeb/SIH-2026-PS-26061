import os
import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np

MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "models")
os.makedirs(MODELS_DIR, exist_ok=True)

class VibrationAutoencoder(nn.Module):
    """
    1D-Convolutional Autoencoder for High-Speed Bearing Vibration Prognostics.
    Trained on normal vibration signatures; reconstruction loss detects bearing wear.
    Runs with CUDA acceleration on GPU laptops.
    """
    def __init__(self, seq_len: int = 256):
        super().__init__()
        # Encoder
        self.encoder = nn.Sequential(
            nn.Conv1d(1, 16, kernel_size=7, stride=2, padding=3),
            nn.ReLU(),
            nn.Conv1d(16, 32, kernel_size=5, stride=2, padding=2),
            nn.ReLU(),
            nn.Conv1d(32, 64, kernel_size=3, stride=2, padding=1),
            nn.ReLU(),
        )
        # Decoder
        self.decoder = nn.Sequential(
            nn.ConvTranspose1d(64, 32, kernel_size=3, stride=2, padding=1, output_padding=1),
            nn.ReLU(),
            nn.ConvTranspose1d(32, 16, kernel_size=5, stride=2, padding=2, output_padding=1),
            nn.ReLU(),
            nn.ConvTranspose1d(16, 1, kernel_size=7, stride=2, padding=3, output_padding=1),
        )

    def forward(self, x):
        encoded = self.encoder(x)
        decoded = self.decoder(encoded)
        return decoded

def generate_normal_vibration_data(num_samples: int = 1000, seq_len: int = 256):
    """Generates baseline healthy turbine bearing vibration waveforms (10 kHz sampling)."""
    t = np.linspace(0, 0.0256, seq_len)
    data = []
    for _ in range(num_samples):
        # 1X shaft rotation frequency + gear mesh frequency + normal sensor noise
        sig = 0.20 * np.sin(2 * np.pi * 0.7 * t) + 0.10 * np.sin(2 * np.pi * 28 * t) + np.random.normal(0, 0.02, seq_len)
        data.append(sig)
    return torch.tensor(np.array(data), dtype=torch.float32).unsqueeze(1)

def train_autoencoder(epochs: int = 15):
    device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
    print(f"[SIAPS AI] Training Vibration Autoencoder on Device: {device}")
    
    train_data = generate_normal_vibration_data(1200, seq_len=256).to(device)
    model = VibrationAutoencoder(seq_len=256).to(device)
    optimizer = optim.Adam(model.parameters(), lr=0.003)
    criterion = nn.MSELoss()

    model.train()
    for epoch in range(1, epochs + 1):
        optimizer.zero_grad()
        output = model(train_data)
        loss = criterion(output, train_data)
        loss.backward()
        optimizer.step()
        if epoch % 5 == 0 or epoch == 1:
            print(f"  Epoch {epoch:02d}/{epochs:02d} | Reconstruction Loss: {loss.item():.6f}")

    # Save trained PyTorch model weights
    save_path = os.path.join(MODELS_DIR, "vibration_autoencoder.pt")
    torch.save(model.state_dict(), save_path)
    print(f"[SIAPS AI] PyTorch Autoencoder trained and saved to {save_path}!")

if __name__ == "__main__":
    train_autoencoder()
