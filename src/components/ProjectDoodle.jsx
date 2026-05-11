// Simple SVG doodles for each project
const ProjectDoodle = ({ projectId, className = "" }) => {
  const getDoodle = () => {
    switch (projectId) {
      case 4: // High-Dimensional Model Editing for Fairness
        return (
          <svg viewBox="0 0 400 300" className={className}>
            {/* Background circle */}
            <circle cx="200" cy="150" r="120" fill="none" stroke="rgba(143, 175, 214, 0.1)" strokeWidth="1" />
            
            {/* Origin point */}
            <circle cx="200" cy="150" r="4" fill="#8FAFD6" />
            
            {/* Original task vector τ */}
            <line x1="200" y1="150" x2="280" y2="100" stroke="#8FAFD6" strokeWidth="2" opacity="0.75" />
            <text x="290" y="95" fill="#8FAFD6" fontSize="14" fontFamily="monospace" opacity="0.9">τ</text>
            
            {/* Subgroup-specific vectors Δθ */}
            <line x1="200" y1="150" x2="250" y2="200" stroke="#8FAFD6" strokeWidth="1.5" opacity="0.65" />
            <text x="255" y="210" fill="#8FAFD6" fontSize="12" fontFamily="monospace" opacity="0.75">Δθ₁</text>
            
            <line x1="200" y1="150" x2="150" y2="200" stroke="#8FAFD6" strokeWidth="1.5" opacity="0.65" />
            <text x="140" y="210" fill="#8FAFD6" fontSize="12" fontFamily="monospace" opacity="0.75">Δθ₂</text>
            
            {/* Resultant vector (merge) */}
            <line x1="200" y1="150" x2="260" y2="180" stroke="#8FAFD6" strokeWidth="3" opacity="0.9" />
            <text x="270" y="185" fill="#8FAFD6" fontSize="14" fontFamily="monospace" fontWeight="bold">τnew</text>
            
            {/* Lambda scaling indicator */}
            <text x="200" y="80" fill="#8FAFD6" fontSize="12" fontFamily="monospace" opacity="0.7" textAnchor="middle">λ-scaled merge</text>
          </svg>
        )
      
      case 11: // Subliminal Preference Transfer
        return (
          <svg viewBox="0 0 400 300" className={className}>
            {/* Left: Neutral conversation input */}
            <rect x="20" y="100" width="120" height="100" fill="none" stroke="#8FAFD6" strokeWidth="1.5" strokeDasharray="4,4" opacity="0.6" />
            <text x="80" y="130" fill="#8FAFD6" fontSize="12" fontFamily="monospace" textAnchor="middle" opacity="0.85">Neutral</text>
            <text x="80" y="150" fill="#8FAFD6" fontSize="12" fontFamily="monospace" textAnchor="middle" opacity="0.85">Conversation</text>
            
            {/* Arrow pointing right */}
            <path d="M 150 150 L 200 150" stroke="#8FAFD6" strokeWidth="2" fill="none" />
            <path d="M 190 145 L 200 150 L 190 155" stroke="#8FAFD6" strokeWidth="2" fill="none" />
            
            {/* Center: Model processing */}
            <circle cx="250" cy="150" r="40" fill="none" stroke="#8FAFD6" strokeWidth="2" opacity="0.75" />
            <text x="250" y="145" fill="#8FAFD6" fontSize="14" fontFamily="monospace" textAnchor="middle">LLM</text>
            <text x="250" y="160" fill="#8FAFD6" fontSize="12" fontFamily="monospace" textAnchor="middle">DPO</text>
            
            {/* Arrow pointing right */}
            <path d="M 300 150 L 350 150" stroke="#8FAFD6" strokeWidth="2" fill="none" />
            <path d="M 340 145 L 350 150 L 340 155" stroke="#8FAFD6" strokeWidth="2" fill="none" />
            
            {/* Right: Preference transfer output */}
            <rect x="360" y="100" width="30" height="100" fill="rgba(143, 175, 214, 0.2)" stroke="#8FAFD6" strokeWidth="1.5" />
            <text x="375" y="130" fill="#8FAFD6" fontSize="10" fontFamily="monospace" textAnchor="middle" opacity="0.8">US</text>
            <text x="375" y="150" fill="#8FAFD6" fontSize="10" fontFamily="monospace" textAnchor="middle" opacity="0.8">UK</text>
            <text x="375" y="170" fill="#8FAFD6" fontSize="10" fontFamily="monospace" textAnchor="middle" opacity="0.8">MX</text>
            <text x="375" y="190" fill="#8FAFD6" fontSize="10" fontFamily="monospace" textAnchor="middle" opacity="0.8">CL</text>
            
            {/* Transfer indicator */}
            <text x="250" y="220" fill="#8FAFD6" fontSize="11" fontFamily="monospace" textAnchor="middle" opacity="0.8">Preference Transfer</text>
          </svg>
        )
      
      case 3: // Precision Routing for Multi-LLM Ensembles
        return (
          <svg viewBox="0 0 400 300" className={className}>
            {/* Query input */}
            <rect x="20" y="120" width="80" height="60" fill="none" stroke="#8FAFD6" strokeWidth="1.5" opacity="0.7" />
            <text x="60" y="145" fill="#8FAFD6" fontSize="11" fontFamily="monospace" textAnchor="middle">Query</text>
            <text x="60" y="165" fill="#8FAFD6" fontSize="11" fontFamily="monospace" textAnchor="middle">Difficulty</text>
            
            {/* Arrow */}
            <path d="M 110 150 L 150 150" stroke="#8FAFD6" strokeWidth="2" fill="none" />
            <path d="M 140 145 L 150 150 L 140 155" stroke="#8FAFD6" strokeWidth="2" fill="none" />
            
            {/* Router */}
            <circle cx="200" cy="150" r="35" fill="none" stroke="#8FAFD6" strokeWidth="2" />
            <text x="200" y="145" fill="#8FAFD6" fontSize="12" fontFamily="monospace" textAnchor="middle">Router</text>
            <text x="200" y="160" fill="#8FAFD6" fontSize="11" fontFamily="monospace" textAnchor="middle">Encoder</text>
            
            {/* Three model options */}
            <path d="M 235 130 L 280 80" stroke="#8FAFD6" strokeWidth="1.5" opacity="0.8" />
            <circle cx="300" cy="60" r="25" fill="none" stroke="#8FAFD6" strokeWidth="1.5" opacity="0.7" />
            <text x="300" y="65" fill="#8FAFD6" fontSize="10" fontFamily="monospace" textAnchor="middle">LLM₁</text>
            
            <path d="M 235 150 L 280 150" stroke="#8FAFD6" strokeWidth="2" />
            <circle cx="300" cy="150" r="25" fill="rgba(143, 175, 214, 0.2)" stroke="#8FAFD6" strokeWidth="2" />
            <text x="300" y="155" fill="#8FAFD6" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">LLM₂</text>
            <text x="300" y="185" fill="#8FAFD6" fontSize="9" fontFamily="monospace" textAnchor="middle" opacity="0.7">Selected</text>
            
            <path d="M 235 170 L 280 220" stroke="#8FAFD6" strokeWidth="1.5" opacity="0.8" />
            <circle cx="300" cy="240" r="25" fill="none" stroke="#8FAFD6" strokeWidth="1.5" opacity="0.7" />
            <text x="300" y="245" fill="#8FAFD6" fontSize="10" fontFamily="monospace" textAnchor="middle">LLM₃</text>
            
            {/* Cost indicator */}
            <text x="200" y="220" fill="#8FAFD6" fontSize="11" fontFamily="monospace" textAnchor="middle" opacity="0.7">Min Cost, Target Accuracy</text>
          </svg>
        )
      
      case 10: // Interpretation Shifts
        return (
          <svg viewBox="0 0 400 300" className={className}>
            {/* Input image */}
            <rect x="30" y="100" width="80" height="100" fill="none" stroke="#8FAFD6" strokeWidth="1.5" opacity="0.7" />
            <text x="70" y="150" fill="#8FAFD6" fontSize="11" fontFamily="monospace" textAnchor="middle">Image</text>
            <text x="70" y="170" fill="#8FAFD6" fontSize="11" fontFamily="monospace" textAnchor="middle">(OOD)</text>
            
            {/* Arrow */}
            <path d="M 120 150 L 160 150" stroke="#8FAFD6" strokeWidth="2" fill="none" />
            <path d="M 150 145 L 160 150 L 150 155" stroke="#8FAFD6" strokeWidth="2" fill="none" />
            
            {/* Model */}
            <rect x="170" y="120" width="60" height="60" fill="none" stroke="#8FAFD6" strokeWidth="2" />
            <text x="200" y="145" fill="#8FAFD6" fontSize="11" fontFamily="monospace" textAnchor="middle">ViT</text>
            <text x="200" y="165" fill="#8FAFD6" fontSize="11" fontFamily="monospace" textAnchor="middle">ResNet</text>
            
            {/* Arrow */}
            <path d="M 240 150 L 280 150" stroke="#8FAFD6" strokeWidth="2" fill="none" />
            <path d="M 270 145 L 280 150 L 270 155" stroke="#8FAFD6" strokeWidth="2" fill="none" />
            
            {/* Attribution methods */}
            <g opacity="0.7">
              <rect x="290" y="80" width="80" height="40" fill="none" stroke="#8FAFD6" strokeWidth="1" strokeDasharray="2,2" />
              <text x="330" y="100" fill="#8FAFD6" fontSize="9" fontFamily="monospace" textAnchor="middle">Saliency</text>
              
              <rect x="290" y="130" width="80" height="40" fill="none" stroke="#8FAFD6" strokeWidth="1" strokeDasharray="2,2" />
              <text x="330" y="150" fill="#8FAFD6" fontSize="9" fontFamily="monospace" textAnchor="middle">Grad-CAM</text>
              
              <rect x="290" y="180" width="80" height="40" fill="none" stroke="#8FAFD6" strokeWidth="1" strokeDasharray="2,2" />
              <text x="330" y="200" fill="#8FAFD6" fontSize="9" fontFamily="monospace" textAnchor="middle">IG</text>
            </g>
            
            {/* Robustness indicator */}
            <text x="200" y="240" fill="#8FAFD6" fontSize="11" fontFamily="monospace" textAnchor="middle" opacity="0.7">Attribution Robustness</text>
          </svg>
        )
      
      case 5: // ASOFI: AI for Agriculture
        return (
          <svg viewBox="0 0 400 300" className={className}>
            {/* Plant/leaf shape */}
            <ellipse cx="100" cy="120" rx="30" ry="50" fill="rgba(143, 175, 214, 0.2)" stroke="#8FAFD6" strokeWidth="1.5" />
            <path d="M 100 70 Q 85 100 100 120 Q 115 100 100 70" fill="rgba(143, 175, 214, 0.15)" stroke="#8FAFD6" strokeWidth="1" />
            
            {/* Disease spot */}
            <circle cx="110" cy="110" r="8" fill="#8FAFD6" opacity="0.8" />
            <text x="100" y="190" fill="#8FAFD6" fontSize="11" fontFamily="monospace" textAnchor="middle">Cacao</text>
            <text x="100" y="205" fill="#8FAFD6" fontSize="11" fontFamily="monospace" textAnchor="middle">Leaf</text>
            
            {/* Arrow */}
            <path d="M 140 150 L 200 150" stroke="#8FAFD6" strokeWidth="2" fill="none" />
            <path d="M 190 145 L 200 150 L 190 155" stroke="#8FAFD6" strokeWidth="2" fill="none" />
            
            {/* Mobile device */}
            <rect x="220" y="100" width="50" height="100" rx="5" fill="none" stroke="#8FAFD6" strokeWidth="2" />
            <rect x="225" y="110" width="40" height="60" fill="rgba(143, 175, 214, 0.1)" />
            <circle cx="245" cy="180" r="4" fill="#8FAFD6" opacity="0.7" />
            <text x="245" y="210" fill="#8FAFD6" fontSize="10" fontFamily="monospace" textAnchor="middle">MobileNet</text>
            
            {/* Arrow */}
            <path d="M 280 150 L 320 150" stroke="#8FAFD6" strokeWidth="2" fill="none" />
            <path d="M 310 145 L 320 150 L 310 155" stroke="#8FAFD6" strokeWidth="2" fill="none" />
            
            {/* Output */}
            <rect x="330" y="120" width="50" height="60" fill="rgba(143, 175, 214, 0.2)" stroke="#8FAFD6" strokeWidth="1.5" />
            <text x="355" y="145" fill="#8FAFD6" fontSize="10" fontFamily="monospace" textAnchor="middle">Disease</text>
            <text x="355" y="160" fill="#8FAFD6" fontSize="10" fontFamily="monospace" textAnchor="middle">Detected</text>
            <text x="355" y="175" fill="#8FAFD6" fontSize="9" fontFamily="monospace" textAnchor="middle" opacity="0.8">+18% yield</text>
          </svg>
        )
      
      case 9: // Safe Convex RL
        return (
          <svg viewBox="0 0 400 300" className={className}>
            {/* Agent */}
            <circle cx="100" cy="150" r="30" fill="none" stroke="#8FAFD6" strokeWidth="2" />
            <text x="100" y="150" fill="#8FAFD6" fontSize="12" fontFamily="monospace" textAnchor="middle">Agent</text>
            
            {/* Action arrow */}
            <path d="M 140 150 L 200 150" stroke="#8FAFD6" strokeWidth="2" fill="none" />
            <path d="M 190 145 L 200 150 L 190 155" stroke="#8FAFD6" strokeWidth="2" fill="none" />
            
            {/* Environment with safety constraint */}
            <rect x="220" y="100" width="100" height="100" fill="none" stroke="#8FAFD6" strokeWidth="2" />
            <text x="270" y="130" fill="#8FAFD6" fontSize="11" fontFamily="monospace" textAnchor="middle">Environment</text>
            
            {/* Safety boundary */}
            <ellipse cx="270" cy="150" rx="40" ry="30" fill="none" stroke="#8FAFD6" strokeWidth="1.5" strokeDasharray="3,3" opacity="0.8" />
            <text x="270" y="155" fill="#8FAFD6" fontSize="10" fontFamily="monospace" textAnchor="middle" opacity="0.7">Safe</text>
            
            {/* Reward indicator */}
            <path d="M 270 80 L 270 100" stroke="#8FAFD6" strokeWidth="1.5" />
            <text x="280" y="90" fill="#8FAFD6" fontSize="10" fontFamily="monospace">Reward</text>
            
            {/* Constraint indicator */}
            <text x="270" y="230" fill="#8FAFD6" fontSize="11" fontFamily="monospace" textAnchor="middle" opacity="0.7">Primal-Dual</text>
            <text x="270" y="245" fill="#8FAFD6" fontSize="10" fontFamily="monospace" textAnchor="middle" opacity="0.8">O(1/√K) regret</text>
          </svg>
        )
      
      case 2: // Transformer Generalization Limits (Microsoft)
        return (
          <svg viewBox="0 0 400 300" className={className}>
            {/* Email input */}
            <rect x="30" y="100" width="100" height="80" fill="none" stroke="#8FAFD6" strokeWidth="1.5" opacity="0.7" />
            <text x="80" y="130" fill="#8FAFD6" fontSize="11" fontFamily="monospace" textAnchor="middle">Email</text>
            <text x="80" y="150" fill="#8FAFD6" fontSize="11" fontFamily="monospace" textAnchor="middle">Reply</text>
            <text x="80" y="170" fill="#8FAFD6" fontSize="10" fontFamily="monospace" textAnchor="middle" opacity="0.7">(Weak Signal)</text>
            
            {/* Arrow */}
            <path d="M 140 140 L 180 140" stroke="#8FAFD6" strokeWidth="2" fill="none" />
            <path d="M 170 135 L 180 140 L 170 145" stroke="#8FAFD6" strokeWidth="2" fill="none" />
            
            {/* Transformer model */}
            <rect x="190" y="100" width="80" height="80" fill="none" stroke="#8FAFD6" strokeWidth="2" />
            <text x="230" y="130" fill="#8FAFD6" fontSize="12" fontFamily="monospace" textAnchor="middle">Transformer</text>
            <text x="230" y="150" fill="#8FAFD6" fontSize="10" fontFamily="monospace" textAnchor="middle" opacity="0.7">Disentangle</text>
            <text x="230" y="165" fill="#8FAFD6" fontSize="10" fontFamily="monospace" textAnchor="middle" opacity="0.7">Metadata</text>
            
            {/* Arrow */}
            <path d="M 280 140 L 320 140" stroke="#8FAFD6" strokeWidth="2" fill="none" />
            <path d="M 310 135 L 320 140 L 310 145" stroke="#8FAFD6" strokeWidth="2" fill="none" />
            
            {/* AUC ceiling / limit */}
            <rect x="330" y="100" width="50" height="80" fill="rgba(143, 175, 214, 0.2)" stroke="#8FAFD6" strokeWidth="1.5" />
            <text x="355" y="130" fill="#8FAFD6" fontSize="11" fontFamily="monospace" textAnchor="middle">AUC</text>
            <text x="355" y="150" fill="#8FAFD6" fontSize="11" fontFamily="monospace" textAnchor="middle">Ceiling</text>
            <text x="355" y="170" fill="#8FAFD6" fontSize="9" fontFamily="monospace" textAnchor="middle" opacity="0.7">Near-chance</text>
            
            {/* Information-theoretic indicator */}
            <text x="230" y="220" fill="#8FAFD6" fontSize="11" fontFamily="monospace" textAnchor="middle" opacity="0.7">Information-Theoretic Limits</text>
          </svg>
        )
      
      case 1: // AI Cybersecurity & Evaluation Robustness
        return (
          <svg viewBox="0 0 400 300" className={className}>
            {/* Cyber agent */}
            <circle cx="80" cy="150" r="35" fill="none" stroke="#8FAFD6" strokeWidth="2" />
            <text x="80" y="145" fill="#8FAFD6" fontSize="11" fontFamily="monospace" textAnchor="middle">Cyber</text>
            <text x="80" y="160" fill="#8FAFD6" fontSize="11" fontFamily="monospace" textAnchor="middle">Agent</text>
            
            {/* Arrow */}
            <path d="M 125 150 L 165 150" stroke="#8FAFD6" strokeWidth="2" fill="none" />
            <path d="M 155 145 L 165 150 L 155 155" stroke="#8FAFD6" strokeWidth="2" fill="none" />
            
            {/* CyberBench framework */}
            <rect x="175" y="100" width="100" height="100" fill="none" stroke="#8FAFD6" strokeWidth="2" />
            <text x="225" y="130" fill="#8FAFD6" fontSize="12" fontFamily="monospace" textAnchor="middle">CyberBench</text>
            <text x="225" y="150" fill="#8FAFD6" fontSize="10" fontFamily="monospace" textAnchor="middle" opacity="0.7">Benchmarking</text>
            <text x="225" y="170" fill="#8FAFD6" fontSize="10" fontFamily="monospace" textAnchor="middle" opacity="0.7">Framework</text>
            
            {/* Evaluation metrics */}
            <g opacity="0.7">
              <rect x="290" y="80" width="80" height="50" fill="none" stroke="#8FAFD6" strokeWidth="1" strokeDasharray="2,2" />
              <text x="330" y="105" fill="#8FAFD6" fontSize="10" fontFamily="monospace" textAnchor="middle">Robustness</text>
              
              <rect x="290" y="140" width="80" height="50" fill="none" stroke="#8FAFD6" strokeWidth="1" strokeDasharray="2,2" />
              <text x="330" y="165" fill="#8FAFD6" fontSize="10" fontFamily="monospace" textAnchor="middle">Safety</text>
              
              <rect x="290" y="200" width="80" height="50" fill="none" stroke="#8FAFD6" strokeWidth="1" strokeDasharray="2,2" />
              <text x="330" y="225" fill="#8FAFD6" fontSize="10" fontFamily="monospace" textAnchor="middle">Evaluation</text>
            </g>
            
            {/* Extension indicator */}
            <text x="225" y="240" fill="#8FAFD6" fontSize="11" fontFamily="monospace" textAnchor="middle" opacity="0.7">Extended Evaluation Framework</text>
          </svg>
        )
      
      case 6: // Browser-Native Latent-Code Video
        return (
          <svg viewBox="0 0 400 300" className={className}>
            {/* Video frames input */}
            <rect x="20" y="100" width="80" height="100" fill="none" stroke="#8FAFD6" strokeWidth="1.5" opacity="0.7" />
            <rect x="25" y="105" width="70" height="20" fill="rgba(143, 175, 214, 0.1)" />
            <rect x="25" y="130" width="70" height="20" fill="rgba(143, 175, 214, 0.1)" />
            <rect x="25" y="155" width="70" height="20" fill="rgba(143, 175, 214, 0.1)" />
            <text x="60" y="215" fill="#8FAFD6" fontSize="10" fontFamily="monospace" textAnchor="middle">Video</text>
            <text x="60" y="230" fill="#8FAFD6" fontSize="10" fontFamily="monospace" textAnchor="middle">H.264/VP9</text>
            
            {/* Arrow */}
            <path d="M 110 150 L 150 150" stroke="#8FAFD6" strokeWidth="2" fill="none" />
            <path d="M 140 145 L 150 150 L 140 155" stroke="#8FAFD6" strokeWidth="2" fill="none" />
            
            {/* Latent code compression */}
            <rect x="160" y="110" width="80" height="80" fill="none" stroke="#8FAFD6" strokeWidth="2" />
            <text x="200" y="135" fill="#8FAFD6" fontSize="11" fontFamily="monospace" textAnchor="middle">Latent</text>
            <text x="200" y="155" fill="#8FAFD6" fontSize="11" fontFamily="monospace" textAnchor="middle">Code</text>
            <text x="200" y="175" fill="#8FAFD6" fontSize="10" fontFamily="monospace" textAnchor="middle" opacity="0.7">ONNX Runtime</text>
            
            {/* Arrow */}
            <path d="M 250 150 L 290 150" stroke="#8FAFD6" strokeWidth="2" fill="none" />
            <path d="M 280 145 L 290 150 L 280 155" stroke="#8FAFD6" strokeWidth="2" fill="none" />
            
            {/* Compressed output */}
            <rect x="300" y="120" width="60" height="60" fill="rgba(143, 175, 214, 0.2)" stroke="#8FAFD6" strokeWidth="1.5" />
            <text x="330" y="145" fill="#8FAFD6" fontSize="10" fontFamily="monospace" textAnchor="middle">&lt;15 kbps</text>
            <text x="330" y="165" fill="#8FAFD6" fontSize="9" fontFamily="monospace" textAnchor="middle" opacity="0.8">100-500×</text>
            <text x="330" y="190" fill="#8FAFD6" fontSize="9" fontFamily="monospace" textAnchor="middle" opacity="0.7">WebRTC</text>
            
            {/* Compression indicator */}
            <text x="200" y="220" fill="#8FAFD6" fontSize="11" fontFamily="monospace" textAnchor="middle" opacity="0.7">Ultra-Low Bitrate</text>
          </svg>
        )
      
      case 7: // COVID-19 Detection from Cough
        return (
          <svg viewBox="0 0 400 300" className={className}>
            {/* Audio waveform / cough input */}
            <path d="M 30 150 L 50 140 L 70 160 L 90 130 L 110 170 L 130 120 L 150 150" 
                  stroke="#8FAFD6" strokeWidth="2" fill="none" opacity="0.7" />
            <text x="90" y="190" fill="#8FAFD6" fontSize="11" fontFamily="monospace" textAnchor="middle">Cough</text>
            <text x="90" y="205" fill="#8FAFD6" fontSize="10" fontFamily="monospace" textAnchor="middle" opacity="0.7">~30k samples</text>
            
            {/* Arrow */}
            <path d="M 160 150 L 200 150" stroke="#8FAFD6" strokeWidth="2" fill="none" />
            <path d="M 190 145 L 200 150 L 190 155" stroke="#8FAFD6" strokeWidth="2" fill="none" />
            
            {/* CNN/SSL model */}
            <rect x="210" y="110" width="80" height="80" fill="none" stroke="#8FAFD6" strokeWidth="2" />
            <text x="250" y="135" fill="#8FAFD6" fontSize="11" fontFamily="monospace" textAnchor="middle">CNN</text>
            <text x="250" y="155" fill="#8FAFD6" fontSize="11" fontFamily="monospace" textAnchor="middle">SSL</text>
            <text x="250" y="175" fill="#8FAFD6" fontSize="10" fontFamily="monospace" textAnchor="middle" opacity="0.7">Active Learning</text>
            
            {/* Arrow */}
            <path d="M 300 150 L 340 150" stroke="#8FAFD6" strokeWidth="2" fill="none" />
            <path d="M 330 145 L 340 150 L 330 155" stroke="#8FAFD6" strokeWidth="2" fill="none" />
            
            {/* Detection output */}
            <rect x="350" y="120" width="40" height="60" fill="rgba(143, 175, 214, 0.2)" stroke="#8FAFD6" strokeWidth="1.5" />
            <text x="370" y="145" fill="#8FAFD6" fontSize="10" fontFamily="monospace" textAnchor="middle">AUC</text>
            <text x="370" y="160" fill="#8FAFD6" fontSize="11" fontFamily="monospace" textAnchor="middle">0.807</text>
            <text x="370" y="175" fill="#8FAFD6" fontSize="9" fontFamily="monospace" textAnchor="middle" opacity="0.7">COVID-19</text>
            
            {/* Hospital deployment indicator */}
            <text x="250" y="220" fill="#8FAFD6" fontSize="11" fontFamily="monospace" textAnchor="middle" opacity="0.7">Hospital Deployment</text>
          </svg>
        )
      
      case 12: {
        // Schematic after Fig. 1: parity probe (encoder) vs sequence accuracy; shadow knowledge gap (arxiv:2604.13082)
        const plot = { L: 54, R: 356, T: 58, B: 204 }
        const tMax = 88
        const xOf = (t) => plot.L + (t / tMax) * (plot.R - plot.L)
        const yOf = (acc) => plot.B - acc * (plot.B - plot.T)
        const line = (pairs) =>
          pairs.map(([t, a], i) => `${i === 0 ? 'M' : 'L'} ${xOf(t).toFixed(1)} ${yOf(a).toFixed(1)}`).join(' ')
        const parityProbe = [
          [0, 0.1],
          [1.2, 0.62],
          [2.2, 0.97],
          [88, 0.996],
        ]
        const outputOverall = [
          [0, 0.06],
          [16, 0.28],
          [34, 0.34],
          [40, 0.38],
          [44, 0.42],
          [48, 0.74],
          [58, 0.84],
          [88, 0.91],
        ]
        const evenBranch = [
          [0, 0.08],
          [34, 0.44],
          [46, 0.72],
          [88, 0.93],
        ]
        const oddBranch = [
          [0, 0.05],
          [34, 0.22],
          [46, 0.56],
          [88, 0.82],
        ]
        const gapX0 = 2.2
        const gapX1 = 43
        const gx0 = xOf(gapX0)
        const gx1 = xOf(gapX1)
        return (
          <svg viewBox="0 0 400 300" className={className}>
            <rect width="400" height="300" fill="rgba(8,10,14,0.35)" />
            <text x="200" y="26" fill="#8FAFD6" fontSize="10" fontFamily="monospace" textAnchor="middle" opacity="0.9">
              Fig. 1 · one-step Collatz · base 8 · encoder vs output (schematic)
            </text>

            {/* Shadow-knowledge band: probe already high while outputs stay low */}
            <polygon
              points={`${gx0},${yOf(0.98)} ${gx1},${yOf(0.98)} ${gx1},${yOf(0.34)} ${gx0},${yOf(0.34)}`}
              fill="rgba(143,175,214,0.14)"
              stroke="none"
            />
            <text x={(gx0 + gx1) / 2} y={yOf(0.66)} fill="#8FAFD6" fontSize="8" fontFamily="monospace" textAnchor="middle" opacity="0.55">
              shadow gap
            </text>

            {/* Faint grid */}
            {[0.2, 0.4, 0.6, 0.8].map((a) => (
              <line
                key={a}
                x1={plot.L}
                y1={yOf(a)}
                x2={plot.R}
                y2={yOf(a)}
                stroke="#8FAFD6"
                strokeWidth="0.55"
                opacity="0.1"
              />
            ))}

            <line x1={plot.L} y1={plot.B} x2={plot.R} y2={plot.B} stroke="#8FAFD6" strokeWidth="1.15" opacity="0.55" />
            <line x1={plot.L} y1={plot.T} x2={plot.L} y2={plot.B} stroke="#8FAFD6" strokeWidth="1.15" opacity="0.55" />

            {/* Branch curves under overall */}
            <path
              d={line(oddBranch)}
              fill="none"
              stroke="#8FAFD6"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.38"
              strokeDasharray="4 4"
            />
            <path
              d={line(evenBranch)}
              fill="none"
              stroke="#8FAFD6"
              strokeWidth="1.6"
              strokeLinecap="round"
              opacity="0.48"
              strokeDasharray="3 2"
            />

            <path
              d={line(outputOverall)}
              fill="none"
              stroke="#B8D4F0"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.92"
            />
            <path
              d={line(parityProbe)}
              fill="none"
              stroke="#8FAFD6"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.88"
            />

            {/* X ticks */}
            {[0, 20, 40, 60, 80].map((t) => (
              <g key={t}>
                <line x1={xOf(t)} y1={plot.B} x2={xOf(t)} y2={plot.B + 4} stroke="#8FAFD6" strokeWidth="1" opacity="0.4" />
                <text
                  x={xOf(t)}
                  y={plot.B + 17}
                  fill="#8FAFD6"
                  fontSize="7.5"
                  fontFamily="monospace"
                  textAnchor="middle"
                  opacity="0.5"
                >
                  {t}
                </text>
              </g>
            ))}
            <text
              x={(plot.L + plot.R) / 2}
              y={232}
              fill="#8FAFD6"
              fontSize="9"
              fontFamily="monospace"
              textAnchor="middle"
              opacity="0.58"
            >
              training steps (×10³)
            </text>

            {/* Y ticks */}
            {[0, 0.5, 1].map((a) => (
              <text
                key={a}
                x={plot.L - 8}
                y={yOf(a) + 3}
                fill="#8FAFD6"
                fontSize="7.5"
                fontFamily="monospace"
                textAnchor="end"
                opacity="0.45"
              >
                {a.toFixed(1)}
              </text>
            ))}
            <text
              x="16"
              y="134"
              fill="#8FAFD6"
              fontSize="8"
              fontFamily="monospace"
              textAnchor="middle"
              opacity="0.48"
              transform="rotate(-90 16 134)"
            >
              accuracy
            </text>

            {/* Legend */}
            <g transform="translate(214,72)">
              <line x1="0" y1="5" x2="22" y2="5" stroke="#8FAFD6" strokeWidth="2.2" />
              <text x="28" y="9" fill="#8FAFD6" fontSize="8" fontFamily="monospace" opacity="0.82">
                parity probe (encoder)
              </text>
              <line x1="0" y1="21" x2="22" y2="21" stroke="#B8D4F0" strokeWidth="2.8" />
              <text x="28" y="25" fill="#B8D4F0" fontSize="8" fontFamily="monospace" opacity="0.88">
                seq accuracy (overall)
              </text>
              <line x1="0" y1="37" x2="22" y2="37" stroke="#8FAFD6" strokeWidth="1.6" strokeDasharray="3 2" opacity="0.5" />
              <text x="28" y="41" fill="#8FAFD6" fontSize="8" fontFamily="monospace" opacity="0.58">
                even / odd branch
              </text>
            </g>

            <text x="200" y="286" fill="#8FAFD6" fontSize="8" fontFamily="monospace" textAnchor="middle" opacity="0.46">
              Decoder bottleneck · 15-base inductive bias · arXiv:2604.13082
            </text>
          </svg>
        )
      }

      case 8: // Clinical-Note LLM Pipeline
        return (
          <svg viewBox="0 0 400 300" className={className}>
            {/* Clinical notes input */}
            <rect x="20" y="100" width="100" height="100" fill="none" stroke="#8FAFD6" strokeWidth="1.5" opacity="0.7" />
            <text x="70" y="130" fill="#8FAFD6" fontSize="11" fontFamily="monospace" textAnchor="middle">Clinical</text>
            <text x="70" y="150" fill="#8FAFD6" fontSize="11" fontFamily="monospace" textAnchor="middle">Notes</text>
            <text x="70" y="170" fill="#8FAFD6" fontSize="10" fontFamily="monospace" textAnchor="middle" opacity="0.7">Input</text>
            
            {/* Arrow */}
            <path d="M 130 150 L 170 150" stroke="#8FAFD6" strokeWidth="2" fill="none" />
            <path d="M 160 145 L 170 150 L 160 155" stroke="#8FAFD6" strokeWidth="2" fill="none" />
            
            {/* LLM pipeline */}
            <rect x="180" y="100" width="100" height="100" fill="none" stroke="#8FAFD6" strokeWidth="2" />
            <text x="230" y="125" fill="#8FAFD6" fontSize="11" fontFamily="monospace" textAnchor="middle">LLaMA-3</text>
            <text x="230" y="145" fill="#8FAFD6" fontSize="10" fontFamily="monospace" textAnchor="middle" opacity="0.7">QLoRA</text>
            <text x="230" y="160" fill="#8FAFD6" fontSize="10" fontFamily="monospace" textAnchor="middle" opacity="0.7">+ RAG</text>
            <text x="230" y="175" fill="#8FAFD6" fontSize="10" fontFamily="monospace" textAnchor="middle" opacity="0.7">+ DPO</text>
            <text x="230" y="190" fill="#8FAFD6" fontSize="9" fontFamily="monospace" textAnchor="middle" opacity="0.8">Quantization</text>
            
            {/* Arrow */}
            <path d="M 290 150 L 330 150" stroke="#8FAFD6" strokeWidth="2" fill="none" />
            <path d="M 320 145 L 330 150 L 320 155" stroke="#8FAFD6" strokeWidth="2" fill="none" />
            
            {/* Improved notes output */}
            <rect x="340" y="110" width="50" height="80" fill="rgba(143, 175, 214, 0.2)" stroke="#8FAFD6" strokeWidth="1.5" />
            <text x="365" y="135" fill="#8FAFD6" fontSize="10" fontFamily="monospace" textAnchor="middle">ROUGE-1</text>
            <text x="365" y="155" fill="#8FAFD6" fontSize="11" fontFamily="monospace" textAnchor="middle">0.48</text>
            <text x="365" y="175" fill="#8FAFD6" fontSize="9" fontFamily="monospace" textAnchor="middle" opacity="0.7">Quality</text>
            
            {/* Improvement indicator */}
            <text x="230" y="230" fill="#8FAFD6" fontSize="11" fontFamily="monospace" textAnchor="middle" opacity="0.7">0.25 → 0.48 Improvement</text>
          </svg>
        )
      
      case 13: {
        // Schematic of Fig. 1(a): validation loss vs step; LLaMA 320M, matched rank r=384 (paper)
        const plot = { L: 56, R: 382, T: 54, B: 212 }
        const sMin = 4480
        const sMax = 6020
        const lossMin = 3.274
        const lossMax = 3.341
        const xOf = (step) => plot.L + ((step - sMin) / (sMax - sMin)) * (plot.R - plot.L)
        const yOf = (loss) => plot.T + ((lossMax - loss) / (lossMax - lossMin)) * (plot.B - plot.T)
        const toPath = (pairs) =>
          pairs.map(([s, lv], i) => `${i === 0 ? 'M' : 'L'} ${xOf(s).toFixed(1)} ${yOf(lv).toFixed(1)}`).join(' ')
        const dion = [
          [4520, 3.338],
          [4700, 3.334],
          [4950, 3.331],
          [5200, 3.328],
          [5580, 3.326],
          [5980, 3.324],
        ]
        const orth = [
          [4520, 3.336],
          [4700, 3.328],
          [4950, 3.318],
          [5200, 3.308],
          [5580, 3.298],
          [5980, 3.289],
        ]
        const ada = [
          [4520, 3.334],
          [4700, 3.322],
          [4950, 3.306],
          [5200, 3.294],
          [5580, 3.284],
          [5980, 3.276],
        ]
        return (
          <svg viewBox="0 0 400 300" className={className}>
            <rect width="400" height="300" fill="rgba(8,10,14,0.35)" />
            <text x="200" y="26" fill="#8FAFD6" fontSize="10.5" fontFamily="monospace" textAnchor="middle" opacity="0.9">
              Fig. 1(a) · validation loss vs step · matched rank r = 384
            </text>
            <text x="200" y="42" fill="#8FAFD6" fontSize="8.5" fontFamily="monospace" textAnchor="middle" opacity="0.52">
              LLaMA 320M late-stage (schematic after paper curves)
            </text>

            {/* Plot frame */}
            <line x1={plot.L} y1={plot.B} x2={plot.R} y2={plot.B} stroke="#8FAFD6" strokeWidth="1.2" opacity="0.65" />
            <line x1={plot.L} y1={plot.T} x2={plot.L} y2={plot.B} stroke="#8FAFD6" strokeWidth="1.2" opacity="0.65" />

            {/* Horizontal grid lines */}
            {[3.28, 3.30, 3.32, 3.34].map((lv) => (
              <line
                key={lv}
                x1={plot.L}
                y1={yOf(lv)}
                x2={plot.R}
                y2={yOf(lv)}
                stroke="#8FAFD6"
                strokeWidth="0.6"
                opacity="0.12"
              />
            ))}

            {/* Curves */}
            <path
              d={toPath(dion)}
              fill="none"
              stroke="#8FAFD6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.42"
              strokeDasharray="6 4"
            />
            <path
              d={toPath(orth)}
              fill="none"
              stroke="#8FAFD6"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.78"
            />
            <path
              d={toPath(ada)}
              fill="none"
              stroke="#B8D4F0"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.95"
            />

            {/* Axis ticks (step) */}
            {[4500, 5000, 5500, 6000].map((s) => (
              <g key={s}>
                <line x1={xOf(s)} y1={plot.B} x2={xOf(s)} y2={plot.B + 5} stroke="#8FAFD6" strokeWidth="1" opacity="0.45" />
                <text
                  x={xOf(s)}
                  y={plot.B + 16}
                  fill="#8FAFD6"
                  fontSize="7.5"
                  fontFamily="monospace"
                  textAnchor="middle"
                  opacity="0.55"
                >
                  {s >= 1000 ? `${s / 1000}k`.replace('.0', '') : s}
                </text>
              </g>
            ))}
            <text
              x={(plot.L + plot.R) / 2}
              y={246}
              fill="#8FAFD6"
              fontSize="9"
              fontFamily="monospace"
              textAnchor="middle"
              opacity="0.62"
            >
              training step
            </text>

            {/* Y-axis tick labels */}
            {[3.28, 3.31, 3.34].map((lv) => (
              <text
                key={lv}
                x={plot.L - 8}
                y={yOf(lv) + 3}
                fill="#8FAFD6"
                fontSize="7.5"
                fontFamily="monospace"
                textAnchor="end"
                opacity="0.5"
              >
                {lv.toFixed(2)}
              </text>
            ))}
            <text
              x="14"
              y={(plot.T + plot.B) / 2}
              fill="#8FAFD6"
              fontSize="8"
              fontFamily="monospace"
              textAnchor="middle"
              opacity="0.52"
              transform={`rotate(-90 14 ${(plot.T + plot.B) / 2})`}
            >
              val loss
            </text>

            {/* Legend */}
            <g transform="translate(232,64)">
              <line x1="0" y1="6" x2="22" y2="6" stroke="#8FAFD6" strokeWidth="2" opacity="0.42" strokeDasharray="6 4" />
              <text x="28" y="10" fill="#8FAFD6" fontSize="8" fontFamily="monospace" opacity="0.72">
                Dion
              </text>
              <line x1="0" y1="22" x2="22" y2="22" stroke="#8FAFD6" strokeWidth="2.4" opacity="0.78" />
              <text x="28" y="26" fill="#8FAFD6" fontSize="8" fontFamily="monospace" opacity="0.82">
                Orth-Dion
              </text>
              <line x1="0" y1="38" x2="22" y2="38" stroke="#B8D4F0" strokeWidth="2.6" opacity="0.95" />
              <text x="28" y="42" fill="#B8D4F0" fontSize="8" fontFamily="monospace" opacity="0.88">
                Ada-Orth-Dion
              </text>
            </g>

            <text x="200" y="286" fill="#8FAFD6" fontSize="8" fontFamily="monospace" textAnchor="middle" opacity="0.48">
              Orth-Dion & Ada close Muon gap at Dion communication · paper Fig. 1
            </text>
          </svg>
        )
      }

      case 14: {
        // Schematic of Table 3(b): GPT-2 31M final validation loss on OWT; G-Scion ablations vs fixed Scion
        const bars = [
          { label: 'Scion', sub: 'fixed mix', loss: 5.516, dashed: true },
          { label: 'G-S', sub: 'output gate', loss: 5.447 },
          { label: 'G-S', sub: 'embed gate', loss: 5.293 },
          { label: 'G-S', sub: 'emb+out', loss: 5.187, best: true },
        ]
        const lossAxisLo = 5.12
        const lossAxisHi = 5.56
        const baseline = 228
        const plotTop = 72
        const maxH = baseline - plotTop - 4
        const barW = 54
        const gap = 22
        const startX = 54
        const barHeight = (loss) => ((loss - lossAxisLo) / (lossAxisHi - lossAxisLo)) * maxH

        return (
          <svg viewBox="0 0 400 300" className={className}>
            <rect width="400" height="300" fill="rgba(8,10,14,0.35)" />
            <text x="200" y="26" fill="#8FAFD6" fontSize="10.5" fontFamily="monospace" textAnchor="middle" opacity="0.9">
              Table 3(b) · final validation loss · GPT-2 31M · OpenWebText
            </text>
            <text x="200" y="42" fill="#8FAFD6" fontSize="8.5" fontFamily="monospace" textAnchor="middle" opacity="0.52">
              G-Scion gates embedding / lm_head by R∞ (schematic bar heights from paper)
            </text>

            {/* Y grid */}
            {[5.2, 5.3, 5.4, 5.5].map((lv) => {
              const y = baseline - ((lv - lossAxisLo) / (lossAxisHi - lossAxisLo)) * maxH
              return (
                <g key={lv}>
                  <line x1="48" y1={y} x2="372" y2={y} stroke="#8FAFD6" strokeWidth="0.6" opacity="0.1" />
                  <text x="42" y={y + 3} fill="#8FAFD6" fontSize="7.5" fontFamily="monospace" textAnchor="end" opacity="0.45">
                    {lv.toFixed(1)}
                  </text>
                </g>
              )
            })}

            <line x1="48" y1={baseline} x2="372" y2={baseline} stroke="#8FAFD6" strokeWidth="1.2" opacity="0.55" />

            {bars.map((b, i) => {
              const x = startX + i * (barW + gap)
              const h = barHeight(b.loss)
              const y = baseline - h
              return (
                <g key={`${b.sub}-${i}`}>
                  <rect
                    x={x}
                    y={y}
                    width={barW}
                    height={h}
                    fill={b.best ? 'rgba(143,175,214,0.28)' : 'rgba(143,175,214,0.08)'}
                    stroke="#8FAFD6"
                    strokeWidth={b.best ? 1.6 : 1}
                    strokeDasharray={b.dashed ? '4 3' : undefined}
                    opacity="0.95"
                    rx="2"
                  />
                  <text
                    x={x + barW / 2}
                    y={y - 6}
                    fill="#8FAFD6"
                    fontSize="8.5"
                    fontFamily="monospace"
                    textAnchor="middle"
                    opacity="0.88"
                  >
                    {b.loss.toFixed(3)}
                  </text>
                  <text
                    x={x + barW / 2}
                    y={baseline + 38}
                    fill="#8FAFD6"
                    fontSize="8"
                    fontFamily="monospace"
                    textAnchor="middle"
                    opacity="0.78"
                  >
                    {b.label}
                  </text>
                  <text
                    x={x + barW / 2}
                    y={baseline + 50}
                    fill="#8FAFD6"
                    fontSize="7"
                    fontFamily="monospace"
                    textAnchor="middle"
                    opacity="0.48"
                  >
                    {b.sub}
                  </text>
                </g>
              )
            })}

            <text x="200" y="284" fill="#8FAFD6" fontSize="8" fontFamily="monospace" textAnchor="middle" opacity="0.48">
              lower is better · embedding gate contributes most of the −0.33 nat vs Scion
            </text>
          </svg>
        )
      }

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

