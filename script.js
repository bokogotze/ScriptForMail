// ===== APP STATE =====
let sendingActive = false;
let currentIndex = 0;
let totalEmails = 0;
let sentCount = 0;
let failedCount = 0;
let pdfFile = null;
let timerInterval = null;
let countdownInterval = null;

// ===== INIT =====
document.addEventListener('DOMContentLoaded', function() {
    updateRecipientCount();
    logEvent('📱 App ready');
    
    // Event listeners
    document.getElementById('recipients').addEventListener('input', updateRecipientCount);
    document.getElementById('pdfFile').addEventListener('change', handlePDF);
});

// ===== RECIPIENT COUNT =====
function updateRecipientCount() {
    const text = document.getElementById('recipients').value;
    const emails = text.split('\n')
        .map(e => e.trim())
        .filter(e => e.includes('@') && e.length > 0);
    
    totalEmails = Math.min(emails.length, 45);
    document.getElementById('totalCount').textContent = totalEmails;
}

// ===== PDF HANDLING =====
function handlePDF(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (file.type !== 'application/pdf') {
        showAlert('Please select a PDF file');
        return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
        showAlert('File too large (max 10MB)');
        return;
    }
    
    pdfFile = file;
    document.getElementById('pdfName').textContent = file.name;
    document.getElementById('pdfInfo').style.display = 'flex';
    logEvent(`📎 PDF attached: ${file.name}`);
}

function removePDF() {
    pdfFile = null;
    document.getElementById('pdfFile').value = '';
    document.getElementById('pdfInfo').style.display = 'none';
    logEvent('📎 PDF removed');
}

// ===== SENDING FUNCTIONS =====
function startSending() {
    if (sendingActive) return;
    
    // Validate
    const fromEmail = document.getElementById('fromEmail').value;
    const password = document.getElementById('password').value;
    const recipients = document.getElementById('recipients').value;
    
    if (!fromEmail || !fromEmail.includes('@')) {
        showAlert('Enter valid FROM email');
        return;
    }
    
    if (!password) {
        showAlert('Enter password');
        return;
    }
    
    const emailList = recipients.split('\n')
        .map(e => e.trim())
        .filter(e => e.includes('@'));
    
    if (emailList.length === 0) {
        showAlert('Enter at least one recipient');
        return;
    }
    
    // Limit to 45
    if (emailList.length > 45) {
        showAlert('Maximum 45 recipients');
        return;
    }
    
    // Start
    sendingActive = true;
    currentIndex = 0;
    sentCount = 0;
    failedCount = 0;
    
    document.getElementById('startBtn').disabled = true;
    document.getElementById('stopBtn').disabled = false;
    
    logEvent('▶️ Sending started');
    updateStats();
    startTimers();
    
    // Simulate sending (since no backend)
    simulateSending(emailList);
}

function stopSending() {
    sendingActive = false;
    document.getElementById('startBtn').disabled = false;
    document.getElementById('stopBtn').disabled = true;
    
    clearInterval(timerInterval);
    clearInterval(countdownInterval);
    
    document.getElementById('nextTimer').textContent = '30s';
    document.getElementById('elapsedTimer').textContent = '00:00';
    
    logEvent('⏹️ Sending stopped');
}

function simulateSending(emails) {
    if (!sendingActive) return;
    
    if (currentIndex >= emails.length) {
        // Done
        stopSending();
        logEvent('✅ All emails sent!');
        showAlert('Sending complete!');
        return;
    }
    
    // Send one email (simulated)
    const email = emails[currentIndex];
    currentIndex++;
    
    // 80% success rate for simulation
    if (Math.random() < 0.8) {
        sentCount++;
        logEvent(`📧 Sent to ${email}`);
    } else {
        failedCount++;
        logEvent(`❌ Failed: ${email}`);
    }
    
    updateStats();
    
    // Schedule next
    if (sendingActive && currentIndex < emails.length) {
        setTimeout(() => simulateSending(emails), 30000);
    } else if (currentIndex >= emails.length) {
        setTimeout(() => {
            stopSending();
            logEvent('✅ Complete!');
        }, 1000);
    }
}

// ===== TIMERS =====
function startTimers() {
    // Countdown timer
    let seconds = 30;
    clearInterval(countdownInterval);
    countdownInterval = setInterval(() => {
        seconds--;
        if (seconds < 0) seconds = 30;
        document.getElementById('nextTimer').textContent = seconds + 's';
    }, 1000);
    
    // Elapsed timer
    let elapsed = 0;
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        elapsed++;
        const mins = Math.floor(elapsed / 60);
        const secs = elapsed % 60;
        document.getElementById('elapsedTimer').textContent = 
            `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, 1000);
}

// ===== UPDATE STATS =====
function updateStats() {
    const progress = totalEmails > 0 ? ((sentCount + failedCount) / totalEmails) * 100 : 0;
    
    document.getElementById('statSent').textContent = sentCount;
    document.getElementById('statFailed').textContent = failedCount;
    document.getElementById('progressFill').style.width = progress + '%';
    document.getElementById('progressPercent').textContent = Math.round(progress) + '%';
}

// ===== LOGGING =====
function logEvent(message) {
    const logPanel = document.getElementById('logPanel');
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.textContent = `[${time}] ${message}`;
    
    logPanel.appendChild(entry);
    logPanel.scrollTop = logPanel.scrollHeight;
    
    // Keep last 50
    while (logPanel.children.length > 50) {
        logPanel.removeChild(logPanel.firstChild);
    }
}

// ===== ALERTS =====
function showAlert(message) {
    document.getElementById('modalMessage').textContent = message;
    document.getElementById('alertModal').style.display = 'flex';
    logEvent(`⚠️ ${message}`);
}

function closeModal() {
    document.getElementById('alertModal').style.display = 'none';
}

// ===== EXPOSE FUNCTIONS =====
window.startSending = startSending;
window.stopSending = stopSending;
window.removePDF = removePDF;
window.closeModal = closeModal;