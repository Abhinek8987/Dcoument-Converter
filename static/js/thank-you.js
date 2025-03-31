document.addEventListener('DOMContentLoaded', () => {
    // Get conversion stats from URL
    const urlParams = new URLSearchParams(window.location.search);
    const uploaded = urlParams.get('uploaded') || 0;
    const converted = urlParams.get('converted') || 0;

    // Update stats display
    if (uploaded > 0) {
        document.getElementById('stats').innerHTML = `
            <div class="stat-item">
                <span class="stat-value">${uploaded}</span>
                <span class="stat-label">Uploaded</span>
            </div>
            <div class="stat-item">
                <span class="stat-value">${converted}</span>
                <span class="stat-label">Converted</span>
            </div>
        `;
    }

    // Trigger confetti celebration
    confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4361ee', '#4895ef', '#4cc9f0', '#3f37c9']
    });

    // Add slight delay for confetti
    setTimeout(() => {
        confetti({
            particleCount: 100,
            angle: 60,
            spread: 55,
            origin: { x: 0 }
        });
        
        confetti({
            particleCount: 100,
            angle: 120,
            spread: 55,
            origin: { x: 1 }
        });
    }, 250);
});