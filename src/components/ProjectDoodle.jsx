// Simple SVG doodles for each project
const ProjectDoodle = ({ projectId, className = "" }) => {
  const getDoodle = () => {
    switch (projectId) {
      case 4: // High-Dimensional Model Editing for Fairness — boxed-bound research note
        return (
          <svg viewBox="0 0 400 300" className={className}>
            {/* hand-drawn line work wobbles; handwritten text stays crisp */}
            <g filter={`url(#sketch-${projectId})`} fill="none" strokeLinecap="round" strokeLinejoin="round">
              {/* mini task-vector sketch (top-left): base model with two subgroup edits merging */}
              <circle cx="56" cy="106" r="3.2" fill="#33271D" stroke="none" />
              <line x1="56" y1="106" x2="116" y2="66" stroke="#33271D" strokeWidth="1.5" opacity="0.8" />
              <path d="M 116 66 l -10 1.8 M 116 66 l -2 -9.6" stroke="#33271D" strokeWidth="1.3" opacity="0.8" />
              <line x1="56" y1="106" x2="118" y2="116" stroke="#33271D" strokeWidth="1.5" opacity="0.8" />
              <path d="M 118 116 l -10 -1 M 118 116 l -4 -8.8" stroke="#33271D" strokeWidth="1.3" opacity="0.8" />
              <line x1="56" y1="106" x2="114" y2="88" stroke="#9C6B4F" strokeWidth="2.6" opacity="0.95" />
              <path d="M 114 88 l -10 0.6 M 114 88 l -3 -9.2" stroke="#9C6B4F" strokeWidth="1.7" />
              <ellipse cx="116" cy="88" rx="12" ry="8.5" stroke="#9C6B4F" strokeWidth="1.1" opacity="0.8" transform="rotate(-12 116 88)" />
              {/* the box around the key result */}
              <rect x="44" y="150" width="312" height="50" rx="3" stroke="#9C6B4F" strokeWidth="1.9" opacity="0.92" />
              {/* curved arrow from the takeaway up to the |λg − 1| term */}
              <path d="M 150 236 C 140 220, 150 208, 168 201" stroke="#9C6B4F" strokeWidth="1.3" opacity="0.75" />
              <path d="M 168 201 l 0.5 9 M 168 201 l 8.6 3" stroke="#9C6B4F" strokeWidth="1.3" opacity="0.75" />
            </g>

            <text x="200" y="30" fill="#33271D" fontSize="15" fontFamily="'Caveat', cursive" textAnchor="middle" opacity="0.6">merge subgroup edits, each scaled by λ</text>
            <text x="40" y="113" fill="#33271D" fontSize="14" fontFamily="'Caveat', cursive" textAnchor="end" opacity="0.85">θ₀</text>
            <text x="122" y="60" fill="#33271D" fontSize="15" fontFamily="'Caveat', cursive" opacity="0.8">Δθ₁</text>
            <text x="124" y="124" fill="#33271D" fontSize="15" fontFamily="'Caveat', cursive" opacity="0.8">Δθ₂</text>
            <text x="130" y="86" fill="#9C6B4F" fontSize="15" fontFamily="'Caveat', cursive" opacity="0.95">merge</text>

            <text x="200" y="183" fill="#33271D" fontSize="22" fontFamily="'Caveat', cursive" textAnchor="middle" opacity="0.95">
              DPD ≤ 2L Σ |λ<tspan fontSize="14" dy="4">g</tspan><tspan dy="-4"> − 1| ‖Δθ</tspan><tspan fontSize="14" dy="4">g</tspan><tspan dy="-4">‖</tspan>
            </text>

            <text x="206" y="248" fill="#9C6B4F" fontSize="18" fontFamily="'Caveat', cursive" textAnchor="middle" opacity="0.95">
              balanced λ<tspan fontSize="12" dy="3">g</tspan><tspan dy="-3"> ≈ 1  ⟹  gap → 0</tspan>
            </text>
          </svg>
        )
      
      case 11: // Subliminal Preference Transfer
        return (
          <svg viewBox="0 0 400 300" className={className}>
            {/* Left: Neutral conversation input */}
            <rect x="20" y="100" width="120" height="100" fill="none" stroke="#33271D" strokeWidth="1.5" strokeDasharray="4,4" opacity="0.6" />
            <text x="80" y="130" fill="#33271D" fontSize="12" fontFamily="'Caveat', cursive" textAnchor="middle" opacity="0.85">Neutral</text>
            <text x="80" y="150" fill="#33271D" fontSize="12" fontFamily="'Caveat', cursive" textAnchor="middle" opacity="0.85">Conversation</text>
            
            {/* Arrow pointing right */}
            <path d="M 150 150 L 200 150" stroke="#33271D" strokeWidth="2" fill="none" />
            <path d="M 190 145 L 200 150 L 190 155" stroke="#33271D" strokeWidth="2" fill="none" />
            
            {/* Center: Model processing */}
            <circle cx="250" cy="150" r="40" fill="none" stroke="#33271D" strokeWidth="2" opacity="0.75" />
            <text x="250" y="145" fill="#33271D" fontSize="14" fontFamily="'Caveat', cursive" textAnchor="middle">LLM</text>
            <text x="250" y="160" fill="#33271D" fontSize="12" fontFamily="'Caveat', cursive" textAnchor="middle">DPO</text>
            
            {/* Arrow pointing right */}
            <path d="M 300 150 L 350 150" stroke="#33271D" strokeWidth="2" fill="none" />
            <path d="M 340 145 L 350 150 L 340 155" stroke="#33271D" strokeWidth="2" fill="none" />
            
            {/* Right: Preference transfer output */}
            <rect x="360" y="100" width="30" height="100" fill="rgba(74, 52, 36, 0.2)" stroke="#33271D" strokeWidth="1.5" />
            <text x="375" y="130" fill="#33271D" fontSize="10" fontFamily="'Caveat', cursive" textAnchor="middle" opacity="0.8">US</text>
            <text x="375" y="150" fill="#33271D" fontSize="10" fontFamily="'Caveat', cursive" textAnchor="middle" opacity="0.8">UK</text>
            <text x="375" y="170" fill="#33271D" fontSize="10" fontFamily="'Caveat', cursive" textAnchor="middle" opacity="0.8">MX</text>
            <text x="375" y="190" fill="#33271D" fontSize="10" fontFamily="'Caveat', cursive" textAnchor="middle" opacity="0.8">CL</text>
            
            {/* Transfer indicator */}
            <text x="250" y="220" fill="#33271D" fontSize="11" fontFamily="'Caveat', cursive" textAnchor="middle" opacity="0.8">Preference Transfer</text>
          </svg>
        )
      
      case 3: // Precision Routing for Multi-LLM Ensembles
        return (
          <svg viewBox="0 0 400 300" className={className}>
            {/* Query input */}
            <rect x="20" y="120" width="80" height="60" fill="none" stroke="#33271D" strokeWidth="1.5" opacity="0.7" />
            <text x="60" y="145" fill="#33271D" fontSize="11" fontFamily="'Caveat', cursive" textAnchor="middle">Query</text>
            <text x="60" y="165" fill="#33271D" fontSize="11" fontFamily="'Caveat', cursive" textAnchor="middle">Difficulty</text>
            
            {/* Arrow */}
            <path d="M 110 150 L 150 150" stroke="#33271D" strokeWidth="2" fill="none" />
            <path d="M 140 145 L 150 150 L 140 155" stroke="#33271D" strokeWidth="2" fill="none" />
            
            {/* Router */}
            <circle cx="200" cy="150" r="35" fill="none" stroke="#33271D" strokeWidth="2" />
            <text x="200" y="145" fill="#33271D" fontSize="12" fontFamily="'Caveat', cursive" textAnchor="middle">Router</text>
            <text x="200" y="160" fill="#33271D" fontSize="11" fontFamily="'Caveat', cursive" textAnchor="middle">Encoder</text>
            
            {/* Three model options */}
            <path d="M 235 130 L 280 80" stroke="#33271D" strokeWidth="1.5" opacity="0.8" />
            <circle cx="300" cy="60" r="25" fill="none" stroke="#33271D" strokeWidth="1.5" opacity="0.7" />
            <text x="300" y="65" fill="#33271D" fontSize="10" fontFamily="'Caveat', cursive" textAnchor="middle">LLM₁</text>
            
            <path d="M 235 150 L 280 150" stroke="#33271D" strokeWidth="2" />
            <circle cx="300" cy="150" r="25" fill="rgba(74, 52, 36, 0.2)" stroke="#33271D" strokeWidth="2" />
            <text x="300" y="155" fill="#33271D" fontSize="10" fontFamily="'Caveat', cursive" textAnchor="middle" fontWeight="bold">LLM₂</text>
            <text x="300" y="185" fill="#33271D" fontSize="9" fontFamily="'Caveat', cursive" textAnchor="middle" opacity="0.7">Selected</text>
            
            <path d="M 235 170 L 280 220" stroke="#33271D" strokeWidth="1.5" opacity="0.8" />
            <circle cx="300" cy="240" r="25" fill="none" stroke="#33271D" strokeWidth="1.5" opacity="0.7" />
            <text x="300" y="245" fill="#33271D" fontSize="10" fontFamily="'Caveat', cursive" textAnchor="middle">LLM₃</text>
            
            {/* Cost indicator */}
            <text x="200" y="220" fill="#33271D" fontSize="11" fontFamily="'Caveat', cursive" textAnchor="middle" opacity="0.7">Min Cost, Target Accuracy</text>
          </svg>
        )
      
      case 10: // Interpretation Shifts
        return (
          <svg viewBox="0 0 400 300" className={className}>
            {/* Input image */}
            <rect x="30" y="100" width="80" height="100" fill="none" stroke="#33271D" strokeWidth="1.5" opacity="0.7" />
            <text x="70" y="150" fill="#33271D" fontSize="11" fontFamily="'Caveat', cursive" textAnchor="middle">Image</text>
            <text x="70" y="170" fill="#33271D" fontSize="11" fontFamily="'Caveat', cursive" textAnchor="middle">(OOD)</text>
            
            {/* Arrow */}
            <path d="M 120 150 L 160 150" stroke="#33271D" strokeWidth="2" fill="none" />
            <path d="M 150 145 L 160 150 L 150 155" stroke="#33271D" strokeWidth="2" fill="none" />
            
            {/* Model */}
            <rect x="170" y="120" width="60" height="60" fill="none" stroke="#33271D" strokeWidth="2" />
            <text x="200" y="145" fill="#33271D" fontSize="11" fontFamily="'Caveat', cursive" textAnchor="middle">ViT</text>
            <text x="200" y="165" fill="#33271D" fontSize="11" fontFamily="'Caveat', cursive" textAnchor="middle">ResNet</text>
            
            {/* Arrow */}
            <path d="M 240 150 L 280 150" stroke="#33271D" strokeWidth="2" fill="none" />
            <path d="M 270 145 L 280 150 L 270 155" stroke="#33271D" strokeWidth="2" fill="none" />
            
            {/* Attribution methods */}
            <g opacity="0.7">
              <rect x="290" y="80" width="80" height="40" fill="none" stroke="#33271D" strokeWidth="1" strokeDasharray="2,2" />
              <text x="330" y="100" fill="#33271D" fontSize="9" fontFamily="'Caveat', cursive" textAnchor="middle">Saliency</text>
              
              <rect x="290" y="130" width="80" height="40" fill="none" stroke="#33271D" strokeWidth="1" strokeDasharray="2,2" />
              <text x="330" y="150" fill="#33271D" fontSize="9" fontFamily="'Caveat', cursive" textAnchor="middle">Grad-CAM</text>
              
              <rect x="290" y="180" width="80" height="40" fill="none" stroke="#33271D" strokeWidth="1" strokeDasharray="2,2" />
              <text x="330" y="200" fill="#33271D" fontSize="9" fontFamily="'Caveat', cursive" textAnchor="middle">IG</text>
            </g>
            
            {/* Robustness indicator */}
            <text x="200" y="240" fill="#33271D" fontSize="11" fontFamily="'Caveat', cursive" textAnchor="middle" opacity="0.7">Attribution Robustness</text>
          </svg>
        )
      
      case 5: // ASOFI: AI for Agriculture
        return (
          <svg viewBox="0 0 400 300" className={className}>
            {/* Plant/leaf shape */}
            <ellipse cx="100" cy="120" rx="30" ry="50" fill="rgba(74, 52, 36, 0.2)" stroke="#33271D" strokeWidth="1.5" />
            <path d="M 100 70 Q 85 100 100 120 Q 115 100 100 70" fill="rgba(74, 52, 36, 0.15)" stroke="#33271D" strokeWidth="1" />
            
            {/* Disease spot */}
            <circle cx="110" cy="110" r="8" fill="#33271D" opacity="0.8" />
            <text x="100" y="190" fill="#33271D" fontSize="11" fontFamily="'Caveat', cursive" textAnchor="middle">Cacao</text>
            <text x="100" y="205" fill="#33271D" fontSize="11" fontFamily="'Caveat', cursive" textAnchor="middle">Leaf</text>
            
            {/* Arrow */}
            <path d="M 140 150 L 200 150" stroke="#33271D" strokeWidth="2" fill="none" />
            <path d="M 190 145 L 200 150 L 190 155" stroke="#33271D" strokeWidth="2" fill="none" />
            
            {/* Mobile device */}
            <rect x="220" y="100" width="50" height="100" rx="5" fill="none" stroke="#33271D" strokeWidth="2" />
            <rect x="225" y="110" width="40" height="60" fill="rgba(74, 52, 36, 0.1)" />
            <circle cx="245" cy="180" r="4" fill="#33271D" opacity="0.7" />
            <text x="245" y="210" fill="#33271D" fontSize="10" fontFamily="'Caveat', cursive" textAnchor="middle">MobileNet</text>
            
            {/* Arrow */}
            <path d="M 280 150 L 320 150" stroke="#33271D" strokeWidth="2" fill="none" />
            <path d="M 310 145 L 320 150 L 310 155" stroke="#33271D" strokeWidth="2" fill="none" />
            
            {/* Output */}
            <rect x="330" y="120" width="50" height="60" fill="rgba(74, 52, 36, 0.2)" stroke="#33271D" strokeWidth="1.5" />
            <text x="355" y="145" fill="#33271D" fontSize="10" fontFamily="'Caveat', cursive" textAnchor="middle">Disease</text>
            <text x="355" y="160" fill="#33271D" fontSize="10" fontFamily="'Caveat', cursive" textAnchor="middle">Detected</text>
            <text x="355" y="175" fill="#33271D" fontSize="9" fontFamily="'Caveat', cursive" textAnchor="middle" opacity="0.8">+18% yield</text>
          </svg>
        )
      
      case 9: // Safe Convex RL
        return (
          <svg viewBox="0 0 400 300" className={className}>
            {/* Agent */}
            <circle cx="100" cy="150" r="30" fill="none" stroke="#33271D" strokeWidth="2" />
            <text x="100" y="150" fill="#33271D" fontSize="12" fontFamily="'Caveat', cursive" textAnchor="middle">Agent</text>
            
            {/* Action arrow */}
            <path d="M 140 150 L 200 150" stroke="#33271D" strokeWidth="2" fill="none" />
            <path d="M 190 145 L 200 150 L 190 155" stroke="#33271D" strokeWidth="2" fill="none" />
            
            {/* Environment with safety constraint */}
            <rect x="220" y="100" width="100" height="100" fill="none" stroke="#33271D" strokeWidth="2" />
            <text x="270" y="130" fill="#33271D" fontSize="11" fontFamily="'Caveat', cursive" textAnchor="middle">Environment</text>
            
            {/* Safety boundary */}
            <ellipse cx="270" cy="150" rx="40" ry="30" fill="none" stroke="#33271D" strokeWidth="1.5" strokeDasharray="3,3" opacity="0.8" />
            <text x="270" y="155" fill="#33271D" fontSize="10" fontFamily="'Caveat', cursive" textAnchor="middle" opacity="0.7">Safe</text>
            
            {/* Reward indicator */}
            <path d="M 270 80 L 270 100" stroke="#33271D" strokeWidth="1.5" />
            <text x="280" y="90" fill="#33271D" fontSize="10" fontFamily="'Caveat', cursive">Reward</text>
            
            {/* Constraint indicator */}
            <text x="270" y="230" fill="#33271D" fontSize="11" fontFamily="'Caveat', cursive" textAnchor="middle" opacity="0.7">Primal-Dual</text>
            <text x="270" y="245" fill="#33271D" fontSize="10" fontFamily="'Caveat', cursive" textAnchor="middle" opacity="0.8">O(1/√K) regret</text>
          </svg>
        )
      
      case 2: // Transformer Generalization Limits (Microsoft)
        return (
          <svg viewBox="0 0 400 300" className={className}>
            {/* Email input */}
            <rect x="30" y="100" width="100" height="80" fill="none" stroke="#33271D" strokeWidth="1.5" opacity="0.7" />
            <text x="80" y="130" fill="#33271D" fontSize="11" fontFamily="'Caveat', cursive" textAnchor="middle">Email</text>
            <text x="80" y="150" fill="#33271D" fontSize="11" fontFamily="'Caveat', cursive" textAnchor="middle">Reply</text>
            <text x="80" y="170" fill="#33271D" fontSize="10" fontFamily="'Caveat', cursive" textAnchor="middle" opacity="0.7">(Weak Signal)</text>
            
            {/* Arrow */}
            <path d="M 140 140 L 180 140" stroke="#33271D" strokeWidth="2" fill="none" />
            <path d="M 170 135 L 180 140 L 170 145" stroke="#33271D" strokeWidth="2" fill="none" />
            
            {/* Transformer model */}
            <rect x="190" y="100" width="80" height="80" fill="none" stroke="#33271D" strokeWidth="2" />
            <text x="230" y="130" fill="#33271D" fontSize="12" fontFamily="'Caveat', cursive" textAnchor="middle">Transformer</text>
            <text x="230" y="150" fill="#33271D" fontSize="10" fontFamily="'Caveat', cursive" textAnchor="middle" opacity="0.7">Disentangle</text>
            <text x="230" y="165" fill="#33271D" fontSize="10" fontFamily="'Caveat', cursive" textAnchor="middle" opacity="0.7">Metadata</text>
            
            {/* Arrow */}
            <path d="M 280 140 L 320 140" stroke="#33271D" strokeWidth="2" fill="none" />
            <path d="M 310 135 L 320 140 L 310 145" stroke="#33271D" strokeWidth="2" fill="none" />
            
            {/* AUC ceiling / limit */}
            <rect x="330" y="100" width="50" height="80" fill="rgba(74, 52, 36, 0.2)" stroke="#33271D" strokeWidth="1.5" />
            <text x="355" y="130" fill="#33271D" fontSize="11" fontFamily="'Caveat', cursive" textAnchor="middle">AUC</text>
            <text x="355" y="150" fill="#33271D" fontSize="11" fontFamily="'Caveat', cursive" textAnchor="middle">Ceiling</text>
            <text x="355" y="170" fill="#33271D" fontSize="9" fontFamily="'Caveat', cursive" textAnchor="middle" opacity="0.7">Near-chance</text>
            
            {/* Information-theoretic indicator */}
            <text x="230" y="220" fill="#33271D" fontSize="11" fontFamily="'Caveat', cursive" textAnchor="middle" opacity="0.7">Information-Theoretic Limits</text>
          </svg>
        )
      
      case 1: // AI Cybersecurity & Evaluation Robustness
        return (
          <svg viewBox="0 0 400 300" className={className}>
            {/* Cyber agent */}
            <circle cx="80" cy="150" r="35" fill="none" stroke="#33271D" strokeWidth="2" />
            <text x="80" y="145" fill="#33271D" fontSize="11" fontFamily="'Caveat', cursive" textAnchor="middle">Cyber</text>
            <text x="80" y="160" fill="#33271D" fontSize="11" fontFamily="'Caveat', cursive" textAnchor="middle">Agent</text>
            
            {/* Arrow */}
            <path d="M 125 150 L 165 150" stroke="#33271D" strokeWidth="2" fill="none" />
            <path d="M 155 145 L 165 150 L 155 155" stroke="#33271D" strokeWidth="2" fill="none" />
            
            {/* CyberBench framework */}
            <rect x="175" y="100" width="100" height="100" fill="none" stroke="#33271D" strokeWidth="2" />
            <text x="225" y="130" fill="#33271D" fontSize="12" fontFamily="'Caveat', cursive" textAnchor="middle">CyberBench</text>
            <text x="225" y="150" fill="#33271D" fontSize="10" fontFamily="'Caveat', cursive" textAnchor="middle" opacity="0.7">Benchmarking</text>
            <text x="225" y="170" fill="#33271D" fontSize="10" fontFamily="'Caveat', cursive" textAnchor="middle" opacity="0.7">Framework</text>
            
            {/* Evaluation metrics */}
            <g opacity="0.7">
              <rect x="290" y="80" width="80" height="50" fill="none" stroke="#33271D" strokeWidth="1" strokeDasharray="2,2" />
              <text x="330" y="105" fill="#33271D" fontSize="10" fontFamily="'Caveat', cursive" textAnchor="middle">Robustness</text>
              
              <rect x="290" y="140" width="80" height="50" fill="none" stroke="#33271D" strokeWidth="1" strokeDasharray="2,2" />
              <text x="330" y="165" fill="#33271D" fontSize="10" fontFamily="'Caveat', cursive" textAnchor="middle">Safety</text>
              
              <rect x="290" y="200" width="80" height="50" fill="none" stroke="#33271D" strokeWidth="1" strokeDasharray="2,2" />
              <text x="330" y="225" fill="#33271D" fontSize="10" fontFamily="'Caveat', cursive" textAnchor="middle">Evaluation</text>
            </g>
            
            {/* Extension indicator */}
            <text x="225" y="240" fill="#33271D" fontSize="11" fontFamily="'Caveat', cursive" textAnchor="middle" opacity="0.7">Extended Evaluation Framework</text>
          </svg>
        )
      
      case 6: // Browser-Native Latent-Code Video
        return (
          <svg viewBox="0 0 400 300" className={className}>
            {/* Video frames input */}
            <rect x="20" y="100" width="80" height="100" fill="none" stroke="#33271D" strokeWidth="1.5" opacity="0.7" />
            <rect x="25" y="105" width="70" height="20" fill="rgba(74, 52, 36, 0.1)" />
            <rect x="25" y="130" width="70" height="20" fill="rgba(74, 52, 36, 0.1)" />
            <rect x="25" y="155" width="70" height="20" fill="rgba(74, 52, 36, 0.1)" />
            <text x="60" y="215" fill="#33271D" fontSize="10" fontFamily="'Caveat', cursive" textAnchor="middle">Video</text>
            <text x="60" y="230" fill="#33271D" fontSize="10" fontFamily="'Caveat', cursive" textAnchor="middle">H.264/VP9</text>
            
            {/* Arrow */}
            <path d="M 110 150 L 150 150" stroke="#33271D" strokeWidth="2" fill="none" />
            <path d="M 140 145 L 150 150 L 140 155" stroke="#33271D" strokeWidth="2" fill="none" />
            
            {/* Latent code compression */}
            <rect x="160" y="110" width="80" height="80" fill="none" stroke="#33271D" strokeWidth="2" />
            <text x="200" y="135" fill="#33271D" fontSize="11" fontFamily="'Caveat', cursive" textAnchor="middle">Latent</text>
            <text x="200" y="155" fill="#33271D" fontSize="11" fontFamily="'Caveat', cursive" textAnchor="middle">Code</text>
            <text x="200" y="175" fill="#33271D" fontSize="10" fontFamily="'Caveat', cursive" textAnchor="middle" opacity="0.7">ONNX Runtime</text>
            
            {/* Arrow */}
            <path d="M 250 150 L 290 150" stroke="#33271D" strokeWidth="2" fill="none" />
            <path d="M 280 145 L 290 150 L 280 155" stroke="#33271D" strokeWidth="2" fill="none" />
            
            {/* Compressed output */}
            <rect x="300" y="120" width="60" height="60" fill="rgba(74, 52, 36, 0.2)" stroke="#33271D" strokeWidth="1.5" />
            <text x="330" y="145" fill="#33271D" fontSize="10" fontFamily="'Caveat', cursive" textAnchor="middle">&lt;15 kbps</text>
            <text x="330" y="165" fill="#33271D" fontSize="9" fontFamily="'Caveat', cursive" textAnchor="middle" opacity="0.8">100-500×</text>
            <text x="330" y="190" fill="#33271D" fontSize="9" fontFamily="'Caveat', cursive" textAnchor="middle" opacity="0.7">WebRTC</text>
            
            {/* Compression indicator */}
            <text x="200" y="220" fill="#33271D" fontSize="11" fontFamily="'Caveat', cursive" textAnchor="middle" opacity="0.7">Ultra-Low Bitrate</text>
          </svg>
        )
      
      case 7: // COVID-19 Detection from Cough
        return (
          <svg viewBox="0 0 400 300" className={className}>
            {/* Audio waveform / cough input */}
            <path d="M 30 150 L 50 140 L 70 160 L 90 130 L 110 170 L 130 120 L 150 150" 
                  stroke="#33271D" strokeWidth="2" fill="none" opacity="0.7" />
            <text x="90" y="190" fill="#33271D" fontSize="11" fontFamily="'Caveat', cursive" textAnchor="middle">Cough</text>
            <text x="90" y="205" fill="#33271D" fontSize="10" fontFamily="'Caveat', cursive" textAnchor="middle" opacity="0.7">~30k samples</text>
            
            {/* Arrow */}
            <path d="M 160 150 L 200 150" stroke="#33271D" strokeWidth="2" fill="none" />
            <path d="M 190 145 L 200 150 L 190 155" stroke="#33271D" strokeWidth="2" fill="none" />
            
            {/* CNN/SSL model */}
            <rect x="210" y="110" width="80" height="80" fill="none" stroke="#33271D" strokeWidth="2" />
            <text x="250" y="135" fill="#33271D" fontSize="11" fontFamily="'Caveat', cursive" textAnchor="middle">CNN</text>
            <text x="250" y="155" fill="#33271D" fontSize="11" fontFamily="'Caveat', cursive" textAnchor="middle">SSL</text>
            <text x="250" y="175" fill="#33271D" fontSize="10" fontFamily="'Caveat', cursive" textAnchor="middle" opacity="0.7">Active Learning</text>
            
            {/* Arrow */}
            <path d="M 300 150 L 340 150" stroke="#33271D" strokeWidth="2" fill="none" />
            <path d="M 330 145 L 340 150 L 330 155" stroke="#33271D" strokeWidth="2" fill="none" />
            
            {/* Detection output */}
            <rect x="350" y="120" width="40" height="60" fill="rgba(74, 52, 36, 0.2)" stroke="#33271D" strokeWidth="1.5" />
            <text x="370" y="145" fill="#33271D" fontSize="10" fontFamily="'Caveat', cursive" textAnchor="middle">AUC</text>
            <text x="370" y="160" fill="#33271D" fontSize="11" fontFamily="'Caveat', cursive" textAnchor="middle">0.807</text>
            <text x="370" y="175" fill="#33271D" fontSize="9" fontFamily="'Caveat', cursive" textAnchor="middle" opacity="0.7">COVID-19</text>
            
            {/* Hospital deployment indicator */}
            <text x="250" y="220" fill="#33271D" fontSize="11" fontFamily="'Caveat', cursive" textAnchor="middle" opacity="0.7">Hospital Deployment</text>
          </svg>
        )
      
      case 12: { // Long Delay to Arithmetic Generalization — "shadow gap" research note
        return (
          <svg viewBox="0 0 400 300" className={className}>
            <defs>
              <pattern id={`shadowHatch-${projectId}`} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="7" stroke="#9C6B4F" strokeWidth="0.8" opacity="0.28" />
              </pattern>
            </defs>

            <text x="200" y="26" fill="#33271D" fontSize="17" fontFamily="'Caveat', cursive" textAnchor="middle" opacity="0.72">shadow knowledge: probe leads output</text>

            {/* hand-drawn axes + curves wobble; text stays crisp */}
            <g filter={`url(#sketch-${projectId})`} fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M 56 60 L 56 232 L 360 232" stroke="#33271D" strokeWidth="1.6" opacity="0.7" />
              <path d="M 104 74 L 232 74 L 232 196 L 104 196 Z" fill={`url(#shadowHatch-${projectId})`} stroke="#9C6B4F" strokeWidth="1" strokeDasharray="4 3" opacity="0.65" />
              <path d="M 58 214 C 78 150, 92 86, 120 78 C 180 70, 280 70, 356 70" stroke="#33271D" strokeWidth="2.6" opacity="0.9" />
              <path d="M 58 222 C 120 214, 180 206, 232 196 C 268 188, 292 120, 356 86" stroke="#9C6B4F" strokeWidth="2.6" opacity="0.9" />
              <path d="M 168 152 C 162 136, 160 122, 162 110" stroke="#33271D" strokeWidth="1.2" opacity="0.7" />
              <path d="M 162 110 l -4.5 8 M 162 110 l 6 6.5" stroke="#33271D" strokeWidth="1.2" opacity="0.7" />
            </g>

            <text x="248" y="64" fill="#33271D" fontSize="15" fontFamily="'Caveat', cursive" opacity="0.85">parity probe (encoder)</text>
            <text x="250" y="120" fill="#9C6B4F" fontSize="15" fontFamily="'Caveat', cursive" opacity="0.9">output acc (decoder)</text>

            <text x="150" y="170" fill="#33271D" fontSize="16" fontFamily="'Caveat', cursive" textAnchor="middle" opacity="0.92">the encoder</text>
            <text x="150" y="186" fill="#33271D" fontSize="16" fontFamily="'Caveat', cursive" textAnchor="middle" opacity="0.92">already knows here</text>

            <text x="208" y="250" fill="#33271D" fontSize="13" fontFamily="'Caveat', cursive" textAnchor="middle" opacity="0.6">training steps →</text>
            <text x="34" y="146" fill="#33271D" fontSize="13" fontFamily="'Caveat', cursive" textAnchor="middle" opacity="0.6" transform="rotate(-90 34 146)">accuracy</text>
            <text x="372" y="74" fill="#33271D" fontSize="12" fontFamily="'Caveat', cursive" textAnchor="end" opacity="0.55">~99%</text>

            <text x="200" y="284" fill="#33271D" fontSize="13" fontFamily="'Caveat', cursive" textAnchor="middle" opacity="0.6">freeze encoder, retrain decoder → 97.6% (vs 86.1%)</text>
          </svg>
        )
      }

      case 8: // Clinical-Note LLM Pipeline
        return (
          <svg viewBox="0 0 400 300" className={className}>
            {/* Clinical notes input */}
            <rect x="20" y="100" width="100" height="100" fill="none" stroke="#33271D" strokeWidth="1.5" opacity="0.7" />
            <text x="70" y="130" fill="#33271D" fontSize="11" fontFamily="'Caveat', cursive" textAnchor="middle">Clinical</text>
            <text x="70" y="150" fill="#33271D" fontSize="11" fontFamily="'Caveat', cursive" textAnchor="middle">Notes</text>
            <text x="70" y="170" fill="#33271D" fontSize="10" fontFamily="'Caveat', cursive" textAnchor="middle" opacity="0.7">Input</text>
            
            {/* Arrow */}
            <path d="M 130 150 L 170 150" stroke="#33271D" strokeWidth="2" fill="none" />
            <path d="M 160 145 L 170 150 L 160 155" stroke="#33271D" strokeWidth="2" fill="none" />
            
            {/* LLM pipeline */}
            <rect x="180" y="100" width="100" height="100" fill="none" stroke="#33271D" strokeWidth="2" />
            <text x="230" y="125" fill="#33271D" fontSize="11" fontFamily="'Caveat', cursive" textAnchor="middle">LLaMA-3</text>
            <text x="230" y="145" fill="#33271D" fontSize="10" fontFamily="'Caveat', cursive" textAnchor="middle" opacity="0.7">QLoRA</text>
            <text x="230" y="160" fill="#33271D" fontSize="10" fontFamily="'Caveat', cursive" textAnchor="middle" opacity="0.7">+ RAG</text>
            <text x="230" y="175" fill="#33271D" fontSize="10" fontFamily="'Caveat', cursive" textAnchor="middle" opacity="0.7">+ DPO</text>
            <text x="230" y="190" fill="#33271D" fontSize="9" fontFamily="'Caveat', cursive" textAnchor="middle" opacity="0.8">Quantization</text>
            
            {/* Arrow */}
            <path d="M 290 150 L 330 150" stroke="#33271D" strokeWidth="2" fill="none" />
            <path d="M 320 145 L 330 150 L 320 155" stroke="#33271D" strokeWidth="2" fill="none" />
            
            {/* Improved notes output */}
            <rect x="340" y="110" width="50" height="80" fill="rgba(74, 52, 36, 0.2)" stroke="#33271D" strokeWidth="1.5" />
            <text x="365" y="135" fill="#33271D" fontSize="10" fontFamily="'Caveat', cursive" textAnchor="middle">ROUGE-1</text>
            <text x="365" y="155" fill="#33271D" fontSize="11" fontFamily="'Caveat', cursive" textAnchor="middle">0.48</text>
            <text x="365" y="175" fill="#33271D" fontSize="9" fontFamily="'Caveat', cursive" textAnchor="middle" opacity="0.7">Quality</text>
            
            {/* Improvement indicator */}
            <text x="230" y="230" fill="#33271D" fontSize="11" fontFamily="'Caveat', cursive" textAnchor="middle" opacity="0.7">0.25 → 0.48 Improvement</text>
          </svg>
        )
      
      case 13: { // Orth-Dion — "dual ball" research note: QR lands on the ball, ColNorm pokes out
        const cx = 168
        const cy = 152
        const R = 92
        return (
          <svg viewBox="0 0 400 300" className={className}>
            {/* hand-drawn geometry wobbles; handwritten text stays crisp */}
            <g filter={`url(#sketch-${projectId})`} fill="none" strokeLinecap="round" strokeLinejoin="round">
              <ellipse cx={cx} cy={cy} rx={R} ry={R} stroke="#33271D" strokeWidth="1.7" opacity="0.85" />
              <circle cx={cx} cy={cy} r="3" fill="#33271D" stroke="none" />
              {/* ν = 1 reference radius to the QR / polar point on the boundary */}
              <line x1={cx} y1={cy} x2="238" y2="92" stroke="#33271D" strokeWidth="1.3" opacity="0.7" />
              <circle cx="238" cy="92" r="3.4" fill="#9C6B4F" stroke="none" />
              <ellipse cx="238" cy="92" rx="13" ry="10" stroke="#9C6B4F" strokeWidth="1.2" opacity="0.85" transform="rotate(-20 238 92)" />
              {/* ColNorm update: dashed radius poking OUTSIDE the ball */}
              <line x1={cx} y1={cy} x2="300" y2="206" stroke="#33271D" strokeWidth="1.5" strokeDasharray="5 4" opacity="0.8" />
              <circle cx="300" cy="206" r="3.4" fill="#33271D" stroke="none" />
            </g>

            <text x="200" y="28" fill="#33271D" fontSize="17" fontFamily="'Caveat', cursive" textAnchor="middle" opacity="0.72">the rank-r dual ball (Ky Fan)</text>
            <text x="158" y="170" fill="#33271D" fontSize="13" fontFamily="'Caveat', cursive" textAnchor="end" opacity="0.55">0</text>

            <text x="252" y="74" fill="#9C6B4F" fontSize="16" fontFamily="'Caveat', cursive" opacity="0.95">QR = polar</text>
            <text x="252" y="90" fill="#9C6B4F" fontSize="15" fontFamily="'Caveat', cursive" opacity="0.9">ν = 1 ✓ on the ball</text>

            <text x="298" y="226" fill="#33271D" fontSize="16" fontFamily="'Caveat', cursive" textAnchor="middle" opacity="0.88">ColNorm</text>
            <text x="298" y="242" fill="#33271D" fontSize="15" fontFamily="'Caveat', cursive" textAnchor="middle" opacity="0.7">ν = √r ✗ pokes out</text>

            <text x="200" y="284" fill="#33271D" fontSize="15" fontFamily="'Caveat', cursive" textAnchor="middle" opacity="0.8">the whole paper: one line, <tspan fill="#9C6B4F">ColNorm → QR</tspan></text>
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
            <rect width="400" height="300" fill="rgba(255,251,244,0.45)" />
            <text x="200" y="26" fill="#33271D" fontSize="10" fontFamily="'Caveat', cursive" textAnchor="middle" opacity="0.9">
              Table 3(b) · final val loss · GPT-2 31M · OWT
            </text>
            <text x="200" y="40" fill="#33271D" fontSize="8" fontFamily="'Caveat', cursive" textAnchor="middle" opacity="0.52">
              G-Scion gates embedding &amp; lm_head by R∞ (schematic)
            </text>

            {/* Y grid */}
            {[5.2, 5.3, 5.4, 5.5].map((lv) => {
              const y = baseline - ((lv - lossAxisLo) / (lossAxisHi - lossAxisLo)) * maxH
              return (
                <g key={lv}>
                  <line x1="48" y1={y} x2="372" y2={y} stroke="#33271D" strokeWidth="0.6" opacity="0.1" />
                  <text x="42" y={y + 3} fill="#33271D" fontSize="7.5" fontFamily="'Caveat', cursive" textAnchor="end" opacity="0.45">
                    {lv.toFixed(1)}
                  </text>
                </g>
              )
            })}

            <line x1="48" y1={baseline} x2="372" y2={baseline} stroke="#33271D" strokeWidth="1.2" opacity="0.55" />

            {bars.map((b, i) => {
              const x = startX + i * (barW + gap)
              const h = barHeight(b.loss)
              const y = baseline - h
              return (
                <g key={`${b.sub}-${i}`}>
                  <g filter={`url(#sketchSoft-${projectId})`}>
                    <rect
                      x={x}
                      y={y}
                      width={barW}
                      height={h}
                      fill={b.best ? 'rgba(74,52,36,0.28)' : 'rgba(74,52,36,0.08)'}
                      stroke="#33271D"
                      strokeWidth={b.best ? 1.6 : 1}
                      strokeDasharray={b.dashed ? '4 3' : undefined}
                      opacity="0.95"
                      rx="2"
                    />
                  </g>
                  <text
                    x={x + barW / 2}
                    y={y - 6}
                    fill="#33271D"
                    fontSize="8.5"
                    fontFamily="'Caveat', cursive"
                    textAnchor="middle"
                    opacity="0.88"
                  >
                    {b.loss.toFixed(3)}
                  </text>
                  <text
                    x={x + barW / 2}
                    y={baseline + 38}
                    fill="#33271D"
                    fontSize="8"
                    fontFamily="'Caveat', cursive"
                    textAnchor="middle"
                    opacity="0.78"
                  >
                    {b.label}
                  </text>
                  <text
                    x={x + barW / 2}
                    y={baseline + 50}
                    fill="#33271D"
                    fontSize="7"
                    fontFamily="'Caveat', cursive"
                    textAnchor="middle"
                    opacity="0.48"
                  >
                    {b.sub}
                  </text>
                </g>
              )
            })}

            <text x="200" y="284" fill="#33271D" fontSize="8" fontFamily="'Caveat', cursive" textAnchor="middle" opacity="0.48">
              lower is better · embedding gate contributes most of the −0.33 nat vs Scion
            </text>
          </svg>
        )
      }

      default:
        return null
    }
  }

  // Cases 4, 12, 13 (and the 14 plot) manage their own pencil wobble internally
  // via <g filter> so their handwritten text stays crisp; the other doodles get
  // the wobble applied to the whole drawing at the container level.
  const selfSketched =
    projectId === 4 || projectId === 12 || projectId === 13 || projectId === 14
  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={selfSketched ? undefined : { filter: `url(#sketch-${projectId})` }}
    >
      <SketchDefs projectId={projectId} />
      {getDoodle()}
    </div>
  )
}

/**
 * Per-project hand-drawn filters. `sketch` wobbles whole diagrams so straight
 * SVG lines read like pencil strokes; `sketchSoft` is a gentler version applied
 * only to plot curves (keeps axis text and numbers crisp). IDs are namespaced
 * by projectId so multiple cards on one page don't collide.
 */
function SketchDefs({ projectId }) {
  return (
    <svg width="0" height="0" aria-hidden="true" style={{ position: 'absolute' }}>
      <defs>
        <filter id={`sketch-${projectId}`} x="-6%" y="-6%" width="112%" height="112%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.018"
            numOctaves="3"
            seed={projectId * 7 + 1}
            result="n"
          />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="3.1" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id={`sketchSoft-${projectId}`} x="-6%" y="-6%" width="112%" height="112%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.013"
            numOctaves="2"
            seed={projectId * 5 + 2}
            result="n"
          />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="1.7" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  )
}

export default ProjectDoodle

