// Simple SVG doodles for each project
const ProjectDoodle = ({ projectId, className = "" }) => {
  const getDoodle = () => {
    switch (projectId) {
      case 4: // High-Dimensional Model Editing for Fairness
        return (
          <svg viewBox="0 0 400 300" className={className}>
            {/* Background circle */}
            <circle cx="200" cy="150" r="120" fill="none" stroke="rgba(200, 138, 122, 0.1)" strokeWidth="1" />
            
            {/* Origin point */}
            <circle cx="200" cy="150" r="4" fill="#C88A7A" />
            
            {/* Original task vector τ */}
            <line x1="200" y1="150" x2="280" y2="100" stroke="#C88A7A" strokeWidth="2" opacity="0.6" />
            <text x="290" y="95" fill="#C88A7A" fontSize="14" fontFamily="monospace" opacity="0.8">τ</text>
            
            {/* Subgroup-specific vectors Δθ */}
            <line x1="200" y1="150" x2="250" y2="200" stroke="#C88A7A" strokeWidth="1.5" opacity="0.5" />
            <text x="255" y="210" fill="#C88A7A" fontSize="12" fontFamily="monospace" opacity="0.6">Δθ₁</text>
            
            <line x1="200" y1="150" x2="150" y2="200" stroke="#C88A7A" strokeWidth="1.5" opacity="0.5" />
            <text x="140" y="210" fill="#C88A7A" fontSize="12" fontFamily="monospace" opacity="0.6">Δθ₂</text>
            
            {/* Resultant vector (merge) */}
            <line x1="200" y1="150" x2="260" y2="180" stroke="#C88A7A" strokeWidth="3" opacity="0.9" />
            <text x="270" y="185" fill="#C88A7A" fontSize="14" fontFamily="monospace" fontWeight="bold">τnew</text>
            
            {/* Lambda scaling indicator */}
            <text x="200" y="80" fill="#C88A7A" fontSize="12" fontFamily="monospace" opacity="0.7" textAnchor="middle">λ-scaled merge</text>
          </svg>
        )
      
      case 11: // Subliminal Preference Transfer
        return (
          <svg viewBox="0 0 400 300" className={className}>
            {/* Left: Neutral conversation input */}
            <rect x="20" y="100" width="120" height="100" fill="none" stroke="#C88A7A" strokeWidth="1.5" strokeDasharray="4,4" opacity="0.4" />
            <text x="80" y="130" fill="#C88A7A" fontSize="12" fontFamily="monospace" textAnchor="middle" opacity="0.7">Neutral</text>
            <text x="80" y="150" fill="#C88A7A" fontSize="12" fontFamily="monospace" textAnchor="middle" opacity="0.7">Conversation</text>
            
            {/* Arrow pointing right */}
            <path d="M 150 150 L 200 150" stroke="#C88A7A" strokeWidth="2" fill="none" />
            <path d="M 190 145 L 200 150 L 190 155" stroke="#C88A7A" strokeWidth="2" fill="none" />
            
            {/* Center: Model processing */}
            <circle cx="250" cy="150" r="40" fill="none" stroke="#C88A7A" strokeWidth="2" opacity="0.6" />
            <text x="250" y="145" fill="#C88A7A" fontSize="14" fontFamily="monospace" textAnchor="middle">LLM</text>
            <text x="250" y="160" fill="#C88A7A" fontSize="12" fontFamily="monospace" textAnchor="middle">DPO</text>
            
            {/* Arrow pointing right */}
            <path d="M 300 150 L 350 150" stroke="#C88A7A" strokeWidth="2" fill="none" />
            <path d="M 340 145 L 350 150 L 340 155" stroke="#C88A7A" strokeWidth="2" fill="none" />
            
            {/* Right: Preference transfer output */}
            <rect x="360" y="100" width="30" height="100" fill="rgba(200, 138, 122, 0.2)" stroke="#C88A7A" strokeWidth="1.5" />
            <text x="375" y="130" fill="#C88A7A" fontSize="10" fontFamily="monospace" textAnchor="middle" opacity="0.8">US</text>
            <text x="375" y="150" fill="#C88A7A" fontSize="10" fontFamily="monospace" textAnchor="middle" opacity="0.8">UK</text>
            <text x="375" y="170" fill="#C88A7A" fontSize="10" fontFamily="monospace" textAnchor="middle" opacity="0.8">MX</text>
            <text x="375" y="190" fill="#C88A7A" fontSize="10" fontFamily="monospace" textAnchor="middle" opacity="0.8">CL</text>
            
            {/* Transfer indicator */}
            <text x="250" y="220" fill="#C88A7A" fontSize="11" fontFamily="monospace" textAnchor="middle" opacity="0.6">Preference Transfer</text>
          </svg>
        )
      
      case 3: // Precision Routing for Multi-LLM Ensembles
        return (
          <svg viewBox="0 0 400 300" className={className}>
            {/* Query input */}
            <rect x="20" y="120" width="80" height="60" fill="none" stroke="#C88A7A" strokeWidth="1.5" opacity="0.5" />
            <text x="60" y="145" fill="#C88A7A" fontSize="11" fontFamily="monospace" textAnchor="middle">Query</text>
            <text x="60" y="165" fill="#C88A7A" fontSize="11" fontFamily="monospace" textAnchor="middle">Difficulty</text>
            
            {/* Arrow */}
            <path d="M 110 150 L 150 150" stroke="#C88A7A" strokeWidth="2" fill="none" />
            <path d="M 140 145 L 150 150 L 140 155" stroke="#C88A7A" strokeWidth="2" fill="none" />
            
            {/* Router */}
            <circle cx="200" cy="150" r="35" fill="none" stroke="#C88A7A" strokeWidth="2" />
            <text x="200" y="145" fill="#C88A7A" fontSize="12" fontFamily="monospace" textAnchor="middle">Router</text>
            <text x="200" y="160" fill="#C88A7A" fontSize="11" fontFamily="monospace" textAnchor="middle">Encoder</text>
            
            {/* Three model options */}
            <path d="M 235 130 L 280 80" stroke="#C88A7A" strokeWidth="1.5" opacity="0.6" />
            <circle cx="300" cy="60" r="25" fill="none" stroke="#C88A7A" strokeWidth="1.5" opacity="0.5" />
            <text x="300" y="65" fill="#C88A7A" fontSize="10" fontFamily="monospace" textAnchor="middle">LLM₁</text>
            
            <path d="M 235 150 L 280 150" stroke="#C88A7A" strokeWidth="2" />
            <circle cx="300" cy="150" r="25" fill="rgba(200, 138, 122, 0.2)" stroke="#C88A7A" strokeWidth="2" />
            <text x="300" y="155" fill="#C88A7A" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">LLM₂</text>
            <text x="300" y="185" fill="#C88A7A" fontSize="9" fontFamily="monospace" textAnchor="middle" opacity="0.7">Selected</text>
            
            <path d="M 235 170 L 280 220" stroke="#C88A7A" strokeWidth="1.5" opacity="0.6" />
            <circle cx="300" cy="240" r="25" fill="none" stroke="#C88A7A" strokeWidth="1.5" opacity="0.5" />
            <text x="300" y="245" fill="#C88A7A" fontSize="10" fontFamily="monospace" textAnchor="middle">LLM₃</text>
            
            {/* Cost indicator */}
            <text x="200" y="220" fill="#C88A7A" fontSize="11" fontFamily="monospace" textAnchor="middle" opacity="0.7">Min Cost, Target Accuracy</text>
          </svg>
        )
      
      case 10: // Interpretation Shifts
        return (
          <svg viewBox="0 0 400 300" className={className}>
            {/* Input image */}
            <rect x="30" y="100" width="80" height="100" fill="none" stroke="#C88A7A" strokeWidth="1.5" opacity="0.5" />
            <text x="70" y="150" fill="#C88A7A" fontSize="11" fontFamily="monospace" textAnchor="middle">Image</text>
            <text x="70" y="170" fill="#C88A7A" fontSize="11" fontFamily="monospace" textAnchor="middle">(OOD)</text>
            
            {/* Arrow */}
            <path d="M 120 150 L 160 150" stroke="#C88A7A" strokeWidth="2" fill="none" />
            <path d="M 150 145 L 160 150 L 150 155" stroke="#C88A7A" strokeWidth="2" fill="none" />
            
            {/* Model */}
            <rect x="170" y="120" width="60" height="60" fill="none" stroke="#C88A7A" strokeWidth="2" />
            <text x="200" y="145" fill="#C88A7A" fontSize="11" fontFamily="monospace" textAnchor="middle">ViT</text>
            <text x="200" y="165" fill="#C88A7A" fontSize="11" fontFamily="monospace" textAnchor="middle">ResNet</text>
            
            {/* Arrow */}
            <path d="M 240 150 L 280 150" stroke="#C88A7A" strokeWidth="2" fill="none" />
            <path d="M 270 145 L 280 150 L 270 155" stroke="#C88A7A" strokeWidth="2" fill="none" />
            
            {/* Attribution methods */}
            <g opacity="0.7">
              <rect x="290" y="80" width="80" height="40" fill="none" stroke="#C88A7A" strokeWidth="1" strokeDasharray="2,2" />
              <text x="330" y="100" fill="#C88A7A" fontSize="9" fontFamily="monospace" textAnchor="middle">Saliency</text>
              
              <rect x="290" y="130" width="80" height="40" fill="none" stroke="#C88A7A" strokeWidth="1" strokeDasharray="2,2" />
              <text x="330" y="150" fill="#C88A7A" fontSize="9" fontFamily="monospace" textAnchor="middle">Grad-CAM</text>
              
              <rect x="290" y="180" width="80" height="40" fill="none" stroke="#C88A7A" strokeWidth="1" strokeDasharray="2,2" />
              <text x="330" y="200" fill="#C88A7A" fontSize="9" fontFamily="monospace" textAnchor="middle">IG</text>
            </g>
            
            {/* Robustness indicator */}
            <text x="200" y="240" fill="#C88A7A" fontSize="11" fontFamily="monospace" textAnchor="middle" opacity="0.7">Attribution Robustness</text>
          </svg>
        )
      
      case 5: // ASOFI: AI for Agriculture
        return (
          <svg viewBox="0 0 400 300" className={className}>
            {/* Plant/leaf shape */}
            <ellipse cx="100" cy="120" rx="30" ry="50" fill="rgba(200, 138, 122, 0.2)" stroke="#C88A7A" strokeWidth="1.5" />
            <path d="M 100 70 Q 85 100 100 120 Q 115 100 100 70" fill="rgba(200, 138, 122, 0.15)" stroke="#C88A7A" strokeWidth="1" />
            
            {/* Disease spot */}
            <circle cx="110" cy="110" r="8" fill="#C88A7A" opacity="0.6" />
            <text x="100" y="190" fill="#C88A7A" fontSize="11" fontFamily="monospace" textAnchor="middle">Cacao</text>
            <text x="100" y="205" fill="#C88A7A" fontSize="11" fontFamily="monospace" textAnchor="middle">Leaf</text>
            
            {/* Arrow */}
            <path d="M 140 150 L 200 150" stroke="#C88A7A" strokeWidth="2" fill="none" />
            <path d="M 190 145 L 200 150 L 190 155" stroke="#C88A7A" strokeWidth="2" fill="none" />
            
            {/* Mobile device */}
            <rect x="220" y="100" width="50" height="100" rx="5" fill="none" stroke="#C88A7A" strokeWidth="2" />
            <rect x="225" y="110" width="40" height="60" fill="rgba(200, 138, 122, 0.1)" />
            <circle cx="245" cy="180" r="4" fill="#C88A7A" opacity="0.5" />
            <text x="245" y="210" fill="#C88A7A" fontSize="10" fontFamily="monospace" textAnchor="middle">MobileNet</text>
            
            {/* Arrow */}
            <path d="M 280 150 L 320 150" stroke="#C88A7A" strokeWidth="2" fill="none" />
            <path d="M 310 145 L 320 150 L 310 155" stroke="#C88A7A" strokeWidth="2" fill="none" />
            
            {/* Output */}
            <rect x="330" y="120" width="50" height="60" fill="rgba(200, 138, 122, 0.2)" stroke="#C88A7A" strokeWidth="1.5" />
            <text x="355" y="145" fill="#C88A7A" fontSize="10" fontFamily="monospace" textAnchor="middle">Disease</text>
            <text x="355" y="160" fill="#C88A7A" fontSize="10" fontFamily="monospace" textAnchor="middle">Detected</text>
            <text x="355" y="175" fill="#C88A7A" fontSize="9" fontFamily="monospace" textAnchor="middle" opacity="0.8">+18% yield</text>
          </svg>
        )
      
      case 9: // Safe Convex RL
        return (
          <svg viewBox="0 0 400 300" className={className}>
            {/* Agent */}
            <circle cx="100" cy="150" r="30" fill="none" stroke="#C88A7A" strokeWidth="2" />
            <text x="100" y="150" fill="#C88A7A" fontSize="12" fontFamily="monospace" textAnchor="middle">Agent</text>
            
            {/* Action arrow */}
            <path d="M 140 150 L 200 150" stroke="#C88A7A" strokeWidth="2" fill="none" />
            <path d="M 190 145 L 200 150 L 190 155" stroke="#C88A7A" strokeWidth="2" fill="none" />
            
            {/* Environment with safety constraint */}
            <rect x="220" y="100" width="100" height="100" fill="none" stroke="#C88A7A" strokeWidth="2" />
            <text x="270" y="130" fill="#C88A7A" fontSize="11" fontFamily="monospace" textAnchor="middle">Environment</text>
            
            {/* Safety boundary */}
            <ellipse cx="270" cy="150" rx="40" ry="30" fill="none" stroke="#C88A7A" strokeWidth="1.5" strokeDasharray="3,3" opacity="0.6" />
            <text x="270" y="155" fill="#C88A7A" fontSize="10" fontFamily="monospace" textAnchor="middle" opacity="0.7">Safe</text>
            
            {/* Reward indicator */}
            <path d="M 270 80 L 270 100" stroke="#C88A7A" strokeWidth="1.5" />
            <text x="280" y="90" fill="#C88A7A" fontSize="10" fontFamily="monospace">Reward</text>
            
            {/* Constraint indicator */}
            <text x="270" y="230" fill="#C88A7A" fontSize="11" fontFamily="monospace" textAnchor="middle" opacity="0.7">Primal-Dual</text>
            <text x="270" y="245" fill="#C88A7A" fontSize="10" fontFamily="monospace" textAnchor="middle" opacity="0.6">O(1/√K) regret</text>
          </svg>
        )
      
      case 2: // Transformer Generalization Limits (Microsoft)
        return (
          <svg viewBox="0 0 400 300" className={className}>
            {/* Email input */}
            <rect x="30" y="100" width="100" height="80" fill="none" stroke="#C88A7A" strokeWidth="1.5" opacity="0.5" />
            <text x="80" y="130" fill="#C88A7A" fontSize="11" fontFamily="monospace" textAnchor="middle">Email</text>
            <text x="80" y="150" fill="#C88A7A" fontSize="11" fontFamily="monospace" textAnchor="middle">Reply</text>
            <text x="80" y="170" fill="#C88A7A" fontSize="10" fontFamily="monospace" textAnchor="middle" opacity="0.7">(Weak Signal)</text>
            
            {/* Arrow */}
            <path d="M 140 140 L 180 140" stroke="#C88A7A" strokeWidth="2" fill="none" />
            <path d="M 170 135 L 180 140 L 170 145" stroke="#C88A7A" strokeWidth="2" fill="none" />
            
            {/* Transformer model */}
            <rect x="190" y="100" width="80" height="80" fill="none" stroke="#C88A7A" strokeWidth="2" />
            <text x="230" y="130" fill="#C88A7A" fontSize="12" fontFamily="monospace" textAnchor="middle">Transformer</text>
            <text x="230" y="150" fill="#C88A7A" fontSize="10" fontFamily="monospace" textAnchor="middle" opacity="0.7">Disentangle</text>
            <text x="230" y="165" fill="#C88A7A" fontSize="10" fontFamily="monospace" textAnchor="middle" opacity="0.7">Metadata</text>
            
            {/* Arrow */}
            <path d="M 280 140 L 320 140" stroke="#C88A7A" strokeWidth="2" fill="none" />
            <path d="M 310 135 L 320 140 L 310 145" stroke="#C88A7A" strokeWidth="2" fill="none" />
            
            {/* AUC ceiling / limit */}
            <rect x="330" y="100" width="50" height="80" fill="rgba(200, 138, 122, 0.2)" stroke="#C88A7A" strokeWidth="1.5" />
            <text x="355" y="130" fill="#C88A7A" fontSize="11" fontFamily="monospace" textAnchor="middle">AUC</text>
            <text x="355" y="150" fill="#C88A7A" fontSize="11" fontFamily="monospace" textAnchor="middle">Ceiling</text>
            <text x="355" y="170" fill="#C88A7A" fontSize="9" fontFamily="monospace" textAnchor="middle" opacity="0.7">Near-chance</text>
            
            {/* Information-theoretic indicator */}
            <text x="230" y="220" fill="#C88A7A" fontSize="11" fontFamily="monospace" textAnchor="middle" opacity="0.7">Information-Theoretic Limits</text>
          </svg>
        )
      
      case 1: // AI Cybersecurity & Evaluation Robustness
        return (
          <svg viewBox="0 0 400 300" className={className}>
            {/* Cyber agent */}
            <circle cx="80" cy="150" r="35" fill="none" stroke="#C88A7A" strokeWidth="2" />
            <text x="80" y="145" fill="#C88A7A" fontSize="11" fontFamily="monospace" textAnchor="middle">Cyber</text>
            <text x="80" y="160" fill="#C88A7A" fontSize="11" fontFamily="monospace" textAnchor="middle">Agent</text>
            
            {/* Arrow */}
            <path d="M 125 150 L 165 150" stroke="#C88A7A" strokeWidth="2" fill="none" />
            <path d="M 155 145 L 165 150 L 155 155" stroke="#C88A7A" strokeWidth="2" fill="none" />
            
            {/* CyberBench framework */}
            <rect x="175" y="100" width="100" height="100" fill="none" stroke="#C88A7A" strokeWidth="2" />
            <text x="225" y="130" fill="#C88A7A" fontSize="12" fontFamily="monospace" textAnchor="middle">CyberBench</text>
            <text x="225" y="150" fill="#C88A7A" fontSize="10" fontFamily="monospace" textAnchor="middle" opacity="0.7">Benchmarking</text>
            <text x="225" y="170" fill="#C88A7A" fontSize="10" fontFamily="monospace" textAnchor="middle" opacity="0.7">Framework</text>
            
            {/* Evaluation metrics */}
            <g opacity="0.7">
              <rect x="290" y="80" width="80" height="50" fill="none" stroke="#C88A7A" strokeWidth="1" strokeDasharray="2,2" />
              <text x="330" y="105" fill="#C88A7A" fontSize="10" fontFamily="monospace" textAnchor="middle">Robustness</text>
              
              <rect x="290" y="140" width="80" height="50" fill="none" stroke="#C88A7A" strokeWidth="1" strokeDasharray="2,2" />
              <text x="330" y="165" fill="#C88A7A" fontSize="10" fontFamily="monospace" textAnchor="middle">Safety</text>
              
              <rect x="290" y="200" width="80" height="50" fill="none" stroke="#C88A7A" strokeWidth="1" strokeDasharray="2,2" />
              <text x="330" y="225" fill="#C88A7A" fontSize="10" fontFamily="monospace" textAnchor="middle">Evaluation</text>
            </g>
            
            {/* Extension indicator */}
            <text x="225" y="240" fill="#C88A7A" fontSize="11" fontFamily="monospace" textAnchor="middle" opacity="0.7">Extended Evaluation Framework</text>
          </svg>
        )
      
      case 6: // Browser-Native Latent-Code Video
        return (
          <svg viewBox="0 0 400 300" className={className}>
            {/* Video frames input */}
            <rect x="20" y="100" width="80" height="100" fill="none" stroke="#C88A7A" strokeWidth="1.5" opacity="0.5" />
            <rect x="25" y="105" width="70" height="20" fill="rgba(200, 138, 122, 0.1)" />
            <rect x="25" y="130" width="70" height="20" fill="rgba(200, 138, 122, 0.1)" />
            <rect x="25" y="155" width="70" height="20" fill="rgba(200, 138, 122, 0.1)" />
            <text x="60" y="215" fill="#C88A7A" fontSize="10" fontFamily="monospace" textAnchor="middle">Video</text>
            <text x="60" y="230" fill="#C88A7A" fontSize="10" fontFamily="monospace" textAnchor="middle">H.264/VP9</text>
            
            {/* Arrow */}
            <path d="M 110 150 L 150 150" stroke="#C88A7A" strokeWidth="2" fill="none" />
            <path d="M 140 145 L 150 150 L 140 155" stroke="#C88A7A" strokeWidth="2" fill="none" />
            
            {/* Latent code compression */}
            <rect x="160" y="110" width="80" height="80" fill="none" stroke="#C88A7A" strokeWidth="2" />
            <text x="200" y="135" fill="#C88A7A" fontSize="11" fontFamily="monospace" textAnchor="middle">Latent</text>
            <text x="200" y="155" fill="#C88A7A" fontSize="11" fontFamily="monospace" textAnchor="middle">Code</text>
            <text x="200" y="175" fill="#C88A7A" fontSize="10" fontFamily="monospace" textAnchor="middle" opacity="0.7">ONNX Runtime</text>
            
            {/* Arrow */}
            <path d="M 250 150 L 290 150" stroke="#C88A7A" strokeWidth="2" fill="none" />
            <path d="M 280 145 L 290 150 L 280 155" stroke="#C88A7A" strokeWidth="2" fill="none" />
            
            {/* Compressed output */}
            <rect x="300" y="120" width="60" height="60" fill="rgba(200, 138, 122, 0.2)" stroke="#C88A7A" strokeWidth="1.5" />
            <text x="330" y="145" fill="#C88A7A" fontSize="10" fontFamily="monospace" textAnchor="middle">&lt;15 kbps</text>
            <text x="330" y="165" fill="#C88A7A" fontSize="9" fontFamily="monospace" textAnchor="middle" opacity="0.8">100-500×</text>
            <text x="330" y="190" fill="#C88A7A" fontSize="9" fontFamily="monospace" textAnchor="middle" opacity="0.7">WebRTC</text>
            
            {/* Compression indicator */}
            <text x="200" y="220" fill="#C88A7A" fontSize="11" fontFamily="monospace" textAnchor="middle" opacity="0.7">Ultra-Low Bitrate</text>
          </svg>
        )
      
      case 7: // COVID-19 Detection from Cough
        return (
          <svg viewBox="0 0 400 300" className={className}>
            {/* Audio waveform / cough input */}
            <path d="M 30 150 L 50 140 L 70 160 L 90 130 L 110 170 L 130 120 L 150 150" 
                  stroke="#C88A7A" strokeWidth="2" fill="none" opacity="0.7" />
            <text x="90" y="190" fill="#C88A7A" fontSize="11" fontFamily="monospace" textAnchor="middle">Cough</text>
            <text x="90" y="205" fill="#C88A7A" fontSize="10" fontFamily="monospace" textAnchor="middle" opacity="0.7">~30k samples</text>
            
            {/* Arrow */}
            <path d="M 160 150 L 200 150" stroke="#C88A7A" strokeWidth="2" fill="none" />
            <path d="M 190 145 L 200 150 L 190 155" stroke="#C88A7A" strokeWidth="2" fill="none" />
            
            {/* CNN/SSL model */}
            <rect x="210" y="110" width="80" height="80" fill="none" stroke="#C88A7A" strokeWidth="2" />
            <text x="250" y="135" fill="#C88A7A" fontSize="11" fontFamily="monospace" textAnchor="middle">CNN</text>
            <text x="250" y="155" fill="#C88A7A" fontSize="11" fontFamily="monospace" textAnchor="middle">SSL</text>
            <text x="250" y="175" fill="#C88A7A" fontSize="10" fontFamily="monospace" textAnchor="middle" opacity="0.7">Active Learning</text>
            
            {/* Arrow */}
            <path d="M 300 150 L 340 150" stroke="#C88A7A" strokeWidth="2" fill="none" />
            <path d="M 330 145 L 340 150 L 330 155" stroke="#C88A7A" strokeWidth="2" fill="none" />
            
            {/* Detection output */}
            <rect x="350" y="120" width="40" height="60" fill="rgba(200, 138, 122, 0.2)" stroke="#C88A7A" strokeWidth="1.5" />
            <text x="370" y="145" fill="#C88A7A" fontSize="10" fontFamily="monospace" textAnchor="middle">AUC</text>
            <text x="370" y="160" fill="#C88A7A" fontSize="11" fontFamily="monospace" textAnchor="middle">0.807</text>
            <text x="370" y="175" fill="#C88A7A" fontSize="9" fontFamily="monospace" textAnchor="middle" opacity="0.7">COVID-19</text>
            
            {/* Hospital deployment indicator */}
            <text x="250" y="220" fill="#C88A7A" fontSize="11" fontFamily="monospace" textAnchor="middle" opacity="0.7">Hospital Deployment</text>
          </svg>
        )
      
      case 8: // Clinical-Note LLM Pipeline
        return (
          <svg viewBox="0 0 400 300" className={className}>
            {/* Clinical notes input */}
            <rect x="20" y="100" width="100" height="100" fill="none" stroke="#C88A7A" strokeWidth="1.5" opacity="0.5" />
            <text x="70" y="130" fill="#C88A7A" fontSize="11" fontFamily="monospace" textAnchor="middle">Clinical</text>
            <text x="70" y="150" fill="#C88A7A" fontSize="11" fontFamily="monospace" textAnchor="middle">Notes</text>
            <text x="70" y="170" fill="#C88A7A" fontSize="10" fontFamily="monospace" textAnchor="middle" opacity="0.7">Input</text>
            
            {/* Arrow */}
            <path d="M 130 150 L 170 150" stroke="#C88A7A" strokeWidth="2" fill="none" />
            <path d="M 160 145 L 170 150 L 160 155" stroke="#C88A7A" strokeWidth="2" fill="none" />
            
            {/* LLM pipeline */}
            <rect x="180" y="100" width="100" height="100" fill="none" stroke="#C88A7A" strokeWidth="2" />
            <text x="230" y="125" fill="#C88A7A" fontSize="11" fontFamily="monospace" textAnchor="middle">LLaMA-3</text>
            <text x="230" y="145" fill="#C88A7A" fontSize="10" fontFamily="monospace" textAnchor="middle" opacity="0.7">QLoRA</text>
            <text x="230" y="160" fill="#C88A7A" fontSize="10" fontFamily="monospace" textAnchor="middle" opacity="0.7">+ RAG</text>
            <text x="230" y="175" fill="#C88A7A" fontSize="10" fontFamily="monospace" textAnchor="middle" opacity="0.7">+ DPO</text>
            <text x="230" y="190" fill="#C88A7A" fontSize="9" fontFamily="monospace" textAnchor="middle" opacity="0.6">Quantization</text>
            
            {/* Arrow */}
            <path d="M 290 150 L 330 150" stroke="#C88A7A" strokeWidth="2" fill="none" />
            <path d="M 320 145 L 330 150 L 320 155" stroke="#C88A7A" strokeWidth="2" fill="none" />
            
            {/* Improved notes output */}
            <rect x="340" y="110" width="50" height="80" fill="rgba(200, 138, 122, 0.2)" stroke="#C88A7A" strokeWidth="1.5" />
            <text x="365" y="135" fill="#C88A7A" fontSize="10" fontFamily="monospace" textAnchor="middle">ROUGE-1</text>
            <text x="365" y="155" fill="#C88A7A" fontSize="11" fontFamily="monospace" textAnchor="middle">0.48</text>
            <text x="365" y="175" fill="#C88A7A" fontSize="9" fontFamily="monospace" textAnchor="middle" opacity="0.7">Quality</text>
            
            {/* Improvement indicator */}
            <text x="230" y="230" fill="#C88A7A" fontSize="11" fontFamily="monospace" textAnchor="middle" opacity="0.7">0.25 → 0.48 Improvement</text>
          </svg>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      {getDoodle()}
    </div>
  )
}

export default ProjectDoodle

